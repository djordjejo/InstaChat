import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { createChat, getChats, viewChat, deleteChat } from "../api/chatsApi";
import { sendMessage } from "../api/messageApi";
import { useSignalRConnection } from "../hooks/useSignalRConnection";
import { useOnlineUsers } from "../hooks/useOnlineUsers";
import TypingIndicator from "../components/Chat/ChatView/TypingIndicator";

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
    const [typingUsers, setTypingUsers] = useState(new Map());
    const [messages, setMessages] = useState([]);
    const [messageTxt, setMessageTxt] = useState("");
    const [unreadMessages, setUnreadMessages] = useState(new Map());

    const connection = useSignalRConnection();
    const { otherOnlineUsers } = useOnlineUsers(connection, user);
    const initials = user?.username?.slice(0, 2).toUpperCase();

    // Inicijalno učitavanje chatova
    useEffect(() => {
        const fetchChats = async () => {
            const ch = await getChats();
            setChats(ch ?? []);
        };
        fetchChats();
    }, []);

    // Učitavanje konkretnog chata kad se klikne
    useEffect(() => {
        if (!activeChatId || !connection) return;

        setUnreadMessages(prev => {
            const next = new Map(prev);
            next.delete(activeChatId);
            return next;
        });

        const fetchChat = async () => {
            const conversation = await viewChat(activeChatId);
            setChat(conversation ?? null);
            setMessages(conversation?.messages ?? []);
        };
        fetchChat();
    }, [activeChatId, connection]);

    // Listener za dolazne poruke
    useEffect(() => {
        if (!connection) return;

        const handleNewMessage = (message) => {
            if (message.conversationId === activeChatId) {
                setMessages(prev => [...prev, message]);
            } else {
                setUnreadMessages(prev => {
                    const next = new Map(prev);
                    next.set(message.conversationId, (next.get(message.conversationId) || 0) + 1);
                    return next;
                });
            }
        };

        connection.on("ReceiveMessage", handleNewMessage);
        return () => connection.off("ReceiveMessage", handleNewMessage);
    }, [connection, activeChatId]);

    // Listener za nove konverzacije (sidebar update za drugog korisnika)
    useEffect(() => {
        if (!connection) return;

        const handleConversationCreated = async () => {
            const updatedChats = await getChats();
            setChats(updatedChats ?? []);
        };

        connection.on("ConversationCreated", handleConversationCreated);
        return () => connection.off("ConversationCreated", handleConversationCreated);
    }, [connection]);

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

    const onlineUser = otherOnlineUsers.find(
        u => u.userId === chat?.members?.find(m => m.userId !== user.userId)?.userId
    );

    const handleCreateChat = async (userId) => {
        if (!userId) return;

        const existingChat = chats.find(c =>
            c.members?.some(m => m.userId === userId)
        );
        if (existingChat) {
            setActiveChatId(existingChat.conversationId);
            setSidebarView("chats");
            return;
        }

        try {
            const newChat = await createChat({
                name: onlineUser?.username || "Novi cet",
                isGroup: false,
                memberIds: [userId]
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
            const newChat = await createChat({
                name,
                isGroup: true,
                memberIds
            });
            const updatedChats = await getChats();
            setChats(updatedChats ?? []);
            setActiveChatId(newChat.conversationId);
            setShowCreateGroupModal(false);
        } catch (err) {
            console.error("Kreiranje grupe nije uspelo:", err);
        }
    };
    useEffect(() => {
        if (!connection) return;

        const handleUserTyping = ({ userId, userName, conversationId }) => {
            setTypingUsers(prev => {
                const next = new Map(prev);
                const usersInChat = new Map(next.get(conversationId) ?? new Map());
                usersInChat.set(userId, userName);
                next.set(conversationId, usersInChat);
                return next;
            });
        };

        const handleUserStopTyping = ({ userId, conversationId }) => {
            setTypingUsers(prev => {
                const next = new Map(prev);
                const usersInChat = new Map(next.get(conversationId) ?? new Map());
                usersInChat.delete(userId);
                if (usersInChat.size === 0) {
                    next.delete(conversationId);
                } else {
                    next.set(conversationId, usersInChat);
                }
                return next;
            });
        };

        connection.on("UserTyping", handleUserTyping);
        connection.on("UserStopTyping", handleUserStopTyping);

        return () => {
            connection.off("UserTyping", handleUserTyping);
            connection.off("UserStopTyping", handleUserStopTyping);
        };
    }, [connection]);
    return (
        <div
            style={{ background: "linear-gradient(135deg, #e0f2fe 0%, #ede9fe 50%, #fce7f3 100%)" }}
            className="flex h-screen w-full overflow-hidden text-[#1e293b]"
        >
            <aside className="flex w-64 shrink-0 flex-col border-r border-black/[0.06] bg-[#e0effe]">
                <div className="flex items-center gap-3 border-b border-black/[0.06] px-5 py-4">
                    <Avatar initials={initials} size="sm" />
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-[#1e293b]">{user?.username}</p>
                        <p className="text-xs text-green-500">Online</p>
                    </div>
                    <button
                        onClick={() => setShowCreateGroupModal(true)}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-[#64748b] transition hover:bg-blue-600/10 hover:text-blue-600"
                        title="Kreiraj grupu"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

                <div className="flex-1 overflow-y-auto px-4 pt-5">
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

            {chat == null ? (
                <WelcomeScreen />
            ) : (
                <main className="flex flex-1 flex-col bg-[#f0f7ff]">
                    <ChatHeader chat={chat} onDeleteChat={handleDeleteChat} />
                    <MessagesList messages={messages} />

                    <TypingIndicator
                        usernames={[...(typingUsers.get(activeChatId)?.values() ?? [])]}
                    />

                    <MessageInput
                        value={messageTxt}
                        onChange={setMessageTxt}
                        onSend={handleSendMessage}
                        connection={connection}
                        activeChatId={activeChatId}
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