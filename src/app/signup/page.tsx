import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="mx-auto max-w-md p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Create your account</h1>
      <div className="space-y-3">
        <a href="/api/auth/signin/email" className="btn-outline w-full inline-block text-center">Continue with Email</a>
        <a href="/api/auth/signin/google" className="btn-outline w-full inline-block text-center">Continue with Google</a>
      </div>
      <p className="text-sm text-neutral-500">Already have an account? <Link href="/login" className="underline">Log in</Link></p>
    </div>
  );
}


