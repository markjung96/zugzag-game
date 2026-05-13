export { auth as middleware } from "@/lib/auth";

export const config = {
  matcher: ["/((?!api/sse|tv|_next/static|_next/image|favicon.ico).*)"],
};
