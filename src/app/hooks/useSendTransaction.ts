import { useState, useCallback } from "react";
import { Wallet } from "@/app/components";
import {
  createKernelAccount,
  createZeroDevPaymasterClient,
  createKernelAccountClient,
} from "@zerodev/sdk";
import {
  ENTRYPOINT_ADDRESS_V07,
  walletClientToSmartAccountSigner,
} from "permissionless";
import { http, createPublicClient, zeroAddress } from "viem";
import { polygon } from "viem/chains";
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import { KERNEL_V3_1 } from "@zerodev/sdk/constants";

export const useSendTransaction = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactionHash, setTransactionHash] = useState("");

  const sendTransaction = useCallback(
    async (
      primaryWallet: Wallet | null,
      index: bigint,
      to: `0x${string}`,
      value: bigint
    ) => {
      setLoading(true);
      setError(null);

      if (!primaryWallet) {
        setError("Primary wallet is null or undefined. Is the user logged in?");
        setLoading(false);
        return;
      }

      try {
        const publicClient = createPublicClient({
          transport: http(process.env.NEXT_PUBLIC_BUNDLER_RPC, {
            timeout: 60_000,
          }),
        });

        const dynamicWalletClient: any =
          await primaryWallet?.connector?.getWalletClient();
        const smartAccountSigner = await walletClientToSmartAccountSigner(
          dynamicWalletClient
        );
        const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
          signer: smartAccountSigner,
          entryPoint: ENTRYPOINT_ADDRESS_V07,
          kernelVersion: KERNEL_V3_1,
        });

        const paymasterClient = createZeroDevPaymasterClient({
          chain: polygon,
          transport: http(process.env.NEXT_PUBLIC_PAYMASTER_RPC, {
            timeout: 60_000,
          }),
          entryPoint: ENTRYPOINT_ADDRESS_V07,
        });

        const account = await createKernelAccount(publicClient, {
          entryPoint: ENTRYPOINT_ADDRESS_V07,
          plugins: {
            sudo: ecdsaValidator,
          },
          index,
          kernelVersion: KERNEL_V3_1,
        });

        const kernelClient = createKernelAccountClient({
          entryPoint: ENTRYPOINT_ADDRESS_V07,
          account: account,
          chain: polygon,
          bundlerTransport: http(process.env.NEXT_PUBLIC_BUNDLER_RPC, {
            timeout: 60_000,
          }),
        });

        // @ts-ignore
        const txHash = await kernelClient.sendTransaction({
          to,
          value,
          data: "0x",
        });

        setTransactionHash(txHash);
        console.log(txHash);
      } catch (err: any) {
        console.error("Error sending transaction:", err);
        setError(err.message || "An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { sendTransaction, loading, error, transactionHash };
};
