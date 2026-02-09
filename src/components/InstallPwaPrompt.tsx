import React, { useEffect, useState } from 'react';
import { X, Download, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

export function InstallPwaPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // Check for iOS
        const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;

        setIsIOS(isIOSDevice);

        if (isStandalone) {
            setIsVisible(false);
            return;
        }

        // Handle Android/Desktop standard PWA prompt
        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            checkDismissed();
        };

        // For iOS, we can technically show a custom prompt if not in standalone mode
        if (isIOSDevice && !isStandalone) {
            checkDismissed();
        }

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const checkDismissed = () => {
        const dismissedAt = localStorage.getItem('pwa-install-dismissed');
        if (dismissedAt) {
            const daysSinceDismissal = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60 * 24);
            if (daysSinceDismissal < 7) {
                setIsVisible(false);
                return;
            }
        }
        setIsVisible(true);
    };

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setDeferredPrompt(null);
            setIsVisible(false);
        }
    };

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-[24rem] animate-in slide-in-from-bottom-10 fade-in duration-500">
            <Card className="border-primary/20 shadow-xl bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 ring-1 ring-black/5">
                <CardHeader className="pb-3 px-4 pt-4">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-primary/10 rounded-xl">
                                <Smartphone className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-base font-bold">Install App</CardTitle>
                                <CardDescription className="text-xs font-medium text-muted-foreground mt-0.5">
                                    Get the best experience
                                </CardDescription>
                            </div>
                        </div>
                        <button onClick={handleDismiss} className="text-muted-foreground/50 hover:text-foreground transition-colors p-1 -mr-2 -mt-2">
                            <X className="h-4 w-4" />
                            <span className="sr-only">Close</span>
                        </button>
                    </div>
                </CardHeader>
                <div className="px-4 pb-4">
                    <p className="text-sm text-foreground/80 leading-relaxed mb-4">
                        Install <span className="font-semibold text-primary">Me List</span> to receive instant notifications about new wishes and claims directly on your device.
                    </p>

                    {isIOS ? (
                        <div className="text-xs bg-muted/50 p-3 rounded-lg border border-border">
                            <p className="font-semibold mb-1">To install on iOS:</p>
                            <p>Tap <span className="font-bold">Share</span> <span className="inline-block px-1.5 py-0.5 bg-background border rounded text-[10px] mx-0.5">⎋</span> then select <span className="font-bold">"Add to Home Screen"</span> <span className="inline-block px-1.5 py-0.5 bg-background border rounded text-[10px] mx-0.5">+</span></p>
                        </div>
                    ) : (
                        deferredPrompt && (
                            <Button onClick={handleInstallClick} className="w-full gap-2 font-extrabold uppercase tracking-wider text-xs h-10 shadow-lg shadow-primary/20">
                                <Download className="h-4 w-4" />
                                Install Application
                            </Button>
                        )
                    )}
                </div>
            </Card>
        </div>
    );
}
