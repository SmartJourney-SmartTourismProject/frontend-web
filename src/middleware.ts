import { withAuth } from 'next-auth/middleware';

// Route protection. Runs on the edge before a page renders, using the
// next-auth JWT cookie only (no Keycloak round-trip). Unauthenticated users
// are sent to /login (authOptions.pages.signIn) with ?callbackUrl=<page>.
export default withAuth({
  pages: { signIn: '/login' },
  callbacks: {
    authorized({ token, req }) {
      // A token whose refresh failed is as good as no token: force a fresh
      // login rather than letting the page render with a dead access token.
      if (!token || token.error) return false;
      if (req.nextUrl.pathname.startsWith('/admin')) {
        return token.roles?.includes('admin') ?? false;
      }
      return true;
    },
  },
});

export const config = {
  // Everything under the (app) route group, plus /admin for when it exists.
  matcher: ['/home/:path*', '/explore/:path*', '/saved-itineraries/:path*', '/budget-tracker/:path*', '/admin/:path*'],
};
