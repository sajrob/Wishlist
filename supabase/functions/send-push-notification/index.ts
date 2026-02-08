import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import webpush from "https://esm.sh/web-push"

// VAPID keys from environment variables
const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')!
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!
const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') || 'mailto:admin@example.com'

webpush.setVapidDetails(
    VAPID_SUBJECT,
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
)

serve(async (req) => {
    try {
        const { user_id, title, body, icon, url, data } = await req.json()

        if (!user_id) {
            return new Response(JSON.stringify({ error: 'user_id is required' }), { status: 400 })
        }

        // Initialize Supabase client
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        )

        // Get all subscriptions for the user
        const { data: subscriptions, error: subError } = await supabase
            .from('push_subscriptions')
            .select('*')
            .eq('user_id', user_id)

        if (subError) throw subError

        if (!subscriptions || subscriptions.length === 0) {
            return new Response(JSON.stringify({ message: 'No subscriptions found for user' }), { status: 200 })
        }

        const results = await Promise.all(subscriptions.map(async (sub) => {
            const pushSubscription = {
                endpoint: sub.endpoint,
                keys: {
                    p256dh: sub.p256dh,
                    auth: sub.auth
                }
            }

            const payload = JSON.stringify({
                notification: {
                    title,
                    body,
                    icon: icon || '/icons/icon-192x192.png',
                    data: {
                        url: url || '/',
                        ...data
                    }
                }
            })

            try {
                await webpush.sendNotification(pushSubscription, payload)
                return { endpoint: sub.endpoint, status: 'success' }
            } catch (err) {
                if (err.statusCode === 410 || err.statusCode === 404) {
                    // Subscription has expired or is no longer valid
                    await supabase
                        .from('push_subscriptions')
                        .delete()
                        .eq('id', sub.id)
                    return { endpoint: sub.endpoint, status: 'expired' }
                }
                return { endpoint: sub.endpoint, status: 'error', error: err.message }
            }
        }))

        return new Response(JSON.stringify({ results }), {
            headers: { "Content-Type": "application/json" },
            status: 200
        })

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { "Content-Type": "application/json" },
            status: 500
        })
    }
})
