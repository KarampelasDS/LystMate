import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LystMate",
    short_name: "LystMate",
    description: "Create, share and manage lists with friends and family.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#f5ede3",
    theme_color: "#D7A679",
    orientation: "portrait",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
    ],
  };
}
