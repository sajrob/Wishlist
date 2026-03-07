import { supabase } from "@/supabaseClient";

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

// Diagnostic helper - call from browser console: window.diagnosePush()
export async function diagnosePush() {
  console.group("[Push] Diagnostic Report");
  console.log("Starting comprehensive push notification diagnostic...\n");

  try {
    console.log("1. Browser Support:");
    const hasServiceWorker = !!navigator.serviceWorker;
    const hasPushManager = !!("PushManager" in window);
    const hasNotification = !!window.Notification;
    const isSecure = window.isSecureContext;
    const isOnline = navigator.onLine;

    console.log(
      "   - serviceWorker:",
      hasServiceWorker,
      hasServiceWorker ? "✅" : "❌",
    );
    console.log(
      "   - PushManager:",
      hasPushManager,
      hasPushManager ? "✅" : "❌",
    );
    console.log(
      "   - Notification:",
      hasNotification,
      hasNotification ? "✅" : "❌",
    );
    console.log(
      "   - isSecureContext:",
      isSecure,
      isSecure ? "✅" : "❌ (REQUIRED for push)",
    );
    console.log("   - Online:", isOnline, isOnline ? "✅" : "❌");

    console.log("\n2. VAPID Configuration:");
    const vapidSet = !!VAPID_PUBLIC_KEY;
    console.log(
      "   - VAPID_PUBLIC_KEY set:",
      vapidSet,
      vapidSet ? "✅" : "❌ (REQUIRED)",
    );
    if (VAPID_PUBLIC_KEY) {
      console.log("   - Key length:", VAPID_PUBLIC_KEY.length);
      console.log(
        "   - Key starts with:",
        VAPID_PUBLIC_KEY.substring(0, 20) + "...",
      );
    } else {
      console.warn(
        "   ⚠️ VAPID key missing - check .env.local for VITE_VAPID_PUBLIC_KEY",
      );
    }

    console.log("\n3. Service Worker Status:");
    const activeReg = await navigator.serviceWorker.getRegistration();
    const hasActive = !!activeReg;
    console.log(
      "   ↳ Active registration found:",
      hasActive,
      hasActive ? "✅" : "❌",
    );

    if (activeReg) {
      console.log("   - Scope:", activeReg.scope);
      console.log(
        "   - State:",
        activeReg.installing
          ? "installing"
          : activeReg.waiting
            ? "waiting"
            : activeReg.active
              ? "active"
              : "unknown",
      );
      console.log(
        "   - Controller:",
        !!navigator.serviceWorker.controller,
        navigator.serviceWorker.controller ? "✅" : "❌",
      );
      console.log(
        "   - Active worker:",
        !!activeReg.active,
        activeReg.active ? "✅" : "❌",
      );
    } else {
      console.warn("   ⚠️ No active registration - trying .ready...");
      try {
        const ready = await Promise.race([
          navigator.serviceWorker.ready,
          new Promise<ServiceWorkerRegistration>((_, reject) =>
            setTimeout(() => reject(new Error("timeout")), 3000),
          ),
        ]);
        console.log("   ✅ .ready resolved:", ready.scope);
      } catch (e) {
        console.error(
          "   ❌ .ready timeout or error:",
          e instanceof Error ? e.message : e,
        );
      }
    }

    const allRegs = await navigator.serviceWorker.getRegistrations();
    console.log("\n   📊 All registrations:", allRegs.length);
    allRegs.forEach((reg, i) => {
      console.log(
        `   - [${i}] Scope: ${reg.scope} (${reg.active ? "active" : "inactive"})`,
      );
    });

    console.log("\n4. Push Permission:");
    console.log(
      "   - Permission:",
      Notification.permission,
      Notification.permission === "granted" ? "✅" : "⚠️",
    );

    console.log("\n5. Existing Subscription:");
    if (activeReg) {
      try {
        const sub = await activeReg.pushManager.getSubscription();
        console.log("   - Subscription exists:", !!sub, sub ? "✅" : "❌");
        if (sub) {
          console.log(
            "   - Endpoint prefix:",
            sub.endpoint.substring(0, 50) + "...",
          );
        }
      } catch (e) {
        console.error("   ❌ Error checking subscription:", e);
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("📋 SUMMARY:");
    const allGood =
      hasServiceWorker &&
      hasPushManager &&
      hasNotification &&
      isSecure &&
      vapidSet &&
      hasActive;
    if (allGood) {
      console.log(
        "✅ All systems ready! Try subscribing to push notifications.",
      );
    } else {
      console.warn("⚠️ Issues detected:");
      if (!hasServiceWorker) console.warn("   - Service Worker not available");
      if (!isSecure)
        console.warn("   - Not secure context (need HTTPS or localhost)");
      if (!vapidSet) console.warn("   - VAPID key not found in environment");
      if (!hasActive)
        console.warn(
          "   - Service Worker not registered - check console for registration errors",
        );
    }
    console.log("=".repeat(60));
  } catch (error) {
    console.error("Diagnostic error:", error);
  }
  console.groupEnd();
}

// Make available globally for user debugging
(window as any).diagnosePush = diagnosePush;

export async function subscribeToPushNotifications(userId: string) {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    throw new Error("Push notifications are not supported by this browser.");
  }

  if (!VAPID_PUBLIC_KEY) {
    console.error(
      "[Push] VAPID_PUBLIC_KEY not found. Env keys:",
      Object.keys(import.meta.env),
    );
    throw new Error(
      "VAPID public key is not configured. Please ensure VITE_VAPID_PUBLIC_KEY is set in your environment.",
    );
  }

  console.log("[Push] Attempting to find service worker...");
  console.log("[Push] VAPID key available:", !!VAPID_PUBLIC_KEY);

  // Check if we already have a registration first
  let registration: ServiceWorkerRegistration | undefined =
    await navigator.serviceWorker.getRegistration();

  if (!registration) {
    console.log(
      "[Push] No active registration found, waiting for service worker to be ready...",
    );
    try {
      // Wait for service worker to be ready with extended timeout
      registration = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise<ServiceWorkerRegistration>((_, reject) =>
          setTimeout(
            () =>
              reject(
                new Error(
                  "Service Worker initialization timeout - took longer than 30 seconds. This may indicate a service worker registration error.",
                ),
              ),
            30000,
          ),
        ),
      ]);
    } catch (error) {
      console.error("[Push] Service worker ready failed:", error);
      // Try to check registrations directly
      const registrations = await navigator.serviceWorker.getRegistrations();
      console.log("[Push] Found registrations:", registrations.length);
      if (registrations.length === 0) {
        throw new Error(
          "Service Worker failed to register. Please refresh the page and try again.",
        );
      }
      registration = registrations[0];
    }
  }

  if (!registration) {
    throw new Error(
      "Service Worker failed to initialize. Please refresh and try again.",
    );
  }

  console.log("[Push] Service worker found:", registration.scope);

  // Check for existing subscription
  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    console.log("[Push] No existing subscription found, creating new one...");
    try {
      // Subscribe if no existing subscription
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
      console.log("[Push] Successfully created new subscription");
    } catch (error) {
      console.error("[Push] Subscription error:", error);
      throw new Error(
        `Failed to create push notification subscription: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  } else {
    console.log("[Push] Using existing subscription");
  }

  // Save subscription to Supabase
  try {
    const p256dhKey = subscription.getKey("p256dh");
    const authKey = subscription.getKey("auth");

    if (!p256dhKey || !authKey) {
      throw new Error("Push subscription keys are missing");
    }

    const { error } = await supabase.from("push_subscriptions").upsert(
      {
        user_id: userId,
        endpoint: subscription.endpoint,
        p256dh: btoa(String.fromCharCode(...new Uint8Array(p256dhKey))),
        auth: btoa(String.fromCharCode(...new Uint8Array(authKey))),
      },
      { onConflict: "user_id, endpoint" },
    );

    if (error) {
      console.error("[Push] Supabase upsert error:", error);
      throw new Error(
        `Failed to save subscription to database: ${error.message}`,
      );
    }

    console.log("[Push] Subscription saved successfully");
  } catch (error) {
    console.error("[Push] Error saving subscription:", error);
    throw error;
  }

  return subscription;
}

export async function unsubscribeFromPushNotifications(userId: string) {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      // Unsubscribe from browser
      await subscription.unsubscribe();

      // Delete from Supabase
      const { error } = await supabase
        .from("push_subscriptions")
        .delete()
        .match({ user_id: userId, endpoint: subscription.endpoint });

      if (error) throw error;
    }
    return true;
  } catch (err) {
    console.error("Error unsubscribing from push notifications:", err);
    return false;
  }
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
