'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  SkipBack,
  SkipForward,
} from 'lucide-react';
import { videosService, VideoQualityInfo } from '@/services/videosService';
import { formatDuration } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface VideoPlayerProps {
  videoId: string;
  onProgress?: (progress: number, completed: boolean) => void;
}

const QUALITY_LABELS: Record<string, string> = {
  '1080p': '۱۰۸۰p (Full HD)',
  '720p': '۷۲۰p (HD)',
  '480p': '۴۸۰p',
  '360p': '۳۶۰p',
};

export default function VideoPlayer({ videoId, onProgress }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'main' | 'speed' | 'quality'>('main');

  // HLS quality state
  const [isHls, setIsHls] = useState(false);
  const [hlsLevels, setHlsLevels] = useState<{ height: number; bitrate: number; index: number }[]>([]);
  const [currentQuality, setCurrentQuality] = useState(-1); // -1 = auto
  const [qualities, setQualities] = useState<VideoQualityInfo[]>([]);

  const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  // Cleanup HLS instance
  const destroyHls = useCallback(() => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
  }, []);

  // Load video
  useEffect(() => {
    loadVideo();
    return () => {
      destroyHls();
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [videoId]);

  const loadVideo = async () => {
    setIsLoading(true);
    setError(null);
    destroyHls();

    try {
      const data = await videosService.getStreamUrl(videoId);
      setDuration(data.duration);
      setQualities(data.qualities || []);

      if (data.isHls && Hls.isSupported()) {
        // Use HLS.js for adaptive streaming
        setIsHls(true);
        initHls(data.streamUrl, data.lastPosition);
      } else if (data.isHls && videoRef.current?.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari native HLS support
        setIsHls(true);
        if (videoRef.current) {
          videoRef.current.src = data.streamUrl;
          if (data.lastPosition > 0) {
            videoRef.current.currentTime = data.lastPosition;
          }
        }
      } else {
        // Direct MP4 fallback
        setIsHls(false);
        if (videoRef.current) {
          videoRef.current.src = data.streamUrl;
          if (data.lastPosition > 0) {
            videoRef.current.currentTime = data.lastPosition;
          }
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'خطا در بارگذاری ویدیو');
    } finally {
      setIsLoading(false);
    }
  };

  const initHls = (url: string, lastPosition: number) => {
    if (!videoRef.current) return;

    const hls = new Hls({
      startLevel: -1, // auto
      capLevelToPlayerSize: true,
      maxBufferLength: 30,
      maxMaxBufferLength: 600,
    });

    hls.loadSource(url);
    hls.attachMedia(videoRef.current);

    hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
      // Extract available quality levels
      const levels = data.levels.map((level, index) => ({
        height: level.height,
        bitrate: level.bitrate,
        index,
      }));
      setHlsLevels(levels.sort((a, b) => b.height - a.height));
      setCurrentQuality(-1); // auto

      // Restore position
      if (lastPosition > 0 && videoRef.current) {
        videoRef.current.currentTime = lastPosition;
      }
    });

    hls.on(Hls.Events.LEVEL_SWITCHED, (_event, data) => {
      // Track which quality is actually playing
      if (currentQuality === -1) {
        // In auto mode, just update the display
      }
    });

    hls.on(Hls.Events.ERROR, (_event, data) => {
      if (data.fatal) {
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            hls.startLoad();
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            hls.recoverMediaError();
            break;
          default:
            setError('خطا در پخش ویدیو');
            destroyHls();
            break;
        }
      }
    });

    hlsRef.current = hls;
  };

  // Change HLS quality
  const changeQuality = (levelIndex: number) => {
    if (!hlsRef.current) return;
    hlsRef.current.currentLevel = levelIndex; // -1 = auto
    setCurrentQuality(levelIndex);
    setShowSettingsMenu(false);
    setSettingsTab('main');
  };

  // Save progress periodically
  const saveProgress = useCallback(async () => {
    if (!videoRef.current) return;

    const position = Math.floor(videoRef.current.currentTime);
    const completed = position >= duration - 10;

    try {
      await videosService.updateProgress(videoId, position, completed);
      onProgress?.(position, completed);
    } catch (err) {
      console.error('Error saving progress:', err);
    }
  }, [videoId, duration, onProgress]);

  // Start/stop progress saving
  useEffect(() => {
    if (isPlaying) {
      progressInterval.current = setInterval(saveProgress, 10000);
    } else {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
        saveProgress();
      }
    }

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [isPlaying, saveProgress]);

  // Video event handlers
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleProgress = () => {
    if (videoRef.current && videoRef.current.buffered.length > 0) {
      const bufferedEnd = videoRef.current.buffered.end(
        videoRef.current.buffered.length - 1
      );
      setBuffered((bufferedEnd / videoRef.current.duration) * 100);
    }
  };

  // Controls
  const togglePlay = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const newVolume = parseFloat(e.target.value);
    videoRef.current.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const time = parseFloat(e.target.value);
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const skip = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime += seconds;
  };

  const changeSpeed = (speed: number) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = speed;
    setPlaybackSpeed(speed);
    setShowSettingsMenu(false);
    setSettingsTab('main');
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Auto-hide controls
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      if (isPlaying) {
        timeout = setTimeout(() => setShowControls(false), 3000);
      }
    };

    const container = containerRef.current;
    container?.addEventListener('mousemove', handleMouseMove);

    return () => {
      container?.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeout);
    };
  }, [isPlaying]);

  // Close settings menu on outside click
  useEffect(() => {
    if (!showSettingsMenu) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Element;
      if (!target.closest('.settings-menu-container')) {
        setShowSettingsMenu(false);
        setSettingsTab('main');
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [showSettingsMenu]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!containerRef.current?.contains(document.activeElement) && document.activeElement !== document.body) return;

      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          skip(-10);
          break;
        case 'ArrowRight':
          e.preventDefault();
          skip(10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (videoRef.current) {
            const newVol = Math.min(1, volume + 0.1);
            videoRef.current.volume = newVol;
            setVolume(newVol);
            setIsMuted(false);
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (videoRef.current) {
            const newVol = Math.max(0, volume - 0.1);
            videoRef.current.volume = newVol;
            setVolume(newVol);
            setIsMuted(newVol === 0);
          }
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, volume]);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  // Get quality label for display
  const getQualityLabel = (height: number): string => {
    if (height >= 1080) return '۱۰۸۰p';
    if (height >= 720) return '۷۲۰p';
    if (height >= 480) return '۴۸۰p';
    if (height >= 360) return '۳۶۰p';
    return `${height}p`;
  };

  const getCurrentQualityLabel = (): string => {
    if (!isHls || hlsLevels.length === 0) return '';
    if (currentQuality === -1) {
      const autoLevel = hlsRef.current?.currentLevel ?? -1;
      if (autoLevel >= 0 && hlsLevels[autoLevel]) {
        return `خودکار (${getQualityLabel(hlsLevels.find((l) => l.index === autoLevel)?.height || 0)})`;
      }
      return 'خودکار';
    }
    const level = hlsLevels.find((l) => l.index === currentQuality);
    return level ? getQualityLabel(level.height) : '';
  };

  if (isLoading) {
    return (
      <div className="aspect-video bg-gray-900 rounded-xl flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="aspect-video bg-gray-900 rounded-xl flex items-center justify-center text-white">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative aspect-video bg-black rounded-xl overflow-hidden group"
      onContextMenu={handleContextMenu}
      tabIndex={0}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onProgress={handleProgress}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => saveProgress()}
        playsInline
      />

      {/* Controls Overlay */}
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity',
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
      >
        {/* Center Play Button */}
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center"
        >
          {!isPlaying && (
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Play className="w-10 h-10 text-white fill-white" />
            </div>
          )}
        </button>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {/* Progress Bar */}
          <div className="relative h-1 bg-white/30 rounded-full mb-4 group/progress cursor-pointer hover:h-2 transition-all">
            {/* Buffered */}
            <div
              className="absolute h-full bg-white/50 rounded-full"
              style={{ width: `${buffered}%` }}
            />
            {/* Progress */}
            <div
              className="absolute h-full bg-primary-500 rounded-full"
              style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
            />
            {/* Seek Input */}
            <input
              type="range"
              min={0}
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Play/Pause */}
              <button onClick={togglePlay} className="text-white hover:text-primary-400 transition-colors">
                {isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6" />
                )}
              </button>

              {/* Skip */}
              <button
                onClick={() => skip(-10)}
                className="text-white hover:text-primary-400 transition-colors hidden sm:block"
              >
                <SkipBack className="w-5 h-5" />
              </button>
              <button
                onClick={() => skip(10)}
                className="text-white hover:text-primary-400 transition-colors hidden sm:block"
              >
                <SkipForward className="w-5 h-5" />
              </button>

              {/* Volume */}
              <div className="flex items-center gap-2">
                <button onClick={toggleMute} className="text-white hover:text-primary-400 transition-colors">
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 sm:w-20 h-1 bg-white/30 rounded-full appearance-none cursor-pointer"
                />
              </div>

              {/* Time */}
              <span className="text-white text-xs sm:text-sm whitespace-nowrap">
                {formatDuration(Math.floor(currentTime))} / {formatDuration(Math.floor(duration))}
              </span>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              {/* Settings (Speed + Quality) */}
              <div className="relative settings-menu-container">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowSettingsMenu(!showSettingsMenu);
                    setSettingsTab('main');
                  }}
                  className="text-white hover:text-primary-400 transition-colors flex items-center gap-1"
                >
                  <Settings className="w-5 h-5" />
                  {(playbackSpeed !== 1 || (isHls && currentQuality !== -1)) && (
                    <span className="text-xs font-bold">
                      {playbackSpeed !== 1 ? `${playbackSpeed}x` : ''}
                    </span>
                  )}
                </button>

                {showSettingsMenu && (
                  <div
                    className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900/95 backdrop-blur-sm rounded-lg py-2 min-w-[180px] shadow-xl z-50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {settingsTab === 'main' && (
                      <>
                        {/* Speed Option */}
                        <button
                          onClick={() => setSettingsTab('speed')}
                          className="w-full flex items-center justify-between px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors"
                        >
                          <span>سرعت پخش</span>
                          <span className="text-xs text-gray-400">
                            {playbackSpeed === 1 ? 'عادی' : `${playbackSpeed}x`}
                          </span>
                        </button>

                        {/* Quality Option (only for HLS) */}
                        {isHls && hlsLevels.length > 0 && (
                          <button
                            onClick={() => setSettingsTab('quality')}
                            className="w-full flex items-center justify-between px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors"
                          >
                            <span>کیفیت تصویر</span>
                            <span className="text-xs text-gray-400">
                              {getCurrentQualityLabel()}
                            </span>
                          </button>
                        )}
                      </>
                    )}

                    {settingsTab === 'speed' && (
                      <>
                        <button
                          onClick={() => setSettingsTab('main')}
                          className="w-full px-4 py-1.5 text-xs text-gray-400 hover:text-white text-right border-b border-white/10 mb-1"
                        >
                          ← سرعت پخش
                        </button>
                        {speedOptions.map((speed) => (
                          <button
                            key={speed}
                            onClick={() => changeSpeed(speed)}
                            className={cn(
                              'w-full px-4 py-1.5 text-sm text-center transition-colors',
                              playbackSpeed === speed
                                ? 'text-primary-400 font-bold bg-white/10'
                                : 'text-white hover:bg-white/10'
                            )}
                          >
                            {speed === 1 ? 'عادی' : `${speed}x`}
                          </button>
                        ))}
                      </>
                    )}

                    {settingsTab === 'quality' && (
                      <>
                        <button
                          onClick={() => setSettingsTab('main')}
                          className="w-full px-4 py-1.5 text-xs text-gray-400 hover:text-white text-right border-b border-white/10 mb-1"
                        >
                          ← کیفیت تصویر
                        </button>
                        {/* Auto option */}
                        <button
                          onClick={() => changeQuality(-1)}
                          className={cn(
                            'w-full px-4 py-1.5 text-sm text-center transition-colors',
                            currentQuality === -1
                              ? 'text-primary-400 font-bold bg-white/10'
                              : 'text-white hover:bg-white/10'
                          )}
                        >
                          خودکار
                        </button>
                        {hlsLevels.map((level) => (
                          <button
                            key={level.index}
                            onClick={() => changeQuality(level.index)}
                            className={cn(
                              'w-full px-4 py-1.5 text-sm text-center transition-colors',
                              currentQuality === level.index
                                ? 'text-primary-400 font-bold bg-white/10'
                                : 'text-white hover:bg-white/10'
                            )}
                          >
                            {getQualityLabel(level.height)}
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="text-white hover:text-primary-400 transition-colors"
              >
                {isFullscreen ? (
                  <Minimize className="w-5 h-5" />
                ) : (
                  <Maximize className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
