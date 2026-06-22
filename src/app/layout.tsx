import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Founder OS — Şirketinin Beyni",
  description: "20+ projeyi tek ekranda yöneten komuta merkezi.",
};

export const viewport: Viewport = {
  themeColor: "#fbfbfa",
  width: "device-width",
  initialScale: 1,
};

const themeScript = `
(function(){
  try {
    var s = JSON.parse(localStorage.getItem('founder-os-v2') || '{}');
    var t = (s.state && s.state.theme) || 'light';
    document.documentElement.setAttribute('data-theme', t);
  } catch(e) { document.documentElement.setAttribute('data-theme','light'); }
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
