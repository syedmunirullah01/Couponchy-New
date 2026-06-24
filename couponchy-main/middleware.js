import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// ── Inlined from @/lib/countries ─────────────────────────────────────────────
const COUNTRY_COOKIE_KEY = "couponchy_country";
const DEFAULT_COUNTRY_CODE = "US";
const COUNTRY_HEADER_KEY = "x-country-code";

function normalizeCountryCode(value) {
  const normalized = String(value || "").trim().toUpperCase();
  return /^[A-Z]{2}$/.test(normalized) ? normalized : DEFAULT_COUNTRY_CODE;
}

function getCountryCodeFromSegment(value) {
  const normalized = String(value || "").trim().toUpperCase();
  return /^[A-Z]{2}$/.test(normalized) ? normalized : null;
}

function getCountryCodeFromPathname(pathname) {
  const [, segment] = String(pathname || "").split("/");
  return getCountryCodeFromSegment(segment);
}

function removeCountryPrefix(pathname) {
  const normalizedPath = String(pathname || "/");
  const countryCode = getCountryCodeFromPathname(normalizedPath);
  if (!countryCode) return normalizedPath || "/";
  const withoutPrefix = normalizedPath.replace(/^\/[^/]+/, "");
  return withoutPrefix || "/";
}

function getCountrySegment(value) {
  return normalizeCountryCode(value).toLowerCase();
}

function buildCountryPath(pathname, countryCode = DEFAULT_COUNTRY_CODE) {
  const cleanPath = removeCountryPrefix(pathname);
  const normalizedCountryCode = normalizeCountryCode(countryCode);
  if (normalizedCountryCode === DEFAULT_COUNTRY_CODE) return cleanPath || "/";
  const segment = getCountrySegment(normalizedCountryCode);
  return cleanPath === "/" ? `/${segment}` : `/${segment}${cleanPath}`;
}

// ── Inlined from @/lib/access-control ────────────────────────────────────────
function getPermissionsForRole(role, permissions = []) {
  const ALL_KEYS = ["dashboard","homepage","stores","products","offers","hero","events","categories","settings","scraper","blogs"];
  if (role === "admin") return ALL_KEYS;
  const valid = new Set(ALL_KEYS);
  const normalized = [...new Set(permissions.filter((p) => valid.has(p)))];
  const ROLE_DEFAULTS = {
    editor: ["dashboard","homepage","stores","products","offers","hero","events","categories","blogs"],
    "social-media": ["dashboard","offers","blogs"],
  };
  return normalized.length ? normalized : ROLE_DEFAULTS[role] || ["dashboard"];
}

function canAccessPermission(permissions, permission) {
  if (permission === "scraper") return false; // AI disabled on edge
  return permission === "dashboard" || permissions.includes(permission);
}

function getPermissionForPath(pathname) {
  if (pathname.startsWith("/admin/homepage")) return "homepage";
  if (pathname.startsWith("/admin/products")) return "products";
  if (pathname.startsWith("/admin/hero")) return "hero";
  if (pathname.startsWith("/admin/events")) return "events";
  if (pathname.startsWith("/admin/settings")) return "settings";
  if (pathname.startsWith("/admin/categories")) return "categories";
  if (pathname.startsWith("/admin/offers")) return "offers";
  if (pathname.startsWith("/admin/stores")) return "stores";
  if (pathname.startsWith("/admin/scraper")) return "scraper";
  if (pathname.startsWith("/admin/blogs")) return "blogs";
  return "dashboard";
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function isStaticAsset(pathname) {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    /\.[a-zA-Z0-9]+$/.test(pathname)
  );
}

function isAdminOrAuthPath(pathname) {
  return pathname.startsWith("/admin") || pathname.startsWith("/login");
}

// ── Middleware ────────────────────────────────────────────────────────────────
export async function middleware(req) {
  const { pathname, search } = req.nextUrl;

  // Admin auth guard
  if (pathname.startsWith("/admin")) {
    const token = await getToken({ req });

    if (!token) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = "/login";
      return NextResponse.redirect(redirectUrl);
    }

    const permission = getPermissionForPath(pathname);
    const permissions = getPermissionsForRole(token.role, token.permissions || []);

    if (!canAccessPermission(permissions, permission)) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = "/admin";
      redirectUrl.searchParams.set("denied", permission);
      return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.next();
  }

  if (isStaticAsset(pathname) || isAdminOrAuthPath(pathname)) {
    return NextResponse.next();
  }

  // Country routing
  const prefixedCountryCode = getCountryCodeFromPathname(pathname);

  if (prefixedCountryCode) {
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set(COUNTRY_HEADER_KEY, prefixedCountryCode);

    const rewriteUrl = req.nextUrl.clone();
    rewriteUrl.pathname = removeCountryPrefix(pathname);

    const response = NextResponse.rewrite(rewriteUrl, {
      request: { headers: requestHeaders },
    });

    response.cookies.set(COUNTRY_COOKIE_KEY, prefixedCountryCode, {
      path: "/",
      maxAge: 31536000,
      sameSite: "lax",
    });

    return response;
  }

  const cookieCountryCode = normalizeCountryCode(
    req.cookies.get(COUNTRY_COOKIE_KEY)?.value || DEFAULT_COUNTRY_CODE
  );

  if (cookieCountryCode === DEFAULT_COUNTRY_CODE) {
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set(COUNTRY_HEADER_KEY, cookieCountryCode);

    const response = NextResponse.next({
      request: { headers: requestHeaders },
    });

    response.cookies.set(COUNTRY_COOKIE_KEY, cookieCountryCode, {
      path: "/",
      maxAge: 31536000,
      sameSite: "lax",
    });

    return response;
  }

  const redirectUrl = req.nextUrl.clone();
  redirectUrl.pathname = buildCountryPath(pathname, cookieCountryCode);
  redirectUrl.search = search;
  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
