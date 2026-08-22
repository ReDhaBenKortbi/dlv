import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const apiUrl = process.env.VITE_API_URL || "http://localhost:3000/api";
const apiOrigin = new URL(apiUrl).origin;

const csp = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: https://res.cloudinary.com`,
  "font-src 'self'",
  `connect-src 'self' ${apiOrigin} https://api.cloudinary.com`,
  `frame-src ${apiOrigin}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const permissionsPolicy = [
  "camera=()",
  "microphone=()",
  "geolocation=()",
  "payment=()",
  "usb=()",
  "magnetometer=()",
  "gyroscope=()",
  "interest-cohort=()",
].join(", ");

const headers = `/*
  Content-Security-Policy: ${csp}
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: ${permissionsPolicy}
  Cross-Origin-Opener-Policy: same-origin-allow-popups
  Cross-Origin-Resource-Policy: same-site
`;

const distDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "dist");
writeFileSync(path.join(distDir, "_headers"), headers);

console.log(`Wrote dist/_headers (API origin: ${apiOrigin})`);
