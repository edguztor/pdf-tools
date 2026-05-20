import type { Metadata } from "next";
import FirmarTool from "@/components/FirmarTool";
import AdBanner from "@/components/AdBanner";

export const metadata: Metadata = {
  title: "Firmar PDF Gratis Online — Firma Digital Sin Registro",
  description: "Firma documentos PDF gratis online. Dibuja tu firma con el mouse o el dedo y colócala donde quieras. Firma digital sin registro, sin instalar nada, 100% privado.",
  keywords: ["firmar pdf gratis", "firma digital pdf online", "firma electronica pdf", "sign pdf gratis", "firmar documento pdf"],
  alternates: { canonical: "https://pdf-tools-xi-brown.vercel.app/firmar" },
  openGraph: { title: "Firmar PDF Gratis Online", description: "Dibuja tu firma y colócala en tu PDF al instante. Gratis y sin registro.", type: "website" },
};

export default function FirmarPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-100 text-3xl mb-4">✍️</div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Firmar PDF</h1>
        <p className="text-gray-500">Dibuja tu firma con el mouse o el dedo y colócala en tu documento PDF.</p>
      </div>
      <FirmarTool />
      <div className="mt-8"><AdBanner format="horizontal" /></div>
      <div className="mt-10 text-sm text-gray-500 space-y-2">
        <h2 className="font-bold text-gray-700">¿Cómo firmar un PDF gratis?</h2>
        <p>Sube tu PDF, dibuja tu firma en el lienzo, elige la página y posición, y descarga el PDF firmado. Todo ocurre en tu navegador sin subir nada a ningún servidor.</p>
      </div>
    </div>
  );
}
