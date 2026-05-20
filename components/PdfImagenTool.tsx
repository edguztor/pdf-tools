"use client";

import { useState, useRef, useCallback } from "react";
import JSZip from "jszip";

type Stage = "idle" | "loading" | "done" | "error";
type Format = "png" | "jpeg";

interface PageImage {
  index: number;
  dataUrl: string;
  blob: Blob;
}


export default function PdfImagenTool() {
  const [stage, setStage] = useState<Stage>("idle");
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState("");
  const [images, setImages] = useState<PageImage[]>([]);
  const [format, setFormat] = useState<Format>("png");
  const [scale, setScale] = useState(2);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const bufferRef = useRef<ArrayBuffer | null>(null);

  const process = useCallback(async (buffer: ArrayBuffer, fmt: Format, sc: number) => {
    setStage("loading"); setProgress(0); setImages([]);
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      const pdf = await pdfjsLib.getDocument({ data: buffer.slice(0) }).promise;
      const total = pdf.numPages;
      const result: PageImage[] = [];

      for (let i = 1; i <= total; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: sc });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d")!;
        if (fmt === "jpeg") { ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, canvas.width, canvas.height); }
        await page.render({ canvasContext: ctx, viewport, canvas }).promise;
        const mimeType = fmt === "jpeg" ? "image/jpeg" : "image/png";
        const dataUrl = canvas.toDataURL(mimeType, 0.92);
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        result.push({ index: i, dataUrl, blob });
        setProgress(Math.round((i / total) * 100));
      }
      setImages(result);
      setStage("done");
    } catch { setError("Error al convertir el PDF."); setStage("error"); }
  }, []);

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".pdf")) { setError("Selecciona un PDF."); setStage("error"); return; }
    setError(""); setFileName(file.name);
    const ab = await file.arrayBuffer();
    bufferRef.current = ab;
    await process(ab, format, scale);
  }, [format, scale, process]);

  const reprocess = async () => {
    if (bufferRef.current) await process(bufferRef.current, format, scale);
  };

  const downloadAll = async () => {
    const zip = new JSZip();
    const baseName = fileName.replace(".pdf", "");
    images.forEach(img => {
      const name = `${baseName}_pagina_${img.index}.${format}`;
      zip.file(name, img.blob);
    });
    const zipBlob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement("a");
    a.href = url; a.download = `${baseName}_imagenes.zip`; a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => { setStage("idle"); setImages([]); bufferRef.current = null; setError(""); };

  if (stage === "loading") return (
    <div className="text-center py-14">
      <div className="text-5xl mb-4">🖼️</div>
      <p className="text-gray-600 font-medium mb-3">Convirtiendo páginas... {progress}%</p>
      <div className="w-64 mx-auto bg-gray-200 rounded-full h-3">
        <div className="h-3 rounded-full progress-bar transition-all" style={{ width: `${progress}%`, backgroundColor: "#ec4899" }} />
      </div>
    </div>
  );

  if (stage === "done") return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <p className="font-semibold text-gray-800">{images.length} página{images.length !== 1 ? "s" : ""} convertida{images.length !== 1 ? "s" : ""}</p>
          <p className="text-sm text-gray-400">{fileName} · {format.toUpperCase()} · {scale}x</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <select value={format} onChange={e => setFormat(e.target.value as Format)}
            className="text-sm border border-gray-300 rounded-lg px-2 py-1">
            <option value="png">PNG</option>
            <option value="jpeg">JPG</option>
          </select>
          <select value={scale} onChange={e => setScale(Number(e.target.value))}
            className="text-sm border border-gray-300 rounded-lg px-2 py-1">
            <option value={1}>1x (Rápido)</option>
            <option value={2}>2x (HD)</option>
            <option value={3}>3x (4K)</option>
          </select>
          <button onClick={reprocess} className="text-sm px-3 py-1 rounded-lg border border-pink-300 text-pink-600 hover:bg-pink-50">
            Reconvertir
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-80 overflow-y-auto bg-white border border-gray-200 rounded-2xl p-3">
        {images.map(img => (
          <a key={img.index} href={img.dataUrl} download={`${fileName.replace(".pdf","")}_pagina_${img.index}.${format}`}
            className="group block rounded-xl overflow-hidden border border-gray-200 hover:border-pink-400 transition-colors relative">
            <img src={img.dataUrl} alt={`Página ${img.index}`} className="w-full h-auto object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-xs font-bold bg-pink-500 px-2 py-1 rounded-full">⬇️ Pág. {img.index}</span>
            </div>
          </a>
        ))}
      </div>

      <div className="flex gap-3">
        <button onClick={downloadAll}
          className="flex-1 py-3 rounded-xl font-bold text-white shadow"
          style={{ backgroundColor: "#ec4899" }}>
          📦 Descargar todo (ZIP)
        </button>
        <button onClick={reset} className="py-3 px-5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50">
          Otro PDF
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <div className={`drop-zone rounded-2xl p-10 text-center cursor-pointer ${dragging ? "active" : ""}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}>
        <div className="text-5xl mb-3">🖼️</div>
        <p className="text-lg font-semibold text-gray-700 mb-1">Arrastra tu PDF aquí</p>
        <p className="text-gray-400 text-sm mb-3">Convierte cada página en PNG o JPG</p>
        <div className="flex gap-2 justify-center mb-4">
          {(["png", "jpeg"] as Format[]).map(f => (
            <button key={f} type="button" onClick={e => { e.stopPropagation(); setFormat(f); }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border-2 transition-colors ${format === f ? "border-pink-500 bg-pink-50 text-pink-700" : "border-gray-200 text-gray-500 hover:border-pink-300"}`}>
              {f.toUpperCase()}
            </button>
          ))}
        </div>
        <button className="btn-primary px-6 py-2 rounded-full font-medium text-sm" type="button">Seleccionar PDF</button>
        <input ref={inputRef} type="file" accept=".pdf,application/pdf" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
      </div>
      {stage === "error" && <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">⚠️ {error}</div>}
    </div>
  );
}
