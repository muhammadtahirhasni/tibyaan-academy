import createIntlMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import { updateSession } from "./lib/supabase/middleware";

const intlMiddleware = createIntlMiddleware(routing);

const protectedPaths = ["/student", "/teacher", "/admin"];
const authPaths = ["/login", "/signup", "/onboarding"];

function getPathnameWithoutLocale(pathname: string): string {
  const localePattern = /^\/(ur|ar|en|fr|id)(\/|$)/;
  return pathname.replace(localePattern, "/");
}

function getLocaleFromPathname(pathname: string): string {
  const match = pathname.match(/^\/(ur|ar|en|fr|id)(\/|$)/);
  return match ? match[1] : "ur";
}

function getDashboardByRole(role: string | undefined, locale: string): string {
  switch (role) {
    case "admin":
      return `/${locale}/admin/dashboard`;
    case "teacher":
      return `/${locale}/teacher/dashboard`;
    default:
      return `/${locale}/student/dashboard`;
  }
}

export async function proxy(request: NextRequest) {
  // Run intl middleware first for locale detection and routing
  const intlResponse = intlMiddleware(request);

  // Get the pathname without locale prefix
  const pathWithoutLocale = getPathnameWithoutLocale(request.nextUrl.pathname);
  const locale = getLocaleFromPathname(request.nextUrl.pathname);

  const isProtectedRoute = protectedPaths.some((path) =>
    pathWithoutLocale.startsWith(path)
  );
  const isAuthRoute = authPaths.some((path) =>
    pathWithoutLocale.startsWith(path)
  );

  // Only check auth for protected or auth routes
  if (isProtectedRoute || isAuthRoute) {
    const { user } = await updateSession(request, intlResponse);
    const role = user?.user_metadata?.role as string | undefined;

    // Not logged in trying to access protected route → redirect to login
    if (!user && isProtectedRoute) {
      const loginUrl = new URL(`/${locale}/login`, request.url);
      loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Logged in trying to access auth pages (except onboarding) → redirect to role-based dashboard
    if (user && isAuthRoute && !pathWithoutLocale.startsWith("/onboarding")) {
      const dashboardPath = getDashboardByRole(role, locale);
      return NextResponse.redirect(new URL(dashboardPath, request.url));
    }

    // Role-based access control for admin routes
    if (user && pathWithoutLocale.startsWith("/admin")) {
      if (role !== "admin") {
        const redirectPath = getDashboardByRole(role, locale);
        return NextResponse.redirect(new URL(redirectPath, request.url));
      }
    }

    // Role-based access control for teacher routes
    if (user && pathWithoutLocale.startsWith("/teacher")) {
      if (role !== "teacher" && role !== "admin") {
        const redirectPath = getDashboardByRole(role, locale);
        return NextResponse.redirect(new URL(redirectPath, request.url));
      }
    }

    // Role-based access control for student routes
    if (user && pathWithoutLocale.startsWith("/student")) {
      if (role !== "student" && role !== undefined) {
        // Admin/teacher shouldn't be on student routes
        if (role === "admin" || role === "teacher") {
          const redirectPath = getDashboardByRole(role, locale);
          return NextResponse.redirect(new URL(redirectPath, request.url));
        }
      }
    }
  }

  return intlResponse;
}

export const config = {
  matcher: ["/", "/(ur|ar|en|fr|id)/:path*"],
};
