"use client";

import { createClient } from "@/utils/supabase/client";
import Image from "next/image";
import { useEffect, useState } from "react";

const Chat = ({ channelId, onClose }) => {
  const supabase = createClient();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("channel_id", channelId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error(error);
      } else {
        setMessages(data);
      }
    };

    fetchMessages();

    const subsciption = supabase
      .channel("custom-all-channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `channel_id=eq.${channelId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      subsciption.unsubscribe();
    };
  }, [channelId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error("Пользователь не авторизован");
      return;
    }

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("username")
      .eq("id", user.id)
      .single();

    if (userError) {
      console.error("Ошибка получения username:", userError);
      return;
    }

    const username = userData.username;

    const { error } = await supabase.from("messages").insert([
      {
        channel_id: channelId,
        message: newMessage,
        user_id: user.id,
        m_username: username,
      },
    ]);

    if (error) {
      console.error(error);
    } else {
      setNewMessage("");
    }
  };
  return (
    <div className="flex flex-col h-screen bg-neutral-800 rounded-lg p-4 w-full relative">
      <button
        className="absolute top-2 right-4 hover:bg-neutral-700 rounded-full transition-color"
        onClick={onClose}
      >
        <Image
          src={"/CloseOutlined.svg"}
          alt="close"
          width={25}
          height={25}
          style={{ width: "25px", height: "25px" }}
        />
      </button>
      <div className="flex-1 overflow-y-auto mt-6">
        {messages.map((message) => (
          <div key={message.id} className="mb-2 p-2 bg-neutral-700 rounded-lg">
            <p className="text-white">
              <strong>{message.m_username}:</strong> {message.message}
            </p>
            <span className="text-xs text-gray-400">
              {new Date(message.created_at).toLocaleTimeString()}
            </span>
          </div>
        ))}
      </div>
      <div className="flex gap-x-2 z-50">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Введите сообщение"
          className="flex-1 p-2 bg-neutral-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
        <button
          onClick={handleSendMessage}
          className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Отправить
        </button>
      </div>
    </div>
  );
};
export default Chat;
