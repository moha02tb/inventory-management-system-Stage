import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api/authApi"; // Import the API service function
import { useAuth } from "../hooks/useAuth"; // Import useAuth hook

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(""); // State for displaying login errors
    const navigate = useNavigate();
    const { updateAuth } = useAuth(); // Get the updateAuth function from context

    const handleLogin = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior
        setError(""); // Clear previous errors

        if (!email || !password) {
            setError("Email and password are required.");
            return;
        }

        // 1. Call the API service to log in
        const result = await loginUser(email, password);

        if (result.success) {
            // 2. Update the AuthContext with the new role
            updateAuth(true, result.role, result.name);
            // 3. Navigate on successful login
            navigate("/dashboard");
        } else {
            // 4. Display the error message from the API call
            setError(result.msg || "Login failed. Please check your credentials.");
        }
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
            <div
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(59,130,246,0.15),transparent_40%),radial-gradient(circle_at_80%_20%,rgba(236,72,153,0.12),transparent_35%),radial-gradient(circle_at_40%_80%,rgba(16,185,129,0.12),transparent_38%)]"
                aria-hidden="true"
            />
            <div className="relative grid w-full max-w-5xl grid-cols-1 gap-6 md:grid-cols-5">
                <div className="rounded-2xl border border-white/70 bg-white/90 p-8 shadow-xl shadow-slate-900/10 backdrop-blur md:col-span-3">
                    <div className="mb-6 flex items-center gap-3">
                        <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-500 text-sm font-semibold text-white shadow-lg shadow-blue-500/25">
                            SM
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Welcome back</p>
                            <h1 className="text-3xl font-semibold text-slate-900">Sign in to Stock Manager</h1>
                        </div>
                    </div>

                    {/* Error Message Display */}
                    {error && (
                        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700" htmlFor="email">
                                Email
                            </label>
                            <div className="relative">
                                <input
                                    id="email"
                                    type="email"
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-inner shadow-slate-900/5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    placeholder="you@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700" htmlFor="password">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type="password"
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-inner shadow-slate-900/5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:translate-y-px hover:shadow-xl"
                        >
                            Sign in
                        </button>
                    </form>

                    <p className="mt-6 text-xs text-slate-500">
                        Secure access to manage products, stock movement, sales, and issues in one place.
                    </p>
                </div>

                <div className="flex flex-col justify-between rounded-2xl bg-slate-900 px-6 py-8 text-white shadow-2xl shadow-slate-900/20 md:col-span-2">
                    <div>
                        <p className="text-xs uppercase tracking-[0.25em] text-slate-300">Live snapshot</p>
                        <h2 className="mt-2 text-2xl font-semibold">Stay ahead of inventory</h2>
                        <p className="mt-3 text-sm text-slate-200">
                            Track alerts, sales, and movements the moment you log in. Designed for admins and staff to
                            react quickly.
                        </p>
                    </div>
                    <div className="mt-8 grid grid-cols-2 gap-3 text-sm">
                        <div className="rounded-xl bg-white/5 p-4 backdrop-blur">
                            <p className="text-slate-300">Low stock alerts</p>
                            <p className="text-2xl font-semibold text-white">Real-time</p>
                        </div>
                        <div className="rounded-xl bg-white/5 p-4 backdrop-blur">
                            <p className="text-slate-300">Role based</p>
                            <p className="text-2xl font-semibold text-white">Secure</p>
                        </div>
                        <div className="rounded-xl bg-white/5 p-4 backdrop-blur">
                            <p className="text-slate-300">Sales</p>
                            <p className="text-2xl font-semibold text-white">Instant</p>
                        </div>
                        <div className="rounded-xl bg-white/5 p-4 backdrop-blur">
                            <p className="text-slate-300">Insights</p>
                            <p className="text-2xl font-semibold text-white">Visual</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
