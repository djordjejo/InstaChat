import axiosInstance from "./axiosInstance";

export const getUsers = async () => {
    const response = await axiosInstance.get("/user");
    return response.data;
};

// Profil prijavljenog korisnika. Iz tokena se dobijaju samo ime i email -
// avatar se menja bez nove prijave, pa mora sa servera.
export const getCurrentUser = async () => {
    const response = await axiosInstance.get("/user/me");
    return response.data;
};

// Multipart, ne JSON. Content-Type se NE postavlja rucno - browser ga sam
// generise zajedno sa "boundary" vrednoscu, koju rucno ne mozes znati.
export const uploadAvatar = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axiosInstance.post("/user/avatar", formData);
    return response.data;
};

export const deleteAvatar = async () => {
    const response = await axiosInstance.delete("/user/avatar");
    return response.data;
};

// Isto kao kod priloga: <img src="/api/user/.../avatar"> ne salje Authorization
// zaglavlje, pa bi endpoint vratio 401. Zato sliku dovlacimo axiosom i od blob-a
// pravimo lokalni objectURL.
export const fetchAvatarBlob = async (avatarUrl) => {
    const response = await axiosInstance.get(avatarUrl, { responseType: "blob" });
    return response.data;
};
