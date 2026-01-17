/**
 * FAQ page component that answers common questions about the application.
 * Clean, centered layout for all users (publicly accessible).
 */
import React from 'react';
import { Separator } from "@/components/ui/separator";
import {
    ChevronDown,
    HelpCircle,
    Heart,
    BookKey,
    Gift,
    Share2,
    Zap,
    CreditCard,
    Tag,
    ScrollText,
    EyeOff,
    Bug,
} from "lucide-react";

function Faq() {
    const [openItem, setOpenItem] = React.useState<number | null>(0);

    const faqs = [
        {
            question: "What is Me List?",
            answer: "Me List is where community and celebration meet. It's a shared space for you and your circle to truly know each other's needs and desires. Whether it's for a wedding, a new home, or just because, Me List helps your friends and family support you with exactly what you need, while giving you the same chance to be a blessing to them.",
            icon: Heart
        },
        {
            question: "How do I create a new wishlist?",
            answer: "It's easy! Click the 'New Wishlist' button in the sidebar. You can give your list a custom name and choose its privacy settings right away. Once created, it appears instantly in your dashboard.",
            icon: ScrollText
        },
        {
            question: "How do I add items?",
            answer: "Just paste a link from any online store! Me List automatically grabs the details for you. You can also manually add items or use the 'Must Have' toggle to let your circle know which things you need most.",
            icon: Zap
        },
        {
            question: "Can I share my wishlists with friends?",
            answer: "Absolutely. Each wishlist has a 'Share' button that generates a unique link. You can send this link to anyone, even if they don't have an account. If your profile is public, friends can also find you by searching your email. Remember to put your wishlist on public if you want friends to see it.",
            icon: Share2
        },
        {
            question: "What's the difference between public and private wishlists?",
            answer: "Public wishlists are visible to anyone with the link or who views your profile. Private wishlists are for your eyes only—perfect for secret gift planning or personal tracking.",
            icon: BookKey
        },
        {
            question: "How does 'Claiming' work?",
            answer: "When a friend sees something they want to get for you, they can 'Claim' it. This lets the rest of the circle know that the item is being handled so they can pick something else or join in! Since it's an honor system, you can still get multiples of things you need plenty of, but it helps friends coordinate to avoid unnecessary duplicates.",
            icon: Tag
        },
        {
            question: "How do I track items I want to buy?",
            answer: "When adding an item, you can include details like price, a direct link to the store, and an image. Use the 'Must Have' toggle to highlight your top priorities so friends know exactly what you want most.",
            icon: Zap
        },
        {
            question: "Is it really free?",
            answer: "Yes, Me List is 100% free to use. We believe that supporting your community and staying connected with loved ones shouldn't cost a dime.",
            icon: CreditCard
        },
        {
            question: "Will I know if an item is claimed?",
            answer: "To keep the surprise alive, you will never see if an item has been claimed. Only your friends can see that coordination. We believe the best part of a gift is the 'wow' moment when you open it!",
            icon: EyeOff
        },
        {
            question: "How do I see what my friends want?",
            answer: "Life is better together. Search for your friends to follow them. Once connected, you can browse their public lists and claim items to ensure you're giving them exactly what they desire.",
            icon: Gift
        }
    ];

    const handleToggle = (index: number) => {
        setOpenItem(openItem === index ? null : index);
    };

    return (
        <div className="flex flex-col min-h-screen bg-slate-50/50">
            {/* Header */}
            <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b bg-white/80 backdrop-blur-md px-6 shadow-sm">
                <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
                    <h1 className="text-xl  mx-auto font-bold tracking-tight text-slate-900 flex items-center gap-2">
                        <span className="flex items-center justify-center size-8 rounded-lg bg-indigo-50 text-indigo-600">
                            <HelpCircle className="size-5" />
                        </span>
                        Frequently Asked Questions
                    </h1>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto">
                {/* Hero Section */}
                <div className="relative overflow-hidden bg-white border-b border-slate-200">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                    <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-indigo-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-purple-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

                    <div className="relative max-w-3xl mx-auto px-6 py-12 text-center">
                        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-4">
                            How can we help you?
                        </h2>
                        <p className="text-lg text-slate-600 max-w-xl mx-auto">
                            Find answers to common questions about managing your wishlists, sharing with friends, and getting the most out of your community.
                        </p>
                    </div>
                </div>

                {/* FAQ Content */}
                <div className="max-w-3xl mx-auto p-6 md:pb-20">
                    <div className="space-y-4">
                        {faqs.map((faq, index) => {
                            const Icon = faq.icon;
                            const isOpen = openItem === index;

                            return (
                                <div
                                    key={index}
                                    className={`group bg-white rounded-xl border transition-all duration-200 overflow-hidden ${isOpen
                                        ? "border-indigo-200 shadow-md ring-1 ring-indigo-50"
                                        : "border-slate-200 shadow-sm hover:border-indigo-200 hover:shadow-md"
                                        }`}
                                >
                                    <button
                                        onClick={() => handleToggle(index)}
                                        className="w-full flex items-center justify-between p-5 text-left focus:outline-none"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`flex items-center justify-center size-10 rounded-full transition-colors ${isOpen ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600"
                                                }`}>
                                                <Icon className="size-5" />
                                            </div>
                                            <span className={`font-semibold text-lg transition-colors ${isOpen ? "text-indigo-900" : "text-slate-900 group-hover:text-indigo-700"
                                                }`}>
                                                {faq.question}
                                            </span>
                                        </div>
                                        <ChevronDown
                                            className={`size-5 text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180 text-indigo-500" : "group-hover:text-indigo-400"
                                                }`}
                                        />
                                    </button>
                                    <div
                                        className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                                            }`}
                                    >
                                        <div className="overflow-hidden">
                                            <div className="px-5 pb-6 pt-0 pl-[4.5rem]">
                                                <p className="text-slate-600 leading-relaxed">
                                                    {faq.answer}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Bug Report Section */}
                        <div className="mt-8 relative overflow-hidden rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/50 p-6 sm:p-8">
                            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-indigo-100/50 rounded-full blur-2xl pointer-events-none"></div>
                            <div className="relative flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white text-indigo-600 shadow-sm ring-1 ring-indigo-100">
                                    <Bug className="h-7 w-7" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-lg font-bold text-slate-900">
                                        Found a bug or have an idea?
                                    </h3>
                                    <p className="text-slate-600 leading-relaxed max-w-2xl">
                                        We're in Beta! If something isn't working or you have an idea to make the community better, please let us know. We appreciate your feedback as we build Me List!
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Faq;