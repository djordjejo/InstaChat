export default function Avatar({ initials, size = "md" }) {
    const sizes = {
        sm: "h-8 w-8 text-xs",
        md: "h-10 w-10 text-sm",
        lg: "h-16 w-16 text-xl",
    };
    return (
        <div className={`${sizes[size]} rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center font-semibold text-blue-700 shrink-0`}>
            {initials}
        </div>
    );
}
