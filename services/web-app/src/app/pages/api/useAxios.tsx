import { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "@/app/lib/constants";
import { AxiosRequest } from "@/app/lib/types";

const useAxios = (request: AxiosRequest) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(BASE_URL + request.path, {
        params: { userId: 24 },
      });
      console.log(request.params);
      //   const response = await axios[request.method](BASE_URL + request.path, {
      //     params: request.params ?? undefined,
      //     data: request.body ?? undefined,
      //   });
      console.log("sent request, gto response");
      console.log(response);
      setData(response.data);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error };
};

export default useAxios;
