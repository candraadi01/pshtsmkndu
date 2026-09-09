import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PSHT SMKN Darul Ulum Muncar",
    short_name: "PSHT SMKNDU",
    description:
      "Portal resmi Persaudaraan Setia Hati Terate (PSHT) Rayon SMKN Darul Ulum Muncar, Banyuwangi.",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    orientation: "portrait",
    categories: ["sports", "education", "lifestyle"],
    lang: "id",
    icons: [
      {
        src: "/favicon-16x16.png?v=laravel-transparent-1",
        sizes: "16x16",
        type: "image/png",
      },
      {
        src: "/favicon-32x32.png?v=laravel-transparent-1",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/apple-touch-icon.png?v=laravel-transparent-1",
        sizes: "180x180",
        type: "image/png",
      },
      {
        src: "/android-chrome-192x192.png?v=laravel-transparent-1",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/android-chrome-512x512.png?v=laravel-transparent-1",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
