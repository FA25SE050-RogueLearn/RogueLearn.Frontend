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
    { label: "Home", ariaLabel: "Go to home page", link: "/" },
    { label: "Game", ariaLabel: "Navigate to game page", link: "/game" },
    {
      label: "Learning",
      ariaLabel: "Navigate to learning section",
      link: "#learning",
    },
    { label: "About", ariaLabel: "Navigate to about section", link: "#about" },
  ];

  const socialItems = [
    { label: "GitHub", link: "https://github.com/FA25SE050-RogueLearn" },
    { label: "Discord", link: "#discord" },
    { label: "Twitter", link: "#twitter" },
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
        <section className="relative">
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

          {/* Content overlay */}
          <div className="relative z-10 pb-24 pt-12 md:pb-32 lg:pb-56 lg:pt-44">
            <div className="relative mx-auto flex max-w-6xl flex-col px-6 lg:block">
              <div className="mx-auto max-w-lg text-center lg:ml-0 lg:w-1/2 lg:text-left">
                {/* Simple blur background for hero text */}
                <div
                  className="p-8 backdrop-blur-md bg-white/10 rounded-[32px] border border-white/20"
                  style={{
                    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
                  }}
                >
                  <h1 className="mt-8 max-w-2xl text-balance text-5xl font-medium md:text-6xl lg:mt-16 xl:text-7xl font-tilt-neon text-white">
                    Learn Programming Through Adventure
                  </h1>
                  <p className="mt-8 max-w-2xl text-pretty text-lg font-tilt-neon text-white/90">
                    Master coding concepts through an immersive rogue-like game
                    experience. Battle bugs, solve puzzles, and level up your
                    programming skills in an engaging virtual world.
                  </p>
                </div>

                <div className="mt-12 flex flex-col items-center justify-center gap-2 sm:flex-row lg:justify-start">
                  <Button asChild size="lg" className="px-5 text-base">
                    <Link href="/dashboard">
                      <span className="text-nowrap">Open Dashboard</span>
                    </Link>
                  </Button>
                  <Button
                    key={2}
                    asChild
                    size="lg"
                    variant="ghost"
                    className="px-5 text-base"
                  >
                    <Link href="#features">
                      <span className="text-nowrap">Learn More</span>
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="pb-16 md:pb-32">
          <div className="group relative m-auto max-w-6xl px-6">
            <div className="flex flex-col items-center md:flex-row">
              <div className="md:max-w-44 md:border-r md:pr-6">
                <p className="text-end text-sm">Trusted by educators</p>
              </div>
              <div className="relative py-6 md:w-[calc(100%-11rem)]">
                <InfiniteSlider speedOnHover={20} speed={40} gap={112}>
                  <div className="flex">
                    <img
                      className="mx-auto h-5 w-fit dark:invert"
                      src="https://html.tailus.io/blocks/customers/github.svg"
                      alt="GitHub Logo"
                      height="20"
                      width="auto"
                    />
                  </div>

                  <div className="flex">
                    <img
                      className="mx-auto h-4 w-fit dark:invert"
                      src="https://html.tailus.io/blocks/customers/laravel.svg"
                      alt="Laravel Logo"
                      height="16"
                      width="auto"
                    />
                  </div>
                  <div className="flex">
                    <img
                      className="mx-auto h-6 w-fit dark:invert"
                      src="https://html.tailus.io/blocks/customers/openai.svg"
                      alt="OpenAI Logo"
                      height="24"
                      width="auto"
                    />
                  </div>
                  <div className="flex">
                    <img
                      className="mx-auto h-5 w-fit dark:invert"
                      src="https://html.tailus.io/blocks/customers/nvidia.svg"
                      alt="Nvidia Logo"
                      height="20"
                      width="auto"
                    />
                  </div>
                  <div className="flex">
                    <img
                      className="mx-auto h-5 w-fit dark:invert"
                      src="https://html.tailus.io/blocks/customers/lemonsqueezy.svg"
                      alt="Lemon Squeezy Logo"
                      height="20"
                      width="auto"
                    />
                  </div>
                </InfiniteSlider>

                <ProgressiveBlur
                  className="pointer-events-none absolute left-0 top-0 h-full w-32"
                  direction="left"
                  blurIntensity={2}
                />
                <ProgressiveBlur
                  className="pointer-events-none absolute right-0 top-0 h-full w-32"
                  direction="right"
                  blurIntensity={2}
                />
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
