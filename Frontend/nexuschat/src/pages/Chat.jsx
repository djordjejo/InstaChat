import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { createChat, getChats, viewChat, deleteChat } from "../api/chatsApi";
import {
    sendMessage,
    sendImageMessage,
    editMessage,
    deleteMessage,
} from "../api/messageApi";
import { getUsers, getCurrentUser } from "../api/userApi";
import { forgetAvatar } from "../hooks/useAvatarObjectUrl";
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
import TypingIndicator from "../components/Chat/ChatView/TypingIndicator";
import AttachImageModal from "../components/Chat/ChatView/AttachImageModal";
import { getInitials } from "../utility/getInitials";

const appendMessage = (list, message) =>
    list.some((m) => m.messageId === message.messageId) ? list : [...list, message];

// Izmena stize BEZ priloga - backend ih ne ucitava jer ih izmena ne dira.
// Zato se preuzimaju samo sadrzaj i oznaka izmene, a lista priloga se cuva.
const replaceMessage = (list, updated) =>
    list.map((m) =>
        m.messageId === updated.messageId
            ? { ...m, content: updated.content, isEdited: updated.isEdited }
            : m
    );

const removeMessage = (list, messageId) =>
    list.filter((m) => m.messageId !== messageId);

// Koliko dugo posle poslednjeg pritiska tastera se jos smatra da korisnik kuca.
const TYPING_IDLE_MS = 2000;

// Osigurac na strani primaoca: ako "StopTyping" nikad ne stigne - tab zatvoren
// usred kucanja, veza pukla - indikator bi inace ostao zauvek.
const TYPING_STALE_MS = 6000;

export default function Chat() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [chats, setChats] = useState([]);
    const [users, setUsers] = useState([]);
    const [profile, setProfile] = useState(null);
    const [chat, setChat] = useState(null);

    const [activeChatId, setActiveChatId] = useState(null);
    const [sidebarView, setSidebarView] = useState("chats");
    const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
    const [showAttachModal, setShowAttachModal] = useState(false);

    const [messages, setMessages] = useState([]);
    const [messageTxt, setMessageTxt] = useState("");
    const [unreadMessages, setUnreadMessages] = useState(new Map());

    // Uz mapu "userId -> korisnicko ime" pamti se i razgovor na koji se odnosi.
    // Zahvaljujuci tome, prelazak na drugi razgovor ne trazi ciscenje stanja:
    // indikator se prosto ne prikazuje kad se chatId ne poklapa sa otvorenim.
    const [typing, setTyping] = useState({ chatId: null, users: new Map() });

    // Ref, ne state: menja se pri svakom pritisku tastera, a nista se od njega
    // ne iscrtava - state bi ovde znacio ponovni render po slovu.
    const typingIdleRef = useRef(null);
    const typingSentRef = useRef(false);
    const typingStaleRef = useRef(new Map());

    const connection = useSignalRConnection();
    const { otherOnlineUsers } = useOnlineUsers(connection, user);

    // Set malih slova - poredjenje GUID-ova iz dva izvora (baza i SignalR)
    // mora biti neosetljivo na velicinu slova.
    const onlineIds = new Set(
        otherOnlineUsers.map((u) => u.userId?.toLowerCase()).filter(Boolean)
    );
    const initials = getInitials(user?.username);

    // Puna lista korisnika iz baze. Prisutnost i dalje stize preko SignalR-a -
    // ova lista samo obezbedjuje da se offline korisnici uopste vide.
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const all = await getUsers();
                setUsers(all ?? []);
            } catch (err) {
                console.error("Učitavanje korisnika nije uspelo:", err);
            }
        };
        fetchUsers();
    }, []);

    // Sopstveni profil ide zasebno od liste korisnika: nju backend vraca BEZ
    // pozivaoca, a avatar u zaglavlju je bas njegov.
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setProfile(await getCurrentUser());
            } catch (err) {
                console.error("Učitavanje profila nije uspelo:", err);
            }
        };
        fetchProfile();
    }, []);

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

        // "cancelled" stiti od trke pri brzom prebacivanju razgovora: ako
        // korisnik klikne drugi chat dok prvi jos ucitava, stari odgovor se
        // odbacuje umesto da pregazi novi.
        let cancelled = false;

        const openConversation = async () => {
            try {
                // AWAIT je ovde kljucan. Ranije je invoke bio "fire and forget",
                // pa je "chat" mogao da se iscrta - zajedno sa poljem za unos -
                // dok konekcija jos nije usla u SignalR grupu. Poruka poslata u
                // tom prozoru emitovala bi se na Group(id) koju jos ne slusas,
                // i videlo bi je se tek posle refresha.
                await connection.invoke("JoinConversation", activeChatId);
            } catch (err) {
                console.error("JoinConversation nije uspeo:", err);
            }

            if (cancelled) return;

            try {
                const conversation = await viewChat(activeChatId);
                if (cancelled) return;

                setChat(conversation ?? null);
                setMessages(conversation?.messages ?? []);
            } catch (err) {
                console.error("Učitavanje razgovora nije uspelo:", err);
            }
        };

        openConversation();

        return () => {
            cancelled = true;
        };
    }, [activeChatId, connection]);

    // Stara adresa avatara ostaje u kesu sa svojim objectURL-om; posle izmene
    // se vise nikad ne trazi, pa je oslobadjamo odmah.
    const handleAvatarChange = (updated) => {
        forgetAvatar(profile?.avatarUrl);
        setProfile(updated);
    };

    const handleLogout = () => {
        logout();
        navigate("/login", { replace: true });
    };

    const handleSendMessage = async (message) => {
        if (!message.trim()) return;

        const text = message;
        setMessageTxt("");

        try {
            const sent = await sendMessage(activeChatId, text);

            // Sopstvenu poruku prikazujemo odmah iz HTTP odgovora, ne cekamo
            // da se vrati preko SignalR-a. Tako se vidi cak i ako ulazak u
            // grupu jos nije zavrsio. Ako stigne i preko huba, appendMessage
            // je odbacuje po messageId.
            if (sent) {
                setMessages((prev) => appendMessage(prev, sent));
            }
        } catch (err) {
            console.error("Slanje nije uspelo:", err);
            setMessageTxt(text);
        }
    };

    const handleSendImage = async (file, caption) => {
        // Isti obrazac kao kod teksta: poruku prikazujemo iz HTTP odgovora, a
        // appendMessage odbacuje duplikat ako ista stigne i preko SignalR-a.
        const sent = await sendImageMessage(activeChatId, file, caption);

        if (sent) {
            setMessages((prev) => appendMessage(prev, sent));
        }

        setShowAttachModal(false);
    };

    // Izmena i brisanje se NE primenjuju lokalno: obe operacije backend emituje
    // svim clanovima grupe, pa se sopstveni prikaz azurira istim putem kao i
    // tudji. Time nema dva mesta koja odrzavaju isto stanje.
    const handleEditMessage = async (messageId, content) => {
        await editMessage(messageId, content);
    };

    const handleDeleteMessage = async (messageId) => {
        await deleteMessage(messageId);
    };

    // --- indikator kucanja: slanje ---

    const stopTyping = () => {
        clearTimeout(typingIdleRef.current);

        // Bez ove zastite bi se "StopTyping" slao i kad se nikad nije ni javilo
        // da korisnik kuca - npr. na svaki izlazak iz polja za unos.
        if (!typingSentRef.current) return;

        typingSentRef.current = false;
        connection?.invoke("StopTyping", activeChatId).catch(() => {});
    };

    const notifyTyping = () => {
        if (!connection || !activeChatId) return;

        // "StartTyping" ide samo jednom po nizu kucanja, ne po slovu - inace bi
        // svaki pritisak tastera bio jedan poziv cvorista.
        if (!typingSentRef.current) {
            typingSentRef.current = true;
            connection.invoke("StartTyping", activeChatId).catch(() => {});
        }

        clearTimeout(typingIdleRef.current);
        typingIdleRef.current = setTimeout(stopTyping, TYPING_IDLE_MS);
    };

    // --- indikator kucanja: prijem ---

    useEffect(() => {
        if (!connection) return;

        const staleTimers = typingStaleRef.current;

        const forget = (userId) => {
            clearTimeout(staleTimers.get(userId));
            staleTimers.delete(userId);

            setTyping((prev) => {
                if (!prev.users.has(userId)) return prev;
                const users = new Map(prev.users);
                users.delete(userId);
                return { chatId: prev.chatId, users };
            });
        };

        const handleUserTyping = (payload) => {
            // Dogadjaj stize za svaku grupu u kojoj je konekcija clan; prikazuje
            // se samo ako se odnosi na razgovor koji je trenutno otvoren.
            if (payload?.conversationId !== activeChatId) return;

            setTyping((prev) => {
                // Zaostali unosi iz prethodnog razgovora se odbacuju umesto da
                // se nadovezuju.
                const users =
                    prev.chatId === activeChatId ? new Map(prev.users) : new Map();

                users.set(payload.userId, payload.userName);
                return { chatId: activeChatId, users };
            });

            clearTimeout(staleTimers.get(payload.userId));
            staleTimers.set(
                payload.userId,
                setTimeout(() => forget(payload.userId), TYPING_STALE_MS)
            );
        };

        const handleUserStopTyping = (payload) => {
            if (payload?.conversationId !== activeChatId) return;
            forget(payload.userId);
        };

        connection.on("UserTyping", handleUserTyping);
        connection.on("UserStopTyping", handleUserStopTyping);

        return () => {
            connection.off("UserTyping", handleUserTyping);
            connection.off("UserStopTyping", handleUserStopTyping);
        };
    }, [connection, activeChatId]);

    // Prelaskom na drugi razgovor sopstveno kucanje pocinje iznova - inace bi
    // se "StartTyping" preskocio, jer zastavica jos stoji od prethodnog.
    // Ovde se dira samo ref, bez postavljanja stanja: prikaz se ionako racuna
    // poredjenjem typing.chatId sa otvorenim razgovorom.
    useEffect(() => {
        const staleTimers = typingStaleRef.current;

        typingSentRef.current = false;
        clearTimeout(typingIdleRef.current);

        return () => {
            staleTimers.forEach((timer) => clearTimeout(timer));
            staleTimers.clear();
        };
    }, [activeChatId]);

    useEffect(() => {
        if (!connection) return;

        const handleNewMessage = (message) => {
            if (message.conversationId === activeChatId) {
                setMessages((prev) => appendMessage(prev, message));
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

    // Izmena i brisanje poruke. Oba dogadjaja se odnose samo na otvoreni
    // razgovor - poruke ostalih razgovora se ionako ne drze u stanju, pa ce
    // izmenu pokupiti pri sledecem otvaranju.
    useEffect(() => {
        if (!connection) return;

        const handleMessageUpdated = (message) => {
            if (message.conversationId !== activeChatId) return;
            setMessages((prev) => replaceMessage(prev, message));
        };

        const handleMessageDeleted = (payload) => {
            if (payload?.conversationId !== activeChatId) return;
            setMessages((prev) => removeMessage(prev, payload.messageId));
        };

        connection.on("MessageUpdated", handleMessageUpdated);
        connection.on("MessageDeleted", handleMessageDeleted);

        return () => {
            connection.off("MessageUpdated", handleMessageUpdated);
            connection.off("MessageDeleted", handleMessageDeleted);
        };
    }, [connection, activeChatId]);

    // Drugi ucesnik ne zna da je razgovor nastao - njegova konekcija je usla u grupe
    // jos u OnConnectedAsync. Backend ga zato obavesti preko Clients.Users(...),
    // pa on sam udje u grupu i osvezi listu.
    useEffect(() => {
        if (!connection) return;

        const handleConversationCreated = async (conversationId) => {
            try {
                await connection.invoke("JoinConversation", conversationId);
            } catch (err) {
                console.error("Ulazak u grupu nije uspeo:", err);
            }

            try {
                const updated = await getChats();
                setChats(updated ?? []);
            } catch (err) {
                console.error("Osvezavanje liste razgovora nije uspelo:", err);
            }
        };

        connection.on("ConversationCreated", handleConversationCreated);
        return () => connection.off("ConversationCreated", handleConversationCreated);
    }, [connection]);

    // Brisanje je ogledalo kreiranja: backend javi svim clanovima preko
    // Clients.Users(...), pa svaki klijent sam ocisti svoje stanje.
    useEffect(() => {
        if (!connection) return;

        const handleConversationDeleted = (conversationId) => {
            setChats((prev) =>
                prev.filter((c) => c.conversationId !== conversationId)
            );

            // Ako je bas taj razgovor bio otvoren, zatvori ga - inace bi korisnik
            // gledao u poruke razgovora koji vise ne postoji.
            setActiveChatId((prev) => (prev === conversationId ? null : prev));
            setChat((prev) =>
                prev?.conversationId === conversationId ? null : prev
            );
            setMessages((prev) => (prev.length > 0 ? [] : prev));

            // Ocisti i brojac neprocitanih za taj razgovor.
            setUnreadMessages((prev) => {
                if (!prev.has(conversationId)) return prev;
                const next = new Map(prev);
                next.delete(conversationId);
                return next;
            });
        };

        connection.on("ConversationDeleted", handleConversationDeleted);
        return () => connection.off("ConversationDeleted", handleConversationDeleted);
    }, [connection]);

    // Avatar posiljaoca se cita iz clanova otvorenog razgovora - MessageDto
    // nosi samo ime, a i da nosi sliku, ona bi zastarela cim je posiljalac
    // promeni (stare poruke se ne osvezavaju).
    const memberAvatars = new Map(
        (chat?.members ?? []).map((m) => [m.userId?.toLowerCase(), m.avatarUrl])
    );

    // Sopstvena slika ide iz profila: on se azurira odmah po izmeni, dok
    // "chat.members" nosi vrednost od trenutka otvaranja razgovora.
    if (profile && user?.userId) {
        memberAvatars.set(user.userId.toLowerCase(), profile.avatarUrl ?? null);
    }

    const peer = chat?.members?.find((m) => m.userId !== user?.userId);
    const onlineUser = otherOnlineUsers.find((u) => u.userId === peer?.userId);

    const handleCreateChat = async (userId) => {
        if (!userId) return;

        const targetId = userId.toLowerCase();

        // Trazimo POSTOJECI 1-na-1 razgovor bas sa tim covekom:
        //   - nije grupa
        //   - ima tacno dva clana
        //   - jedan od njih je onaj na koga si kliknuo
        //
        // Ranije je uslov bio samo "sadrzi tog korisnika", pa je klik na Marka
        // otvarao prvu GRUPU u kojoj se Marko nalazi. Ako ste u zajednickoj
        // grupi, privatni razgovor nisi mogao ni da zapocnes.
        const existingChat = chats.find(
            (c) =>
                !c.isGroup &&
                c.members?.length === 2 &&
                c.members.some((m) => m.userId?.toLowerCase() === targetId)
        );

        if (existingChat) {
            setActiveChatId(existingChat.conversationId);
            setSidebarView("chats");
            return;
        }

        try {
            const newChat = await createChat({
                // Za 1-na-1 razgovor "Name" ostaje null. Backend ga ionako
                // ignorise (DisplayNameFor vraca ime sagovornika, razlicito za
                // svakog ucesnika), pa bi upisivanje jednog imena u bazu bilo
                // tacno samo za jednu stranu.
                name: null,
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
        <div className="flex h-dvh w-full overflow-hidden bg-slate-100 text-slate-900">
            {/* Na uskim ekranima sidebar i razgovor se smenjuju, ne dele prostor. */}
            <aside
                className={
                    "w-full shrink-0 flex-col border-r border-slate-200 bg-white md:flex md:w-72 " +
                    (chat ? "hidden md:flex" : "flex")
                }
            >
                <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4">
                    <Avatar initials={initials} size="sm" avatarUrl={profile?.avatarUrl} />
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-900">
                            {user?.username}
                        </p>
                        <p className="flex items-center gap-1.5 text-xs text-slate-500">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Online
                        </p>
                    </div>
                    <button
                        onClick={() => setShowCreateGroupModal(true)}
                        aria-label="Kreiraj grupu"
                        title="Kreiraj grupu"
                        className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-500 motion-reduce:transition-none"
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
                            users={users}
                            onlineIds={onlineIds}
                            onCreateChat={handleCreateChat}
                        />
                    )}
                    {sidebarView === "profile" && (
                        <ProfilePanel
                            initials={initials}
                            avatarUrl={profile?.avatarUrl}
                            onAvatarChange={handleAvatarChange}
                            onLogout={handleLogout}
                        />
                    )}
                </div>

                <div className="flex flex-col gap-0.5 border-t border-slate-200 px-3 py-3">
                    <button
                        onClick={() =>
                            setSidebarView(sidebarView === "profile" ? "chats" : "profile")
                        }
                        aria-current={sidebarView === "profile" ? "page" : undefined}
                        className={
                            "flex items-center gap-3 rounded-[10px] px-3 py-2 text-sm transition focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-500 motion-reduce:transition-none " +
                            (sidebarView === "profile"
                                ? "bg-blue-50 font-medium text-blue-700"
                                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900")
                        }
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <circle cx="12" cy="8" r="4" />
                            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                        </svg>
                        Moj profil
                    </button>
                    <button className="flex items-center gap-3 rounded-[10px] px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-500 motion-reduce:transition-none">
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
                <main className="flex flex-1 flex-col bg-slate-50">
                    {/* Nazad na listu - vidljivo samo dok je sidebar sakriven */}
                    <button
                        onClick={() => {
                            setActiveChatId(null);
                            setChat(null);
                            setMessages([]);
                        }}
                        className="flex items-center gap-2 border-b border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-600 transition hover:text-slate-900 md:hidden"
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
                    <MessagesList
                        messages={messages}
                        memberAvatars={memberAvatars}
                        onEditMessage={handleEditMessage}
                        onDeleteMessage={handleDeleteMessage}
                    />
                    <TypingIndicator
                        names={
                            typing.chatId === activeChatId
                                ? Array.from(typing.users.values())
                                : []
                        }
                    />
                    <MessageInput
                        value={messageTxt}
                        onChange={setMessageTxt}
                        onSend={handleSendMessage}
                        onAttach={() => setShowAttachModal(true)}
                        onTyping={notifyTyping}
                        onStopTyping={stopTyping}
                    />
                </main>
            )}

            {showAttachModal && (
                <AttachImageModal
                    onClose={() => setShowAttachModal(false)}
                    onSend={handleSendImage}
                />
            )}

            {showCreateGroupModal && (
                <CreateGroupModal
                    users={users}
                    onlineIds={onlineIds}
                    onClose={() => setShowCreateGroupModal(false)}
                    onCreate={handleCreateGroup}
                />
            )}
        </div>
    );
}