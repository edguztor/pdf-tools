import type { Metadata } from "next";
import PdfImagenTool from "@/components/PdfImagenTool";
import AdBanner from "@/components/AdBanner";

export const metadata: Metadata = {
  title: "Convertir PDF a Imagen PNG JPG Gratis Online",
  description: "Convierte páginas de PDF a imágenes PNG o JPG gratis online. Alta resolución HD. Descarga imágenes individuales o todas en ZIP. Sin registro, sin instalar nada.",
  keywords: ["pdf a imagen gratis", "convertir pdf a png", "pdf a jpg online", "pdf to image", "pasar pdf a imagen gratis"],
  alternates: { canonical: "https://pdf-tools-xi-brown.vercel.app/pdf-a-imagen" },
  openGraph: { title: "Convertir PDF a Imagen Gratis Online", description: "Convierte cada página de tu PDF a PNG o JPG en segundos. Gratis y sin registro.", type: "website" },
};

export default function PdfImagenPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-pink-100 text-3xl mb-4">🖼️</div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">PDF a Imagen</h1>
        <p className="text-gray-500">Convierte cada página de tu PDF en una imagen PNG o JPG de alta calidad.</p>
      </div>
      <PdfImagenTool />
      <div className="mt-8"><AdBanner format="horizontal" /></div>
      <div className="mt-10 text-sm text-gray-500 space-y-2">
        <h2 className="font-bold text-gray-700">¿Cómo convertir PDF a imagen gratis?</h2>
        <p>Sube tu PDF, elige el formato (PNG o JPG) y descarga las imágenes individualmente o todas en un ZIP. Sin registro, sin servidores.</p>
      </div>
    </div>
  );
}
