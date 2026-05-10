import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../api/axiosInstance";

export default function LogIn() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [user, setUser] = useState({
        "email": "",
        "password": "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setUser((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await axiosInstance.post("/auth/login", {
                email: user.email,
                password: user.password,
            });
            login(response.data.token);
            navigate("/");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.response?.data ||
                "Login failed. Please check your credentials."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-1 items-center justify-center px-4">
            <div className="w-full max-w-md rounded-2xl border border-(--border) bg-(--bg) p-8 shadow-(--shadow)">
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-(--accent-bg)">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-semibold tracking-tight text-(--text-h)">
                        Welcome back
                    </h1>
                    <p className="mt-2 text-sm text-(--text)">
                        Sign in to your NexusChat account
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <label htmlFor="email" className="text-sm font-medium text-(--text-h)">
                            Email
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={user.email}
                            onChange={handleChange}
                            placeholder="john@example.com"
                            className="rounded-lg border border-(--border) bg-(--code-bg) px-4 py-2.5 text-sm text-(--text-h) outline-none transition focus:border-(--accent) focus:ring-2 focus:ring-(--accent-border)"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label htmlFor="password" className="text-sm font-medium text-(--text-h)">
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={user.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            className="rounded-lg border border-(--border) bg-(--code-bg) px-4 py-2.5 text-sm text-(--text-h) outline-none transition focus:border-(--accent) focus:ring-2 focus:ring-(--accent-border)"
                        />
                    </div>

                    {error && (
                        <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-2 rounded-lg bg-(--accent) px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? "Signing in..." : "Sign in"}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-(--text)">
                    Don't have an account?{" "}
                    <Link
                        to="/register"
                        className="font-medium text-(--accent) hover:underline"
                    >
                        Create one
                    </Link>
                </p>
            </div>
        </div>
    );
}