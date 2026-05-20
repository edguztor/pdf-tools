import type { Metadata } from "next";
import FusionarTool from "@/components/FusionarTool";
import AdBanner from "@/components/AdBanner";

export const metadata: Metadata = {
  title: "Fusionar PDFs Gratis Online — Unir PDF Sin Registro",
  description: "Une y combina múltiples archivos PDF en uno solo gratis. Sin registro, sin límites. Arrastra para reordenar las páginas. Procesamiento 100% en tu navegador.",
  keywords: ["fusionar pdf", "unir pdf gratis", "combinar pdf online", "juntar pdf", "merge pdf gratis"],
  alternates: { canonical: "https://pdf-tools-xi-brown.vercel.app/fusionar" },
  openGraph: { title: "Fusionar PDFs Gratis Online", description: "Une varios PDFs en uno solo al instante. Gratis y sin registro.", type: "website" },
};

export default function FusionarPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-100 text-3xl mb-4">🔗</div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Fusionar PDFs</h1>
        <p className="text-gray-500">Combina múltiples PDFs en un solo archivo. Arrastra para reordenar.</p>
      </div>
      <FusionarTool />
      <div className="mt-8"><AdBanner format="horizontal" /></div>
      <div className="mt-10 text-sm text-gray-500 space-y-2">
        <h2 className="font-bold text-gray-700">¿Cómo fusionar PDFs gratis?</h2>
        <p>Sube dos o más archivos PDF, ordénalos y haz clic en Fusionar. Todo ocurre en tu navegador sin subir nada a ningún servidor.</p>
      </div>
    </div>
  );
}
