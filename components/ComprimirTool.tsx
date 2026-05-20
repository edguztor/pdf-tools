"use client";

import { useState, useRef, useCallback } from "react";
import { PDFDocument } from "pdf-lib";

type Stage = "idle" | "loading" | "done" | "error";

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function ComprimirTool() {
  const [stage, setStage] = useState<Stage>("idle");
  const [dragging, setDragging] = useState(false);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("Por favor selecciona un archivo PDF.");
      setStage("error");
      return;
    }
    setStage("loading");
    setError("");
    setDownloadUrl(null);
    setFileName(file.name);
    setOriginalSize(file.size);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const compressedBytes = await pdfDoc.save({ useObjectStreams: true, addDefaultPage: false });
      const blob = new Blob([compressedBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      setCompressedSize(blob.size);
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(URL.createObjectURL(blob));
      setStage("done");
    } catch {
      setError("No se pudo procesar el archivo. Verifica que no esté dañado o protegido.");
      setStage("error");
    }
  }, [downloadUrl]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const savings = originalSize > 0 ? Math.max(0, Math.round((1 - compressedSize / originalSize) * 100)) : 0;

  if (stage === "loading") return (
    <div className="text-center py-14">
      <div className="text-5xl mb-4 animate-bounce">⚙️</div>
      <p className="text-gray-600 font-medium">Comprimiendo {fileName}...</p>
      <div className="mt-4 w-48 mx-auto bg-gray-200 rounded-full h-2">
        <div className="bg-red-500 h-2 rounded-full w-3/4 animate-pulse" />
      </div>
    </div>
  );

  if (stage === "done") return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-xl">✅</div>
          <div>
            <p className="font-bold text-gray-900">¡PDF comprimido!</p>
            <p className="text-sm text-gray-400 truncate max-w-xs">{fileName}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-400 mb-1">Original</p>
            <p className="font-bold text-gray-700">{formatBytes(originalSize)}</p>
          </div>
          <div className="bg-green-50 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-400 mb-1">Comprimido</p>
            <p className="font-bold text-green-700">{formatBytes(compressedSize)}</p>
          </div>
          <div className="bg-red-50 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-400 mb-1">Ahorro</p>
            <p className="font-bold text-red-600">{savings}%</p>
          </div>
        </div>
        <a href={downloadUrl!} download={`comprimido_${fileName}`}
          className="btn-primary w-full py-3 rounded-xl font-semibold text-center block">
          ⬇️ Descargar PDF Comprimido
        </a>
      </div>
      <button onClick={() => { setStage("idle"); setDownloadUrl(null); }}
        className="w-full py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors">
        Comprimir otro PDF
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
        onDrop={onDrop}
      >
        <div className="text-5xl mb-3">📄</div>
        <p className="text-lg font-semibold text-gray-700 mb-1">Arrastra tu PDF aquí</p>
        <p className="text-gray-400 text-sm mb-4">o haz clic para seleccionarlo</p>
        <button className="btn-primary px-6 py-2 rounded-full font-medium text-sm" type="button">
          Seleccionar PDF
        </button>
        <input ref={inputRef} type="file" accept=".pdf,application/pdf" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
      </div>
      {stage === "error" && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">⚠️ {error}</div>
      )}
    </div>
  );
}
