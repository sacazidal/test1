"use client";

import CreateChannel from "@/components/CreateChannel";
import DeleteChannel from "@/components/DeleteChannel";
import Chat from "@/components/Chat";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ChannelAvatar from "@/components/ChannelAvatar";

export default function Home() {
  const supabase = createClient();
  const [channels, setChannels] = useState([]);
  const [selectedChannelId, setSelectedChannelId] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };

    fetchUser();
  }, [supabase]);

  useEffect(() => {
    const fetchChannels = async () => {
      const { data, error } = await supabase.from("channels").select("*");
      if (error) {
        console.error(error);
      } else {
        setChannels(data);
      }
    };

    fetchChannels();

    const subscription = supabase
      .channel("custom-all-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "channels" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setChannels((prev) => [...prev, payload.new]);
          } else if (payload.eventType === "DELETE") {
            setChannels((prev) =>
              prev.filter((channel) => channel.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <div className="container mx-auto flex gap-x-5 h-screen max-h-[calc(100vh-80px)] xs:max-h-[calc(100vh-80px)]">
      <div className="flex flex-col w-full max-w-md justify-start px-4 lg:px-0">
        <h1 className="text-2xl font-bold mb-4">Каналы</h1>
        <CreateChannel />
        <div className={`${selectedChannelId ? "hidden md:block" : "block"}`}>
          <ul className="space-y-2 mb-4">
            {channels.map((channel) => (
              <li
                key={channel.id}
                className="p-4 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-x-3">
                    <ChannelAvatar
                      imageUrl={channel.image_url}
                      name={channel.name}
                    />
                    <h3 className="text-lg font-medium text-white">
                      {channel.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-x-2">
                    <button
                      onClick={() => setSelectedChannelId(channel.id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Открыть
                    </button>
                    <DeleteChannel
                      channelId={channel.id}
                      imageUrl={channel.image_url}
                      user_id={channel.user_id}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <AnimatePresence>
        {selectedChannelId && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-neutral-900 z-50 md:static md:bg-transparent"
          >
            <Chat
              channelId={selectedChannelId}
              onClose={() => setSelectedChannelId(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
