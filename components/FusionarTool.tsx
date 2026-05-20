"use client";

import { useState, useRef, useCallback } from "react";
import { PDFDocument } from "pdf-lib";

type Stage = "idle" | "loading" | "done" | "error";

interface PdfFile {
  id: string;
  name: string;
  size: number;
  arrayBuffer: ArrayBuffer;
}

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function FusionarTool() {
  const [files, setFiles] = useState<PdfFile[]>([]);
  const [stage, setStage] = useState<Stage>("idle");
  const [dragging, setDragging] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [mergedSize, setMergedSize] = useState(0);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback(async (newFiles: FileList | File[]) => {
    const validFiles: PdfFile[] = [];
    for (const file of Array.from(newFiles)) {
      if (!file.name.toLowerCase().endsWith(".pdf")) continue;
      const ab = await file.arrayBuffer();
      validFiles.push({ id: `${file.name}-${Date.now()}-${Math.random()}`, name: file.name, size: file.size, arrayBuffer: ab });
    }
    setFiles((prev) => [...prev, ...validFiles]);
  }, []);

  const removeFile = (id: string) => setFiles((prev) => prev.filter((f) => f.id !== id));

  const moveFile = (index: number, dir: -1 | 1) => {
    const arr = [...files];
    const t = index + dir;
    if (t < 0 || t >= arr.length) return;
    [arr[index], arr[t]] = [arr[t], arr[index]];
    setFiles(arr);
  };

  const handleMerge = async () => {
    if (files.length < 2) { setError("Necesitas al menos 2 archivos PDF."); return; }
    setStage("loading"); setError("");
    try {
      const merged = await PDFDocument.create();
      for (const pdfFile of files) {
        const src = await PDFDocument.load(pdfFile.arrayBuffer, { ignoreEncryption: true });
        const pages = await merged.copyPages(src, src.getPageIndices());
        pages.forEach((p) => merged.addPage(p));
      }
      const bytes = await merged.save({ useObjectStreams: true });
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
      setMergedSize(blob.size);
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(URL.createObjectURL(blob));
      setStage("done");
    } catch {
      setError("Error al fusionar. Verifica que los PDFs no estén protegidos.");
      setStage("error");
    }
  };

  const reset = () => { setFiles([]); setStage("idle"); setDownloadUrl(null); setError(""); };

  if (stage === "loading") return (
    <div className="text-center py-14">
      <div className="text-5xl mb-4 animate-spin">⚙️</div>
      <p className="text-gray-600 font-medium">Fusionando {files.length} PDFs...</p>
    </div>
  );

  if (stage === "done") return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-xl">✅</div>
          <div>
            <p className="font-bold text-gray-900">¡PDFs fusionados!</p>
            <p className="text-sm text-gray-400">{files.length} archivos → 1 PDF ({formatBytes(mergedSize)})</p>
          </div>
        </div>
        <a href={downloadUrl!} download="fusionado.pdf"
          className="block w-full py-3 rounded-xl font-semibold text-center text-white shadow"
          style={{ backgroundColor: "#2563eb" }}>
          ⬇️ Descargar PDF Fusionado
        </a>
      </div>
      <button onClick={reset}
        className="w-full py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors">
        Fusionar otros PDFs
      </button>
    </div>
  );

  return (
    <div>
      <div
        className={`drop-zone rounded-2xl p-8 text-center cursor-pointer mb-4 ${dragging ? "active" : ""}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
      >
        <div className="text-4xl mb-2">➕</div>
        <p className="font-semibold text-gray-700 mb-1">
          {files.length === 0 ? "Arrastra tus PDFs aquí" : "Añadir más PDFs"}
        </p>
        <p className="text-gray-400 text-sm">o haz clic para seleccionarlos</p>
        <input ref={inputRef} type="file" accept=".pdf,application/pdf" multiple className="hidden"
          onChange={(e) => { if (e.target.files) addFiles(e.target.files); }} />
      </div>

      {files.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-4 shadow-sm">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex justify-between text-sm font-medium text-gray-500">
            <span>{files.length} archivo{files.length !== 1 ? "s" : ""}</span>
            <span>Orden de fusión</span>
          </div>
          {files.map((file, i) => (
            <div key={file.id} className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50">
              <span className="text-gray-400 text-sm w-5 text-center">{i + 1}</span>
              <span className="text-red-400">📄</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                <p className="text-xs text-gray-400">{formatBytes(file.size)}</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => moveFile(i, -1)} disabled={i === 0}
                  className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 transition-colors text-sm">↑</button>
                <button onClick={() => moveFile(i, 1)} disabled={i === files.length - 1}
                  className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 transition-colors text-sm">↓</button>
                <button onClick={() => removeFile(file.id)}
                  className="p-1 rounded hover:bg-red-100 text-red-400 transition-colors text-sm">✕</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">⚠️ {error}</div>}

      {files.length >= 2 && (
        <button onClick={handleMerge}
          className="w-full py-4 rounded-xl font-bold text-lg text-white shadow"
          style={{ backgroundColor: "#2563eb" }}>
          🔗 Fusionar {files.length} PDFs
        </button>
      )}
    </div>
  );
}
