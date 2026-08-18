import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { getErrorMessage } from "../utility/getErrorMessage";
import signInBg from "../assets/SignIn-bg.jpg";

export default function Register() {
    const navigate = useNavigate();

    const [user, setUser] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Ziva provera, ne samo na submit - korisnik vidi neslaganje dok kuca,
    // a ne tek posle klika. Prazan confirm se ne racuna kao greska.
    const mismatch =
        user.confirmPassword.length > 0 && user.password !== user.confirmPassword;

    const handleChange = (e) => {
        setUser((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        if (error) setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (user.password !== user.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);
        try {
            await axiosInstance.post("/auth/register", {
                username: user.username,
                email: user.email,
                password: user.password,
            });

            // Backend na /auth/register NE vraca token - RegisterResult ima samo
            // UserId, Username i Email. Auto-login zato nije moguc; saljemo
            // korisnika na prijavu. replace:true da Back ne vrati na formu.
            navigate("/login", { replace: true });
        } catch (err) {
            // response.data moze biti string, objekat sa .message, ili ProblemDetails
            // (koji koristi .detail). Bez ovog svodjenja React baca
            // "Objects are not valid as a React child".
setError(getErrorMessage(err, "Registracija nije uspela. Pokušaj ponovo."));
        } finally {
            setLoading(false);
        }
    };

    // Zajednicke klase za sva cetiri inputa - da se autofill override i focus stanja
    // ne kopiraju cetiri puta.
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

    const iconClass = "pointer-events-none absolute left-[13px] text-white/55";

    return (
        // min-h-svh, ne min-h-screen: 100vh na iOS Safariju racuna sakrivenu adresnu traku.
        <div className="relative isolate flex min-h-svh w-full items-center justify-center overflow-hidden px-4 py-8 text-left">
            {/* Dekorativna pozadina - alt="" jer slika ne nosi informaciju, citac ekrana je preskace.
                fetchPriority="high" jer je ovo LCP element cele strane. */}
            <img
                src={signInBg}
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
                    Create an account
                </h1>
                <p className="mb-[26px] text-[13px] leading-relaxed text-white/70">
                    Join NexusChat and start connecting
                </p>

                <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
                    <div className="flex flex-col gap-[7px]">
                        <label htmlFor="username" className="text-xs font-medium text-white/85">
                            Username
                        </label>
                        <div className="relative flex items-center">
                            <svg className={iconClass} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                autoComplete="username"
                                required
                                value={user.username}
                                onChange={handleChange}
                                placeholder="johndoe"
                                className={inputClass}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-[7px]">
                        <label htmlFor="email" className="text-xs font-medium text-white/85">
                            Email
                        </label>
                        <div className="relative flex items-center">
                            <svg className={iconClass} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
                                className={inputClass}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-[7px]">
                        <label htmlFor="password" className="text-xs font-medium text-white/85">
                            Password
                        </label>
                        <div className="relative flex items-center">
                            <svg className={iconClass} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <rect x="3" y="11" width="18" height="11" rx="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                autoComplete="new-password"
                                required
                                minLength={8}
                                value={user.password}
                                onChange={handleChange}
                                placeholder="At least 8 characters"
                                aria-describedby="password-hint"
                                className={inputClass + " pr-[42px]"}
                            />
                            {/* Jedan toggle za oba polja - dva bi bila suvisna, korisnik ionako
                                hoce da vidi obe lozinke istovremeno kad proverava neslaganje. */}
                            <button
                                type="button"
                                onClick={() => setShowPassword((v) => !v)}
                                aria-label={showPassword ? "Hide passwords" : "Show passwords"}
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
                        <p id="password-hint" className="text-[11px] leading-snug text-white/55">
                            Use 8 or more characters
                        </p>
                    </div>

                    <div className="flex flex-col gap-[7px]">
                        <label htmlFor="confirmPassword" className="text-xs font-medium text-white/85">
                            Confirm password
                        </label>
                        <div className="relative flex items-center">
                            <svg className={iconClass} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <rect x="3" y="11" width="18" height="11" rx="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type={showPassword ? "text" : "password"}
                                autoComplete="new-password"
                                required
                                value={user.confirmPassword}
                                onChange={handleChange}
                                placeholder="Repeat your password"
                                aria-invalid={mismatch ? "true" : undefined}
                                aria-describedby={mismatch ? "confirm-error" : undefined}
                                className={inputClass}
                            />
                        </div>
                        {mismatch && (
                            <p id="confirm-error" className="text-[11px] leading-snug text-[#ffc4c4]">
                                Passwords don't match
                            </p>
                        )}
                    </div>

                    {/* role="alert": citac ekrana saznaje da je registracija pala bez pomeranja fokusa */}
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
                        {loading ? "Creating account…" : "Create account"}
                    </button>
                </form>

                <p className="mt-[22px] text-center text-[13px] text-white/70">
                    Already have an account?{" "}
                    <Link to="/login" className="font-medium text-white hover:underline">
                        Sign in
                    </Link>
                </p>
            </main>
        </div>
    );
}