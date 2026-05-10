import {useAuth} from "../../context/AuthContext";

export default function WelcomeScreen({  }) {
    const { user } = useAuth();
    return (
        <main className="flex flex-1 flex-col items-center justify-center gap-4 bg-[#f0f7ff]">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-200 bg-blue-100">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
            </div>
            <div className="text-center">
                <p className="text-base font-semibold text-[#1e293b]">Dobrodošao, {user?.username}</p>
                <p className="mt-1 text-sm text-[#64748b]">Izaberi razgovor ili pokreni novi</p>
            </div>
        </main>
    );
}
