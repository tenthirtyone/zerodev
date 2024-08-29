import { Wallet } from "@/app/components";
import { buyResponse } from "@/app/data/apiResponseData";
import { createStackupPaymasterClient } from "permissionless/clients/stackup";
import { createPimlicoPaymasterClient } from "permissionless/clients/pimlico";
import {
  createKernelAccount,
  createZeroDevPaymasterClient,
  createKernelAccountClient,
  getCustomNonceKeyFromString,
} from "@zerodev/sdk";
import {
  ENTRYPOINT_ADDRESS_V07,
  bundlerActions,
  walletClientToSmartAccountSigner,
} from "permissionless";
import { http, createPublicClient, zeroAddress } from "viem";

import { polygon } from "viem/chains";

import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import { KERNEL_V3_1 } from "@zerodev/sdk/constants";

const publicClient = createPublicClient({
  transport: http(process.env.NEXT_PUBLIC_BUNDLER_RPC, {
    timeout: 60_000,
  }),
});

const entryPoint = ENTRYPOINT_ADDRESS_V07;

export const sendTransaction = async (
  primaryWallet: Wallet | null,
  index: bigint
) => {
  if (!primaryWallet)
    throw new Error(
      "primaryWallet is null or undefined. Is the user logged in?"
    );

  const dynamicWalletClient: any =
    await primaryWallet?.connector?.getWalletClient();
  const smartAccountSigner = await walletClientToSmartAccountSigner(
    dynamicWalletClient
  );
  // A ZeroDev validator is the interface between the eoa/signer options
  const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
    signer: smartAccountSigner,
    entryPoint,
    kernelVersion: KERNEL_V3_1,
  });

  const paymasterClient = createZeroDevPaymasterClient({
    chain: polygon,
    transport: http(process.env.NEXT_PUBLIC_PAYMASTER_RPC, {
      timeout: 60_000,
    }),
    entryPoint,
  });

  const account = await createKernelAccount(publicClient, {
    entryPoint,
    plugins: {
      sudo: ecdsaValidator,
    },
    index,
    kernelVersion: KERNEL_V3_1,
  });

  const kernelClient = createKernelAccountClient({
    entryPoint,
    account: account,
    chain: polygon,
    bundlerTransport: http(process.env.NEXT_PUBLIC_BUNDLER_RPC, {
      timeout: 60_000,
    }),
    //middleware: {
    //  sponsorUserOperation: paymasterClient.sponsorUserOperation,
    //},
  });

  // @ts-ignore
  // data is from API Endpoint: https://api-mainnet.magiceden.io/v3/rtp/polygon/execute/buy/v7
  //https://docs.zerodev.app/sdk/core-api/send-transactions#sending-transactions-1
  const txHash = await kernelClient.sendTransaction({
    to: "0x206CDd64aec5819495C88B57D0E18E014670Bcc4", // buyResponse.steps[0].items[0].data.to as `0x${string}`,
    value: BigInt(1), // BigInt(buyResponse.steps[0].items[0].data.value),
    data: "0x", //buyResponse.steps[0].items[0].data.data as `0x${string}`,
  });

  console.log(txHash);
};
