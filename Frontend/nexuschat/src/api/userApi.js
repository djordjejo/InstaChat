import axiosInstance from "./axiosInstance";

export const getUsers = async () => {
    const response = await axiosInstance.get("/user");
    return response.data;
};
