import React, { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export function NotificationBanner() {
  const { permission, subscribe, isSubscribed, loading } =
    usePushNotifications();
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check local storage for dismissed state
    const isDismissed = localStorage.getItem(
      "push-notification-banner-dismissed",
    );

    // Show if:
    // 1. User is logged in
    // 2. Not loading
    // 3. Not subscribed
    // 4. Permission is 'default' (meaning we can ask)
    // 5. Not dismissed
    if (
      user &&
      !loading &&
      !isSubscribed &&
      permission === "default" &&
      !isDismissed
    ) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [user, loading, isSubscribed, permission]);

  const handleEnable = async () => {
    // subscribe will trigger the permission prompt
    await subscribe();
    // If successful, isSubscribed becomes true and banner hides.
    // If denied, permission becomes 'denied' and banner hides.
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("push-notification-banner-dismissed", "true");
    toast("Notification prompt dismissed", {
      description:
        "You can enable notifications anytime on your profile page under 'Push Notifications'.",
      action: {
        label: "Undo",
        onClick: () => {
          localStorage.removeItem("push-notification-banner-dismissed");
          // We don't auto-reshow immediately to avoid flicker, but next reload it will show.
          // Or we can setIsVisible(true) if we want.
        },
      },
    });
  };

  if (!isVisible) return null;

  return (
    <div className="w-full bg-amber-50 border-b border-primary/20 p-3 sm:p-4 animate-in slide-in-from-top duration-300 relative z-50">
      <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="p-2 bg-primary/20 rounded-full text-primary hidden sm:block">
            <Bell className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground flex items-center justify-center sm:justify-start gap-2">
              <Bell className="w-4 h-4 sm:hidden text-primary" />
              Enable Notifications
            </p>
            <p className="text-xs text-muted-foreground">
              Get instant updates when friends claim your wishes or add to their
              lists.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-muted-foreground hover:text-foreground h-8 text-xs"
          >
            Not Now
          </Button>
          <Button
            size="sm"
            onClick={handleEnable}
            className="h-8 text-xs font-semibold"
          >
            Allow Notifications
          </Button>
        </div>
      </div>
    </div>
  );
}
