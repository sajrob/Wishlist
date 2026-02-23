import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

// VAPID keys from environment variables
const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY")!;
const VAPID_SUBJECT =
  Deno.env.get("VAPID_SUBJECT") || "mailto:solomonroberts87@gmail.com";

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

// Map notification types to preference fields
const notificationTypeMap: Record<string, string> = {
  claim: "claim_notifications",
  follow: "follow_notifications",
  wishlist_share: "wishlist_share_notifications",
};

serve(async (req) => {
  try {
    const { user_id, title, body, icon, url, data, type } = await req.json();

    if (!user_id) {
      return new Response(JSON.stringify({ error: "user_id is required" }), {
        status: 400,
      });
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Check user's notification preferences if type is provided
    if (type && notificationTypeMap[type]) {
      const { data: preferences, error: prefError } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", user_id)
        .single();

      if (prefError && prefError.code !== "PGRST116") {
        console.error("[Push] Error fetching preferences:", prefError);
        // Continue anyway if we can't fetch preferences
      }

      if (preferences) {
        const preferenceField = notificationTypeMap[type];
        if (!preferences[preferenceField as keyof typeof preferences]) {
          console.log(
            `[Push] User ${user_id} has disabled ${type} notifications`,
          );
          return new Response(
            JSON.stringify({
              message: `${type} notifications disabled for user`,
              skipped: true,
            }),
            { status: 200 },
          );
        }
      }
    }

    // Get all subscriptions for the user
    const { data: subscriptions, error: subError } = await supabase
      .from("push_subscriptions")
      .select("*")
      .eq("user_id", user_id);

    if (subError) throw subError;

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ message: "No subscriptions found for user" }),
        { status: 200 },
      );
    }

    console.log(
      `[Push] Sending ${type || "notification"} to user ${user_id} (${subscriptions.length} subscriptions)`,
    );

    const results = await Promise.all(
      subscriptions.map(async (sub) => {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        };

        const payload = JSON.stringify({
          notification: {
            title,
            body,
            icon: icon || "/icons/icon-192x192.png",
            data: {
              url: url || "/",
              type: type || "default",
              ...data,
            },
          },
        });

        try {
          await webpush.sendNotification(pushSubscription, payload);
          return { endpoint: sub.endpoint, status: "success" };
        } catch (err: any) {
          if (err?.statusCode === 410 || err?.statusCode === 404) {
            // Subscription has expired or is no longer valid
            console.log(`[Push] Cleaning up expired subscription: ${sub.id}`);
            await supabase.from("push_subscriptions").delete().eq("id", sub.id);
            return { endpoint: sub.endpoint, status: "expired" };
          }
          console.error(
            `[Push] Error sending to ${sub.endpoint}:`,
            err?.message,
          );
          return {
            endpoint: sub.endpoint,
            status: "error",
            error: err?.message || "Unknown error",
          };
        }
      }),
    );

    const successCount = results.filter((r) => r.status === "success").length;
    const expiredCount = results.filter((r) => r.status === "expired").length;
    const errorCount = results.filter((r) => r.status === "error").length;

    console.log(
      `[Push] Results - Success: ${successCount}, Expired: ${expiredCount}, Error: ${errorCount}`,
    );

    return new Response(
      JSON.stringify({
        results,
        summary: {
          total: results.length,
          success: successCount,
          expired: expiredCount,
          error: errorCount,
        },
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("[Push] Fatal error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
