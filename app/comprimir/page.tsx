import type { Metadata } from "next";
import ComprimirTool from "@/components/ComprimirTool";
import AdBanner from "@/components/AdBanner";

export const metadata: Metadata = {
  title: "Comprimir PDF Gratis Online — Sin Registro",
  description: "Comprime y reduce el tamaño de tu PDF gratis online. Sin registro, sin límites. Procesamiento 100% en tu navegador, tus archivos nunca se suben a ningún servidor.",
  keywords: ["comprimir pdf", "reducir tamaño pdf", "comprimir pdf gratis", "comprimir pdf online", "pdf más pequeño"],
  alternates: { canonical: "https://pdf-tools-xi-brown.vercel.app/comprimir" },
  openGraph: { title: "Comprimir PDF Gratis Online", description: "Reduce el tamaño de tu PDF al instante. Gratis y sin registro.", type: "website" },
};

export default function ComprimirPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-100 text-3xl mb-4">🗜️</div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Comprimir PDF</h1>
        <p className="text-gray-500">Reduce el tamaño de tu PDF gratis. Tu archivo nunca sale de tu navegador.</p>
      </div>
      <ComprimirTool />
      <div className="mt-8"><AdBanner format="horizontal" /></div>
      <div className="mt-10 text-sm text-gray-500 space-y-2">
        <h2 className="font-bold text-gray-700">¿Cómo comprimir un PDF gratis?</h2>
        <p>Sube tu archivo PDF, nuestra herramienta lo re-optimiza eliminando datos redundantes. El resultado es un PDF más pequeño, listo para enviar por email.</p>
      </div>
    </div>
  );
}
