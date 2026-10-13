import type { Metadata } from "next";

import { SignUpForm } from "@/components/auth/sign-up-form";

export const metadata: Metadata = {
  title: "Sign up",
};

export default function SignUpPage() {
  return (
    <div className="w-full space-y-6">
      <h1 className="font-heading text-center text-xl font-semibold tracking-tight">
        Create an account
      </h1>
      <SignUpForm />
    </div>
  );
}
