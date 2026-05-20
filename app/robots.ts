import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = "https://pdf-tools-xi-brown.vercel.app";
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${base}/sitemap.xml`,
  };
}
