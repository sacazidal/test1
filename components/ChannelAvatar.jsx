"use client";

import Image from "next/image";

const ChannelAvatar = ({ imageUrl, name }) => {
  // Если есть изображение, отображаем его
  if (imageUrl) {
    return (
      <Image
        src={imageUrl}
        alt={name}
        width={35}
        height={35}
        style={{ width: "35px", height: "35px" }}
        priority
      />
    );
  }

  // Если изображения нет, отображаем кружок с первыми двумя буквами
  const initials = name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="w-[35px] h-[35px] rounded-full bg-zinc-600 flex items-center justify-center text-white font-medium">
      {initials}
    </div>
  );
};

export default ChannelAvatar;
