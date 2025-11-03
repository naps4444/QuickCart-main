import axios from "axios";
import { useAuth } from "@clerk/nextjs";

const useAxios = () => {
  const { getToken } = useAuth();

  const instance = axios.create({
    baseURL: "/api",
  });

  instance.interceptors.request.use(async (config) => {
    const token = await getToken({ template: "default" });
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return instance;
};

export default useAxios;
