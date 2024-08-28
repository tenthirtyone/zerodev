"use client";

import { useState } from "react";
import {
  useDynamicContext,
  SignerAddress,
  SmartAccountAddress,
} from "@/app/components";
import { buyNFT } from "@/app/actions";

export default function Home() {
  const { primaryWallet } = useDynamicContext();
  const [index] = useState(2n); // Assuming '2n' is intentional for BigInt usage

  const handleBuyNFT = async () => {
    try {
      await buyNFT(primaryWallet, index);
    } catch (e) {
      console.error("Error buying NFT:", e);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="flex flex-col items-center w-full space-y-4">
        <SignerAddress />
        <SmartAccountAddress />
        <button
          onClick={handleBuyNFT}
          className="px-4 py-2 bg-blue-500 text-white font-bold rounded hover:bg-blue-700 transition duration-300"
        >
          Buy NFT
        </button>
      </div>
      <div className="lg:grid lg:grid-cols-4 lg:w-full lg:max-w-5xl mb-32 lg:mb-0 text-center lg:text-left">
        {/* Other content or placeholders could go here */}
      </div>
    </main>
  );
}
