import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../api/axiosInstance";
import loginBg from "../assets/Login-bg.jpg";

export default function LogIn() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [user, setUser] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        setUser((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        if (error) setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const { data } = await axiosInstance.post("/auth/login", {
                email: user.email,
                password: user.password,
            });
            login(data.token);
            navigate("/", { replace: true });
        } catch (err) {
            // response.data moze biti string, objekat sa .message, ili ProblemDetails.
            // Bez ovog svodjenja React baca "Objects are not valid as a React child".
            const payload = err.response?.data;
            const message =
                typeof payload === "string"
                    ? payload
                    : payload?.message ?? payload?.title ?? null;

            setError(message || "Login failed. Please check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    // Zajednicke klase za oba inputa - jedina "varijabla", da se 15 klasa ne kopira dvaput.
    const inputClass =
        "h-11 w-full rounded-[10px] border border-white/25 bg-white/15 pl-[38px] pr-3 text-sm text-white outline-none " +
        "transition-[background-color,border-color,box-shadow] duration-200 " +
        "placeholder:text-white/50 hover:bg-white/20 " +
        "focus-visible:border-white/55 focus-visible:shadow-[0_0_0_3px_rgb(255_255_255/0.18)] " +
        "aria-invalid:border-[rgb(255_138_138/0.75)] " +
        // Chrome autofill inace naslika punu belu pozadinu i ubije staklo.
        "[&:-webkit-autofill]:[-webkit-text-fill-color:#fff] [&:-webkit-autofill]:caret-white " +
        "[&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_rgb(255_255_255/0.15)] " +
        "[&:-webkit-autofill]:[transition:background-color_9999s_ease-out] " +
        "motion-reduce:transition-none";

    return (
        // min-h-svh, ne min-h-screen: 100vh na iOS Safariju racuna sakrivenu adresnu traku.
        <div className="relative isolate flex min-h-svh w-full items-center justify-center overflow-hidden px-4 py-6 text-left">
            {/* Dekorativna pozadina - alt="" jer slika ne nosi informaciju, citac ekrana je preskace.
                fetchPriority="high" jer je ovo LCP element cele strane. */}
            <img
                src={loginBg}
                alt=""
                aria-hidden="true"
                fetchPriority="high"
                decoding="async"
                className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
            />
            {/* Scrim drzi beli tekst iznad 4.5:1 bez obzira koji deo fotke je ispod. */}
            <div
                aria-hidden="true"
                className="absolute inset-0 -z-10 bg-[rgb(44_34_22/0.34)]"
            />

            <main
                className={
                    "w-full max-w-[380px] rounded-[20px] border border-white/30 bg-white/15 p-[30px_26px] " +
                    // inset rim light = ivica stakla koja hvata svetlo
                    "shadow-[inset_0_1px_0_rgb(255_255_255/0.35),0_18px_44px_rgb(0_0_0/0.30)] " +
                    "backdrop-blur-[26px] backdrop-saturate-[1.8] " +
                    // Firefox sa iskljucenim flagom i Safari < 18 nemaju blur -> solidan fallback
                    "not-supports-[backdrop-filter:blur(1px)]:bg-[rgb(28_22_16/0.80)] " +
                    "[@media(prefers-reduced-transparency:reduce)]:bg-[rgb(28_22_16/0.90)] " +
                    "[@media(prefers-reduced-transparency:reduce)]:backdrop-blur-none"
                }
            >
                <div className="mb-[22px] flex items-center gap-2.5 text-sm font-medium text-white/90">
                    <span className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] border border-white/30 bg-white/20 text-white">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                    </span>
                    NexusChat
                </div>

                <h1 className="mb-[5px] text-[26px] font-medium leading-tight tracking-tight text-white">
                    Welcome back
                </h1>
                <p className="mb-[26px] text-[13px] leading-relaxed text-white/70">
                    Sign in to your account to continue
                </p>

                <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
                    <div className="flex flex-col gap-[7px]">
                        <label htmlFor="email" className="text-xs font-medium text-white/85">
                            Email
                        </label>
                        <div className="relative flex items-center">
                            <svg className="pointer-events-none absolute left-[13px] text-white/55" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <rect x="2" y="4" width="20" height="16" rx="2" />
                                <path d="m22 7-10 6L2 7" />
                            </svg>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={user.email}
                                onChange={handleChange}
                                placeholder="name@company.com"
                                aria-invalid={error ? "true" : undefined}
                                className={inputClass}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-[7px]">
                        <div className="flex items-baseline justify-between gap-3">
                            <label htmlFor="password" className="text-xs font-medium text-white/85">
                                Password
                            </label>
                            <Link to="/forgot-password" className="text-xs text-white/70 hover:text-white hover:underline">
                                Forgot password?
                            </Link>
                        </div>
                        <div className="relative flex items-center">
                            <svg className="pointer-events-none absolute left-[13px] text-white/55" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <rect x="3" y="11" width="18" height="11" rx="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                autoComplete="current-password"
                                required
                                value={user.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                aria-invalid={error ? "true" : undefined}
                                className={inputClass + " pr-[42px]"}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((v) => !v)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                                aria-pressed={showPassword}
                                className="absolute right-1.5 flex h-8 w-8 items-center justify-center rounded-lg text-white/65 hover:bg-white/12 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-white/70"
                            >
                                {showPassword ? (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <path d="M9.9 4.24A9.1 9.1 0 0 1 12 4c7 0 10 8 10 8a18.5 18.5 0 0 1-2.16 3.19M6.61 6.61A18.6 18.6 0 0 0 2 12s3 8 10 8a9.1 9.1 0 0 0 5.39-1.61" />
                                        <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24M2 2l20 20" />
                                    </svg>
                                ) : (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <path d="M2 12s3-8 10-8 10 8 10 8-3 8-10 8-10-8-10-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* role="alert": citac ekrana saznaje da je login pao bez pomeranja fokusa */}
                    <p
                        role="alert"
                        aria-live="assertive"
                        hidden={!error}
                        className="m-0 rounded-[10px] border border-[rgb(255_138_138/0.40)] bg-[rgb(120_20_20/0.45)] px-3 py-2.5 text-[13px] leading-snug text-[#ffdcdc]"
                    >
                        {error}
                    </p>

                    {/* Jedina neprovidna povrsina na kartici - zato oko ide pravo na nju. */}
                    <button
                        type="submit"
                        disabled={loading}
                        aria-busy={loading}
                        className="mt-1 h-11 rounded-[10px] bg-white/95 text-sm font-medium text-[#1a1a18] transition hover:bg-white active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-65 motion-reduce:transition-none motion-reduce:active:scale-100"
                    >
                        {loading ? "Signing in…" : "Sign in"}
                    </button>
                </form>

                <p className="mt-[22px] text-center text-[13px] text-white/70">
                    Don't have an account?{" "}
                    <Link to="/register" className="font-medium text-white hover:underline">
                        Create one
                    </Link>
                </p>
            </main>
        </div>
    );
}