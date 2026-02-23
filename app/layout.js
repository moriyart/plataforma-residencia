import "./globals.css";
import Sidebar from "./Sidebar";
import { Inter } from "next/font/google";
import { ClerkProvider, SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Minha Plataforma",
  description: "Plataforma de estudos",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="pt-br">
        <body className={`${inter.className} bg-slate-50 text-slate-900`}>
          
          {/* Caso o usuário NÃO esteja logado */}
          <SignedOut>
            <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6">
              <h1 className="text-3xl font-black text-violet-600 mb-4 tracking-tighter">ESTUDOS CONCURSO</h1>
              <p className="text-slate-500 mb-8 font-medium">Faça login para acessar sua plataforma.</p>
              <SignInButton mode="modal">
                <button className="bg-violet-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-violet-700 transition-all shadow-lg shadow-violet-200">
                  Entrar na Plataforma
                </button>
              </SignInButton>
            </div>
          </SignedOut>

          {/* Caso o usuário ESTEJA logado */}
          <SignedIn>
            <div className="flex min-h-screen">
              {/* Sidebar fixa na esquerda */}
              <Sidebar />

              <div className="flex-1 flex flex-col">
                {/* Header superior com botão de perfil */}
                <header className="flex justify-end items-center p-4 bg-white/50 backdrop-blur-md border-b border-slate-100 sticky top-0 z-10">
                  <UserButton afterSignOutUrl="/" />
                </header>

                <main className="flex-1 p-6 md:p-10 overflow-y-auto">
                  {children}
                </main>
              </div>
            </div>
          </SignedIn>

        </body>
      </html>
    </ClerkProvider>
  );
}
