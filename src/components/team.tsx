import Image from 'next/image'
import Link from 'next/link'

const members = [
    {
        name: 'Dinh Duong',
        role: 'Frontend Developer',
        avatar: '/dinh-duong.png',
        link: '#',
    },
    {
        name: 'Duy Tan',
        role: 'Game Developer',
        avatar: '/duy-tan.png',
        link: '#',
    },
    {
        name: 'Minh Anh',
        role: 'Full Stack Developer',
        avatar: '/minh-anh.png',
        link: '#',
    },
    {
        name: 'Song Phuc',
        role: 'Backend Developer',
        avatar: '/song-phuc.png',
        link: '#',
    },
    {
        name: 'Thinh An',
        role: 'Full Stack Developer',
        avatar: '/thinh-an.png',
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
                        <p className="font-body text-muted-foreground">Meet the passionate team behind RogueLearn. Five dedicated developers working together to transform programming education into an engaging RPG adventure.</p>
                    </div>
                </div>
                <div className="mt-12 md:mt-24">
                    <div className="flex flex-wrap justify-center gap-6 gap-y-12">
                        {members.map((member, index) => (
                            <div
                                key={index}
                                className="group overflow-hidden w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.33%-16px)]">
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
