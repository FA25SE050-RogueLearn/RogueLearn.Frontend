// roguelearn-web/src/app/page.tsx
"use client";

import { useState } from 'react';
import HeroSection from '@/components/hero-section';
import FeaturesSection from '@/components/features-8';
import FAQsTwo from '@/components/faqs-2';
import FooterSection from '@/components/footer-one';
import CallToAction from '@/components/call-to-action';
import TestimonialsSection from '@/components/testimonials';
import TeamSection from '@/components/team';
import ContentSection from '@/components/content-one';
import LoadingScreen from '@/components/LoadingScreen';

// This is the correct entry point for your root URL ('/').
// It was correct before, the 404 suggests a deeper configuration issue or
// a problem with how the dev server was started. This file itself is architecturally sound.
export default function Home() {
  const [loadingComplete, setLoadingComplete] = useState(false);

  return (
    <>
      {!loadingComplete && (
        <LoadingScreen onLoadingComplete={() => setLoadingComplete(true)} />
      )}
      {/* The loading screen will cover these until it completes */}
      <div style={{ visibility: loadingComplete ? 'visible' : 'hidden' }}>
        <HeroSection />
        <ContentSection />
        <TestimonialsSection />
        <TeamSection />
        <FAQsTwo />
        <CallToAction />
        <FooterSection />
      </div>
    </>
  );
}