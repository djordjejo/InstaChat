import axiosInstance from './axiosInstance'; // ili kako se već zove fajl

export const getChats = async (token) => {
    try{
        const response = await axiosInstance.get("/conversation", {
            headers: {
                "Authorization": `Bearer ${token}`,
            }
        });
        return response.data;
    }catch(error)
    {
        throw new Error("Failed to fetch chats: " + error.message);
    }
}

export const createChat = async (token,memberId,chatName) => {
    try{
        const response = await axiosInstance.post("/conversation/create",{
            conversationName: chatName,
            memberId: memberId
        },{
            headers: {
                "Authorization": `Bearer ${token}`,
            }
            
        });
        return response.data;
    }catch(error)
    {
        throw new Error("Failed to create a chat: " + error.message);
    }
}
export const deleteChat = async (token, chatId) => {
    try{
        await axiosInstance.delete(`/conversation/${chatId}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
            }
        });
    }catch(error)
    {
        throw new Error("Failed to delete a chat: " + error.message);
    }
}
export const viewChat = async (token, chatId) => {
    try{
       const response = await axiosInstance.get(`/conversation/getConversation/${chatId}`, {
          headers: {
              "Authorization": `Bearer ${token}`,
    }
});
        return response.data;

    }catch(error)
    {
        throw new Error("Failed to fetch a chat: " + error.message);

    }
}