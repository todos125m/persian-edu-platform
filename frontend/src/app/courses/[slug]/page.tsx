import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CourseDetailClient from '@/components/courses/CourseDetailClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

async function getCourse(slug: string) {
  try {
    const res = await fetch(`${API_URL}/courses/slug/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const course = await getCourse(params.slug);

  if (!course) {
    return { title: 'دوره یافت نشد' };
  }

  return {
    title: course.metaTitle || course.title,
    description: course.metaDescription || course.shortDesc || course.description?.slice(0, 160),
    openGraph: {
      title: course.title,
      description: course.shortDesc || course.description?.slice(0, 160),
      type: 'website',
      locale: 'fa_IR',
      images: course.thumbnail ? [{ url: course.thumbnail }] : [],
    },
  };
}

export default async function CourseDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const course = await getCourse(params.slug);

  if (!course) {
    notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.shortDesc || course.description?.slice(0, 300),
    provider: {
      '@type': 'Organization',
      name: 'آکادمی آموزش',
    },
    ...(course.thumbnail && { image: course.thumbnail }),
    offers: {
      '@type': 'Offer',
      price: course.discountPrice || course.price,
      priceCurrency: 'IRR',
      availability: 'https://schema.org/InStock',
    },
    courseMode: 'online',
    inLanguage: 'fa',
    numberOfCredits: course.lessonsCount,
    timeRequired: `PT${Math.floor(course.duration / 60)}H${course.duration % 60}M`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CourseDetailClient course={course} />
    </>
  );
}
