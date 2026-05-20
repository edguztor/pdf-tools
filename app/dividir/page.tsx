import type { Metadata } from "next";
import DividirTool from "@/components/DividirTool";
import AdBanner from "@/components/AdBanner";

export const metadata: Metadata = {
  title: "Dividir PDF Gratis Online — PDFGratis",
  description: "Extrae páginas o divide tu PDF en múltiples archivos, gratis y sin registro. Procesamiento en tu navegador.",
};

export default function DividirPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-100 text-3xl mb-4">✂️</div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Dividir PDF</h1>
        <p className="text-gray-500">Extrae páginas o divide tu PDF en múltiples archivos. Sin registro.</p>
      </div>
      <DividirTool />
      <div className="mt-8"><AdBanner format="horizontal" /></div>
      <div className="mt-10 text-sm text-gray-500 space-y-2">
        <h2 className="font-bold text-gray-700">¿Cómo dividir un PDF gratis?</h2>
        <p>Sube tu PDF, elige cómo dividirlo y descarga los archivos al instante. Sin instalar nada, sin subir documentos a ningún servidor.</p>
      </div>
    </div>
  );
}
