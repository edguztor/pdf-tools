import type { Metadata } from "next";
import RotarTool from "@/components/RotarTool";
import AdBanner from "@/components/AdBanner";

export const metadata: Metadata = {
  title: "Rotar Páginas de PDF Gratis — PDFGratis",
  description: "Rota páginas de tu PDF 90°, 180° o 270° gratis y sin registro. Selecciona páginas individuales o todas a la vez.",
};

export default function RotarPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-100 text-3xl mb-4">🔄</div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Rotar Páginas de PDF</h1>
        <p className="text-gray-500">Gira páginas individuales o todas a la vez. 90°, 180° o 270°.</p>
      </div>
      <RotarTool />
      <div className="mt-8"><AdBanner format="horizontal" /></div>
      <div className="mt-10 text-sm text-gray-500 space-y-2">
        <h2 className="font-bold text-gray-700">¿Cómo rotar páginas de un PDF gratis?</h2>
        <p>Sube tu PDF, usa las flechas ↺ ↻ para rotar cada página y descarga el resultado. Sin servidores, sin registro.</p>
      </div>
    </div>
  );
}
