'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import Link from 'next/link'

export default function FAQsTwo() {
    const faqItems = [
        {
            id: 'item-1',
            question: 'What is RogueLearn?',
            answer: 'RogueLearn is a gamified learning platform that combines RPG mechanics with programming education. Complete quests, battle bugs, level up your skills, and join guilds—all while learning real coding concepts.',
        },
        {
            id: 'item-2',
            question: 'Do I need prior programming experience?',
            answer: 'Not at all! RogueLearn is designed for all skill levels. Our quest system starts with beginner-friendly challenges and progressively introduces advanced concepts as you level up your character.',
        },
        {
            id: 'item-3',
            question: 'What programming languages can I learn?',
            answer: 'Currently, we offer quests for JavaScript, Python, Java, and C++. Each language has its own skill tree with unique abilities to unlock. More languages are being added based on community requests.',
        },
        {
            id: 'item-4',
            question: 'How does the guild system work?',
            answer: "Guilds are groups of learners who tackle challenges together. Join or create a guild, participate in raids (collaborative coding challenges), compete on leaderboards, and share knowledge with your party members.",
        },
        {
            id: 'item-5',
            question: 'Is RogueLearn free to use?',
            answer: 'Yes! RogueLearn offers a free tier with access to core quests and features. Premium membership unlocks exclusive dungeons, advanced skill trees, and additional customization options for your character.',
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
