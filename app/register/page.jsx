"use client";

import { createClient } from "@/utils/supabase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignUp() {
  const supabase = createClient();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Проверка заполнения полей
    if (!email || !username || !password) {
      setError("Заполните все поля");
      return;
    }

    // Регистрация через Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      return;
    }

    // Добавляем пользователя в таблицу `users`
    const { error: insertError } = await supabase.from("users").insert([
      {
        id: authData.user.id,
        email,
        username,
      },
    ]);

    if (insertError) {
      setError("Ошибка при создании пользователя");
      return;
    }

    // Перенаправляем на главную страницу
    router.push("/login");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col h-screen max-h-[calc(100vh-80px)] items-center justify-center"
    >
      <div className="space-y-4 border-2 border-zinc-800 rounded-xl px-5 md:px-8 lg:px-10 py-7 max-w-lg w-full flex flex-col items-center justify-center">
        <h2 className="text-2xl font-semibold ">Регистрация</h2>
        <div className="flex flex-col gap-y-4 w-full">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
          />
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
          />
        </div>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <button
          type="submit"
          className="border-2 rounded-lg py-2 px-6 sm:px-8 md:px-10 lg:px-14 bg-zinc-100 text-zinc-950 font-medium transition-colors duration-300"
        >
          Зарегистрироваться
        </button>
      </div>
    </form>
  );
}
