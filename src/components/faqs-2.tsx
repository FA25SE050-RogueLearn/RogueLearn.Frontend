'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import Link from 'next/link'

export default function FAQsTwo() {
    const faqItems = [
        {
            id: 'item-1',
            question: 'What is RogueLearn?',
            answer: 'RogueLearn is a gamified learning platform that transforms programming education into an RPG adventure. Complete quests, track your progress, compete in code battles, earn achievements, and join guilds—all while mastering real coding skills.',
        },
        {
            id: 'item-2',
            question: 'How does the Quest system work?',
            answer: 'Quests are structured learning paths with step-by-step challenges. You can track your completion percentage, resume from where you left off, and earn XP for each step completed. Find quests that match your current subject curriculum.',
        },
        {
            id: 'item-3',
            question: 'What are Code Battles?',
            answer: 'Code Battles are competitive events where you solve programming challenges against other learners. Join active events, compete for positions on leaderboards, and earn special achievements. New battles are regularly added!',
        },
        {
            id: 'item-4',
            question: 'How do Guilds and Parties work?',
            answer: "Guilds are communities of learners collaborating together. Join a guild to access shared resources and compete in guild events. Parties are smaller groups for focused study sessions and tackling challenges with friends.",
        },
        {
            id: 'item-5',
            question: 'How do I track my progress?',
            answer: 'Your dashboard shows everything: active quests with completion percentage, skills with XP levels, earned achievements, and your guild/party memberships. Watch your skills level up as you complete more challenges!',
        },
    ]

    return (
        <section className="py-16 md:py-24 bg-muted/30">
            <div className="mx-auto max-w-5xl px-4 md:px-6">
                <div className="mx-auto max-w-xl text-center">
                    <h2 className="font-heading text-balance text-3xl font-bold md:text-4xl lg:text-5xl text-foreground">
                        Quest <span className="text-primary">FAQ</span>
                    </h2>
                    <p className="font-body text-muted-foreground mt-4 text-balance">
                        Everything you need to know about your learning adventure in RogueLearn.
                    </p>
                </div>

                <div className="mx-auto mt-12 max-w-xl">
                    <Accordion
                        type="single"
                        collapsible
                        className="bg-card w-full rounded-2xl border border-border px-8 py-3 shadow-sm">
                        {faqItems.map((item) => (
                            <AccordionItem
                                key={item.id}
                                value={item.id}
                                className="border-dashed border-border">
                                <AccordionTrigger className="font-heading cursor-pointer text-base hover:no-underline text-foreground">{item.question}</AccordionTrigger>
                                <AccordionContent>
                                    <p className="font-body text-base text-muted-foreground">{item.answer}</p>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>

                    <p className="font-body text-muted-foreground mt-6 px-8">
                        Still have questions? Join our{' '}
                        <Link
                            href="#"
                            className="text-primary font-semibold hover:underline">
                            Discord community
                        </Link>
                        {' '}or message our support team.
                    </p>
                </div>
            </div>
        </section>
    )
}
