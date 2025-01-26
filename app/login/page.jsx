"use client";

import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

const page = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const supabase = createClient();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Введите email");
      return;
    } else if (!password) {
      setError("Введите пароль");
      return;
    }

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (authError) {
      setError(authError.message);
      return;
    }

    setError("");
    router.push("/");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col h-screen items-center justify-center"
    >
      <div className="space-y-4 border-2 border-zinc-800 rounded-xl px-5 md:px-8 lg:px-10 py-7 max-w-lg w-full flex flex-col items-center justify-center">
        <h2 className="text-2xl font-semibold ">Вход</h2>
        <div className="flex flex-col gap-y-4 w-full">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
          />
        </div>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <button
          type="submit"
          className="border-2 rounded-lg py-2 px-6 sm:px-8 md:px-10 lg:px-14 bg-zinc-100 text-zinc-950 font-medium transition-colors duration-300"
        >
          Войти
        </button>
      </div>
    </form>
  );
};
export default page;
