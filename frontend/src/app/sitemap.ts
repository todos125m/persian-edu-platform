import { MetadataRoute } from 'next';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${SITE_URL}/courses`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  // Dynamic course pages
  try {
    const res = await fetch(`${API_URL}/courses?limit=100`, {
      next: { revalidate: 3600 },
    });

    if (res.ok) {
      const data = await res.json();
      const courses = data.data || data;

      const coursePages: MetadataRoute.Sitemap = courses.map((course: any) => {
        let lastModified = new Date();
        try {
          const d = new Date(course.updatedAt || course.createdAt);
          if (!isNaN(d.getTime())) lastModified = d;
        } catch {}
        return {
          url: `${SITE_URL}/courses/${course.slug}`,
          lastModified,
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        };
      });

      return [...staticPages, ...coursePages];
    }
  } catch {
    // If API is unavailable, return static pages only
  }

  return staticPages;
}
