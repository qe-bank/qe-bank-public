import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import 'katex/dist/katex.min.css';
import { Inter } from "next/font/google";
import { AuthProvider } from './AuthContext'; 
import AuthButtons from './components/AuthButtons'; 
import Link from 'next/link';
import Footer from './components/Footer'; 
import ThemeSwitcher from './components/ThemeSwitcher'; 

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "쏘가리 Q.E.A 학생용",
  description: "검정고시 문제은행 서비스",
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" suppressHydrationWarning className="light" data-theme="light">
      <head>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (() => {
                try {
                  const storageKey = 'qe-bank-theme';
                  const saved = localStorage.getItem(storageKey);
                  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                  const theme = saved === 'dark' || saved === 'light' ? saved : (prefersDark ? 'dark' : 'light');
                  const html = document.documentElement;
                  const applyToBody = () => {
                    const body = document.body;
                    if (!body) return false;
                    body.classList.remove('dark', 'light');
                    body.classList.add(theme);
                    body.setAttribute('data-theme', theme);
                    body.style.colorScheme = theme;
                    return true;
                  };

                  html.classList.remove('dark', 'light');
                  html.classList.add(theme);
                  html.setAttribute('data-theme', theme);
                  html.style.colorScheme = theme;

                  if (!applyToBody()) {
                    document.addEventListener('DOMContentLoaded', applyToBody, { once: true });
                  }
                } catch (e) {
                  /* no-op */
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.className} bg-gray-50 dark:bg-black text-gray-900 dark:text-white light`} data-theme="light"> 
        <AuthProvider> 
          <div className="flex flex-col min-h-screen"> 
            <header className="bg-white/90 dark:bg-slate-950/90 backdrop-blur border-b border-gray-200 dark:border-slate-800 shadow-sm sticky top-0 z-40">
              <nav className="max-w-6xl mx-auto px-4 md:px-6 py-4 flex justify-between items-center">
                <Link href="/" className="text-2xl font-bold text-blue-700 dark:text-cyan-300 hover:text-blue-800 dark:hover:text-cyan-200 transition-colors">쏘가리 Q.E.A</Link>
                <div className="flex items-center gap-4">
                  <AuthButtons />
                  <ThemeSwitcher /> 
                </div>
              </nav>
            </header>
            
            <main className="flex-grow"> 
              {children} 
            </main>

            <Footer /> 
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}