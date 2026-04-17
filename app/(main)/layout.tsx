"use client";

import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ErrorBoundary } from "@/components/error-boundary";

function RedirectToLogin() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/login");
  }, [router]);
  return null;
}

function StoreProfileOnMount({ children }: { children: React.ReactNode }) {
  const storeProfile = useMutation(api.users.storeProfile);

  useEffect(() => {
    storeProfile().catch(() => {});
  }, [storeProfile]);

  return <>{children}</>;
}

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary>
      <AuthLoading>
        <div className="flex min-h-screen items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
      </AuthLoading>
      <Unauthenticated>
        <RedirectToLogin />
      </Unauthenticated>
      <Authenticated>
        <StoreProfileOnMount>
          <div className="flex h-screen overflow-hidden">{children}</div>
        </StoreProfileOnMount>
      </Authenticated>
    </ErrorBoundary>
  );
}
