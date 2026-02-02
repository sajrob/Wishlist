import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
    Search,
    User,
    MessageSquare,
    List,
    Loader2
} from "lucide-react";

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { searchAdmin } from "@/api/admin";

export function AdminSearch() {
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState("");
    const [results, setResults] = React.useState<{
        users: any[];
        feedback: any[];
        wishlists: any[];
    }>({ users: [], feedback: [], wishlists: [] });
    const [loading, setLoading] = React.useState(false);
    const navigate = useNavigate();

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    React.useEffect(() => {
        if (!query) {
            setResults({ users: [], feedback: [], wishlists: [] });
            return;
        }

        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await searchAdmin(query);
                setResults(res);
            } catch (error) {
                console.error("Search error:", error);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    const onSelect = (path: string) => {
        setOpen(false);
        navigate(path);
    };

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="relative inline-flex items-center justify-start rounded-md bg-muted/50 px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 sm:pr-12 md:w-40 lg:w-64"
            >
                <Search className="mr-2 h-4 w-4" />
                <span className="hidden lg:inline-flex">Search admin...</span>
                <span className="inline-flex lg:hidden">Search...</span>
                <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </button>
            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput
                    placeholder="Type to search users, feedback, wishlists..."
                    onValueChange={setQuery}
                />
                <CommandList>
                    {loading && (
                        <div className="flex items-center justify-center py-6">
                            <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                    )}
                    {!loading && query && (
                        <CommandEmpty>No results found.</CommandEmpty>
                    )}

                    <CommandGroup heading="Users">
                        {results.users.map((u) => (
                            <CommandItem key={u.id} onSelect={() => onSelect(`/admin/users`)}>
                                <User className="mr-2 h-4 w-4" />
                                <span>{u.full_name}</span>
                                <span className="ml-2 text-xs text-muted-foreground tracking-tight">@{u.username}</span>
                            </CommandItem>
                        ))}
                    </CommandGroup>

                    <CommandGroup heading="Feedback">
                        {results.feedback.map((f) => (
                            <CommandItem key={f.id} onSelect={() => onSelect(`/admin/feedback`)}>
                                <MessageSquare className="mr-2 h-4 w-4" />
                                <span className="truncate max-w-[300px] italic">"{f.message}"</span>
                                <span className="ml-2 text-xs text-muted-foreground shrink-0">{f.username}</span>
                            </CommandItem>
                        ))}
                    </CommandGroup>

                    <CommandGroup heading="Wishlists">
                        {results.wishlists.map((w) => (
                            <CommandItem key={w.id} onSelect={() => onSelect(`/admin/wishlists`)}>
                                <List className="mr-2 h-4 w-4" />
                                <span>{w.name}</span>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </>
    );
}
