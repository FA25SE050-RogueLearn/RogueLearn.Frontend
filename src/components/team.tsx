import Image from 'next/image'
import Link from 'next/link'

const members = [
    {
        name: 'Alex Rodriguez',
        role: 'Lead Game Designer',
        avatar: 'https://i.pravatar.cc/400?img=33',
        link: '#',
    },
    {
        name: 'Maya Patel',
        role: 'Chief Learning Officer',
        avatar: 'https://i.pravatar.cc/400?img=47',
        link: '#',
    },
    {
        name: 'Jordan Kim',
        role: 'Senior Developer',
        avatar: 'https://i.pravatar.cc/400?img=13',
        link: '#',
    },
    {
        name: 'Samantha Chen',
        role: 'Quest Architect',
        avatar: 'https://i.pravatar.cc/400?img=44',
        link: '#',
    },
    {
        name: 'Marcus Johnson',
        role: 'Community Manager',
        avatar: 'https://i.pravatar.cc/400?img=12',
        link: '#',
    },
    {
        name: 'Elena Volkov',
        role: 'UX Engineer',
        avatar: 'https://i.pravatar.cc/400?img=45',
        link: '#',
    },
]

export default function TeamSection() {
    return (
        <section className="py-16 md:py-32">
            <div className="mx-auto max-w-5xl border-t border-border px-6">
                <span className="font-body text-sm font-medium text-muted-foreground -ml-6 -mt-3.5 block w-max bg-background px-6 uppercase tracking-wider">The Party</span>
                <div className="mt-12 gap-4 sm:grid sm:grid-cols-2 md:mt-24">
                    <div className="sm:w-2/5">
                        <h2 className="font-heading text-3xl font-bold sm:text-4xl text-foreground">Meet Our <span className="text-primary">Guild</span></h2>
                    </div>
                    <div className="mt-6 sm:mt-0">
                        <p className="font-body text-muted-foreground">A diverse team of developers, educators, and game designers united by one mission: making programming education engaging, effective, and accessible through gamification.</p>
                    </div>
                </div>
                <div className="mt-12 md:mt-24">
                    <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                        {members.map((member, index) => (
                            <div
                                key={index}
                                className="group overflow-hidden">
                                <Image
                                    className="h-96 w-full rounded-md object-cover object-top grayscale transition-all duration-500 hover:grayscale-0 group-hover:h-[22.5rem] group-hover:rounded-xl"
                                    src={member.avatar}
                                    alt="team member"
                                    width={826}
                                    height={1239}
                                />
                                <div className="px-2 pt-2 sm:pb-0 sm:pt-4">
                                    <div className="flex justify-between">
                                        <h3 className="font-heading text-base font-semibold text-foreground transition-all duration-500 group-hover:tracking-wider">{member.name}</h3>
                                        <span className="font-body text-xs text-muted-foreground">Lv.{index + 10}</span>
                                    </div>
                                    <div className="mt-1 flex items-center justify-between">
                                        <span className="font-body text-muted-foreground inline-block translate-y-6 text-sm opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">{member.role}</span>
                                        <Link
                                            href={member.link}
                                            className="font-body text-primary inline-block translate-y-8 text-sm tracking-wide opacity-0 transition-all duration-500 hover:underline group-hover:translate-y-0 group-hover:opacity-100">
                                            {' '}
                                            Profile
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
