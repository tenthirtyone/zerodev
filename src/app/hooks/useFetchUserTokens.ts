import { useState, useEffect } from "react";
import axios from "axios";

const useFetchUserTokens = (address: `0x${string}`) => {
  const [tokens, setTokens] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const API_KEY = "YOUR_API_KEY";
    const config = {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        Accept: "*/*",
      },
    };

    axios
      .get("https://api-mainnet.magiceden.dev/v3/rtp/getUsersUserTokensV7", {
        params: {
          normalizeRoyalties: "false",
          sortBy: "acquiredAt",
          sortDirection: "desc",
          limit: "20",
          includeTopBid: "false",
          includeAttributes: "false",
          includeLastSale: "false",
          includeRawData: "false",
          filterSpamTokens: "false",
          useNonFlaggedFloorAsk: "false",
          chain: "polygon",
          user: address,
        },
        ...config,
      })
      .then((response) => {
        setTokens(response.data);
        setLoading(false);
      })
      .catch((error) => {
        setError(error);
        setLoading(false);
      });

    return () => {
      setTokens(null);
      setLoading(true);
      setError(null);
    };
  }, [address]);

  return { tokens, loading, error };
};

export default useFetchUserTokens;
