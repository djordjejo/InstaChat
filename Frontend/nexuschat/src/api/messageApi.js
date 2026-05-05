import axiosInstance from './axiosInstance';

export const sendMessage = async (chatId, message) => {
    try{
        const response = await axiosInstance.post(`/message/send`, 
        {
            conversationId: chatId,
            content: message
        });
        return response.data;
    }catch(error)
    {
        throw new Error("Failed to send a message: " + error.message);
    }
}