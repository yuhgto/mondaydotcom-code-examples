import { SeamlessApiClient } from "@mondaydotcomorg/api";
import { useState, useEffect } from "react";

const seamlessApiClient = new SeamlessApiClient("2025-01");

export function useApiQuery(
  query,
  options?: { variables?: Record<string, any> }
) {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    seamlessApiClient
      .request(query, options?.variables)
      .then((res) => {
        const queryResult = res as Record<string, any>;
        console.log({
          msg: "API request made",
          result: queryResult,
          params: { query, options },
        });
        setLoading(false);
        setData(queryResult.data);
        return res;
      })
      .catch((err) => {
        setError(true);
        console.error({ msg: "Error was found", err });
      });
  }, [query, options]);
  return { data, loading, error };
}
