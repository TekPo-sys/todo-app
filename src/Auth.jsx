import { useState } from "react";
import { supabase } from "./supabaseClient";

export default function Auth({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 w-full max-w-sm transition-shadow hover:shadow-md"
      >
        <h1 className="text-xl font-semibold text-stone-900 mb-1">
          {isSignUp ? "Create an account" : "Welcome back"}
        </h1>
        <p className="text-sm text-stone-400 mb-5">
          {isSignUp ? "Sign up to start your list" : "Log in to see your tasks"}
        </p>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-3 px-3 py-2.5 text-sm bg-stone-50 rounded-lg border border-stone-200 outline-none transition-colors focus:border-stone-400 focus:bg-white hover:border-stone-300"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 px-3 py-2.5 text-sm bg-stone-50 rounded-lg border border-stone-200 outline-none transition-colors focus:border-stone-400 focus:bg-white hover:border-stone-300"
          required
        />

        {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-stone-900 text-white rounded-lg py-2.5 text-sm mb-3 transition-all hover:bg-stone-700 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Please wait..." : isSignUp ? "Sign up" : "Log in"}
        </button>

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