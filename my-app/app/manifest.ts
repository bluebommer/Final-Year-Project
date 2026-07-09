import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ReadLite",
    short_name: "ReadLite",
    description: "A high-precision news aggregator tailored to your curiosity.",
    start_url: "/home",
    display: "standalone",
    background_color: "#080d18",
    theme_color: "#080d18",
    icons: [
      { src: "/icons/icon-192.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icons/icon-512.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icons/icon-maskable.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
