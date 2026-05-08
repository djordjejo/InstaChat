import axiosInstance from './axiosInstance';

export const getChats = async () => {
    try{
        const response = await axiosInstance.get("/conversation");
        return response.data;
    }catch(error)
    {
        throw new Error("Failed to fetch chats: " + error.message);
    }
}

export const createChat = async ({memberIds,chatName,isGroup}) => {
    try{
        const response = await axiosInstance.post("/conversation/create",{
            name: chatName,
            memberIds: memberIds,
            isGroup: isGroup
        });
        return response.data;
    }catch(error)
    {
        throw new Error("Failed to create a chat: " + error.message);
    }
}
export const deleteChat = async (chatId) => {
    try{
        await axiosInstance.delete(`/conversation/${chatId}`);
    }catch(error)
    {
        throw new Error("Failed to delete a chat: " + error.message);
    }
}
export const viewChat = async (chatId) => {
    try{
       const response = await axiosInstance.get(`/conversation/getConversation/${chatId}`, );
        return response.data;

    }catch(error)
    {
        throw new Error("Failed to fetch a chat: " + error.message);

    }
}