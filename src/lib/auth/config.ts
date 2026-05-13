import type { NextAuthConfig } from "next-auth";

/**
 * NextAuth v5 config — .zugzag.com 쿠키 공유 (D14).
 *
 * zugzag 본체와 같은 NEXTAUTH_SECRET을 사용하여
 * .zugzag.com 도메인 쿠키를 공유한다.
 * Provider는 본체와 동일 (Google/Kakao) — Phase 1에서 구체화.
 */
export const authConfig: NextAuthConfig = {
  providers: [],
  pages: {
    signIn: "/login",
  },
  cookies: {
    sessionToken: {
      name: `__Secure-authjs.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
        domain: process.env.NEXTAUTH_COOKIE_DOMAIN || ".zugzag.com",
      },
    },
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isPublicRoute = nextUrl.pathname.startsWith("/tv/") || nextUrl.pathname === "/login";

      if (isPublicRoute) return true;
      return isLoggedIn;
    },
  },
};
