import { axiosAuth, axiosNoAuth } from "./axios";

// User login API
export const loginUser= async (email: string, password: string) => {
    const response = await axiosNoAuth.post("/auth/login", { email, password });
    return response.data;
  };

  export const getMe = async () => {
    const response = await axiosAuth.get("/auth/me");
    return response.data;
};