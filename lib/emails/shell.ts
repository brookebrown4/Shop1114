import { SITE_NAME } from "@/lib/constants";

// Minimal shared wrapper for every transactional email this app sends, so
// order and contact emails look consistent without duplicating markup.
export function emailShell(title: string, bodyHtml: string): string {
  return `
    <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:480px;margin:0 auto;color:#111;">
      <h1 style="font-size:20px;margin:0 0 8px;">${SITE_NAME}</h1>
      <h2 style="font-size:16px;font-weight:600;margin:0 0 16px;">${title}</h2>
      ${bodyHtml}
    </div>`;
}
