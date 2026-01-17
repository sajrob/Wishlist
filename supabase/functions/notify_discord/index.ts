
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const DISCORD_WEBHOOK_URL = Deno.env.get('DISCORD_WEBHOOK_URL')

interface FeedbackRecord {
    id: string;
    user_id: string | null;
    username: string | null;
    type: string;
    message: string;
    page_url: string;
    status: string;
}

serve(async (req) => {
    try {
        const payload = await req.json()
        console.log('Received payload:', payload)

        // Check if the request is a database webhook payload
        const { type, table, record, schema } = payload as {
            type: string;
            table: string;
            record: FeedbackRecord;
            schema: string
        }

        // Only process INSERT events on the feedback table
        if (type !== 'INSERT' || table !== 'feedback') {
            return new Response('Ignored non-insert or non-feedback event', { status: 200 })
        }

        if (!DISCORD_WEBHOOK_URL) {
            console.error('Missing DISCORD_WEBHOOK_URL')
            return new Response('Missing Discord Webhook URL', { status: 500 })
        }

        // Determine color based on feedback type
        let color = 0x3b82f6 // Blue (default)
        if (record.type === 'Bug') color = 0xef4444 // Red
        else if (record.type === 'Feature Request') color = 0x10b981 // Green
        else if (record.type === 'UX Issue') color = 0xf59e0b // Orange

        const discordPayload = {
            content: "🚨 **New Beta Feedback Received!**",
            embeds: [
                {
                    title: `${record.type}: ${record.status}`,
                    description: record.message,
                    color: color,
                    fields: [
                        {
                            name: "Page URL",
                            value: record.page_url || "N/A",
                            inline: false
                        },
                        {
                            name: "User",
                            value: `${record.username || "Guest"} (${record.user_id || "Anon"})`,
                            inline: true
                        },
                        {
                            name: "Feedback ID",
                            value: record.id,
                            inline: true
                        }
                    ],
                    timestamp: new Date().toISOString(),
                    footer: {
                        text: "Wishlist Beta Feedback System"
                    }
                }
            ]
        }

        const response = await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(discordPayload),
        })

        if (!response.ok) {
            console.error('Error sending to Discord:', await response.text())
            return new Response('Error sending to Discord', { status: 500 })
        }

        return new Response('Notification sent!', { status: 200 })

    } catch (error) {
        console.error(error)
        return new Response(error.message, { status: 500 })
    }
})
