"use client";

import { Facehash } from "facehash";

const AVATAR_COLORS = ["#c4845a", "#9c6548", "#d4a070", "#b87850", "#8a5030"];

interface FaceAvatarProps {
  name: string;
  size?: number;
  interactive?: boolean;
  className?: string;
}

export function FaceAvatar({
  name,
  size = 36,
  interactive = false,
  className,
}: FaceAvatarProps) {
  return (
    <Facehash
      name={name}
      size={size}
      colors={AVATAR_COLORS}
      interactive={interactive}
      showInitial={true}
      style={{ color: "rgba(255,255,255,0.9)", flexShrink: 0 }}
      className={className}
    />
  );
}
