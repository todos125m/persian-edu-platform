import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from './storage.service';
import { VideoStatus } from '@prisma/client';
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuid } from 'uuid';

interface QualityPreset {
  name: string;
  resolution: string;
  width: number;
  height: number;
  bitrate: number; // kbps video
  audioBitrate: number; // kbps audio
  maxBitrate: number;
  bufsize: number;
}

const QUALITY_PRESETS: QualityPreset[] = [
  {
    name: '1080p',
    resolution: '1920x1080',
    width: 1920,
    height: 1080,
    bitrate: 5000,
    audioBitrate: 192,
    maxBitrate: 5350,
    bufsize: 7500,
  },
  {
    name: '720p',
    resolution: '1280x720',
    width: 1280,
    height: 720,
    bitrate: 2800,
    audioBitrate: 128,
    maxBitrate: 3000,
    bufsize: 4200,
  },
  {
    name: '480p',
    resolution: '854x480',
    width: 854,
    height: 480,
    bitrate: 1400,
    audioBitrate: 128,
    maxBitrate: 1500,
    bufsize: 2100,
  },
  {
    name: '360p',
    resolution: '640x360',
    width: 640,
    height: 360,
    bitrate: 800,
    audioBitrate: 96,
    maxBitrate: 856,
    bufsize: 1200,
  },
];

@Injectable()
export class TranscodingService {
  private readonly logger = new Logger(TranscodingService.name);
  private readonly tempDir: string;

  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {
    this.tempDir = path.join(process.cwd(), 'temp', 'transcoding');
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  /**
   * Start transcoding a video to HLS with multiple quality variants.
   * Runs in background (fire-and-forget from the caller's perspective).
   */
  async startTranscoding(videoId: string): Promise<void> {
    this.logger.log(`Starting transcoding for video ${videoId}`);

    // Update status to TRANSCODING
    await this.prisma.video.update({
      where: { id: videoId },
      data: { status: VideoStatus.TRANSCODING },
    });

    // Run transcoding in background
    this.transcodeVideo(videoId).catch(async (error) => {
      this.logger.error(`Transcoding failed for video ${videoId}:`, error);
      await this.prisma.video.update({
        where: { id: videoId },
        data: { status: VideoStatus.ERROR },
      });
    });
  }

  private async transcodeVideo(videoId: string): Promise<void> {
    const video = await this.prisma.video.findUnique({
      where: { id: videoId },
    });

    if (!video) {
      throw new Error(`Video ${videoId} not found`);
    }

    // Create working directory for this video
    const workDir = path.join(this.tempDir, videoId);
    if (!fs.existsSync(workDir)) {
      fs.mkdirSync(workDir, { recursive: true });
    }

    try {
      // Step 1: Download original video to temp
      const inputPath = await this.downloadOriginal(video.storageKey, workDir);

      // Step 2: Probe video to get resolution
      const probeInfo = await this.probeVideo(inputPath);
      const inputHeight = probeInfo.height;

      // Step 3: Filter quality presets based on input resolution
      const applicablePresets = QUALITY_PRESETS.filter(
        (p) => p.height <= inputHeight,
      );

      // Always include at least one quality
      if (applicablePresets.length === 0) {
        applicablePresets.push(QUALITY_PRESETS[QUALITY_PRESETS.length - 1]); // 360p
      }

      // Step 4: Transcode each quality
      for (const preset of applicablePresets) {
        const qualityDir = path.join(workDir, preset.name);
        fs.mkdirSync(qualityDir, { recursive: true });

        this.logger.log(`Transcoding ${videoId} to ${preset.name}...`);
        await this.transcodeToQuality(inputPath, qualityDir, preset);
      }

      // Step 5: Generate master playlist
      const masterPlaylist = this.generateMasterPlaylist(applicablePresets);
      const masterPath = path.join(workDir, 'master.m3u8');
      fs.writeFileSync(masterPath, masterPlaylist);

      // Step 6: Upload all files to storage
      const hlsBasePath = `hls/${videoId}`;
      await this.uploadHlsFiles(workDir, hlsBasePath, videoId, applicablePresets);

      // Step 7: Update video record
      await this.prisma.video.update({
        where: { id: videoId },
        data: {
          status: VideoStatus.READY,
          hlsPath: `${hlsBasePath}/master.m3u8`,
        },
      });

      this.logger.log(`Transcoding complete for video ${videoId}`);
    } finally {
      // Cleanup temp files
      this.cleanupDir(workDir);
    }
  }

  private async downloadOriginal(
    storageKey: string,
    workDir: string,
  ): Promise<string> {
    const ext = storageKey.split('.').pop() || 'mp4';
    const inputPath = path.join(workDir, `original.${ext}`);

    if (this.storage.isLocalStorage()) {
      // Copy from local uploads
      const sourcePath = path.join(process.cwd(), 'uploads', storageKey);
      fs.copyFileSync(sourcePath, inputPath);
    } else {
      // Download from S3
      const url = await this.storage.getStreamUrl(storageKey, 7200);
      // Use curl or similar to download - simplest approach
      await this.runCommand('curl', ['-sS', '-o', inputPath, url]);
    }

    return inputPath;
  }

  private async probeVideo(
    inputPath: string,
  ): Promise<{ width: number; height: number; duration: number }> {
    return new Promise((resolve, reject) => {
      const args = [
        '-v',
        'error',
        '-select_streams',
        'v:0',
        '-show_entries',
        'stream=width,height,duration',
        '-show_entries',
        'format=duration',
        '-of',
        'json',
        inputPath,
      ];

      const proc = spawn('ffprobe', args);
      let stdout = '';
      let stderr = '';

      proc.stdout.on('data', (data) => (stdout += data.toString()));
      proc.stderr.on('data', (data) => (stderr += data.toString()));

      proc.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`ffprobe failed: ${stderr}`));
          return;
        }
        try {
          const info = JSON.parse(stdout);
          const stream = info.streams?.[0] || {};
          const format = info.format || {};
          resolve({
            width: stream.width || 1920,
            height: stream.height || 1080,
            duration: parseFloat(format.duration || stream.duration || '0'),
          });
        } catch (e) {
          reject(new Error(`Failed to parse ffprobe output: ${e}`));
        }
      });
    });
  }

  private async transcodeToQuality(
    inputPath: string,
    outputDir: string,
    preset: QualityPreset,
  ): Promise<void> {
    const playlistPath = path.join(outputDir, 'playlist.m3u8');
    const segmentPath = path.join(outputDir, 'seg%03d.ts');

    const args = [
      '-i', inputPath,
      '-vf', `scale=${preset.width}:${preset.height}:force_original_aspect_ratio=decrease,pad=${preset.width}:${preset.height}:(ow-iw)/2:(oh-ih)/2`,
      '-c:v', 'libx264',
      '-preset', 'medium',
      '-b:v', `${preset.bitrate}k`,
      '-maxrate', `${preset.maxBitrate}k`,
      '-bufsize', `${preset.bufsize}k`,
      '-c:a', 'aac',
      '-b:a', `${preset.audioBitrate}k`,
      '-ac', '2',
      '-ar', '44100',
      '-hls_time', '10',
      '-hls_playlist_type', 'vod',
      '-hls_segment_filename', segmentPath,
      '-f', 'hls',
      playlistPath,
    ];

    await this.runCommand('ffmpeg', args);
  }

  private generateMasterPlaylist(presets: QualityPreset[]): string {
    let content = '#EXTM3U\n#EXT-X-VERSION:3\n';

    for (const preset of presets) {
      const bandwidth = (preset.bitrate + preset.audioBitrate) * 1000;
      content += `#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},RESOLUTION=${preset.resolution}\n`;
      content += `${preset.name}/playlist.m3u8\n`;
    }

    return content;
  }

  private async uploadHlsFiles(
    workDir: string,
    hlsBasePath: string,
    videoId: string,
    presets: QualityPreset[],
  ): Promise<void> {
    // Upload master playlist
    const masterContent = fs.readFileSync(
      path.join(workDir, 'master.m3u8'),
    );

    if (this.storage.isLocalStorage()) {
      // Copy all files to uploads/hls/{videoId}/
      const destDir = path.join(process.cwd(), 'uploads', hlsBasePath);
      this.copyDirRecursive(workDir, destDir);
    } else {
      // Upload all files to S3
      await this.uploadDirToS3(workDir, hlsBasePath);
    }

    // Create VideoQuality records
    for (const preset of presets) {
      const qualityDir = path.join(workDir, preset.name);
      const segmentFiles = fs.readdirSync(qualityDir).filter((f) => f.endsWith('.ts'));
      let totalSize = 0;
      for (const seg of segmentFiles) {
        totalSize += fs.statSync(path.join(qualityDir, seg)).size;
      }

      await this.prisma.videoQuality.upsert({
        where: {
          videoId_quality: { videoId, quality: preset.name },
        },
        update: {
          resolution: preset.resolution,
          bitrate: preset.bitrate,
          storageKey: `${hlsBasePath}/${preset.name}/playlist.m3u8`,
          size: totalSize,
        },
        create: {
          videoId,
          quality: preset.name,
          resolution: preset.resolution,
          bitrate: preset.bitrate,
          storageKey: `${hlsBasePath}/${preset.name}/playlist.m3u8`,
          size: totalSize,
        },
      });
    }
  }

  private copyDirRecursive(src: string, dest: string): void {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      if (entry.name === 'original.mp4' || entry.name === 'original.mkv' || entry.name === 'original.avi') {
        continue; // skip original file
      }
      if (entry.isDirectory()) {
        this.copyDirRecursive(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  private async uploadDirToS3(localDir: string, s3BasePath: string): Promise<void> {
    const entries = fs.readdirSync(localDir, { withFileTypes: true });
    for (const entry of entries) {
      const localPath = path.join(localDir, entry.name);
      if (entry.name.startsWith('original.')) continue;

      if (entry.isDirectory()) {
        await this.uploadDirToS3(localPath, `${s3BasePath}/${entry.name}`);
      } else {
        const buffer = fs.readFileSync(localPath);
        const contentType = entry.name.endsWith('.m3u8')
          ? 'application/vnd.apple.mpegurl'
          : 'video/MP2T';
        await this.storage.uploadFile(
          `${s3BasePath}/${entry.name}`,
          buffer,
          contentType,
        );
      }
    }
  }

  private runCommand(command: string, args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      const proc = spawn(command, args, { stdio: ['pipe', 'pipe', 'pipe'] });
      let stdout = '';
      let stderr = '';

      proc.stdout.on('data', (data) => (stdout += data.toString()));
      proc.stderr.on('data', (data) => (stderr += data.toString()));

      proc.on('close', (code) => {
        if (code !== 0) {
          reject(
            new Error(`${command} exited with code ${code}: ${stderr.slice(-500)}`),
          );
        } else {
          resolve(stdout);
        }
      });

      proc.on('error', (err) => {
        reject(new Error(`Failed to start ${command}: ${err.message}`));
      });
    });
  }

  private cleanupDir(dir: string): void {
    try {
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
      }
    } catch (e) {
      this.logger.warn(`Failed to cleanup temp dir ${dir}: ${e}`);
    }
  }

  /**
   * Get transcoding status for a video
   */
  async getTranscodingStatus(videoId: string) {
    const video = await this.prisma.video.findUnique({
      where: { id: videoId },
      include: {
        qualities: {
          select: {
            quality: true,
            resolution: true,
            bitrate: true,
            size: true,
          },
        },
      },
    });

    return {
      status: video?.status,
      hlsPath: video?.hlsPath,
      qualities: video?.qualities || [],
    };
  }
}
