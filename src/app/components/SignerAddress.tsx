import { useDynamicContext } from "@/app/components";

export function SignerAddress() {
  const { primaryWallet } = useDynamicContext();

  return (
    <div>
      EoA Signer Address:{" "}
      {primaryWallet?.address || "User is not Authenticated"}
    </div>
  );
}

export default SignerAddress;
