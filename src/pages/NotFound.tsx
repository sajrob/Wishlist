import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Gift, Home, ArrowLeft, SearchX } from 'lucide-react';

const NotFound: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-[80vh] w-full flex flex-col items-center justify-center p-4 text-center animate-in fade-in zoom-in duration-500">
            <div className="relative mb-8 group">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full transition-all duration-500 group-hover:bg-primary/30" />

                {/* Icon Container */}
                <div className="relative bg-card p-6 rounded-3xl border border-border shadow-2xl transition-transform duration-300 hover:scale-105">
                    <Gift className="w-24 h-24 text-primary" strokeWidth={1.5} />
                    <div className="absolute -bottom-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-2 border-4 border-background shadow-sm">
                        <SearchX className="w-6 h-6" />
                    </div>
                </div>
            </div>

            <div className="space-y-3 mb-8">
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
                    404
                </h1>
                <h2 className="text-2xl font-semibold text-foreground">
                    Page Not Found
                </h2>
                <p className="text-muted-foreground text-lg max-w-md mx-auto">
                    Oops! It looks like this page isn't on anyone's wishlist.
                </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
                <Button
                    variant="outline"
                    onClick={() => navigate(-1)}
                    className="flex-1 gap-2 h-11 font-medium transition-all hover:bg-muted/50"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Go Back
                </Button>
                <Button
                    onClick={() => navigate('/dashboard')}
                    className="flex-1 gap-2 h-11 font-medium shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                >
                    <Home className="w-4 h-4" />
                    Go to Dashboard
                </Button>
            </div>
        </div>
    );
};

export default NotFound;
