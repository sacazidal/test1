"use client";

import { createClient } from "@/utils/supabase/client";
import Image from "next/image";
import { useEffect, useState } from "react";

const Chat = ({ channelId, onClose }) => {
  const supabase = createClient();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUser(user);
    };

    fetchUser();
  }, []);

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
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          setMessages((prev) =>
            prev.filter((msg) => msg.id !== payload.old.id)
          );
        }
      )
      .subscribe();

    return () => {
      subsciption.unsubscribe();
    };
  }, [channelId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error("Пользователь не авторизован");
      setLoading(false);
      return;
    }

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("username")
      .eq("id", user.id)
      .single();

    if (userError) {
      console.error("Ошибка получения username:", userError);
      setLoading(false);
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
      setLoading(false);
    } else {
      setNewMessage("");
    }
    setLoading(false);
  };

  const handleDeleteChannel = async (messageId, messageUserId) => {
    setLoading(true);
    if (!currentUser || messageUserId !== currentUser.id) {
      console.error("У вас нет прав на удаление сообщения");
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from("messages")
      .delete()
      .eq("id", messageId);

    if (error) {
      console.error("Ошибка при удалении сообщения:", error);
      setLoading(false);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-20px)] xs:max-h-[calc(100vh-20)] bg-neutral-800 rounded-lg p-4 w-full md:max-w-[360px] relative">
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
          <div
            key={message.id}
            className="mb-2 p-2 bg-neutral-700 rounded-lg flex flex-col max-w-sm"
          >
            <div className="mb-0 flex items-center gap-x-3">
              <div className="flex flex-col min-w-10">
                <p className="text-white mb-1 break-words whitespace-normal flex flex-col max-w-[300px]">
                  <strong>{message.m_username}:</strong> {message.message}
                </p>
                <span className="text-xs text-gray-400">
                  {new Date(message.created_at).toLocaleTimeString()}
                </span>
              </div>

              {currentUser &&
                message.user_id === currentUser.id &&
                (loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-2 border-t-blue-500 rounded-full animate-spin"></div>
                ) : (
                  <button
                    onClick={() =>
                      handleDeleteChannel(message.id, message.user_id)
                    }
                  >
                    <Image
                      src={"/TrashCan.svg"}
                      alt="delete"
                      width={20}
                      height={20}
                      className=""
                    />
                  </button>
                ))}
            </div>
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
          className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
        >
          {loading ? (
            <div className="w-[21px] h-5 border-2 border-white border-t-2 border-t-blue-500 rounded-full animate-spin mx-[34px]"></div>
          ) : (
            "Отправить"
          )}
        </button>
      </div>
    </div>
  );
};
export default Chat;
