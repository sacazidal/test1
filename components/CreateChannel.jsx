"use client";

import { createClient } from "@/utils/supabase/client";
import { useState } from "react";

export default function CreateChannel() {
  const supabase = createClient();
  const [channelName, setChannelName] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCreateChannel = async () => {
    if (!channelName) return;

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error("Пользователь не авторизован");
      setLoading(false);
      return;
    }

    let imageUrl = null;

    if (imageFile) {
      const filePath = `channel_images/${Date.now()}_${imageFile.name}`;
      const { error } = await supabase.storage
        .from("channel_images")
        .upload(filePath, imageFile);

      if (error) {
        console.error("Error uploading image:", error);
        setLoading(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("channel_images")
        .getPublicUrl(filePath);

      imageUrl = urlData.publicUrl;
    }

    const { data, error } = await supabase
      .from("channels")
      .insert([{ name: channelName, image_url: imageUrl, user_id: user.id }])
      .select();

    if (error) {
      setLoading(false);
      console.error(error);
    } else {
      console.log("Channel created:", data);
      setLoading(false);
      setChannelName("");
      setImageFile(null);
    }
  };

  return (
    <div className="mb-6">
      <input
        type="text"
        value={channelName}
        onChange={(e) => setChannelName(e.target.value)}
        placeholder="Название канала"
        className="w-full p-2 mb-2 bg-neutral-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
      />
      <input
        type="file"
        onChange={(e) => setImageFile(e.target.files[0])}
        accept="image/*"
        className="mb-2"
      />
      <button
        onClick={handleCreateChannel}
        className="w-full p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-2 border-t-blue-500 rounded-full animate-spin"></div>
            <span>Создаем канал...</span>
          </div>
        ) : (
          "Создать канал"
        )}
      </button>
    </div>
  );
}
