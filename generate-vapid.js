#!/usr/bin/env node

/**
 * Generate VAPID Keys for Web Push Notifications
 *
 * VAPID keys are required for Web Push protocol. Copy the output to:
 * 1. .env.local (for local development)
 * 2. Vercel Environment Variables (for production)
 */

import crypto from "crypto";

function generateVAPIDKeys() {
  // Generate a 32-byte (256-bit) private key
  const privateKey = crypto.randomBytes(32);

  // Generate the public key from the private key using ECDH with P-256 curve
  const ecdh = crypto.createECDH("prime256v1");
  ecdh.setPrivateKey(privateKey);
  const publicKey = ecdh.getPublicKey();

  // Convert to base64url format (used by Web Push protocol)
  const privateKeyB64 = privateKey
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

  const publicKeyB64 = publicKey
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

  return {
    publicKey: publicKeyB64,
    privateKey: privateKeyB64,
  };
}

console.log("🔐 Generating VAPID Keys for Web Push Notifications...\n");

const keys = generateVAPIDKeys();

console.log("✅ VAPID Keys Generated Successfully!\n");
console.log("=".repeat(70));
console.log("\n📋 Copy these to your environment:\n");

console.log("For .env.local (Local Development):");
console.log("─".repeat(70));
console.log(`VITE_VAPID_PUBLIC_KEY=${keys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${keys.privateKey}`);
console.log(`VAPID_SUBJECT=mailto:your-email@example.com\n`);

console.log(
  "For Vercel Environment Variables (Settings → Environment Variables):",
);
console.log("─".repeat(70));
console.log(`VITE_VAPID_PUBLIC_KEY=${keys.publicKey}`);
console.log(`VAPID_PUBLIC_KEY=${keys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${keys.privateKey}`);
console.log(`VAPID_SUBJECT=mailto:your-email@example.com\n`);

console.log("=".repeat(70));
console.log("\n⚠️  IMPORTANT SECURITY NOTES:\n");
console.log("1. NEVER commit VAPID keys to git - use environment variables");
console.log("2. VAPID_PRIVATE_KEY should ONLY be on server (Supabase/backend)");
console.log("3. VITE_VAPID_PUBLIC_KEY can be on frontend (it is public)");
console.log(
  "4. Keep these keys secure - anyone with the private key can send notifications\n",
);

console.log("=".repeat(70));
console.log("\n✨ Next Steps:\n");
console.log("1. ✅ Save these keys in a secure location");
console.log("2. ✅ Add VITE_VAPID_PUBLIC_KEY to Vercel environment variables");
console.log("3. ✅ Add VAPID_PRIVATE_KEY to Supabase edge function secrets");
console.log("4. ✅ Add VAPID_SUBJECT to both environments");
console.log("5. ✅ Redeploy to Vercel");
console.log("6. ✅ Test on mobile device\n");
