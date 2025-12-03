// roguelearn-web/src/app/page.tsx
"use client";

import { useState } from 'react';
import HeroSection from '@/components/hero-section';
import FAQsTwo from '@/components/faqs-2';
import FooterSection from '@/components/footer-one';
import CallToAction from '@/components/call-to-action';
import TestimonialsSection from '@/components/testimonials';
import TeamSection from '@/components/team';
import ContentSection from '@/components/content-one';
import QuickIntro from '@/components/QuickIntro';

export default function Home() {
  const [introComplete, setIntroComplete] = useState(false);

  return (
    <>
      {!introComplete && (
        <QuickIntro onComplete={() => setIntroComplete(true)} />
      )}
      <div>
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