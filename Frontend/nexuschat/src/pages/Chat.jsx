import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { createChat ,getChats, viewChat } from "../api/chatsApi";
import { sendMessage } from "../api/messageApi";
import { useSignalRConnection } from "../hooks/useSignalRConnection";
import { useOnlineUsers } from "../hooks/useOnlineUsers";

import Avatar from "../components/common/Avatar";
import SidebarMenu from "../components/Chat/Sidebar/SidebarMenu";
import ChatsList from "../components/Chat/Sidebar/ChatsList";
import ActiveUsersList from "../components/Chat/Sidebar/ActiveUsersList";
import ProfilePanel from "../components/Chat/Sidebar/ProfilePanel";
import WelcomeScreen from "../components/Chat/WelcomeScreen";
import ChatHeader from "../components/Chat/ChatView/ChatHeader";
import MessagesList from "../components/Chat/ChatView/MessagesList";
import MessageInput from "../components/Chat/ChatView/MessageInput";

export default function Chat() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [chats, setChats] = useState([]);
    const [chat, setChat] = useState(null);
    const [activeChatId, setActiveChatId] = useState(null);
    const [sidebarView, setSidebarView] = useState("chats");
    const [messages, setMessages] = useState([]);
    const [messageTxt, setMessageTxt] = useState("");

    const connection = useSignalRConnection(setMessages);
    const { otherOnlineUsers } = useOnlineUsers(connection, user);

    const initials = user.slice(0, 2).toUpperCase();
    // dohvata cetove korisnika pri učitavanju stranice i postavlja ih u stanje
    useEffect(() => {
        const fetchChats = async () => {
            const ch = await getChats();
            setChats(ch ?? []);
        };
        fetchChats();
    }, []);
    // svaki put kad se promeni aktivni čet ili konekcija,
    //  korisnik napušta prethodni čet (ako postoji) i pridružuje se novom, 
    // a zatim učitava poruke za novi čet
    useEffect(() => {
        if (!activeChatId || !connection) return;

        connection.invoke("LeaveConversation", activeChatId);

        const fetchChat = async () => {
            const conversation = await viewChat(activeChatId);
            setChat(conversation ?? null);
            setMessages(conversation?.messages ?? []);
        };
        fetchChat();

        connection.invoke("JoinConversation", activeChatId);
    }, [activeChatId, connection]);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const handleSendMessage = async (message) => {
        if (!message.trim()) return;
        setMessageTxt("");
        try {
            await sendMessage(activeChatId, message);
        } catch (err) {
            console.error("Slanje nije uspelo:", err);
            setMessageTxt(message);
        }
    };

    const handleCreateChat = async (userId) => {
    if (!userId) return;

    const existingChat = chats.find(c => 
        c.members?.some(m => m.userId === userId)
    );
    const user = otherOnlineUsers.find(u => u.userId === userId);
    console.log(user);
    if (existingChat) {
        // Čet postoji - samo ga otvori
        setActiveChatId(existingChat.conversationsId);
        setSidebarView("chats");
        return;
    }

    try {
        const newChat = await createChat({
        name: user?.username || "Novi cet",
        isGroup: false,
        memberIds: [userId]
});
        setChats([...chats, newChat]);
        setActiveChatId(newChat.conversationsId);
        setSidebarView("chats");
    } catch (err) {
        console.error("Kreiranje chata nije uspelo:", err);
    }
};
    return (
        <div
            style={{ background: "linear-gradient(135deg, #e0f2fe 0%, #ede9fe 50%, #fce7f3 100%)" }}
            className="flex h-screen w-full overflow-hidden text-[#1e293b]"
        >
            {/* SIDEBAR */}
            <aside className="flex w-64 shrink-0 flex-col border-r border-black/[0.06] bg-[#e0effe]">

                {/* Profil korisnika */}
                <div className="flex items-center gap-3 border-b border-black/[0.06] px-5 py-4">
                    <Avatar initials={initials} size="sm" />
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[#1e293b]">{user}</p>
                        <p className="text-xs text-green-500">Online</p>
                    </div>
                </div>

                <SidebarMenu
                    sidebarView={sidebarView}
                    setSidebarView={setSidebarView}
                    onlineCount={otherOnlineUsers.length}
                />

                <div className="flex-1 overflow-y-auto px-4 pt-5">
                    {sidebarView === "chats" && (
                        <ChatsList
                            chats={chats}
                            activeChatId={activeChatId}
                            onChatSelect={setActiveChatId}
                        />
                    )}
                    {sidebarView === "activeUsers" && (
                        <ActiveUsersList users={otherOnlineUsers} 
                        onCreateChat={handleCreateChat}/>
                    )}
                    {sidebarView === "profile" && (
                        <ProfilePanel
                            user={user}
                            initials={initials}
                            onLogout={handleLogout}
                        />
                    )}
                </div>

                {/* Dno sidebar-a */}
                <div className="flex flex-col gap-0.5 border-t border-black/[0.06] px-4 py-3">
                    <button
                        onClick={() => setSidebarView(sidebarView === "profile" ? "chats" : "profile")}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${sidebarView === "profile" ? "bg-blue-600/10 text-blue-700" : "text-[#64748b] hover:bg-black/5 hover:text-[#1e293b]"}`}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="8" r="4" />
                            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                        </svg>
                        Moj profil
                    </button>
                    <button className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-[#64748b] transition hover:bg-black/5 hover:text-[#1e293b]">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="3" />
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                        </svg>
                        Podešavanja
                    </button>
                </div>
            </aside>

            {/* MAIN */}
            {chat == null ? (
                <WelcomeScreen user={user} />
            ) : (
                <main className="flex flex-1 flex-col bg-[#f0f7ff]">
                    <ChatHeader user={user} />
                    <MessagesList messages={messages} user={user} />
                    <MessageInput
                        value={messageTxt}
                        onChange={setMessageTxt}
                        onSend={handleSendMessage}
                    />
                </main>
            )}
        </div>
    );
}
