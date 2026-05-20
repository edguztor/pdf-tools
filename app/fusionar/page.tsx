import type { Metadata } from "next";
import FusionarTool from "@/components/FusionarTool";
import AdBanner from "@/components/AdBanner";

export const metadata: Metadata = {
  title: "Fusionar PDFs Gratis Online — PDFGratis",
  description: "Combina múltiples PDFs en uno solo, gratis y sin registro. Arrastra para reordenar, procesamiento en tu navegador.",
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
