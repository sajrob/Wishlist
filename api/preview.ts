
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
        return res.redirect('/');
    }

    let title = 'My Wishlist';
    let description = 'Check out this wishlist on Wishlist App!';
    let image = 'https://wishlist-app.vercel.app/og-default.png';
    let url = `https://wishlist-app.vercel.app/share/${id}`;

    if (supabase) {
        try {
            // Fetch category details
            const { data: category } = await supabase
                .from('categories')
                .select('name')
                .eq('id', id)
                .single();

            if (category) {
                title = `${category.name} | Wishlist`;
                description = `Check out items in ${category.name}`;
            }

            // Fetch first item image
            const { data: items } = await supabase
                .from('items')
                .select('image_url')
                .eq('category_id', id)
                .order('created_at', { ascending: true })
                .limit(1);

            if (items && items.length > 0 && items[0].image_url) {
                image = items[0].image_url;
            }
        } catch (error) {
            console.error('Error fetching preview data:', error);
        }
    }

    // Return HTML with Open Graph tags
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${url}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${image}" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content="${url}" />
    <meta property="twitter:title" content="${title}" />
    <meta property="twitter:description" content="${description}" />
    <meta property="twitter:image" content="${image}" />
    
    <!-- Redirect to actual app -->
    <script>
        window.location.href = '/share/${id}';
    </script>
</head>
<body style="font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #f3f4f6;">
    <div style="text-align: center;">
        <h1 style="font-size: 1.5rem; color: #1f2937; margin-bottom: 1rem;">Redirecting to Wishlist...</h1>
        <p style="color: #6b7280;">If you are not redirected automatically, <a href="/share/${id}" style="color: #4f46e5; text-decoration: underline;">click here</a>.</p>
        <img src="${image}" alt="Preview" style="max-width: 300px; border-radius: 8px; margin-top: 1rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
    </div>
</body>
</html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
}
