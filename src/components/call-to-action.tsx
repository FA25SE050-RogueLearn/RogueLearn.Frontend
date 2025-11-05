import { Button } from '@/components/ui/button'

export default function CallToAction() {
    return (
        <section className="relative bg-gradient-to-b from-background to-muted/30 py-24 md:py-32">
            <div className="mx-auto max-w-3xl px-6 text-center">
                {/* Wizard Avatar Circle */}
                <div className="mx-auto mb-8 flex h-32 w-32 items-center justify-center rounded-full border-[3px] border-foreground bg-background shadow-[0_8px_32px_rgba(210,49,135,0.15)]">
                    <span className="text-6xl" role="img" aria-label="Wizard encouraging action">
                        🧙‍♂️
                    </span>
                </div>

                {/* Main Heading - Playful tone matching reference */}
                <h2 className="font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
                    Dude, you&apos;re at the bottom of our landing page.
                </h2>

                {/* Subtext */}
                <p className="font-body mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
                    Just get the free trial already if you&apos;re that interested.
                    <br />
                    You scrolled all the way here.
                </p>

                {/* CTA Button with subtext */}
                <div className="mt-12 flex flex-col items-center gap-2">
                    <Button
                        asChild
                        size="lg"
                        className="rounded-full border-2 border-foreground bg-background px-12 py-6 text-lg font-semibold text-foreground shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition-all hover:-translate-y-1 hover:bg-foreground hover:text-background hover:shadow-[0_12px_32px_rgba(210,49,135,0.25)]"
                    >
                        <a href="/signup">Come on, click on this</a>
                    </Button>
                    <span className="font-body text-sm text-muted-foreground/70">Don&apos;t make me beg</span>
                </div>
            </div>
        </section>
    )
}
