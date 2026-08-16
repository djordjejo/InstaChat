import axiosInstance from "./axiosInstance";

export const sendMessage = async (chatId, message) => {
    const response = await axiosInstance.post("/message/send", {
        conversationId: chatId,
        content: message,
    });
    return response.data;
};

// Uklonjen je "reciveMessage" - gadjao je /message/recive koji ne postoji na
// backendu, nigde se nije uvozio, a konceptualno je i bio pogresan: poruke
// stizu preko SignalR-a, ne HTTP POST-om.
