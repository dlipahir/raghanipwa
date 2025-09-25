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
  export const getUsers = async () => {
    const response = await axiosAuth.get("/auth/all");
    return response.data;
};

export const registerUser = async (username: string, email: string, password: string) => {
    const response = await axiosNoAuth.post("/auth/register", { username, email, password });
    return response.data;
};
export const ResetPassword = async (_id:string, password: string) => {
    const response = await axiosNoAuth.post("/auth/reset", { _id, password });
    return response.data;
};


