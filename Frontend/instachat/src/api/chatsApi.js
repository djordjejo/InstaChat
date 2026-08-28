import axiosInstance from "./axiosInstance";

// Greske se propustaju kakve jesu. Ranije se ovde pravio novi Error(...),
// cime se gubio error.response - a u njemu su i HTTP status i ProblemDetails
// telo sa porukom sa servera. Pozivalac je video samo "Request failed with
// status code 500" i nije mogao da razlikuje 403 od 404 od 500.

export const getChats = async () => {
    const response = await axiosInstance.get("/conversation");
    return response.data;
};

export const createChat = async ({ name, memberIds, isGroup }) => {
    const response = await axiosInstance.post("/conversation/create", {
        name,
        memberIds,
        isGroup,
    });
    return response.data;
};

export const deleteChat = async (chatId) => {
    const response = await axiosInstance.delete(`/conversation/${chatId}`);
    return response.data;
};

export const viewChat = async (chatId) => {
    const response = await axiosInstance.get(
        `/conversation/getConversation/${chatId}`
    );
    return response.data;
};
