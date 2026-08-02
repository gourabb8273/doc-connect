"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getRole, type Role } from "@/lib/auth";

interface AuthGuardProps {
  required: Role;
  redirectTo: string;
  children: React.ReactNode;
}

export function AuthGuard({ required, redirectTo, children }: AuthGuardProps) {
  const router = useRouter();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    const role = getRole();
    if (role !== required) {
      router.replace(redirectTo);
    } else {
      setAllowed(true);
    }
  }, [required, redirectTo, router]);

  if (!allowed) return null;
  return <>{children}</>;
}
