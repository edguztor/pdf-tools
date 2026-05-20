"use client";

interface AdBannerProps {
  slot?: string;
  format?: "horizontal" | "rectangle" | "vertical";
  className?: string;
}

export default function AdBanner({
  format = "horizontal",
  className = "",
}: AdBannerProps) {
  const sizes = {
    horizontal: "h-24",
    rectangle: "h-64",
    vertical: "h-96",
  };

  return (
    <div
      className={`bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-sm ${sizes[format]} ${className}`}
    >
      [Publicidad — Google AdSense]
      {/*
        Para activar AdSense real, reemplaza este div con:
        <ins
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
          data-ad-slot="XXXXXXXXXX"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      */}
    </div>
  );
}
