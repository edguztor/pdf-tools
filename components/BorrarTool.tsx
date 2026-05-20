"use client";

import { useState, useRef, useCallback } from "react";
import { PDFDocument } from "pdf-lib";

type Stage = "idle" | "loading" | "selecting" | "processing" | "done" | "error";

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function BorrarTool() {
  const [stage, setStage] = useState<Stage>("idle");
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState("");
  const [pageCount, setPageCount] = useState(0);
  const [pdfBuffer, setPdfBuffer] = useState<ArrayBuffer | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState(0);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".pdf")) { setError("Selecciona un archivo PDF."); setStage("error"); return; }
    setStage("loading"); setError(""); setFileName(file.name); setSelected(new Set());
    try {
      const ab = await file.arrayBuffer();
      const doc = await PDFDocument.load(ab, { ignoreEncryption: true });
      setPdfBuffer(ab);
      setPageCount(doc.getPageCount());
      setStage("selecting");
    } catch { setError("No se pudo leer el PDF."); setStage("error"); }
  }, []);

  const toggle = (p: number) => setSelected(prev => {
    const next = new Set(prev);
    next.has(p) ? next.delete(p) : next.add(p);
    return next;
  });

  const selectAll = () => setSelected(new Set(Array.from({ length: pageCount }, (_, i) => i + 1)));
  const clearAll = () => setSelected(new Set());

  const handleDelete = async () => {
    if (!pdfBuffer || selected.size === 0) return;
    if (selected.size === pageCount) { setError("No puedes borrar todas las páginas."); return; }
    setStage("processing");
    try {
      const src = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
      const newDoc = await PDFDocument.create();
      const keepIndices = Array.from({ length: pageCount }, (_, i) => i).filter(i => !selected.has(i + 1));
      const pages = await newDoc.copyPages(src, keepIndices);
      pages.forEach(p => newDoc.addPage(p));
      const bytes = await newDoc.save({ useObjectStreams: true });
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
      setResultSize(blob.size);
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(URL.createObjectURL(blob));
      setStage("done");
    } catch { setError("Error al procesar el PDF."); setStage("selecting"); }
  };

  const reset = () => { setStage("idle"); setPdfBuffer(null); setSelected(new Set()); setDownloadUrl(null); setError(""); };

  if (stage === "loading" || stage === "processing") return (
    <div className="text-center py-14">
      <div className="text-5xl mb-4 animate-bounce">⚙️</div>
      <p className="text-gray-600 font-medium">{stage === "loading" ? "Leyendo PDF..." : "Borrando páginas..."}</p>
    </div>
  );

  if (stage === "done") return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-xl">✅</div>
          <div>
            <p className="font-bold text-gray-900">¡Páginas eliminadas!</p>
            <p className="text-sm text-gray-400">{pageCount - selected.size} página{pageCount - selected.size !== 1 ? "s" : ""} restante{pageCount - selected.size !== 1 ? "s" : ""} · {formatBytes(resultSize)}</p>
          </div>
        </div>
        <a href={downloadUrl!} download={`sin_paginas_${fileName}`}
          className="btn-primary w-full py-3 rounded-xl font-semibold text-center block">
          ⬇️ Descargar PDF
        </a>
      </div>
      <button onClick={reset} className="w-full py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors">
        Editar otro PDF
      </button>
    </div>
  );

  if (stage === "selecting") return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-gray-800 truncate max-w-xs">{fileName}</p>
          <p className="text-sm text-gray-400">{pageCount} páginas · {selected.size} seleccionadas para borrar</p>
        </div>
        <div className="flex gap-2">
          <button onClick={selectAll} className="text-xs px-3 py-1 rounded-lg border border-orange-300 text-orange-600 hover:bg-orange-50">Todas</button>
          <button onClick={clearAll} className="text-xs px-3 py-1 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50">Ninguna</button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
        <p className="text-xs text-gray-400 mb-3 text-center">Haz clic en las páginas que quieres <span className="text-red-500 font-semibold">BORRAR</span></p>
        <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto justify-center">
          {Array.from({ length: pageCount }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => toggle(p)}
              className={`w-12 h-12 rounded-xl text-sm font-bold border-2 transition-all ${selected.has(p)
                ? "bg-red-500 border-red-500 text-white scale-95 shadow-inner"
                : "bg-gray-50 border-gray-200 text-gray-700 hover:border-orange-400 hover:bg-orange-50"}`}>
              {selected.has(p) ? "🗑️" : p}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">⚠️ {error}</div>}

      <button onClick={handleDelete} disabled={selected.size === 0}
        className="w-full py-4 rounded-xl font-bold text-lg text-white shadow disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
        style={{ backgroundColor: selected.size > 0 ? "#ea580c" : "#9ca3af" }}>
        🗑️ Borrar {selected.size > 0 ? `${selected.size} página${selected.size !== 1 ? "s" : ""}` : "páginas"}
      </button>
    </div>
  );

  return (
    <div>
      <div className={`drop-zone rounded-2xl p-10 text-center cursor-pointer ${dragging ? "active" : ""}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}>
        <div className="text-5xl mb-3">🗑️</div>
        <p className="text-lg font-semibold text-gray-700 mb-1">Arrastra tu PDF aquí</p>
        <p className="text-gray-400 text-sm mb-4">Luego selecciona las páginas a eliminar</p>
        <button className="btn-primary px-6 py-2 rounded-full font-medium text-sm" type="button">Seleccionar PDF</button>
        <input ref={inputRef} type="file" accept=".pdf,application/pdf" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
      </div>
      {stage === "error" && <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">⚠️ {error}</div>}
    </div>
  );
}
