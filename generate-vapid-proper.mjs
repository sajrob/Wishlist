#!/usr/bin/env node

/**
 * Generate VAPID Keys using web-push standard library
 * This is the proper way to generate Web Push VAPID keys
 */

import webpush from "web-push";

console.log("🔐 Generating VAPID Keys for Web Push Notifications...\n");

const vapidKeys = webpush.generateVAPIDKeys();

console.log("✅ VAPID Keys Generated Successfully!\n");
console.log("=".repeat(70));
console.log("\n📋 Copy these to your environment:\n");

console.log("For .env.local (Local Development):");
console.log("─".repeat(70));
console.log(`VITE_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log(`VAPID_SUBJECT=mailto:your-email@example.com\n`);

console.log(
  "For Vercel Environment Variables (Settings → Environment Variables):",
);
console.log("─".repeat(70));
console.log(`VITE_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log(`VAPID_SUBJECT=mailto:your-email@example.com\n`);

console.log("=".repeat(70));
console.log("\n✨ Next Steps:\n");
console.log("1. ✅ Copy VITE_VAPID_PUBLIC_KEY to Vercel environment variables");
console.log("2. ✅ Copy VAPID_PRIVATE_KEY to Supabase edge function secrets");
console.log("3. ✅ Update .env.local with new keys");
console.log("4. ✅ Redeploy to Vercel");
console.log("5. ✅ Test on mobile device\n");
