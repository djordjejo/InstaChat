import axiosInstance from "./axiosInstance"
export const allUsers = async () => 
{  
    try{
      const response = await axiosInstance.get("localhost://NexusChat/api/user");
      return response.data;
    }catch
    {
        throw new Error("IsActive function cant get a users");
    }
}