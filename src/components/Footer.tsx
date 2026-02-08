/**
 * Footer component - Shared footer for public pages
 */
import React from "react";
import { Link } from "react-router-dom";
import { Gift } from "lucide-react";

const Footer = () => {
    return (
        <footer className="py-8 border-t border-border">
            <div className="container max-w-6xl mx-auto px-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Gift className="size-5 text-primary" />
                        <span className="font-semibold text-foreground">Me List</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <Link to="/faq" className="hover:text-foreground transition-colors">
                            FAQ
                        </Link>
                        <span>© {new Date().getFullYear()} Me List. All rights reserved.</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
