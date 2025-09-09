import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import * as z from "zod";

const authSchema = z.object({ uid: z.uuid() });
const authPaths = new Set(["/login", "/signup", "/forgot-password"]);

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

export async function middleware(request: NextRequest) {
  let isForgotPasswordRedirected = false;
  const { pathname } = request.nextUrl;
  const forgotPasswordJwt = request.cookies.get(
    "forgotPasswordRedirected"
  )?.value;

  try {
    await jwtVerify<{ email: string }>(
      forgotPasswordJwt ?? "",
      new TextEncoder().encode(process.env.JWT_SECRET),
      { algorithms: ["HS256"] }
    );
    isForgotPasswordRedirected = true;
  } catch {}

  const token = request.cookies.get("auth")?.value;
  const redirect = (path: string) =>
    NextResponse.redirect(new URL(path, request.url));

  if (!isForgotPasswordRedirected && pathname.includes("/reset-password"))
    return redirect("/");

  try {
    const { payload } = await jwtVerify(
      token ?? "",
      new TextEncoder().encode(process.env.JWT_SECRET),
      { algorithms: ["HS256"] }
    );
    const parsed = authSchema.safeParse(payload);
    const isAuthPathLoggedIn = parsed.success && authPaths.has(pathname);
    const isNonAuthPathLoggedOut = !parsed.success && !authPaths.has(pathname);

    if (isAuthPathLoggedIn) return redirect("/");
    if (isNonAuthPathLoggedOut) return redirect("/login");
  } catch {
    if (!authPaths.has(pathname)) return redirect("/login");
  }
}
