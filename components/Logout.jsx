"use client";

import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const supabase = createClient();
  const router = useRouter();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut(); // Выход из системы

    if (error) {
      console.error("Ошибка при выходе из системы:", error);
    } else {
      // Перенаправляем пользователя на страницу входа
      router.push("/login");
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
    >
      Выйти
    </button>
  );
}
