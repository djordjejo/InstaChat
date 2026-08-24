import axiosInstance from "./axiosInstance";

// <img src="/api/attachment/123"> NE bi radio: tag ne salje Authorization
// zaglavlje, pa bi endpoint vratio 401. Zato sliku dovlacimo axiosom (koji
// dodaje token), dobijemo blob, i od njega napravimo lokalni objectURL.
export const fetchAttachmentBlob = async (attachmentId) => {
    const response = await axiosInstance.get(`/attachment/${attachmentId}`, {
        responseType: "blob",
    });
    return response.data;
};
