import axiosInstance from "./axiosInstance";

export const sendMessage = async (chatId, message) => {
    const response = await axiosInstance.post("/message/send", {
        conversationId: chatId,
        content: message,
    });
    return response.data;
};

// Multipart, ne JSON. Content-Type se NE postavlja rucno - browser ga sam
// generise zajedno sa "boundary" vrednoscu, koju rucno ne mozes znati.
export const sendImageMessage = async (chatId, file, content) => {
    const formData = new FormData();
    formData.append("conversationId", chatId);
    formData.append("file", file);
    if (content) formData.append("content", content);

    const response = await axiosInstance.post("/message/send-image", formData);
    return response.data;
};
