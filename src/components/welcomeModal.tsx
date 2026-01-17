"use client";
import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogHeader,

} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Gift, Share2, Users, Sparkles } from "lucide-react";

export function WelcomeModal() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // -----------------------------------------------------------------------
        // START TEMPORARY TESTING BLOCK
        // Reset the welcome execution state so the modal shows on every reload.
        // DELETE THIS BLOCK AFTER TESTING
        // localStorage.removeItem("hasSeenWelcome");
        // -----------------------------------------------------------------------

        // Check if this is the first visit
        const hasSeenWelcome = localStorage.getItem("hasSeenWelcome");
        if (!hasSeenWelcome) {
            // Small delay for better UX on load
            const timer = setTimeout(() => setIsOpen(true), 500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleClose = () => {
        localStorage.setItem("hasSeenWelcome", "true");
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-xl text-center">
                <DialogHeader className="flex flex-col items-center">
                    <Gift className="bg-slate-100 p-2 rounded-lg text-red-600 size-10" />
                    <DialogTitle className="text-2xl font-bold">Welcome to <span className="text-blue-700">Me Lists</span>!</DialogTitle>
                </DialogHeader>
                <div className="space-y-8 ">
                    <p className="text-muted-foreground text-sm">
                        We're so glad you're here. We've made gift-giving a breeze. Here is why you'll love it:
                    </p>

                    <div className="space-y-4 text-left">
                        <div className="flex gap-4 items-start">
                            <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><Gift size={20} /></div>
                            <div>
                                <p className="font-semibold text-sm">Wish Smarter.</p>
                                <p className="text-xs">Paste any link. We'll handle the rest- Or type it out manually.</p>
                            </div>
                        </div>

                        <div className="flex gap-4 items-start">
                            <div className="bg-green-100 p-2 rounded-lg text-green-600"><Share2 size={20} /></div>
                            <div>
                                <p className="font-semibold text-sm">Share Once</p>
                                <p className="text-xs">Send your wishlists. End the "what do you want?" texts forever.</p>
                            </div>
                        </div>

                        <div className="flex gap-4 items-start">
                            <div className="bg-purple-100 p-2 rounded-lg text-purple-600"><Users size={20} /></div>
                            <div>
                                <p className="font-semibold text-sm">The Giving Circle</p>
                                <p className="text-xs text-muted-foreground">Follow friends to see their true desires. Give the perfect gift, every time.</p>
                            </div>
                        </div>
                    </div>

                    <Button onClick={handleClose} className="w-full py-6 text-white text-lg">
                        Let's Get Started
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function FeatureRow({
    icon,
    color,
    title,
    description
}: {
    icon: React.ReactNode;
    color: string;
    title: string;
    description: string;
}) {
    return (
        <div className="flex gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors duration-200 group">
            <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${color} transition-transform duration-200 group-hover:scale-105 shadow-sm`}>
                {icon}
            </div>
            <div className="space-y-0.5">
                <h4 className="font-bold text-slate-900 text-sm">{title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    {description}
                </p>
            </div>
        </div>
    );
}