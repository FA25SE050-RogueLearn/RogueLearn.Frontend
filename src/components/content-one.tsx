'use client'
import { cn } from '@/lib/utils'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Bold, Calendar1, Ellipsis, Italic, Strikethrough, Underline } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ContentSection() {
    return (
        <section>
            <div className="bg-muted/50 py-24">
                <div className="mx-auto w-full max-w-5xl px-6">
                    <div>
                        <span className="font-body text-sm font-semibold uppercase tracking-wider text-primary">Interactive Learning</span>
                        <h2 className="font-heading text-foreground mt-4 text-4xl font-bold">Master Code Through <span className="text-primary">Adventure</span></h2>
                        <p className="font-body text-muted-foreground mb-12 mt-4 text-lg">RogueLearn transforms programming education into an epic quest. Battle through dungeons of algorithms, unlock powerful coding abilities, and level up your skills in real-time combat scenarios.</p>
                    </div>

                    <div className="border-border space-y-6 sm:space-y-0 sm:divide-y divide-border">
                        <div className="grid sm:grid-cols-5 sm:divide-x divide-border">
                            <CodeIllustration className="sm:col-span-2" />
                            <div className="mt-6 sm:col-span-3 sm:mt-0 sm:border-l border-border sm:pl-12">
                                <h3 className="font-heading text-foreground text-xl font-bold">Real Code Challenges</h3>
                                <p className="font-body text-muted-foreground mt-4 text-lg">Face authentic programming challenges disguised as epic quests. Each victory strengthens your understanding and unlocks advanced techniques.</p>
                            </div>
                        </div>
                        <div className="grid sm:grid-cols-5 sm:divide-x divide-border">
                            <div className="pt-12 sm:col-span-3 sm:border-r border-border sm:pr-12">
                                <h3 className="font-heading text-foreground text-xl font-bold">Progressive Skill Trees</h3>
                                <p className="font-body text-muted-foreground mt-4 text-lg">Customize your learning journey. Choose your class, unlock abilities, and specialize in languages that match your career goals.</p>
                            </div>
                            <div className="row-start-1 flex items-center justify-center pt-12 sm:col-span-2 sm:row-start-auto">
                                <ScheduleIllustation className="pt-8" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
type IllustrationProps = {
    className?: string
    variant?: 'elevated' | 'outlined' | 'mixed'
}

export const ScheduleIllustation = ({ className, variant = 'elevated' }: IllustrationProps) => {
    return (
        <div className={cn('relative', className)}>
            <div
                className={cn('bg-background -translate-x-1/8 absolute flex -translate-y-[110%] items-center gap-2 rounded-lg p-1', {
                    'shadow-black-950/10 shadow-lg': variant === 'elevated',
                    'border-foreground/10 border': variant === 'outlined',
                    'border-foreground/10 border shadow-md shadow-black/5': variant === 'mixed',
                })}>
                <Button
                    size="sm"
                    className="rounded-sm">
                    <Calendar1 className="size-3" />
                    <span className="text-sm font-medium">Schedule</span>
                </Button>
                <span className="bg-border block h-4 w-px"></span>
                <ToggleGroup
                    type="multiple"
                    size="sm"
                    className="gap-0.5 *:rounded-md">
                    <ToggleGroupItem
                        value="bold"
                        aria-label="Toggle bold">
                        <Bold className="size-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem
                        value="italic"
                        aria-label="Toggle italic">
                        <Italic className="size-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem
                        value="underline"
                        aria-label="Toggle underline">
                        <Underline className="size-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem
                        value="strikethrough"
                        aria-label="Toggle strikethrough">
                        <Strikethrough className="size-4" />
                    </ToggleGroupItem>
                </ToggleGroup>
                <span className="bg-border block h-4 w-px"></span>
                <Button
                    size="icon"
                    className="size-8"
                    variant="ghost">
                    <Ellipsis className="size-3" />
                </Button>
            </div>
            <span>
                <span className="bg-secondary text-secondary-foreground py-1">Tomorrow 8:30 pm</span> is our priority.
            </span>
        </div>
    )
}

export const CodeIllustration = ({ className }: { className?: string }) => {
    return (
        <div className={cn('[mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_50%,transparent_100%)]', className)}>
            <ul className="text-muted-foreground mx-auto w-fit font-mono text-2xl font-medium">
                {['Classes', 'Functions', 'Variables', 'Arrays', 'Objects'].map((item, index) => (
                    <li
                        key={index}
                        className={cn(index == 2 && "text-foreground before:absolute before:-translate-x-[110%] before:text-primary before:content-['Master']")}>
                        {item}
                    </li>
                ))}
            </ul>
        </div>
    )
}
