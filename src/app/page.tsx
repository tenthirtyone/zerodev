"use client";

import { useState } from "react";

import {
  useDynamicContext,
  LogInLogOut,
  SignerAddress,
  SmartAccountAddress,
} from "@/app/components";

import { buyNFT, recoveryExample } from "@/app/actions";

export default function Home() {
  const { primaryWallet } = useDynamicContext();
  const [index] = useState(2n);

  const buy = async () => {
    try {
      await buyNFT(primaryWallet, index);
    } catch (e) {
      console.log(e);
    }
  };

  const doRecovery = async () => {
    try {
      await recoveryExample(primaryWallet, index);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <div className="block left-0 top-0 w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          <SignerAddress />

          <SmartAccountAddress index={index} />
        </div>
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:size-auto lg:bg-none">
          <LogInLogOut />
        </div>
      </div>

      <button onClick={buy} style={{ border: "solid 1px" }}>
        Buy NFT
      </button>
      <button onClick={doRecovery} style={{ border: "solid 1px" }}>
        Do Recovery
      </button>

      <div className="mb-32 grid text-center lg:mb-0 lg:w-full lg:max-w-5xl lg:grid-cols-4 lg:text-left"></div>
    </main>
  );
}
