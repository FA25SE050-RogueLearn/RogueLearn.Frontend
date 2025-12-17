"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import StaggeredMenu from "./StaggeredMenu";
import PixelBlast from "./PixelBlast";
import { InfiniteSlider } from "@/components/ui/infinite-slider";
import { ProgressiveBlur } from "@/components/ui/progressive-blur";

export default function HeroSection() {
  const menuItems = [
    { label: "Home", ariaLabel: "Go to home page", link: "#home" },
    { label: "Features", ariaLabel: "View features", link: "#features" },
    { label: "The Guild", ariaLabel: "Meet the team", link: "#team" },
    { label: "FAQ", ariaLabel: "View FAQs", link: "#faq" },
  ];

  const socialItems = [
    { label: "Login", link: "/login" },
    { label: "Sign Up", link: "/signup" },
  ];

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          pointerEvents: "none",
        }}
      >
        <StaggeredMenu
          position="right"
          items={menuItems}
          socialItems={socialItems}
          displaySocials={true}
          displayItemNumbering={true}
          menuButtonColor="#d23187"
          openMenuButtonColor="#ffffff"
          changeMenuColorOnOpen={true}
          colors={["#5a4a3e", "#1a1612"]}
          accentColor="#d23187"
          onMenuOpen={() => console.log("Menu opened")}
          onMenuClose={() => console.log("Menu closed")}
        />
      </div>
      <main className="overflow-x-hidden">
        {/* Redesigned Hero Section */}
        <section className="relative min-h-screen flex items-center">
          {/* PixelBlast Background */}
          <div className="absolute inset-0 w-full h-full">
            <PixelBlast
              variant="square"
              pixelSize={4}
              color="#d23187"
              patternScale={2}
              patternDensity={1.5}
              enableRipples
              rippleSpeed={0.4}
              rippleThickness={0.12}
              rippleIntensityScale={1.5}
              speed={0.5}
              edgeFade={0.25}
              transparent
            />
          </div>

          {/* Dark Gradient Overlays - More Neutral */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.5)_100%)]" />

          {/* Content overlay */}
          <div className="relative z-10 w-full py-20 md:py-32 lg:py-40">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-4xl text-center">
                {/* Subtle Badge */}
                <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm">
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-sm font-medium text-white/80">
                    Now in Open Beta
                  </span>
                </div>

                {/* Main Heading - Using Lora Font */}
                <h1 className="font-heading text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white leading-[1.1]">
                  Learn Programming
                  <br />
                  <span className="text-muted-foreground">
                    Through Adventure
                  </span>
                </h1>

                {/* Subheading - Using Nunito Sans */}
                <p className="font-body mt-8 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  Master coding concepts through an immersive roguelike game experience.
                  Battle bugs, solve puzzles, and level up your programming skills.
                </p>

                {/* CTA Buttons - More Subtle */}
                <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button
                    asChild
                    size="lg"
                    className="px-8 py-6 text-base font-semibold shadow-xl"
                  >
                    <Link href="/dashboard">
                      <span className="relative z-10">Start Your Quest</span>
                    </Link>
                  </Button>

                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="border-border bg-background/50 px-8 py-6 text-base font-semibold backdrop-blur-sm hover:bg-background/80"
                  >
                    <Link href="#features">
                      <span>Explore Features</span>
                    </Link>
                  </Button>
                </div>

                {/* Stats - Minimal Design */}
                <div className="mt-20 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
                  <div className="text-center">
                    <div className="font-heading text-4xl font-bold text-foreground">
                      1,000<span className="text-primary">+</span>
                    </div>
                    <div className="mt-2 font-body text-sm text-muted-foreground">
                      Active Learners
                    </div>
                  </div>

                  <div className="text-center border-x border-border/50">
                    <div className="font-heading text-4xl font-bold text-foreground">
                      200<span className="text-primary">+</span>
                    </div>
                    <div className="mt-2 font-body text-sm text-muted-foreground">
                      Epic Quests
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="font-heading text-4xl font-bold text-foreground">
                      95<span className="text-primary">%</span>
                    </div>
                    <div className="mt-2 font-body text-sm text-muted-foreground">
                      Success Rate
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Minimal Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
            <div className="flex flex-col items-center gap-2 animate-bounce opacity-50 hover:opacity-100 transition-opacity">
              <span className="font-body text-xs font-medium text-muted-foreground uppercase tracking-wider">Scroll</span>
              <div className="h-8 w-5 rounded-full border border-border flex items-start justify-center p-1">
                <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
              </div>
            </div>
          </div>
        </section>

        {/* Trusted By Section - Cleaner */}
        <section className="relative py-16 md:py-24 bg-muted/30">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="flex flex-col items-center">
              {/* Title */}
              <div className="mb-12 text-center">
                <p className="font-body text-sm font-medium uppercase tracking-wider text-muted-foreground">
                  Trusted by educators worldwide
                </p>
              </div>

              {/* Logos */}
              <div className="relative w-full">
                <InfiniteSlider speedOnHover={20} speed={40} gap={112}>
                  <div className="flex items-center justify-center px-8">
                    <Image
                      className="h-8 w-auto opacity-50 hover:opacity-100 transition-opacity dark:invert"
                      src="https://html.tailus.io/blocks/customers/github.svg"
                      alt="GitHub Logo"
                      height={32}
                      width={120}
                    />
                  </div>

                  <div className="flex items-center justify-center px-8">
                    <Image
                      className="h-7 w-auto opacity-50 hover:opacity-100 transition-opacity dark:invert"
                      src="https://html.tailus.io/blocks/customers/laravel.svg"
                      alt="Laravel Logo"
                      height={28}
                      width={120}
                    />
                  </div>

                  <div className="flex items-center justify-center px-8">
                    <Image
                      className="h-9 w-auto opacity-50 hover:opacity-100 transition-opacity dark:invert"
                      src="https://html.tailus.io/blocks/customers/openai.svg"
                      alt="OpenAI Logo"
                      height={36}
                      width={120}
                    />
                  </div>

                  <div className="flex items-center justify-center px-8">
                    <Image
                      className="h-8 w-auto opacity-50 hover:opacity-100 transition-opacity dark:invert"
                      src="https://html.tailus.io/blocks/customers/nvidia.svg"
                      alt="Nvidia Logo"
                      height={32}
                      width={120}
                    />
                  </div>

                  <div className="flex items-center justify-center px-8">
                    <Image
                      className="h-8 w-auto opacity-50 hover:opacity-100 transition-opacity dark:invert"
                      src="https://html.tailus.io/blocks/customers/lemonsqueezy.svg"
                      alt="Lemon Squeezy Logo"
                      height={32}
                      width={120}
                    />
                  </div>
                </InfiniteSlider>

                <ProgressiveBlur
                  className="pointer-events-none absolute left-0 top-0 h-full w-40"
                  direction="left"
                  blurIntensity={3}
                />
                <ProgressiveBlur
                  className="pointer-events-none absolute right-0 top-0 h-full w-40"
                  direction="right"
                  blurIntensity={3}
                />
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
