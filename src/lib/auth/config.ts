import type { NextAuthConfig } from "next-auth";
import type { Provider } from "next-auth/providers";
import Credentials from "next-auth/providers/credentials";
import { SignJWT } from "jose";

const supabaseSecret = new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET!);

async function issueSupabaseToken(userId: string): Promise<string> {
  return new SignJWT({ sub: userId, role: "authenticated", aud: "authenticated" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1h")
    .sign(supabaseSecret);
}

function shouldRefreshSupabaseToken(token: {
  sub?: string;
  supabaseTokenSub?: string;
  supabaseAccessToken?: string;
  supabaseExp?: number;
}): boolean {
  if (!token.supabaseAccessToken || !token.supabaseExp) return true;
  if (token.supabaseTokenSub != null && token.supabaseTokenSub !== token.sub) return true;
  return token.supabaseExp - Date.now() / 1000 < 300;
}

const providers: Provider[] = [];

if (process.env.NEXTAUTH_TEST_MODE === "true" && process.env.NODE_ENV !== "production") {
  providers.push(
    Credentials({
      name: "Test",
      credentials: {
        userId: { label: "User ID", type: "text" },
      },
      async authorize(credentials) {
        const userId = credentials?.userId;
        if (typeof userId !== "string" || !userId) return null;
        return { id: userId, name: "Test User", email: "test@test.com" };
      },
    }),
  );
}

/**
 * NextAuth v5 config — .zugzag.com 쿠키 공유 (D14).
 *
 * zugzag 본체와 같은 NEXTAUTH_SECRET을 사용하여
 * .zugzag.com 도메인 쿠키를 공유한다.
 */
export const authConfig: NextAuthConfig = {
  providers,
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
    async jwt({ token, user }) {
      if (user?.id) token.sub = user.id;

      if (token.sub && shouldRefreshSupabaseToken(token)) {
        token.supabaseAccessToken = await issueSupabaseToken(String(token.sub));
        token.supabaseTokenSub = token.sub;
        token.supabaseExp = Math.floor(Date.now() / 1000) + 3600;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.sub) session.user.id = String(token.sub);
      if (token.supabaseAccessToken) session.supabaseToken = String(token.supabaseAccessToken);
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isPublicRoute = nextUrl.pathname.startsWith("/tv/") || nextUrl.pathname === "/login";

      if (isPublicRoute) return true;
      return isLoggedIn;
    },
  },
};
