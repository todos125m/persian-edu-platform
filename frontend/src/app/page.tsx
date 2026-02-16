import { HeroSection } from '@/components/home/HeroSection';
import { FeaturedCourses } from '@/components/home/FeaturedCourses';
import { CategoriesSection } from '@/components/home/CategoriesSection';
import { StatsSection } from '@/components/home/StatsSection';
import { WhyUsSection } from '@/components/home/WhyUsSection';
import { CTASection } from '@/components/home/CTASection';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedCourses />
      <CategoriesSection />
      <StatsSection />
      <WhyUsSection />
      <CTASection />
    </>
  );
}
