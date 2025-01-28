"use client";

import { createClient } from "@/utils/supabase/client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ChannelAvatar from "./ChannelAvatar";

export default function Header() {
  const supabase = createClient();
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = useState(null); // Состояние для хранения аватара пользователя
  const [username, setUserName] = useState(null); //
  const [user, setUser] = useState(null); // Состояние для хранения данных пользователя

  // Проверяем состояние авторизации при загрузке компонента
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (error) {
        console.error("Ошибка при получении аватара:", error);
      } else {
        console.log(data);
        setAvatarUrl(data.avatar_url || null);
        setUserName(data.username || "?");
      }
    };

    fetchUser();

    // Подписываемся на изменения состояния авторизации
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Ошибка при выходе из системы:", error);
    } else {
      router.push("/login"); // Перенаправляем на страницу входа
    }
  };

  return (
    <header className="bg-neutral-800 py-2 flex justify-between items-center">
      <div className="container mx-auto flex items-center justify-between px-4 lg:px-0">
        <div className="flex items-center gap-x-2 md:gap-x-4">
          <Image
            src={"/Protocols.webp"}
            alt="Provider-X"
            width={40}
            height={40}
            className="md:w-10 md:h-10 w-8 h-8"
            style={{
              filter: "brightness(0) invert(1)",
            }}
          />
          <h1 className="text-base md:text-xl font-bold">Provider-X</h1>
        </div>
        <nav>
          {user ? (
            // Если пользователь залогинен, показываем кнопку "Выйти"
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-x-2">
                <ChannelAvatar imageUrl={avatarUrl} name={username} />
                {username && <span className="text-sm">{username}</span>}
              </div>
              <button
                onClick={handleLogout}
                className="px-2 md:px-4 py-1 rounded-lg transition-colors text-black bg-white hover:bg-neutral-200 border-2"
              >
                Выйти
              </button>
            </div>
          ) : (
            // Если пользователь не залогинен, показываем кнопки "Войти" и "Регистрация"
            <div className="flex gap-4">
              <button
                onClick={() => router.push("/login")}
                className="px-4 py-1 rounded-lg transition-colors text-black bg-white hover:bg-neutral-200 border-2"
              >
                Войти
              </button>
              <button
                onClick={() => router.push("/register")}
                className="px-4 py-1 text-white rounded-lg transition-colors border-2 hover:bg-neutral-700"
              >
                Регистрация
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
