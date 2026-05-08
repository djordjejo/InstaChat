import { createContext, useContext, useState } from "react";

const CreateChatContext = createContext();

export function CreateChatProvider({ children }) {
    const [chat, setChat] = useState(null);

    return (
        <CreateChatContext.Provider value={{ chat, setChat }}>
            {children}
        </CreateChatContext.Provider>
    );
}

export function useCreateChat() {
    return useContext(CreateChatContext);
}
