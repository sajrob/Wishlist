import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/hooks/useProfile";

export function ProtectedAdminRoute() {
    const { user, loading: authLoading } = useAuth();
    const { data: profile, isLoading: profileLoading } = useProfile(user?.id || null);

    // Diagnostic logging
    console.log("[AdminGuard] State:", {
        authLoading,
        profileLoading,
        hasUser: !!user,
        profileAdmin: profile?.is_admin,
        metadataAdmin: user?.user_metadata?.is_admin
    });

    if (authLoading || profileLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-muted-foreground animate-pulse">Verifying permissions...</p>
            </div>
        );
    }

    const isAdmin = profile?.is_admin === true || user?.user_metadata?.is_admin === true;

    if (!user || !isAdmin) {
        console.warn("[AdminGuard] Access Denied. Redirecting...");
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
}
