import Hero from '@/components/landing/Hero';
import PhilosophySection from '@/components/landing/PhilosophySection';
import FeaturesGrid from '@/components/landing/FeaturesGrid';
import LandingFooter from '@/components/landing/LandingFooter';

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen bg-background">
      <Hero />
      <PhilosophySection />
      <FeaturesGrid />
      <LandingFooter />
    </main>
  );
}
