"use client";

import { createClient } from "@/utils/supabase/client";
import Image from "next/image";

const DeleteChannel = ({ channelId, imageUrl }) => {
  const supabase = createClient();

  const handleDeleteChannel = async () => {
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

  return (
    <button onClick={handleDeleteChannel}>
      <Image src={"/TrashCan.svg"} alt="Trash" width={20} height={20} />
    </button>
  );
};
export default DeleteChannel;
