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

export default function Home() {
  const [loadingComplete, setLoadingComplete] = useState(false);

  return (
    <>
      {!loadingComplete && (
        <LoadingScreen onLoadingComplete={() => setLoadingComplete(true)} />
      )}
      <HeroSection />
      <ContentSection />
      <TestimonialsSection />
      <TeamSection />
      <FAQsTwo />
      <CallToAction />
      <FooterSection />
    </>
  );
}
