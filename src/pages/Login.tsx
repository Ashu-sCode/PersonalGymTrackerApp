import { useState } from "react";
import type React from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import type { UserProfile } from "../types";

export function Login({ user }: { user: UserProfile | null }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("Local mode is available immediately.");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!supabase) {
      setMessage("Supabase is not configured. Continuing with offline local profile.");
      navigate("/dashboard");
      return;
    }

    const result =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password, options: { data: { name } } });

    if (result.error) setMessage(result.error.message);
    else navigate("/dashboard");
  }

  return (
    <div className="grid min-h-screen place-items-center bg-iron-950 px-4 text-zinc-100">
      <form onSubmit={submit} className="w-full max-w-md rounded-lg border border-white/10 bg-white/[0.035] p-6">
        <Link to="/" className="text-sm text-volt-500">PGT</Link>
        <h1 className="mt-3 text-3xl font-black">{mode === "login" ? "Welcome back" : "Create account"}</h1>
        <p className="mt-2 text-sm text-zinc-400">Signed in locally as {user?.name ?? "Local Athlete"}.</p>
        <div className="mt-6 grid grid-cols-2 rounded-lg bg-white/8 p-1">
          <button type="button" onClick={() => setMode("login")} className={`rounded-md py-2 text-sm ${mode === "login" ? "bg-volt-500 text-iron-950" : "text-zinc-300"}`}>Login</button>
          <button type="button" onClick={() => setMode("register")} className={`rounded-md py-2 text-sm ${mode === "register" ? "bg-volt-500 text-iron-950" : "text-zinc-300"}`}>Register</button>
        </div>
        <div className="mt-5 space-y-3">
          {mode === "register" && <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />}
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
        </div>
        <button className="btn-primary mt-5 w-full">{mode === "login" ? "Login" : "Register"}</button>
        <button type="button" onClick={() => navigate("/dashboard")} className="btn-secondary mt-3 w-full">Continue offline</button>
        <p className="mt-4 text-sm text-zinc-400">{message}</p>
      </form>
    </div>
  );
}
