import "dotenv/config";

// Bind localhost secara default; deployment container dapat mengatur APP_HOSTNAME.
process.env.HOSTNAME = process.env.APP_HOSTNAME || "127.0.0.1";
await import("../.next/standalone/server.js");
