//page.tsx:
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { EditableWishlist } from "@/components/EditableWishlist";
import { RevealCard } from "@/components/RevealCard";
import { Snowflake, Gift, Trees, Sparkles, Heart } from "lucide-react";

type PageParams = {
    slug: string;
    memberSlug: string;
};

type PageProps = {
    params: Promise<PageParams>;
};

export async function generateMetadata(props: PageProps): Promise<Metadata> {
    const { slug } = await props.params;
    const family = await prisma.familyGroup.findUnique({
        where: { slug },
        select: { name: true },
    });

    return {
        title: family ? `Intercambio ${family.name}` : "Amigo Secreto",
        description: "¡Descubre quién es tu amigo secreto y mira su lista de deseos!",
    };
}

export default async function MemberPage(props: PageProps) {
    const { slug, memberSlug } = await props.params;

    const family = await prisma.familyGroup.findUnique({
        where: { slug },
    });

    if (!family) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-red-50 text-red-800 font-serif p-4 text-center">
                Grupo familiar no encontrado 😔
            </div>
        );
    }

    const member = await prisma.member.findUnique({
        where: {
            familyGroupId_slug: {
                familyGroupId: family.id,
                slug: memberSlug,
            },
        },
        include: { wishlist: true },
    });

    if (!member) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-red-50 text-red-800 font-serif p-4 text-center">
                Participante no encontrado 😔
            </div>
        );
    }

    const assignment = await prisma.assignment.findFirst({
        where: {
            familyGroupId: family.id,
            giverId: member.id,
        },
    });

    const receiver = assignment
        ? await prisma.member.findUnique({
            where: { id: assignment.receiverId },
            include: { wishlist: true },
        })
        : null;

    return (
        <div className="min-h-screen bg-[#F0F4F1] font-sans selection:bg-red-200 relative overflow-x-hidden">
            {/* Background Pattern */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03]"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 2L2 38h36z' fill='%23166534' fillRule='evenodd'/%3E%3C/svg%3E")` }}>
            </div>

            {/* Top Garland Border */}
            <div className="h-4 bg-red-700 relative border-b-4 border-yellow-500 shadow-md">
                <div className="absolute top-4 left-0 w-full flex justify-around px-4 overflow-hidden h-6">
                    {[...Array(10)].map((_, i) => (
                        <div key={i} className={`w-3 h-3 rounded-full shadow-md ${i % 2 === 0 ? 'bg-red-500' : 'bg-green-500'}`}></div>
                    ))}
                </div>
            </div>

            <main className="max-w-2xl mx-auto px-4 md:px-6 py-8 md:py-12 relative z-10">
                {/* Festive Header */}
                <header className="text-center mb-12 relative">
                    <div className="inline-block relative px-4">
                        <h1 className="text-4xl md:text-5xl font-serif font-black text-green-900 drop-shadow-sm tracking-tight relative z-10 break-words leading-tight">
                            Intercambio {family.name}
                        </h1>
                        <div className="h-3 w-full bg-red-200/50 absolute bottom-2 left-0 -rotate-1 rounded-full -z-0"></div>
                    </div>
                    <div className="mt-6 flex justify-center items-center gap-2">
                        <div className="h-px w-6 md:w-12 bg-green-300"></div>
                        <p className="text-lg md:text-xl text-green-800 font-serif italic">
                            Hola, <span className="font-bold text-red-600 underline decoration-wavy decoration-red-300 underline-offset-4">{member.name}</span>
                        </p>
                        <div className="h-px w-6 md:w-12 bg-green-300"></div>
                    </div>
                </header>

                {/* Reveal Section */}
                {receiver ? (
                    <section className="mb-16 md:mb-20">
                        <RevealCard receiverName={receiver.name} />
                        <p className="text-center text-green-700/60 text-xs md:text-sm font-medium mt-[-1.5rem] md:mt-[-2rem]">
                            ( ¡No le digas a nadie! 🤫 )
                        </p>
                    </section>
                ) : (
                    <div className="text-center p-8 md:p-12 bg-white rounded-[2rem] border-4 border-dashed border-red-200 mb-12 shadow-sm">
                        <p className="text-slate-400 font-serif italic text-lg">
                            ✨ Los duendes están organizando el sorteo... <br />¡Vuelve pronto! ✨
                        </p>
                    </div>
                )}

                {/* Wishlists Container */}
                <div className="space-y-10 md:space-y-12">
                    {/* User's Own Wishlist */}
                    <section className="bg-white rounded-t-lg rounded-b-[2rem] shadow-xl border-t-8 border-green-700 relative overflow-visible">
                        <div className="absolute -top-10 left-6 bg-green-700 text-white px-4 py-1.5 rounded-t-lg font-bold tracking-widest text-[10px] md:text-xs shadow-sm uppercase">
                            Tu Carta
                        </div>
                        <div className="p-6 md:p-8">
                            <div className="flex items-center gap-3 mb-4 text-green-800">
                                <Trees size={24} className="shrink-0" />
                                <h2 className="text-xl md:text-2xl font-bold font-serif">Para tu Amigo Secreto</h2>
                            </div>
                            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                                Ayuda a quien te regale dándole algunas ideas de lo que te gustaría recibir este año.
                            </p>
                            <EditableWishlist
                                initialContent={member.wishlist?.content ?? ""}
                                familySlug={slug}
                                memberSlug={memberSlug}
                            />
                        </div>
                    </section>

                    {/* Receiver's Wishlist */}
                    {receiver && (
                        <section className="bg-[#FFFBF0] rounded-[2rem] shadow-xl border-4 border-dashed border-red-200 relative p-1 md:p-2">
                            <div className="absolute -right-2 -top-4 md:-right-3 md:-top-3 bg-red-600 text-white p-2 md:p-3 rounded-full shadow-lg rotate-12 z-20">
                                <Gift size={20} className="md:w-6 md:h-6" />
                            </div>

                            <div className="bg-white rounded-[1.5rem] p-6 md:p-8 h-full border border-orange-100">
                                <div className="text-center mb-6">
                                    <span className="text-[10px] md:text-xs font-bold text-red-400 uppercase tracking-widest">Lista de Deseos de</span>
                                    <h2 className="text-2xl md:text-3xl font-black text-red-700 font-serif mt-1 break-words leading-tight">{receiver.name}</h2>
                                </div>
                                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 relative min-h-[100px]">
                                    <Sparkles className="absolute top-2 right-2 text-yellow-400 opacity-50" size={16} />
                                    {receiver.wishlist?.content ? (
                                        <pre className="whitespace-pre-wrap font-serif text-slate-700 text-base md:text-lg leading-loose text-center font-medium">
                                            {receiver.wishlist.content}
                                        </pre>
                                    ) : (
                                        <div className="text-center py-6">
                                            <p className="text-slate-400 italic text-sm md:text-base">
                                                Aún no ha escrito su lista...
                                            </p>
                                            <p className="text-2xl mt-2">🤷</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>
                    )}

                </div>

                {/* Footer */}
                <footer className="mt-20 text-center space-y-4 pb-10">
                    <div className="flex justify-center items-center gap-4 text-red-300">
                        <Snowflake size={16} />
                        <Heart size={16} className="text-red-500 fill-red-500" />
                        <Snowflake size={16} />
                    </div>
                    <p className="text-green-800/50 font-serif italic text-sm">
                        Hecho con mucho amor para la familia
                    </p>
                </footer>
            </main>
        </div>
    );
}

