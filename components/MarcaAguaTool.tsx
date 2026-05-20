"use client";

import { useState, useRef, useCallback } from "react";
import { PDFDocument, rgb, degrees, StandardFonts } from "pdf-lib";

type Stage = "idle" | "configuring" | "processing" | "done" | "error";

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return { r, g, b };
}

export default function MarcaAguaTool() {
  const [stage, setStage] = useState<Stage>("idle");
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState("");
  const [pdfBuffer, setPdfBuffer] = useState<ArrayBuffer | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState(0);
  const [error, setError] = useState("");

  // Config
  const [text, setText] = useState("CONFIDENCIAL");
  const [fontSize, setFontSize] = useState(60);
  const [opacity, setOpacity] = useState(0.2);
  const [angle, setAngle] = useState(45);
  const [color, setColor] = useState("#cc0000");
  const [repeat, setRepeat] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".pdf")) { setError("Selecciona un archivo PDF."); setStage("error"); return; }
    setStage("configuring"); setError(""); setFileName(file.name);
    try {
      const ab = await file.arrayBuffer();
      await PDFDocument.load(ab, { ignoreEncryption: true }); // validate
      setPdfBuffer(ab);
    } catch { setError("No se pudo leer el PDF."); setStage("error"); }
  }, []);

  const handleApply = async () => {
    if (!pdfBuffer || !text.trim()) return;
    setStage("processing");
    try {
      const doc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
      const font = await doc.embedFont(StandardFonts.HelveticaBold);
      const { r, g, b } = hexToRgb(color);

      for (const page of doc.getPages()) {
        const { width, height } = page.getSize();
        const textWidth = font.widthOfTextAtSize(text, fontSize);

        if (repeat) {
          // Grid pattern
          const cols = Math.ceil(width / (textWidth + 80)) + 1;
          const rows = Math.ceil(height / (fontSize + 80)) + 1;
          for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
              page.drawText(text, {
                x: col * (textWidth + 60) - 40,
                y: row * (fontSize + 60) - 40,
                size: fontSize,
                font,
                color: rgb(r, g, b),
                opacity,
                rotate: degrees(angle),
              });
            }
          }
        } else {
          // Centered
          page.drawText(text, {
            x: width / 2 - textWidth / 2,
            y: height / 2 - fontSize / 2,
            size: fontSize,
            font,
            color: rgb(r, g, b),
            opacity,
            rotate: degrees(angle),
          });
        }
      }

      const bytes = await doc.save({ useObjectStreams: true });
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
      setResultSize(blob.size);
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(URL.createObjectURL(blob));
      setStage("done");
    } catch { setError("Error al aplicar la marca de agua."); setStage("configuring"); }
  };

  const reset = () => { setStage("idle"); setPdfBuffer(null); setDownloadUrl(null); setError(""); };

  if (stage === "processing") return (
    <div className="text-center py-14">
      <div className="text-5xl mb-4 animate-pulse">💧</div>
      <p className="text-gray-600 font-medium">Aplicando marca de agua...</p>
    </div>
  );

  if (stage === "done") return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-xl">✅</div>
          <div>
            <p className="font-bold text-gray-900">¡Marca de agua aplicada!</p>
            <p className="text-sm text-gray-400">{formatBytes(resultSize)}</p>
          </div>
        </div>
        <a href={downloadUrl!} download={`marcado_${fileName}`}
          className="block w-full py-3 rounded-xl font-semibold text-center text-white shadow"
          style={{ backgroundColor: "#0891b2" }}>
          ⬇️ Descargar PDF
        </a>
      </div>
      <button onClick={reset} className="w-full py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors">
        Nuevo PDF
      </button>
    </div>
  );

  if (stage === "configuring") return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 bg-cyan-50 border border-cyan-100 rounded-xl p-3">
        <span className="text-2xl">📄</span>
        <div>
          <p className="font-semibold text-gray-800 truncate max-w-xs text-sm">{fileName}</p>
          <p className="text-xs text-gray-400">Configura la marca de agua</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
        {/* Preview */}
        <div className="bg-gray-50 rounded-xl p-4 text-center overflow-hidden" style={{ minHeight: 80 }}>
          <span style={{
            fontSize: Math.min(fontSize, 32),
            color,
            opacity,
            display: "inline-block",
            transform: `rotate(-${angle}deg)`,
            fontWeight: "bold",
            letterSpacing: 2,
          }}>
            {text || "Vista previa"}
          </span>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Texto de la marca</label>
          <input type="text" value={text} onChange={e => setText(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
            placeholder="CONFIDENCIAL, BORRADOR, COPYRIGHT..." />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tamaño: {fontSize}pt</label>
            <input type="range" min={20} max={120} value={fontSize} onChange={e => setFontSize(Number(e.target.value))}
              className="w-full accent-cyan-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Opacidad: {Math.round(opacity * 100)}%</label>
            <input type="range" min={5} max={80} value={Math.round(opacity * 100)} onChange={e => setOpacity(Number(e.target.value) / 100)}
              className="w-full accent-cyan-500" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ángulo: {angle}°</label>
            <input type="range" min={0} max={90} value={angle} onChange={e => setAngle(Number(e.target.value))}
              className="w-full accent-cyan-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
            <input type="color" value={color} onChange={e => setColor(e.target.value)}
              className="w-full h-9 rounded-lg border border-gray-300 cursor-pointer" />
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input type="checkbox" checked={repeat} onChange={e => setRepeat(e.target.checked)} className="w-4 h-4 accent-cyan-500" />
          <span className="text-sm text-gray-700">Repetir en toda la página (patrón)</span>
        </label>
      </div>

      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">⚠️ {error}</div>}

      <button onClick={handleApply} disabled={!text.trim()}
        className="w-full py-4 rounded-xl font-bold text-lg text-white shadow disabled:opacity-40"
        style={{ backgroundColor: "#0891b2" }}>
        💧 Aplicar Marca de Agua
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
        <div className="text-5xl mb-3">💧</div>
        <p className="text-lg font-semibold text-gray-700 mb-1">Arrastra tu PDF aquí</p>
        <p className="text-gray-400 text-sm mb-4">Añade "CONFIDENCIAL", "BORRADOR" o cualquier texto</p>
        <button className="btn-primary px-6 py-2 rounded-full font-medium text-sm" type="button">Seleccionar PDF</button>
        <input ref={inputRef} type="file" accept=".pdf,application/pdf" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
      </div>
      {stage === "error" && <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">⚠️ {error}</div>}
    </div>
  );
}
