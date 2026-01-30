import NewHero from '@/components/landing/NewHero';
import StatsSection from '@/components/landing/StatsSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import ModulesSection from '@/components/landing/ModulesSection';
import LogosSection from '@/components/landing/LogosSection';
import NewFooter from '@/components/landing/NewFooter';

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen">
      <NewHero />
      <StatsSection />
      <FeaturesSection />
      <ModulesSection />
      <LogosSection />
      <NewFooter />
    </main>
  );
}
