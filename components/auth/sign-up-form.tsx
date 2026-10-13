"use client";

import { useActionState } from "react";
import Link from "next/link";

import { registerUser } from "@/app/(auth)/sign-up/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/form/field";

export function SignUpForm() {
  const [error, formAction, isPending] = useActionState(registerUser, undefined);

  return (
    <form action={formAction} className="w-full space-y-4">
      <FormField label="Name" htmlFor="name">
        <Input id="name" name="name" type="text" required autoFocus />
      </FormField>
      <FormField label="Email" htmlFor="email">
        <Input id="email" name="email" type="email" required />
      </FormField>
      <FormField label="Password" htmlFor="password" description="At least 8 characters">
        <Input id="password" name="password" type="password" required minLength={8} />
      </FormField>
      <FormField label="Confirm password" htmlFor="confirmPassword">
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
        />
      </FormField>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Creating account..." : "Create account"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/sign-in" className="font-medium text-foreground hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
