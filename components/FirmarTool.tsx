"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { PDFDocument } from "pdf-lib";

type Stage = "idle" | "drawing" | "placing" | "processing" | "done" | "error";
type Position = "bottom-right" | "bottom-left" | "bottom-center" | "top-right" | "custom";

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function FirmarTool() {
  const [stage, setStage] = useState<Stage>("idle");
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState("");
  const [pageCount, setPageCount] = useState(0);
  const [pdfBuffer, setPdfBuffer] = useState<ArrayBuffer | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState(0);
  const [error, setError] = useState("");
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [targetPage, setTargetPage] = useState(1);
  const [position, setPosition] = useState<Position>("bottom-right");
  const [sigWidth, setSigWidth] = useState(200);
  const [sigColor, setSigColor] = useState("#1a1a2e");
  const [applyAll, setApplyAll] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (stage === "drawing") {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#f9fafb";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "#e5e7eb";
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);
      ctx.setLineDash([]);
    }
  }, [stage]);

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      return { x: (e.touches[0].clientX - rect.left) * scaleX, y: (e.touches[0].clientY - rect.top) * scaleY };
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current; if (!canvas) return;
    setIsDrawing(true);
    lastPos.current = getPos(e, canvas);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing || !lastPos.current) return;
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = sigColor;
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    lastPos.current = pos;
    setHasSignature(true);
  };

  const endDraw = () => { setIsDrawing(false); lastPos.current = null; };

  const clearCanvas = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#f9fafb";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#e5e7eb";
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);
    ctx.setLineDash([]);
    setHasSignature(false);
  };

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".pdf")) { setError("Selecciona un PDF."); setStage("error"); return; }
    setError(""); setFileName(file.name);
    try {
      const ab = await file.arrayBuffer();
      const doc = await PDFDocument.load(ab, { ignoreEncryption: true });
      setPdfBuffer(ab);
      setPageCount(doc.getPageCount());
      setTargetPage(1);
      setStage("drawing");
    } catch { setError("No se pudo leer el PDF."); setStage("error"); }
  }, []);

  const handleSign = async () => {
    if (!pdfBuffer || !hasSignature) return;
    setStage("processing");
    try {
      const canvas = canvasRef.current!;
      const dataUrl = canvas.toDataURL("image/png");
      const base64 = dataUrl.split(",")[1];
      const pngBytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));

      const doc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
      const sigImage = await doc.embedPng(pngBytes);

      const sigHeight = Math.round(sigWidth * (canvas.height / canvas.width));
      const margin = 30;

      const targetPages = applyAll ? doc.getPages() : [doc.getPages()[targetPage - 1]];

      for (const page of targetPages) {
        const { width, height } = page.getSize();
        let x = 0, y = 0;
        switch (position) {
          case "bottom-right":  x = width - sigWidth - margin;  y = margin; break;
          case "bottom-left":   x = margin;                     y = margin; break;
          case "bottom-center": x = width / 2 - sigWidth / 2;  y = margin; break;
          case "top-right":     x = width - sigWidth - margin;  y = height - sigHeight - margin; break;
          default:              x = width - sigWidth - margin;  y = margin;
        }
        page.drawImage(sigImage, { x, y, width: sigWidth, height: sigHeight });
      }

      const bytes = await doc.save({ useObjectStreams: true });
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
      setResultSize(blob.size);
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(URL.createObjectURL(blob));
      setStage("done");
    } catch { setError("Error al firmar el PDF."); setStage("drawing"); }
  };

  const reset = () => { setStage("idle"); setPdfBuffer(null); setDownloadUrl(null); setHasSignature(false); setError(""); };

  if (stage === "processing") return (
    <div className="text-center py-14">
      <div className="text-5xl mb-4 animate-pulse">✍️</div>
      <p className="text-gray-600 font-medium">Firmando PDF...</p>
    </div>
  );

  if (stage === "done") return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-xl">✅</div>
          <div>
            <p className="font-bold text-gray-900">¡PDF firmado!</p>
            <p className="text-sm text-gray-400">{formatBytes(resultSize)}</p>
          </div>
        </div>
        <a href={downloadUrl!} download={`firmado_${fileName}`}
          className="block w-full py-3 rounded-xl font-semibold text-center text-white shadow"
          style={{ backgroundColor: "#4f46e5" }}>
          ⬇️ Descargar PDF Firmado
        </a>
      </div>
      <button onClick={reset} className="w-full py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors">
        Firmar otro PDF
      </button>
    </div>
  );

  if (stage === "drawing") return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <p className="font-semibold text-gray-800 truncate max-w-xs text-sm">{fileName}</p>
          <p className="text-xs text-gray-400">{pageCount} páginas · Dibuja tu firma abajo</p>
        </div>
        <div className="flex gap-2 items-center">
          <label className="text-xs text-gray-600">Color:</label>
          <input type="color" value={sigColor} onChange={e => setSigColor(e.target.value)}
            className="w-8 h-8 rounded border border-gray-300 cursor-pointer" />
          <button onClick={clearCanvas} className="text-xs px-3 py-1 rounded-lg border border-red-200 text-red-500 hover:bg-red-50">
            Borrar
          </button>
        </div>
      </div>

      {/* Signature canvas */}
      <div className="bg-white border-2 border-dashed border-gray-300 rounded-2xl overflow-hidden" style={{ touchAction: "none" }}>
        <canvas ref={canvasRef} width={600} height={180}
          className="w-full cursor-crosshair block"
          onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
          onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw} />
      </div>
      {!hasSignature && <p className="text-center text-xs text-gray-400">✏️ Dibuja tu firma con el mouse o el dedo</p>}

      {/* Placement options */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3 shadow-sm">
        <p className="text-sm font-semibold text-gray-700">Opciones de colocación</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Página</label>
            {applyAll
              ? <p className="text-sm text-indigo-600 font-medium">Todas las páginas</p>
              : <select value={targetPage} onChange={e => setTargetPage(Number(e.target.value))}
                  className="w-full text-sm border border-gray-300 rounded-lg px-2 py-1.5">
                  {Array.from({ length: pageCount }, (_, i) => (
                    <option key={i + 1} value={i + 1}>Página {i + 1}</option>
                  ))}
                </select>
            }
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Posición</label>
            <select value={position} onChange={e => setPosition(e.target.value as Position)}
              className="w-full text-sm border border-gray-300 rounded-lg px-2 py-1.5">
              <option value="bottom-right">Abajo derecha</option>
              <option value="bottom-left">Abajo izquierda</option>
              <option value="bottom-center">Abajo centro</option>
              <option value="top-right">Arriba derecha</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Tamaño: {sigWidth}px</label>
          <input type="range" min={80} max={350} value={sigWidth} onChange={e => setSigWidth(Number(e.target.value))}
            className="w-full accent-indigo-500" />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={applyAll} onChange={e => setApplyAll(e.target.checked)} className="w-4 h-4 accent-indigo-500" />
          <span className="text-sm text-gray-700">Firmar en todas las páginas</span>
        </label>
      </div>

      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">⚠️ {error}</div>}

      <button onClick={handleSign} disabled={!hasSignature}
        className="w-full py-4 rounded-xl font-bold text-lg text-white shadow disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ backgroundColor: "#4f46e5" }}>
        ✍️ Insertar Firma en PDF
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
        <div className="text-5xl mb-3">✍️</div>
        <p className="text-lg font-semibold text-gray-700 mb-1">Arrastra tu PDF aquí</p>
        <p className="text-gray-400 text-sm mb-4">Dibuja tu firma y colócala en el documento</p>
        <button className="btn-primary px-6 py-2 rounded-full font-medium text-sm" type="button">Seleccionar PDF</button>
        <input ref={inputRef} type="file" accept=".pdf,application/pdf" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
      </div>
      {stage === "error" && <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">⚠️ {error}</div>}
    </div>
  );
}
