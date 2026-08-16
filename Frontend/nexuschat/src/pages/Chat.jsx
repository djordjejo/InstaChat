import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { createChat, getChats, viewChat, deleteChat } from "../api/chatsApi";
import { sendMessage } from "../api/messageApi";
import { useSignalRConnection } from "../hooks/useSignalRConnection";
import { useOnlineUsers } from "../hooks/useOnlineUsers";

import Avatar from "../components/common/Avatar";
import SidebarMenu from "../components/Chat/Sidebar/SidebarMenu";
import CreateGroupModal from "../components/Chat/Sidebar/CreateGroupModal";
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
    const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);

    const [messages, setMessages] = useState([]);
    const [messageTxt, setMessageTxt] = useState("");
    const [unreadMessages, setUnreadMessages] = useState(new Map());

    const connection = useSignalRConnection();
    const { otherOnlineUsers } = useOnlineUsers(connection, user);
    const initials = user?.username?.slice(0, 2).toUpperCase();

    useEffect(() => {
        const fetchChats = async () => {
            const ch = await getChats();
            setChats(ch ?? []);
        };
        fetchChats();
    }, []);

    const handleDeleteChat = async () => {
        if (!activeChatId) return;

        try {
            await deleteChat(activeChatId);
            const updatedChats = await getChats();
            setChats(updatedChats ?? []);
            setActiveChatId(null);
            setChat(null);
            setMessages([]);
        } catch (err) {
            console.error("Brisanje razgovora nije uspelo:", err);
        }
    };

    useEffect(() => {
        if (!activeChatId || !connection) return;

        setUnreadMessages((prev) => {
            const next = new Map(prev);
            next.delete(activeChatId);
            return next;
        });

        // JoinConversation je premesten ovde iz tri odvojena mesta.
        // Ranije novi 1-na-1 chat nije ulazio u grupu, pa poruke nisu stizale
        // u realnom vremenu dok se strana ne refreshuje.
        connection.invoke("JoinConversation", activeChatId).catch((err) => {
            console.error("JoinConversation nije uspeo:", err);
        });

        const fetchChat = async () => {
            const conversation = await viewChat(activeChatId);
            setChat(conversation ?? null);
            setMessages(conversation?.messages ?? []);
        };
        fetchChat();
    }, [activeChatId, connection]);

    const handleLogout = () => {
        logout();
        navigate("/login", { replace: true });
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

    useEffect(() => {
        if (!connection) return;

        const handleNewMessage = (message) => {
            if (message.conversationId === activeChatId) {
                setMessages((prev) => [...prev, message]);
            } else {
                setUnreadMessages((prev) => {
                    const next = new Map(prev);
                    next.set(
                        message.conversationId,
                        (next.get(message.conversationId) || 0) + 1
                    );
                    return next;
                });
            }
        };

        connection.on("ReceiveMessage", handleNewMessage);
        return () => connection.off("ReceiveMessage", handleNewMessage);
    }, [connection, activeChatId]);

    const peer = chat?.members?.find((m) => m.userId !== user?.userId);
    const onlineUser = otherOnlineUsers.find((u) => u.userId === peer?.userId);

    const handleCreateChat = async (userId) => {
        if (!userId) return;

        const existingChat = chats.find((c) =>
            c.members?.some((m) => m.userId === userId)
        );
        if (existingChat) {
            setActiveChatId(existingChat.conversationId);
            setSidebarView("chats");
            return;
        }

        // Ranije je ovde stajalo onlineUser?.username - a onlineUser je izveden iz
        // trenutno OTVORENOG chata, ne iz korisnika koga si kliknuo. Novi chat je
        // dobijao ime pogresnog sagovornika ili fallback "Novi cet".
        const target = otherOnlineUsers.find((u) => u.userId === userId);

        try {
            const newChat = await createChat({
                name: target?.username || "Novi razgovor",
                isGroup: false,
                memberIds: [userId],
            });
            const updatedChats = await getChats();
            setChats(updatedChats ?? []);
            setActiveChatId(newChat.conversationId);
            setSidebarView("chats");
        } catch (err) {
            console.error("Kreiranje chata nije uspelo:", err);
        }
    };

    const handleCreateGroup = async ({ name, memberIds }) => {
        try {
            const newChat = await createChat({ name, isGroup: true, memberIds });
            const updatedChats = await getChats();
            setChats(updatedChats ?? []);
            setActiveChatId(newChat.conversationId);
            setShowCreateGroupModal(false);
        } catch (err) {
            console.error("Kreiranje grupe nije uspelo:", err);
        }
    };

    return (
        // h-dvh, ne h-screen: 100vh na mobilnom Safariju racuna sakrivenu adresnu traku
        // pa input za poruku zavrsi ispod ivice ekrana.
        <div className="flex h-dvh w-full overflow-hidden bg-[#141210] text-white">
            {/* Na uskim ekranima sidebar i razgovor se smenjuju, ne dele prostor. */}
            <aside
                className={
                    "w-full shrink-0 flex-col border-r border-white/10 bg-white/[0.04] md:flex md:w-72 " +
                    (chat ? "hidden md:flex" : "flex")
                }
            >
                <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
                    <Avatar initials={initials} size="sm" />
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-white">
                            {user?.username}
                        </p>
                        <p className="flex items-center gap-1.5 text-xs text-white/55">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#4ade80]" />
                            Online
                        </p>
                    </div>
                    <button
                        onClick={() => setShowCreateGroupModal(true)}
                        aria-label="Kreiraj grupu"
                        title="Kreiraj grupu"
                        className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-white/15 bg-white/5 text-white/70 transition hover:bg-white/12 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-white/70 motion-reduce:transition-none"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                    </button>
                </div>

                <SidebarMenu
                    sidebarView={sidebarView}
                    setSidebarView={setSidebarView}
                    onlineCount={otherOnlineUsers.length}
                />

                <div className="flex-1 overflow-y-auto px-3 pt-4">
                    {sidebarView === "chats" && (
                        <ChatsList
                            unreadMessages={unreadMessages}
                            chats={chats}
                            activeChatId={activeChatId}
                            onChatSelect={setActiveChatId}
                        />
                    )}
                    {sidebarView === "activeUsers" && (
                        <ActiveUsersList
                            users={otherOnlineUsers}
                            onCreateChat={handleCreateChat}
                        />
                    )}
                    {sidebarView === "profile" && (
                        <ProfilePanel initials={initials} onLogout={handleLogout} />
                    )}
                </div>

                <div className="flex flex-col gap-0.5 border-t border-white/10 px-3 py-3">
                    <button
                        onClick={() =>
                            setSidebarView(sidebarView === "profile" ? "chats" : "profile")
                        }
                        aria-current={sidebarView === "profile" ? "page" : undefined}
                        className={
                            "flex items-center gap-3 rounded-[10px] px-3 py-2 text-sm transition focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-white/70 motion-reduce:transition-none " +
                            (sidebarView === "profile"
                                ? "bg-white/12 text-white"
                                : "text-white/60 hover:bg-white/8 hover:text-white")
                        }
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <circle cx="12" cy="8" r="4" />
                            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                        </svg>
                        Moj profil
                    </button>
                    <button className="flex items-center gap-3 rounded-[10px] px-3 py-2 text-sm text-white/60 transition hover:bg-white/8 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-white/70 motion-reduce:transition-none">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <circle cx="12" cy="12" r="3" />
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                        </svg>
                        Podesavanja
                    </button>
                </div>
            </aside>

            {chat == null ? (
                <div className="hidden flex-1 md:flex">
                    <WelcomeScreen />
                </div>
            ) : (
                <main className="flex flex-1 flex-col bg-[#191613]">
                    {/* Nazad na listu - vidljivo samo dok je sidebar sakriven */}
                    <button
                        onClick={() => {
                            setActiveChatId(null);
                            setChat(null);
                            setMessages([]);
                        }}
                        className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5 text-sm text-white/70 transition hover:text-white md:hidden"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="m15 18-6-6 6-6" />
                        </svg>
                        Razgovori
                    </button>

                    <ChatHeader
                        chat={chat}
                        isPeerOnline={Boolean(onlineUser)}
                        onDeleteChat={handleDeleteChat}
                    />
                    <MessagesList messages={messages} />
                    <MessageInput
                        value={messageTxt}
                        onChange={setMessageTxt}
                        onSend={handleSendMessage}
                    />
                </main>
            )}

            {showCreateGroupModal && (
                <CreateGroupModal
                    onlineUsers={otherOnlineUsers}
                    onClose={() => setShowCreateGroupModal(false)}
                    onCreate={handleCreateGroup}
                />
            )}
        </div>
    );
}