"use client";

import { useState, useRef, useCallback } from "react";
import { PDFDocument } from "pdf-lib";

type Stage = "idle" | "loading" | "selecting" | "done" | "error";
type SplitMode = "all" | "range" | "extract";

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

interface ResultFile { name: string; url: string; size: number; }

export default function DividirTool() {
  const [stage, setStage] = useState<Stage>("idle");
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState("");
  const [pageCount, setPageCount] = useState(0);
  const [pdfBuffer, setPdfBuffer] = useState<ArrayBuffer | null>(null);
  const [mode, setMode] = useState<SplitMode>("all");
  const [rangeInput, setRangeInput] = useState("");
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [results, setResults] = useState<ResultFile[]>([]);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".pdf")) { setError("Selecciona un PDF."); setStage("error"); return; }
    setStage("loading"); setError(""); setFileName(file.name);
    try {
      const ab = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(ab, { ignoreEncryption: true });
      setPdfBuffer(ab); setPageCount(pdfDoc.getPageCount()); setStage("selecting");
    } catch { setError("No se pudo leer el PDF."); setStage("error"); }
  }, []);

  const parseRange = (input: string, total: number) => {
    const pages = new Set<number>();
    for (const part of input.split(",").map((s) => s.trim())) {
      if (part.includes("-")) {
        const [a, b] = part.split("-").map(Number);
        for (let i = a; i <= Math.min(b, total); i++) if (i >= 1) pages.add(i);
      } else { const n = Number(part); if (n >= 1 && n <= total) pages.add(n); }
    }
    return Array.from(pages).sort((a, b) => a - b);
  };

  const handleSplit = async () => {
    if (!pdfBuffer) return;
    setStage("loading"); setError("");
    try {
      const srcDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
      const newResults: ResultFile[] = [];

      const makePdf = async (pageIndices: number[], name: string) => {
        const newPdf = await PDFDocument.create();
        const copied = await newPdf.copyPages(srcDoc, pageIndices);
        copied.forEach((p) => newPdf.addPage(p));
        const bytes = await newPdf.save();
        const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
        return { name, url: URL.createObjectURL(blob), size: blob.size };
      };

      if (mode === "all") {
        for (let i = 0; i < pageCount; i++)
          newResults.push(await makePdf([i], `pagina_${i + 1}.pdf`));
      } else if (mode === "range") {
        const pages = parseRange(rangeInput, pageCount);
        if (!pages.length) { setError("Rango inválido."); setStage("selecting"); return; }
        newResults.push(await makePdf(pages.map((p) => p - 1), `paginas_${pages[0]}-${pages[pages.length - 1]}.pdf`));
      } else {
        const pages = Array.from(selectedPages).sort((a, b) => a - b);
        if (!pages.length) { setError("Selecciona al menos una página."); setStage("selecting"); return; }
        for (const p of pages) newResults.push(await makePdf([p - 1], `pagina_${p}.pdf`));
      }

      setResults(newResults); setStage("done");
    } catch { setError("Error al dividir el PDF."); setStage("selecting"); }
  };

  const togglePage = (p: number) => setSelectedPages((prev) => {
    const next = new Set(prev); next.has(p) ? next.delete(p) : next.add(p); return next;
  });

  const reset = () => {
    results.forEach((r) => URL.revokeObjectURL(r.url));
    setStage("idle"); setResults([]); setPdfBuffer(null);
    setPageCount(0); setSelectedPages(new Set()); setRangeInput(""); setError("");
  };

  if (stage === "loading") return (
    <div className="text-center py-14">
      <div className="text-5xl mb-4 animate-spin">⚙️</div>
      <p className="text-gray-600 font-medium">Procesando PDF...</p>
    </div>
  );

  if (stage === "done") return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">✅</div>
          <div>
            <p className="font-bold text-gray-900">¡PDF dividido!</p>
            <p className="text-sm text-gray-400">{results.length} archivo{results.length !== 1 ? "s" : ""} generado{results.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
          {results.map((r) => (
            <a key={r.name} href={r.url} download={r.name}
              className="flex items-center justify-between p-3 rounded-xl bg-green-50 border border-green-100 hover:border-green-300 transition-colors group">
              <div className="flex items-center gap-2">
                <span className="text-red-400">📄</span>
                <span className="text-sm font-medium text-gray-800">{r.name}</span>
                <span className="text-xs text-gray-400">({formatBytes(r.size)})</span>
              </div>
              <span className="text-green-600 text-sm font-medium">⬇️ Descargar</span>
            </a>
          ))}
        </div>
      </div>
      <button onClick={reset}
        className="w-full py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors">
        Dividir otro PDF
      </button>
    </div>
  );

  if (stage === "selecting") return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-5">
      <div className="flex items-center gap-3">
        <span className="text-2xl">📄</span>
        <div><p className="font-semibold text-gray-800 truncate">{fileName}</p>
          <p className="text-sm text-gray-400">{pageCount} páginas</p></div>
      </div>
      <div className="flex gap-2 flex-wrap">
        {(["all", "range", "extract"] as SplitMode[]).map((m) => {
          const labels: Record<SplitMode, string> = { all: "Una página/archivo", range: "Rango", extract: "Elegir páginas" };
          return (
            <button key={m} onClick={() => setMode(m)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${mode === m ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
              {labels[m]}
            </button>
          );
        })}
      </div>
      {mode === "range" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Páginas (ej: 1-3, 5, 7-9)</label>
          <input type="text" value={rangeInput} onChange={(e) => setRangeInput(e.target.value)}
            placeholder="1-3, 5, 7-9"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500" />
        </div>
      )}
      {mode === "extract" && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Selecciona páginas ({selectedPages.size} seleccionadas)</p>
          <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
            {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => togglePage(p)}
                className={`w-10 h-10 rounded-lg text-sm font-medium border transition-colors ${selectedPages.has(p) ? "bg-green-500 border-green-500 text-white" : "bg-gray-50 border-gray-200 text-gray-700 hover:border-green-400"}`}>
                {p}
              </button>
            ))}
          </div>
        </div>
      )}
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">⚠️ {error}</div>}
      <button onClick={handleSplit}
        className="w-full py-3 rounded-xl font-bold text-white text-lg shadow"
        style={{ backgroundColor: "#16a34a" }}>
        ✂️ Dividir PDF
      </button>
    </div>
  );

  return (
    <div>
      <div
        className={`drop-zone rounded-2xl p-10 text-center cursor-pointer ${dragging ? "active" : ""}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
      >
        <div className="text-5xl mb-3">📄</div>
        <p className="text-lg font-semibold text-gray-700 mb-1">Arrastra tu PDF aquí</p>
        <p className="text-gray-400 text-sm mb-4">o haz clic para seleccionarlo</p>
        <button className="btn-primary px-6 py-2 rounded-full font-medium text-sm" type="button">Seleccionar PDF</button>
        <input ref={inputRef} type="file" accept=".pdf,application/pdf" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
      </div>
      {stage === "error" && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">⚠️ {error}</div>
      )}
    </div>
  );
}
