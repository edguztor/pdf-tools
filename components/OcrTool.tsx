"use client";
import { useState, useRef } from "react";

export default function OcrTool() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [text, setText] = useState<string | null>(null);
  const [lang, setLang] = useState("spa+eng");
  const inputRef = useRef<HTMLInputElement>(null);

  const extract = async () => {
    if (!file) return;
    setLoading(true);
    setText(null);
    setProgress(0);
    try {
      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker(lang, 1, {
        logger: (m: { status: string; progress: number }) => {
          if (m.status === "recognizing text") setProgress(Math.round(m.progress * 100));
        },
      });
      const { data: { text: extracted } } = await worker.recognize(file);
      await worker.terminate();
      setText(extracted.trim());
    } catch (e) {
      setText("Error al procesar. Asegúrate de que la imagen tenga texto legible.");
      console.error(e);
    }
    setLoading(false);
    setProgress(0);
  };

  const copy = () => { if (text) navigator.clipboard.writeText(text); };
  const download = () => {
    if (!text) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
    a.download = `texto_${file?.name ?? "ocr"}.txt`;
    a.click();
  };

  const LANGS = [
    { v: "spa+eng", l: "🇲🇽 Español + Inglés" },
    { v: "spa",     l: "🇲🇽 Solo Español" },
    { v: "eng",     l: "🇺🇸 Solo Inglés" },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-700">
        🔍 Extrae texto de imágenes, capturas de pantalla o fotografías de documentos. Funciona 100% en tu navegador.
      </div>

      <div>
        <label className="text-sm font-semibold text-gray-700 block mb-2">Idioma del texto</label>
        <div className="flex gap-2 flex-wrap">
          {LANGS.map(l => (
            <button key={l.v} onClick={() => setLang(l.v)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-colors ${lang === l.v ? "border-red-500 bg-red-50 text-red-700" : "border-gray-200 text-gray-500"}`}>
              {l.l}
            </button>
          ))}
        </div>
      </div>

      {!file ? (
        <div className="drop-zone rounded-2xl p-10 text-center cursor-pointer"
          onClick={() => inputRef.current?.click()}>
          <div className="text-5xl mb-3">🔍</div>
          <p className="text-lg font-semibold text-gray-700 mb-1">Arrastra tu imagen aquí</p>
          <p className="text-gray-400 text-sm mb-4">JPG, PNG, WebP, BMP — con texto legible</p>
          <button className="btn-primary px-6 py-2 rounded-full font-medium text-sm" type="button">
            Seleccionar imagen
          </button>
          <input ref={inputRef} type="file" accept="image/*" className="hidden"
            onChange={e => { if (e.target.files?.[0]) { setFile(e.target.files[0]); setText(null); } }} />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
            <span className="text-2xl">🖼️</span>
            <p className="font-medium text-gray-800 text-sm truncate flex-1">{file.name}</p>
            <button onClick={() => { setFile(null); setText(null); }} className="text-gray-400 hover:text-red-500">✕</button>
          </div>

          {loading && (
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex justify-between text-sm text-blue-700 font-medium mb-2">
                <span>Extrayendo texto...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {!loading && (
            <button onClick={extract} className="btn-primary w-full py-3 rounded-xl font-bold">
              🔍 Extraer texto
            </button>
          )}

          {text && (
            <div className="space-y-3">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm font-semibold text-gray-700">Texto extraído</p>
                  <span className="text-xs text-gray-400">{text.length} caracteres</span>
                </div>
                <textarea
                  className="w-full text-sm text-gray-800 bg-transparent resize-y min-h-[200px] outline-none"
                  value={text}
                  onChange={e => setText(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <button onClick={copy} className="btn-primary flex-1 py-2 rounded-xl font-medium text-sm">
                  📋 Copiar texto
                </button>
                <button onClick={download} className="flex-1 py-2 rounded-xl font-medium text-sm border-2 border-red-300 text-red-700 hover:bg-red-50">
                  ⬇️ Descargar .txt
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
