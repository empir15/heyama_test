import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Heyama - Gestionnaire d'Objets en Temps Réel",
  description:
    "Application de gestion d'objets avec synchronisation Socket.IO, stockage S3 et MongoDB",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark">
      <body className="font-sans antialiased">
        {children}
        <Toaster
          position="top-right"
          richColors
          closeButton
          theme="dark"
          toastOptions={{
            duration: 4000,
          }}
        />
      </body>
    </html>
  );
}
