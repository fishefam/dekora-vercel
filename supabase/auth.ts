import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export async function getUserIdFromCookie(): Promise<string | null> {
  const store = await cookies();
  const token = store.get("auth")!.value;
  const secret = process.env.JWT_SECRET!;
  const key = new TextEncoder().encode(secret);

  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });
    return payload.uid as string;
  } catch {
    return null;
  }
}
