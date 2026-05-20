"use client";

import { useState, useRef, useCallback } from "react";
import { PDFDocument, degrees } from "pdf-lib";

type Stage = "idle" | "loading" | "selecting" | "processing" | "done" | "error";

const ROTATIONS = [0, 90, 180, 270] as const;
type Rotation = typeof ROTATIONS[number];

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function RotarTool() {
  const [stage, setStage] = useState<Stage>("idle");
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState("");
  const [pageCount, setPageCount] = useState(0);
  const [pdfBuffer, setPdfBuffer] = useState<ArrayBuffer | null>(null);
  const [rotations, setRotations] = useState<Rotation[]>([]);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState(0);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".pdf")) { setError("Selecciona un archivo PDF."); setStage("error"); return; }
    setStage("loading"); setError(""); setFileName(file.name);
    try {
      const ab = await file.arrayBuffer();
      const doc = await PDFDocument.load(ab, { ignoreEncryption: true });
      const count = doc.getPageCount();
      // Read existing rotations from PDF
      const existing: Rotation[] = doc.getPages().map(p => {
        const r = (p.getRotation().angle % 360 + 360) % 360;
        return (ROTATIONS.includes(r as Rotation) ? r : 0) as Rotation;
      });
      setPdfBuffer(ab);
      setPageCount(count);
      setRotations(existing);
      setStage("selecting");
    } catch { setError("No se pudo leer el PDF."); setStage("error"); }
  }, []);

  const rotate = (pageIdx: number, delta: 90 | -90) => {
    setRotations(prev => {
      const next = [...prev];
      next[pageIdx] = (((next[pageIdx] + delta) % 360 + 360) % 360) as Rotation;
      return next;
    });
  };

  const rotateAll = (angle: Rotation) => setRotations(Array(pageCount).fill(angle));

  const handleApply = async () => {
    if (!pdfBuffer) return;
    setStage("processing");
    try {
      const doc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
      doc.getPages().forEach((page, i) => page.setRotation(degrees(rotations[i])));
      const bytes = await doc.save({ useObjectStreams: true });
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
      setResultSize(blob.size);
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(URL.createObjectURL(blob));
      setStage("done");
    } catch { setError("Error al rotar las páginas."); setStage("selecting"); }
  };

  const reset = () => { setStage("idle"); setPdfBuffer(null); setRotations([]); setDownloadUrl(null); setError(""); };

  const rotIcon = (r: Rotation) => ({ 0: "↑", 90: "→", 180: "↓", 270: "←" }[r]);
  const hasChanges = rotations.some(r => r !== 0);

  if (stage === "loading" || stage === "processing") return (
    <div className="text-center py-14">
      <div className="text-5xl mb-4 animate-spin">🔄</div>
      <p className="text-gray-600 font-medium">{stage === "loading" ? "Leyendo PDF..." : "Aplicando rotaciones..."}</p>
    </div>
  );

  if (stage === "done") return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-xl">✅</div>
          <div>
            <p className="font-bold text-gray-900">¡Páginas rotadas!</p>
            <p className="text-sm text-gray-400">{formatBytes(resultSize)}</p>
          </div>
        </div>
        <a href={downloadUrl!} download={`rotado_${fileName}`}
          className="block w-full py-3 rounded-xl font-semibold text-center text-white shadow"
          style={{ backgroundColor: "#7c3aed" }}>
          ⬇️ Descargar PDF
        </a>
      </div>
      <button onClick={reset} className="w-full py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors">
        Rotar otro PDF
      </button>
    </div>
  );

  if (stage === "selecting") return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <p className="font-semibold text-gray-800 truncate max-w-xs">{fileName}</p>
          <p className="text-sm text-gray-400">{pageCount} páginas</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {([0, 90, 180, 270] as Rotation[]).map(a => (
            <button key={a} onClick={() => rotateAll(a)}
              className="text-xs px-3 py-1 rounded-lg border border-purple-300 text-purple-600 hover:bg-purple-50">
              Todas {a}°
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm max-h-72 overflow-y-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Array.from({ length: pageCount }, (_, i) => (
            <div key={i} className={`border-2 rounded-xl p-3 text-center transition-colors ${rotations[i] !== 0 ? "border-purple-300 bg-purple-50" : "border-gray-100 bg-gray-50"}`}>
              <div className="text-3xl mb-1" style={{ transform: `rotate(${rotations[i]}deg)`, transition: "transform 0.3s ease" }}>📄</div>
              <p className="text-xs font-medium text-gray-600 mb-2">Pág. {i + 1} · {rotations[i]}°</p>
              <div className="flex justify-center gap-1">
                <button onClick={() => rotate(i, -90)} className="w-7 h-7 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-purple-50 hover:border-purple-300 text-sm transition-colors">↺</button>
                <button onClick={() => rotate(i, 90)} className="w-7 h-7 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-purple-50 hover:border-purple-300 text-sm transition-colors">↻</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">⚠️ {error}</div>}

      <button onClick={handleApply} disabled={!hasChanges}
        className="w-full py-4 rounded-xl font-bold text-lg text-white shadow disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
        style={{ backgroundColor: "#7c3aed" }}>
        🔄 Aplicar Rotaciones
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
        <div className="text-5xl mb-3">🔄</div>
        <p className="text-lg font-semibold text-gray-700 mb-1">Arrastra tu PDF aquí</p>
        <p className="text-gray-400 text-sm mb-4">Luego rota las páginas que necesites</p>
        <button className="btn-primary px-6 py-2 rounded-full font-medium text-sm" type="button">Seleccionar PDF</button>
        <input ref={inputRef} type="file" accept=".pdf,application/pdf" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
      </div>
      {stage === "error" && <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">⚠️ {error}</div>}
    </div>
  );
}
