"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {

  const pathname = usePathname();

  function linkClass(path) {
    return `
      p-3 rounded-xl cursor-pointer transition-all
      ${pathname === path
        ? "bg-purple-600 text-white shadow-lg"
        : "hover:bg-purple-700/40 text-purple-100"}
    `;
  }

  return (
    <div className="w-64 bg-gradient-to-b from-purple-700 to-purple-900 text-white p-6">

      <h1 className="text-2xl font-bold mb-8">
        Minha Plataforma
      </h1>

      <ul className="space-y-3">

        <Link href="/">
          <li className={linkClass("/")}>
            Dashboard
          </li>
        </Link>

        <Link href="/cronograma">
          <li className={linkClass("/cronograma")}>
            Cronograma
          </li>
        </Link>

        <Link href="/progresso">
          <li className={linkClass("/progresso")}>
            Progresso
          </li>
        </Link>

        <Link href="/calendario">
          <li className={linkClass("/calendario")}>
            Calendário
          </li>
        </Link>

      </ul>

    </div>
  );
}