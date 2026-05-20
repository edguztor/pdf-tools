import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://pdf-tools-xi-brown.vercel.app";
  const lastModified = new Date();

  return [
    { url: base, lastModified, changeFrequency: "weekly", priority: 1.0 },
    { url: `${base}/comprimir`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/fusionar`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/dividir`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/borrar`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/rotar`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/marca-agua`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/pdf-a-imagen`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/firmar`, lastModified, changeFrequency: "monthly", priority: 0.8 },
  ];
}
