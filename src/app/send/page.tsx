"use client";
import React, { useState } from "react";

import { useDynamicContext } from "@/app/components";

import { useSendTransaction } from "@/app/hooks";

export default function SendTransaction(index: bigint) {
  const { primaryWallet } = useDynamicContext();
  const { sendTransaction, transactionHash } = useSendTransaction();
  const [to, setTo] = useState<`0x${string}`>("0x");
  const [value, setValue] = useState(0n);
  const [data, setData] = useState<`0x${string}`>("0x");
  const handleAddressChange = (e: any) => {
    setTo(e.target.value);
  };

  const handleAmountChange = (e: any) => {
    setValue(BigInt(e.target.value));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      await sendTransaction(primaryWallet, 2n, to, value, data);
    } catch (error: any) {
      alert(`Error sending transaction: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="address" className="block mb-2">
            Address
          </label>
          <input
            type="text"
            id="address"
            value={to}
            onChange={handleAddressChange}
            className="px-4 py-2 bg-gray-800 text-white rounded"
            placeholder="Enter crypto address"
          />
        </div>
        <div>
          <label htmlFor="amount" className="block mb-2">
            Amount (wei)
          </label>
          <input
            type="text"
            id="amount"
            value={value.toString()}
            onChange={handleAmountChange}
            className="px-4 py-2 bg-gray-800 text-white rounded"
            placeholder="Enter amount"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white font-bold rounded hover:bg-blue-700 transition duration-300"
        >
          Send Transaction
        </button>
      </form>
      {transactionHash && (
        <div className="mt-4 text-green-400">
          Transaction Hash: {transactionHash}
        </div>
      )}
    </div>
  );
}
