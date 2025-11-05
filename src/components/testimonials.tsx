import Image from 'next/image';
import { Quote } from 'lucide-react';

export default function TestimonialsSection() {
    return (
        <section className="py-16 md:py-32 bg-muted/30">
            <div className="mx-auto max-w-5xl px-6">
                <div className="mx-auto max-w-3xl">
                    {/* Section Label */}
                    <div className="mb-12 text-center">
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2">
                            <Quote className="h-4 w-4 text-primary" />
                            <span className="font-body text-sm font-semibold text-foreground">
                                Success Stories
                            </span>
                        </div>
                    </div>

                    <blockquote className="relative">
                        {/* Decorative Quote */}
                        <div className="absolute -left-4 -top-8 text-6xl text-primary/20 font-heading">"</div>

                        <p className="font-body text-lg sm:text-xl md:text-2xl text-foreground leading-relaxed">
                            RogueLearn transformed how I approach programming. The quest system kept me engaged, and before I knew it, I&apos;d completed challenges I never thought I could tackle. It&apos;s like learning through an RPG adventure!
                        </p>

                        <div className="mt-12 flex items-center gap-6">
                            <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-primary/20">
                                <Image
                                    className="h-full w-full object-cover"
                                    src="https://i.pravatar.cc/150?img=12"
                                    alt="Sarah Chen"
                                    width={64}
                                    height={64}
                                />
                            </div>
                            <div className="space-y-1 border-l border-border pl-6">
                                <cite className="font-heading not-italic font-semibold text-foreground">Sarah Chen</cite>
                                <span className="font-body text-muted-foreground block text-sm">Computer Science Student, Level 47 Warrior</span>
                            </div>
                        </div>
                    </blockquote>
                </div>
            </div>
        </section>
    )
}
