"use client";

import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Header() {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState(null); // Состояние для хранения данных пользователя

  // Проверяем состояние авторизации при загрузке компонента
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
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
      <div className="container mx-auto flex items-center justify-between">
        <h1 className="text-xl font-bold">Povider-X</h1>
        <nav>
          {user ? (
            // Если пользователь залогинен, показываем кнопку "Выйти"
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Выйти
            </button>
          ) : (
            // Если пользователь не залогинен, показываем кнопки "Войти" и "Регистрация"
            <div className="flex gap-4">
              <button
                onClick={() => router.push("/login")}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Войти
              </button>
              <button
                onClick={() => router.push("/register")}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
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
