import "./globals.css";
import Sidebar from "./Sidebar";
import { Inter } from "next/font/google"; // 1. Importa a fonte

// 2. Configura a fonte (latin é para português)
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Minha Plataforma",
  description: "Plataforma de estudos",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br">
      {/* 3. Aplica a fonte aqui no body usando inter.className */}
      <body className={`${inter.className} bg-slate-50 text-slate-900`}>

        <div className="flex min-h-screen">

          <Sidebar />

          <main className="flex-1 p-10 overflow-y-auto">
            {children}
          </main>

        </div>

      </body>
    </html>
  );
}