import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { Eye, EyeOff } from "lucide-react";

export default function Auth({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const { error } = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
    } else {
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }
    }
  }

  async function handleResetPassword() {
  if (!email) {
    setError("Enter your email above first, then click reset.");
    return;
  }
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin,
  });
  if (error) setError(error.message);
  else setError("Check your email for a password reset link.");
}

  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 w-full max-w-sm transition-shadow hover:shadow-md"
      >
        <h1 className="text-xl font-semibold text-stone-900 mb-1">
          {isSignUp ? "Create an account" : "To-Do List"}
        </h1>
        <p className="text-sm text-stone-400 mb-5">
          {isSignUp ? "Sign up to start your list" : "Log in to see your tasks"}
        </p>
        <input
            type="email"
            autoComplete="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mb-3 px-3 py-2.5 text-sm bg-stone-50 rounded-lg border border-stone-200 outline-none transition-colors focus:border-stone-400 focus:bg-white hover:border-stone-300"
            required
        />
        
        <div className="relative mb-4">
          <input
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2.5 pr-10 text-sm bg-stone-50 rounded-lg border border-stone-200 outline-none transition-colors focus:border-stone-400 focus:bg-white hover:border-stone-300"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {error && <p className="text-xs text-red-500 mb-3">{error}</p>}
        <label className="flex items-center gap-2 mb-4 text-sm text-stone-600">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded border-stone-300"
          />
          Remember my email
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-stone-900 text-white rounded-lg py-2.5 text-sm mb-3 transition-all hover:bg-stone-700 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Please wait..." : isSignUp ? "Sign up" : "Log in"}
        </button>
        {!isSignUp && (
        <button
            type="button"
            onClick={handleResetPassword}
            className="w-full text-xs text-stone-400 hover:text-stone-700 transition-colors mt-2"
        >
            Forgot password?
        </button>
        )}
        <button
          type="button"
          onClick={() => setIsSignUp(!isSignUp)}
          className="w-full text-xs text-stone-500 py-1 rounded-md transition-colors hover:text-stone-800 hover:bg-stone-50"
        >
          {isSignUp ? "Already have an account? Log in" : "Need an account? Sign up"}
        </button>
      </form>
    </div>
  );
}