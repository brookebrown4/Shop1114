import type { Metadata } from "next";
import { Suspense } from "react";

import { SignInForm } from "@/components/auth/sign-in-form";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function SignInPage() {
  return (
    <div className="w-full space-y-6">
      <h1 className="font-heading text-center text-xl font-semibold tracking-tight">
        Sign in
      </h1>
      <Suspense>
        <SignInForm />
      </Suspense>
    </div>
  );
}
