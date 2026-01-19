import { useState } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";
import { Bug, Lightbulb, MessageSquare } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/supabaseClient";
import { useAuth } from "@/context/AuthContext";

interface FeedbackDialogProps {
    trigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function FeedbackDialog({ trigger, open, onOpenChange }: FeedbackDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [type, setType] = useState<string>("Bug");
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { user } = useAuth();
    const location = useLocation();

    // Handle controlled/uncontrolled state
    const show = open !== undefined ? open : isOpen;
    const setShow = onOpenChange || setIsOpen;

    const userName =
        (user?.user_metadata as any)?.full_name ||
        `${(user?.user_metadata as any)?.first_name || ""} ${(user?.user_metadata as any)?.last_name || ""
            }`.trim() ||
        user?.email?.split("@")[0] ||
        "Guest";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) {
            toast.error("Please enter a message");
            return;
        }

        setIsSubmitting(true);

        try {
            const { error } = await supabase.from("feedback").insert({
                user_id: user?.id || null, // Allow guest feedback if configured, though RLS might block it without user_id if we didn't set a policy for anon
                username: userName,
                type,
                message,
                page_url: window.location.origin + location.pathname,
                status: "New",
            });

            if (error) throw error;

            toast.success("Thanks! Solomon has been notified. We're on it!");
            setMessage("");
            setType("Bug");
            setShow(false);
        } catch (error) {
            console.error("Error submitting feedback:", error);
            toast.error("Failed to submit feedback. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={show} onOpenChange={setShow}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Report an Issue</DialogTitle>
                    <DialogDescription>
                        Help us improve the beta! Let us know if you found a bug or have a suggestion.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="type">Type</Label>
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger id="type">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Bug">
                                    <div className="flex items-center gap-2">
                                        <Bug className="h-4 w-4 text-[#ef4444]" />
                                        <span>Bug</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="Feature Request">
                                    <div className="flex items-center gap-2">
                                        <Lightbulb className="h-4 w-4 text-[#10b981]" />
                                        <span>Feature Request</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="UX Issue">
                                    <div className="flex items-center gap-2">
                                        <MessageSquare className="h-4 w-4 text-[#f59e0b]" />
                                        <span>UX Issue</span>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                            id="message"
                            placeholder="Tell us what happened..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="resize-none min-h-[100px]"
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Sending..." : "Send Feedback"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
