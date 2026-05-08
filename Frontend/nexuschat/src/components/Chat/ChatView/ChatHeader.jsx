import Avatar from "../../common/Avatar";

export default function ChatHeader({ user }) {
    return (
        <div className="flex items-center gap-3 border-b border-black/[0.06] bg-[#e0effe] px-5 py-3">
            <Avatar initials={user?.initials} size="sm" />
            <div>
                <p className="text-sm font-semibold text-[#1e293b]">{user?.name}</p>
                <p className="text-xs text-green-500">Online</p>
            </div>
        </div>
    );
}
