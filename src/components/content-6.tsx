import Image from 'next/image'
import Link from 'next/link'

const contributorAvatars = [
    'https://randomuser.me/api/portraits/men/1.jpg',
    'https://randomuser.me/api/portraits/men/2.jpg',
    'https://randomuser.me/api/portraits/men/3.jpg',
    'https://randomuser.me/api/portraits/men/4.jpg',
    'https://randomuser.me/api/portraits/men/5.jpg',
    'https://randomuser.me/api/portraits/men/6.jpg',
    'https://randomuser.me/api/portraits/men/7.jpg',
    'https://randomuser.me/api/portraits/men/1.jpg',
    'https://randomuser.me/api/portraits/men/8.jpg',
    'https://randomuser.me/api/portraits/men/9.jpg',
    'https://randomuser.me/api/portraits/men/10.jpg',
]

export default function CommunitySection() {
    return (
        <section className="py-16 md:py-32">
            <div className="mx-auto max-w-5xl px-6">
                <div className="text-center">
                    <h2 className="text-3xl font-semibold">
                        Built by the Community <br /> for the Community
                    </h2>
                    <p className="mt-6">Harum quae dolore orrupti aut temporibus ariatur.</p>
                </div>
                <div className="mx-auto mt-12 flex max-w-lg flex-wrap justify-center gap-3">
                    {contributorAvatars.map((src, index) => (
                        <Link
                            key={`${src}-${index}`}
                            href="https://github.com/meschacirung"
                            target="_blank"
                            title="Méschac Irung"
                            className="relative size-16 overflow-hidden rounded-full border"
                        >
                            <Image
                                src={src}
                                alt={`Community member ${index + 1}`}
                                width={120}
                                height={120}
                                className="size-full rounded-full object-cover"
                                loading="lazy"
                            />
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}
