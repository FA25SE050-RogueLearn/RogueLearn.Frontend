// roguelearn-web/src/components/logo.tsx
import { cn } from '@/lib/utils'
import Image from 'next/image'

// Renders the application logo from the public directory using the Next.js Image component for optimization.
export const Logo = ({ className }: { className?: string }) => {
    return (
        <Image
            src="/logo.png"
            alt="RogueLearn Logo"
            width={78}
            height={18}
            className={cn('h-5 w-auto', className)}
            priority
        />
    )
}