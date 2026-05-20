import type { Metadata } from "next";
import MarcaAguaTool from "@/components/MarcaAguaTool";
import AdBanner from "@/components/AdBanner";

export const metadata: Metadata = {
  title: "Añadir Marca de Agua a PDF Gratis — PDFGratis",
  description: "Añade marca de agua a tu PDF gratis. Personaliza el texto, opacidad, color y ángulo. Sin registro, procesamiento en tu navegador.",
};

export default function MarcaAguaPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan-100 text-3xl mb-4">💧</div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Marca de Agua en PDF</h1>
        <p className="text-gray-500">Añade "CONFIDENCIAL", "BORRADOR" o cualquier texto personalizado a todas las páginas.</p>
      </div>
      <MarcaAguaTool />
      <div className="mt-8"><AdBanner format="horizontal" /></div>
      <div className="mt-10 text-sm text-gray-500 space-y-2">
        <h2 className="font-bold text-gray-700">¿Cómo añadir marca de agua a un PDF?</h2>
        <p>Sube tu PDF, escribe el texto de la marca de agua, ajusta el estilo y descarga. Todo gratis y sin subir archivos a ningún servidor.</p>
      </div>
    </div>
  );
}
