import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
} from "@/lib/pushNotifications";
import { toast } from "sonner";

export function usePushNotifications() {
  const { user } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission>(
    "Notification" in window ? Notification.permission : "denied",
  );
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkSubscription() {
      if (!("serviceWorker" in navigator) || !user) {
        setLoading(false);
        return;
      }

      try {
        // Check if we already have a registration first
        let registration = await navigator.serviceWorker.getRegistration();

        if (!registration) {
          console.log(
            "[usePushNotifications] No registration found yet, waiting for ready state...",
          );
          console.log(
            "[usePushNotifications] Online status:",
            navigator.onLine,
          );
          // Extended timeout for background check (20s to allow for initial registration)
          registration = await Promise.race([
            navigator.serviceWorker.ready,
            new Promise<ServiceWorkerRegistration>((_, reject) =>
              setTimeout(
                () =>
                  reject(
                    new Error(
                      "Service Worker ready timeout (20s) - SW may not be registered",
                    ),
                  ),
                20000,
              ),
            ),
          ]);
        }

        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      } catch (err) {
        console.warn(
          "[usePushNotifications] Non-critical error checking subscription:",
          err,
        );
        // Check all registrations as fallback
        try {
          const regs = await navigator.serviceWorker.getRegistrations();
          console.log(
            "[usePushNotifications] Total SW registrations found:",
            regs.length,
          );
        } catch (e) {
          console.warn(
            "[usePushNotifications] Could not list registrations:",
            e,
          );
        }
        // If we time out or fail, we just assume not subscribed and let user try to enable
        setIsSubscribed(false);
      } finally {
        setLoading(false);
      }
    }

    checkSubscription();
  }, [user]);

  const requestPermission = async () => {
    if (!("Notification" in window)) return "denied";

    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  };

  const subscribe = async () => {
    if (!user) return;
    setLoading(true);

    console.log("[usePushNotifications] ===== SUBSCRIBE WORKFLOW START =====");

    // Request permission first if not granted
    if (Notification.permission !== "granted") {
      console.log(
        "[usePushNotifications] Requesting notification permission...",
      );
      const perm = await requestPermission();
      if (perm !== "granted") {
        console.log("[usePushNotifications] Permission denied by user");
        setLoading(false);
        toast.error(
          "Notification permission denied. Please enable in browser settings.",
        );
        return;
      }
      console.log("[usePushNotifications] Permission granted");
    } else {
      console.log("[usePushNotifications] Permission already granted");
    }

    try {
      console.log(
        "[usePushNotifications] Starting subscription for user:",
        user.id,
      );
      console.log(
        "[usePushNotifications] STEP 1: Calling subscribeToPushNotifications()...",
      );

      const sub = await subscribeToPushNotifications(user.id);

      console.log(
        "[usePushNotifications] STEP 2: Subscription successful, updating state...",
      );
      setIsSubscribed(true);

      console.log("[usePushNotifications] STEP 3: Showing success toast...");
      toast.success("Successfully subscribed to notifications!");
      console.log(
        "[usePushNotifications] ===== SUBSCRIBE WORKFLOW COMPLETE =====",
      );
    } catch (error: any) {
      console.error(
        "[usePushNotifications] ===== SUBSCRIBE WORKFLOW FAILED =====",
      );
      console.error("[usePushNotifications] Error occurred:", error);
      console.error("[usePushNotifications] Error message:", error.message);
      console.error("[usePushNotifications] Error stack:", error.stack);

      // Provide specific guidance based on error
      let userMessage = error.message || "Failed to subscribe to notifications";

      if (error.message?.includes("Service Worker")) {
        userMessage =
          error.message + " (Run window.diagnosePush() in console for details)";
      } else if (error.message?.includes("timeout")) {
        userMessage =
          "Service Worker took too long to respond. Try refreshing the page.";
      }

      toast.error(userMessage);
    } finally {
      setLoading(false);
      console.log(
        "[usePushNotifications] Subscription attempt finished. Loading set to false.",
      );
    }
  };

  const unsubscribe = async () => {
    if (!user) return;
    setLoading(true);
    const success = await unsubscribeFromPushNotifications(user.id);
    if (success) {
      setIsSubscribed(false);
      toast.success("Unsubscribed from notifications");
    } else {
      toast.error("Failed to unsubscribe");
    }
    setLoading(false);
  };

  return {
    permission,
    isSubscribed,
    loading,
    subscribe,
    unsubscribe,
    requestPermission,
    isSecureContext: window.isSecureContext,
  };
}
