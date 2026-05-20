import type { Metadata } from "next";
import Script from "next/script";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "PDFGratis - Herramientas PDF Online y Gratuitas",
  description:
    "Comprime, fusiona y divide PDFs gratis online. Sin registro, sin límites. Procesa tus archivos directamente en tu navegador.",
  keywords: "comprimir pdf, fusionar pdf, dividir pdf, borrar paginas pdf, rotar pdf, marca de agua pdf, pdf a imagen, firmar pdf gratis",
  openGraph: {
    title: "PDFGratis - Herramientas PDF Online",
    description: "Comprime, fusiona y divide PDFs gratis. Sin registro.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="h-full">
      <head>
        {/* Google AdSense */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8285676413297966"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
              <span className="text-red-600 text-2xl">📄</span>
              <span style={{ color: "var(--primary)" }}>PDF</span>
              <span className="text-gray-800">Gratis</span>
            </Link>
            <nav className="hidden md:flex items-center gap-4 text-sm font-medium text-gray-600">
              <Link href="/comprimir"   className="hover:text-red-600 transition-colors">Comprimir</Link>
              <Link href="/fusionar"    className="hover:text-red-600 transition-colors">Fusionar</Link>
              <Link href="/dividir"     className="hover:text-red-600 transition-colors">Dividir</Link>
              <Link href="/borrar"      className="hover:text-red-600 transition-colors">Borrar</Link>
              <Link href="/rotar"       className="hover:text-red-600 transition-colors">Rotar</Link>
              <Link href="/marca-agua"  className="hover:text-red-600 transition-colors">Marca agua</Link>
              <Link href="/pdf-a-imagen" className="hover:text-red-600 transition-colors">PDF→Imagen</Link>
              <Link href="/firmar"      className="hover:text-red-600 transition-colors">Firmar</Link>
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="bg-gray-800 text-gray-300 py-8 mt-12">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <p className="font-semibold text-white">PDFGratis</p>
                <p className="text-sm text-gray-400">
                  Herramientas PDF 100% gratuitas. Tu privacidad protegida — los archivos se procesan en tu navegador.
                </p>
              </div>
              <div className="flex flex-wrap gap-4 text-sm">
                <Link href="/comprimir"    className="hover:text-white transition-colors">Comprimir</Link>
                <Link href="/fusionar"     className="hover:text-white transition-colors">Fusionar</Link>
                <Link href="/dividir"      className="hover:text-white transition-colors">Dividir</Link>
                <Link href="/borrar"       className="hover:text-white transition-colors">Borrar páginas</Link>
                <Link href="/rotar"        className="hover:text-white transition-colors">Rotar</Link>
                <Link href="/marca-agua"   className="hover:text-white transition-colors">Marca de agua</Link>
                <Link href="/pdf-a-imagen" className="hover:text-white transition-colors">PDF a Imagen</Link>
                <Link href="/firmar"       className="hover:text-white transition-colors">Firmar</Link>
              </div>
            </div>
            <div className="border-t border-gray-700 mt-6 pt-6 text-center text-sm text-gray-500">
              © {new Date().getFullYear()} PDFGratis. Todos los derechos reservados.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
