"use client";
import { useDynamicContext, DynamicWidget } from "@/app/components";

export function LogInLogOut() {
  const { primaryWallet, handleLogOut } = useDynamicContext();

  return (
    <>
      <DynamicWidget />
    </>
  );
}
