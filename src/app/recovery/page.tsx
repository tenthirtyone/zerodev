"use client";
import React from "react";

import { useDynamicContext } from "@/app/components";
import { recoveryExample } from "@/app/actions";

export default function Inventory() {
  const { primaryWallet } = useDynamicContext();
  const doRecovery = async () => {
    try {
      await recoveryExample(primaryWallet);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <button
        onClick={doRecovery}
        className="px-4 py-2 bg-blue-500 text-white font-bold rounded hover:bg-blue-700 transition duration-300"
      >
        Do Recovery
      </button>
    </div>
  );
}
