import axiosInstance from "./axiosInstance";

// Ranije je ovde stajalo axiosInstance.get("localhost://NexusChat/api/user") -
// "localhost://" nije validna sema, pa bi axios to spojio sa baseURL-om u
// besmislenu putanju. Uz to endpoint na backendu nije ni postojao.
export const getUsers = async () => {
    const response = await axiosInstance.get("/user");
    return response.data;
};
