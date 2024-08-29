import { Wallet } from "@/app/components";

import {
  createKernelAccount,
  createZeroDevPaymasterClient,
  createKernelAccountClient,
} from "@zerodev/sdk";
import {
  ENTRYPOINT_ADDRESS_V07,
  bundlerActions,
  walletClientToSmartAccountSigner,
} from "permissionless";
import {
  http,
  createPublicClient,
  parseAbi,
  encodeFunctionData,
  zeroAddress,
} from "viem";
import {
  generatePrivateKey,
  privateKeyToAccount,
  PrivateKeyAccount,
} from "viem/accounts";
import { polygon } from "viem/chains";
import {
  createWeightedECDSAValidator,
  getRecoveryAction,
} from "@zerodev/weighted-ecdsa-validator";
import {
  getValidatorAddress,
  signerToEcdsaValidator,
} from "@zerodev/ecdsa-validator";
import { KERNEL_V3_1 } from "@zerodev/sdk/constants";

const publicClient = createPublicClient({
  transport: http(process.env.NEXT_PUBLIC_BUNDLER_RPC, {
    timeout: 60_000,
  }),
});

// see `ecdsa-recovery` branch, interchangeable with smartAccountSigner below.
//const oldSigner = privateKeyToAccount(generatePrivateKey());
// Arbitrary new owner account
const newSigner: PrivateKeyAccount = privateKeyToAccount(generatePrivateKey());
// Arbitrary account for recovery
const guardian: PrivateKeyAccount = privateKeyToAccount(generatePrivateKey());

const entryPoint = ENTRYPOINT_ADDRESS_V07;
const recoveryExecutorFunction =
  "function doRecovery(address _validator, bytes calldata _data)";

export const recoveryExample = async (primaryWallet: Wallet | null) => {
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

  // As ecdsaValidator, except this account will be used for the recovery action
  // multiple guardians can be set on an account with there own respective weights.
  // To perform recovery the combined guardian weight must cross the threshold value.
  const guardianValidator = await createWeightedECDSAValidator(publicClient, {
    entryPoint,
    config: {
      threshold: 100,
      signers: [{ address: guardian.address, weight: 100 }],
    },
    signers: [guardian],
    kernelVersion: KERNEL_V3_1,
  });

  // This is the counterfactual Kernel Smart Account.
  // account.address represents the determinstic counterfactual on-chain address.
  const account = await createKernelAccount(publicClient, {
    entryPoint,
    plugins: {
      sudo: ecdsaValidator,
      regular: guardianValidator,
      action: getRecoveryAction(entryPoint),
    },
    // index, // This is like a nonce. Since the SA is counterfactually computed, this allows the same account to deploy more than one.
    kernelVersion: KERNEL_V3_1,
  });

  const paymasterClient = createZeroDevPaymasterClient({
    chain: polygon,
    transport: http(process.env.NEXT_PUBLIC_PAYMASTER_RPC, {
      timeout: 60_000,
    }),
    entryPoint,
  });

  // This is the counterfactual Smart Account client.
  const kernelClient = createKernelAccountClient({
    account,
    chain: polygon,
    entryPoint,
    bundlerTransport: http(process.env.NEXT_PUBLIC_BUNDLER_RPC, {
      timeout: 60_000,
    }),
    middleware: {
      sponsorUserOperation: paymasterClient.sponsorUserOperation,
    },
  });

  console.log("performing recovery...");

  // This is the second internal tx, the recovery operation.
  // @ts-ignore
  const userOpHash = await kernelClient.sendUserOperation({
    userOperation: {
      callData: encodeFunctionData({
        abi: parseAbi([recoveryExecutorFunction]),
        functionName: "doRecovery",
        args: [getValidatorAddress(entryPoint, KERNEL_V3_1), newSigner.address],
      }),
    },
  });

  console.log("recovery userOp hash:", userOpHash);

  // The bundler/offchain mempool will send the transaction to the entry point
  const bundlerClient = kernelClient.extend(bundlerActions(entryPoint));
  const { receipt } = await bundlerClient.waitForUserOperationReceipt({
    hash: userOpHash,
    timeout: 60_000,
  });

  console.log("recovery completed!");
  console.log(`tx hash: ${receipt.transactionHash}`);

  // This is the beginning of the second transaction, the new owner will send a benign transaction
  const newEcdsaValidator = await signerToEcdsaValidator(publicClient, {
    signer: newSigner,
    entryPoint,
    kernelVersion: KERNEL_V3_1,
  });

  const newAccount = await createKernelAccount(publicClient, {
    deployedAccountAddress: account.address,
    entryPoint,
    plugins: {
      sudo: newEcdsaValidator,
    },
    kernelVersion: KERNEL_V3_1,
  });

  const newKernelClient = createKernelAccountClient({
    entryPoint,
    account: newAccount,
    chain: polygon,
    bundlerTransport: http(process.env.NEXT_PUBLIC_BUNDLER_RPC, {
      timeout: 60_000,
    }),
    middleware: {
      sponsorUserOperation: paymasterClient.sponsorUserOperation,
    },
  });

  console.log(newKernelClient);

  console.log("sending userOp with new signer");
  // Send a 0 amount to the Zero Address with empty data, a benign tx to demonstrate the new owner
  // @ts-ignore
  const userOpHash2 = await newKernelClient.sendUserOperation({
    userOperation: {
      callData: await newAccount.encodeCallData({
        to: zeroAddress,
        // @ts-ignore
        value: 0n,
        data: "0x",
      }),
    },
  });
  console.log("userOp hash:", userOpHash2);

  const { receipt: receipt2 } = await bundlerClient.waitForUserOperationReceipt(
    {
      hash: userOpHash2,
      timeout: 60_000,
    }
  );
  console.log("userOp completed!");
  console.log(`tx hash: ${receipt2.transactionHash}`);
};
