"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { LogOutIcon, PackageIcon, ShieldIcon, UserIcon } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function UserNav() {
  const { data: session, status } = useSession()

  if (status !== "authenticated") {
    return (
      <Button
        variant="ghost"
        size="icon"
        nativeButton={false}
        render={<Link href="/sign-in" />}
      >
        <UserIcon />
        <span className="sr-only">Sign in</span>
      </Button>
    )
  }

  const initials = (session.user.name ?? session.user.email ?? "?")
    .slice(0, 2)
    .toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon" className="rounded-full" />}
      >
        <Avatar size="sm">
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <span className="sr-only">Account menu</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem render={<Link href="/account" />}>
          <UserIcon /> Account
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/account/orders" />}>
          <PackageIcon /> Orders
        </DropdownMenuItem>
        {session.user.role === "admin" ? (
          <DropdownMenuItem render={<Link href="/admin" />}>
            <ShieldIcon /> Admin
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOutIcon /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
