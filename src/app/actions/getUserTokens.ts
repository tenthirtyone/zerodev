import axios from "axios";

export async function getUserCollections(address: `0x${string}`) {
  const response = await axios.get(
    "https://api-mainnet.magiceden.dev/v3/rtp/getUsersUserCollectionsV3",
    {
      params: {
        includeTopBid: "false",
        includeLiquidCount: "false",
        offset: "0",
        limit: "20",
        chain: "polygon",
        user: address,
      },
      headers: {
        Accept: "*/*",
      },
    }
  );

  console.log(response);
}
