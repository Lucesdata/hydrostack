import NewHero from '@/components/landing/NewHero';
import StatsCounter from '@/components/landing/StatsCounter';
import PreDesignCalculator from '@/components/landing/PreDesignCalculator';
import FeaturesSection from '@/components/landing/FeaturesSection';
import ModulesSection from '@/components/landing/ModulesSection';
import NewFooter from '@/components/landing/NewFooter';

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen">
      <NewHero />
      <StatsCounter />
      <PreDesignCalculator />
      <FeaturesSection />
      <ModulesSection />
      <NewFooter />
    </main>
  );
}
