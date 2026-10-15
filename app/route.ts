import { detectLocale } from "./locale-detection";

// Only the automatic entry varies by preference. Assets and explicit URLs never use this.
export function GET(request: Request): Response {
  const target = new URL(request.url);
  const locale = detectLocale(
    request.headers.get("cookie"),
    request.headers.get("accept-language"),
  );
  target.pathname = `/${locale}`;
  target.hash = "";
  return new Response(null, {
    status: 307,
    headers: {
      Location: target.href,
      "Cache-Control": "private, no-store",
      Vary: "Cookie, Accept-Language",
    },
  });
}
