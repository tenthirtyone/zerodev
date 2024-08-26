"use client";

import { useEffect, useState } from "react";
import { useDynamicContext } from "@/app/components";
import { createKernelAccount } from "@zerodev/sdk";
import {
  ENTRYPOINT_ADDRESS_V07,
  walletClientToSmartAccountSigner,
} from "permissionless";
import { http, createPublicClient } from "viem";

import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import { KERNEL_V3_1 } from "@zerodev/sdk/constants";

const publicClient = createPublicClient({
  transport: http(process.env.NEXT_PUBLIC_BUNDLER_RPC, {
    timeout: 60_000,
  }),
});

const entryPoint = ENTRYPOINT_ADDRESS_V07;

type SmartAccountAddressProps = {
  index: bigint;
};

export function SmartAccountAddress({ index }: SmartAccountAddressProps) {
  const { primaryWallet } = useDynamicContext();
  const [address, setAddress] = useState("");

  useEffect(() => {
    async function getSmartAccountAddress() {
      if (primaryWallet) {
        const dynamicWalletClient: any =
          await primaryWallet?.connector?.getWalletClient();
        if (dynamicWalletClient) {
          const smartAccountSigner = await walletClientToSmartAccountSigner(
            dynamicWalletClient
          );
          // A ZeroDev validator is the interface between the eoa/signer options
          const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
            signer: smartAccountSigner,
            entryPoint,
            kernelVersion: KERNEL_V3_1,
          });

          // This is the counterfactual Kernel Smart Account.
          // account.address represents the determinstic counterfactual on-chain address.
          const account = await createKernelAccount(publicClient, {
            entryPoint,
            plugins: {
              sudo: ecdsaValidator,
            },
            index,
            kernelVersion: KERNEL_V3_1,
          });

          if (account) {
            setAddress(account?.address);
          }
        }
      }
    }

    getSmartAccountAddress();
  }, [primaryWallet]);

  return <>{!!address && <div>Smart Account Address: {address}</div>}</>;
}

export default SmartAccountAddress;
