"use client";

import { useState, useRef } from "react";
import ComprimirTool from "@/components/ComprimirTool";
import FusionarTool from "@/components/FusionarTool";
import DividirTool from "@/components/DividirTool";
import BorrarTool from "@/components/BorrarTool";
import RotarTool from "@/components/RotarTool";
import MarcaAguaTool from "@/components/MarcaAguaTool";
import PdfImagenTool from "@/components/PdfImagenTool";
import FirmarTool from "@/components/FirmarTool";
import AdBanner from "@/components/AdBanner";

const tools = [
  { id: "comprimir",   icon: "🗜️", label: "Comprimir",      desc: "Reduce el tamaño del archivo",            color: "#e53935", bg: "bg-red-50",    border: "border-red-200",    ring: "ring-red-400"    },
  { id: "fusionar",    icon: "🔗", label: "Fusionar",        desc: "Combina varios PDFs en uno",               color: "#2563eb", bg: "bg-blue-50",   border: "border-blue-200",   ring: "ring-blue-400"   },
  { id: "dividir",     icon: "✂️", label: "Dividir",         desc: "Separa páginas en archivos",               color: "#16a34a", bg: "bg-green-50",  border: "border-green-200",  ring: "ring-green-400"  },
  { id: "borrar",      icon: "🗑️", label: "Borrar páginas",  desc: "Elimina páginas específicas",              color: "#ea580c", bg: "bg-orange-50", border: "border-orange-200", ring: "ring-orange-400" },
  { id: "rotar",       icon: "🔄", label: "Rotar páginas",   desc: "Gira páginas 90°, 180°, 270°",            color: "#7c3aed", bg: "bg-purple-50", border: "border-purple-200", ring: "ring-purple-400" },
  { id: "marca-agua",  icon: "💧", label: "Marca de agua",   desc: "Añade texto semitransparente",             color: "#0891b2", bg: "bg-cyan-50",   border: "border-cyan-200",   ring: "ring-cyan-400"   },
  { id: "pdf-imagen",  icon: "🖼️", label: "PDF a Imagen",    desc: "Convierte páginas a PNG o JPG",            color: "#ec4899", bg: "bg-pink-50",   border: "border-pink-200",   ring: "ring-pink-400"   },
  { id: "firmar",      icon: "✍️", label: "Firmar PDF",      desc: "Dibuja y añade tu firma",                  color: "#4f46e5", bg: "bg-indigo-50", border: "border-indigo-200", ring: "ring-indigo-400" },
] as const;

type ToolId = typeof tools[number]["id"];

const TOOL_COMPONENTS: Record<ToolId, React.FC> = {
  comprimir:  ComprimirTool,
  fusionar:   FusionarTool,
  dividir:    DividirTool,
  borrar:     BorrarTool,
  rotar:      RotarTool,
  "marca-agua": MarcaAguaTool,
  "pdf-imagen": PdfImagenTool,
  firmar:     FirmarTool,
};

const features = [
  { icon: "🔒", text: "100% Privado",      sub: "Los archivos nunca salen de tu navegador" },
  { icon: "⚡", text: "Ultrarrápido",       sub: "Procesamiento instantáneo en tu dispositivo" },
  { icon: "🆓", text: "Totalmente Gratis",  sub: "Sin registro, sin límites, sin trampa" },
  { icon: "📱", text: "Funciona en Móvil",  sub: "Compatible con cualquier dispositivo" },
];

export default function Home() {
  const [activeTool, setActiveTool] = useState<ToolId>("comprimir");
  const toolRef = useRef<HTMLDivElement>(null);

  const selectTool = (id: ToolId) => {
    setActiveTool(id);
    setTimeout(() => toolRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  const current = tools.find(t => t.id === activeTool)!;
  const ActiveComponent = TOOL_COMPONENTS[activeTool];

  return (
    <div>
      {/* Hero */}
      <section className="bg-white py-10 px-4 text-center border-b border-gray-100">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-3">
            Herramientas PDF <span style={{ color: "var(--primary)" }}>100% Gratis</span>
          </h1>
          <p className="text-lg text-gray-500">
            8 herramientas para editar PDFs directo en tu navegador.{" "}
            <strong>Sin registro. Sin límites.</strong>
          </p>
        </div>
      </section>

      {/* Ad */}
      <div className="max-w-5xl mx-auto px-4 py-4">
        <AdBanner slot="2956781430" format="horizontal" />
      </div>

      {/* Tool Grid */}
      <section className="max-w-5xl mx-auto px-4 pb-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {tools.map(tool => (
            <button key={tool.id} onClick={() => selectTool(tool.id)}
              className={`tool-card rounded-2xl p-4 text-left border-2 transition-all ${
                activeTool === tool.id
                  ? `${tool.bg} ${tool.border} ring-2 ${tool.ring} shadow-md`
                  : "bg-white border-gray-100 hover:border-gray-300"
              }`}>
              <div className="text-2xl mb-2">{tool.icon}</div>
              <p className="font-bold text-gray-800 text-sm leading-tight">{tool.label}</p>
              <p className="text-xs text-gray-400 mt-0.5 leading-tight hidden sm:block">{tool.desc}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Active Tool Panel */}
      <section ref={toolRef} className="max-w-3xl mx-auto px-4 pb-10 scroll-mt-20">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="px-8 py-5 border-b border-gray-100 flex items-center gap-3" style={{ borderLeftWidth: 4, borderLeftColor: current.color }}>
            <span className="text-3xl">{current.icon}</span>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{current.label}</h2>
              <p className="text-sm text-gray-500">{current.desc}</p>
            </div>
          </div>
          {/* Tool */}
          <div className="p-6 md:p-8">
            <ActiveComponent />
          </div>
        </div>
      </section>

      {/* Ad */}
      <div className="max-w-5xl mx-auto px-4 pb-8">
        <AdBanner slot="2956781430" format="horizontal" />
      </div>

      {/* Features */}
      <section className="bg-white py-12 px-4 border-t border-gray-100">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">¿Por qué PDFGratis?</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {features.map(f => (
              <div key={f.text} className="p-4">
                <div className="text-3xl mb-2">{f.icon}</div>
                <div className="font-bold text-gray-800 mb-1">{f.text}</div>
                <div className="text-sm text-gray-500">{f.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEO */}
      <section className="max-w-3xl mx-auto px-4 py-10 text-gray-600">
        <h2 className="text-xl font-bold text-gray-800 mb-3">Herramientas PDF online gratuitas</h2>
        <p className="text-sm leading-relaxed mb-3">
          PDFGratis reúne 8 herramientas esenciales para trabajar con archivos PDF: comprime,
          fusiona, divide, borra páginas, rota, añade marca de agua, convierte a imagen y firma
          tus documentos. Todo gratis y sin instalar nada.
        </p>
        <p className="text-sm leading-relaxed">
          Tu privacidad es nuestra prioridad:{" "}
          <strong>tus documentos nunca se suben a ningún servidor</strong>. Todo el procesamiento
          ocurre directamente en tu navegador.
        </p>
      </section>
    </div>
  );
}
