import { getServerSession } from "next-auth";
import Link from "next/link";

export const runtime = "nodejs";

export default async function LoginPage() {
  const session = await getServerSession();
  if (session) {
    return (
      <div className="p-6 space-y-4">
        <h1 className="text-2xl font-semibold">You are logged in</h1>
        <Link href="/dashboard" className="btn-primary">Go to dashboard</Link>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-md p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Log in to Alex</h1>
      <div className="space-y-3">
        <a href="/api/auth/signin/email" className="btn-outline w-full inline-block text-center">Continue with Email</a>
        <a href="/api/auth/signin/google" className="btn-outline w-full inline-block text-center">Continue with Google</a>
      </div>
      <p className="text-sm text-neutral-500">By continuing you agree to our <Link href="/legal/terms" className="underline">Terms</Link> and <Link href="/legal/privacy" className="underline">Privacy</Link>.</p>
    </div>
  );
}


