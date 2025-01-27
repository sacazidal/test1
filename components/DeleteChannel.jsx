"use client";

import { createClient } from "@/utils/supabase/client";
import Image from "next/image";
import { useEffect, useState } from "react";

const DeleteChannel = ({ channelId, imageUrl, user_id }) => {
  const supabase = createClient();
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

  const handleDeleteChannel = async () => {
    if (user?.id !== user_id) {
      console.error("User does not have permission to delete this channel");
      return;
    }

    if (imageUrl) {
      const filePath = imageUrl.split("/").pop();
      const { error: storageError } = await supabase.storage
        .from("channel_images")
        .remove([filePath]);

      if (storageError) {
        console.error("Error deleting from storage:", storageError);
      }
    }

    const { error } = await supabase
      .from("channels")
      .delete()
      .eq("id", channelId);

    if (error) {
      console.error("Error deleting channel:", error);
    } else {
      console.log("Channel is deleted!");
    }
  };

  if (user?.id !== user_id) {
    return <div className="w-5 h-5"></div>;
  }

  return (
    <button onClick={handleDeleteChannel}>
      <Image src={"/TrashCan.svg"} alt="Trash" width={20} height={20} />
    </button>
  );
};
export default DeleteChannel;
