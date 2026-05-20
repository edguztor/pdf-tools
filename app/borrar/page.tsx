import type { Metadata } from "next";
import BorrarTool from "@/components/BorrarTool";
import AdBanner from "@/components/AdBanner";

export const metadata: Metadata = {
  title: "Borrar Páginas de PDF Gratis — Eliminar Páginas PDF Online",
  description: "Elimina y borra páginas específicas de tu PDF gratis online. Selecciona las páginas a eliminar y descarga el resultado al instante. Sin registro, 100% privado.",
  keywords: ["borrar paginas pdf", "eliminar paginas pdf gratis", "quitar paginas pdf online", "delete pdf pages", "borrar pdf gratis"],
  alternates: { canonical: "https://pdf-tools-xi-brown.vercel.app/borrar" },
  openGraph: { title: "Borrar Páginas de PDF Gratis Online", description: "Elimina páginas de tu PDF al instante. Gratis y sin registro.", type: "website" },
};

export default function BorrarPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-orange-100 text-3xl mb-4">🗑️</div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Borrar Páginas de PDF</h1>
        <p className="text-gray-500">Selecciona las páginas que quieres eliminar. El resto se conserva intacto.</p>
      </div>
      <BorrarTool />
      <div className="mt-8"><AdBanner format="horizontal" /></div>
      <div className="mt-10 text-sm text-gray-500 space-y-2">
        <h2 className="font-bold text-gray-700">¿Cómo borrar páginas de un PDF gratis?</h2>
        <p>Sube tu PDF, haz clic en las páginas que quieres eliminar y descarga el resultado. Tus archivos nunca se suben a ningún servidor.</p>
      </div>
    </div>
  );
}
