import NewHero from '@/components/landing/NewHero';
import DigitalTwinsCarousel from '@/components/landing/DigitalTwinsCarousel';
import FeaturesSection from '@/components/landing/FeaturesSection';
import ModulesSection from '@/components/landing/ModulesSection';
import LogosSection from '@/components/landing/LogosSection';
import NewFooter from '@/components/landing/NewFooter';

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen">
      <NewHero />
      <DigitalTwinsCarousel />
      <FeaturesSection />
      <ModulesSection />
      <LogosSection />
      <NewFooter />
    </main>
  );
}
