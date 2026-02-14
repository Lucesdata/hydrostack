import NewHero from '@/components/landing/NewHero';
import StatsCounter from '@/components/landing/StatsCounter';
import PreDesignCalculator from '@/components/landing/PreDesignCalculator';
import DigitalTwinsCarousel from '@/components/landing/DigitalTwinsCarousel';
import FeaturesSection from '@/components/landing/FeaturesSection';
import ModulesSection from '@/components/landing/ModulesSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import LogosSection from '@/components/landing/LogosSection';
import NewFooter from '@/components/landing/NewFooter';
import StickyCtaBanner from '@/components/landing/StickyCtaBanner';

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen">
      <NewHero />
      <StatsCounter />
      <PreDesignCalculator />
      <DigitalTwinsCarousel />
      <FeaturesSection />
      <ModulesSection />
      <TestimonialsSection />
      <LogosSection />
      <NewFooter />
      <StickyCtaBanner />
    </main>
  );
}
