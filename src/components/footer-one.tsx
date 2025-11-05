import Link from 'next/link'
import { ArrowUpRight, Heart } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

const infoLinks = [
    { title: 'Support', href: '/support' },
    { title: 'Affiliate', href: '/affiliate' },
    { title: 'All Templates', href: '/templates' },
]

const socialLinks = [
    { title: 'Instagram', href: 'https://instagram.com/roguelearn' },
    { title: 'X (Twitter)', href: 'https://twitter.com/roguelearn' },
    { title: 'YouTube', href: 'https://youtube.com/@roguelearn' },
    { title: 'Notion', href: 'https://notion.so' },
]

export default function FooterSection() {
    return (
        <footer className="bg-muted/30 py-20">
            <div className="mx-auto max-w-7xl px-6">
                {/* Main Footer Card - Larger and with giant brand text inside */}
                <div className="relative overflow-hidden rounded-[40px] border-2 border-border bg-card px-10 py-16 sm:px-16">
                    {/* Top Section: Brand, Contact, Templates */}
                    <div className="relative z-10 mb-12 flex flex-wrap items-start justify-between gap-8">
                        {/* Brand Section - Left */}
                        <div className="space-y-6">
                            <img src="/barcode.png" alt="RogueLearn" className="h-16 w-auto" />
                            <p className="max-w-xs font-body text-sm leading-relaxed text-muted-foreground">
                                Capture ideas, manage projects, and streamline workflows all in one simple, organized space.
                            </p>
                        </div>

                        {/* Contact Button - Right */}
                        <div className="ml-auto">
                            <Button
                                asChild
                                className="rounded-full border-2 border-foreground bg-background px-8 py-5 text-sm font-bold text-foreground shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all hover:-translate-y-1 hover:bg-foreground hover:text-background hover:shadow-[0_8px_24px_rgba(210,49,135,0.2)]"
                            >
                                <Link href="mailto:hello@roguelearn.com">Contact</Link>
                            </Button>
                        </div>
                    </div>

                    {/* Navigation Links - Below description */}
                    <div className="relative z-10 grid gap-12 sm:grid-cols-2 md:max-w-md">
                        <div className="space-y-4">
                            <p className="font-heading text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground">Info</p>
                            <ul className="space-y-3 text-sm">
                                {infoLinks.map((link) => (
                                    <li key={link.title}>
                                        <Link 
                                            href={link.href} 
                                            className="font-medium text-foreground/70 transition-colors hover:text-primary"
                                        >
                                            {link.title}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="space-y-4">
                            <p className="font-heading text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground">Social</p>
                            <ul className="space-y-3 text-sm">
                                {socialLinks.map((link) => (
                                    <li key={link.title}>
                                        <Link 
                                            href={link.href} 
                                            className="font-medium text-foreground/70 transition-colors hover:text-primary" 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                        >
                                            {link.title}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Footer Bottom */}
                    <div className="relative z-10 mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-8 text-xs">
                        <span className="text-muted-foreground">© Copyright {new Date().getFullYear()}. All Rights Reserved.</span>
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                            Made with
                            <Heart className="h-3.5 w-3.5 fill-primary text-primary" />
                            by RougeLearn
                        </span>
                    </div>

                    {/* Giant Brand Text - 70% visible, 30% hidden below */}
                    <div className="relative z-10 mt-12 mb-[-4rem] h-[4.5rem] overflow-visible sm:h-[5.5rem] md:h-[6.5rem] lg:h-[7.5rem]">
                        <p className="text-center font-heading text-[8.5rem] font-black leading-[0.8] tracking-tighter text-foreground/30 sm:text-[10rem] md:text-[11.5rem] lg:text-[13rem]">
                            RogueLearn
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    )
}
