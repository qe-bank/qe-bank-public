import type { Metadata } from "next";
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
    <html lang="ko" suppressHydrationWarning>
      <body className={`${inter.className} bg-gray-50 dark:bg-black text-gray-900 dark:text-white`}> 
        <AuthProvider> 
          <div className="flex flex-col min-h-screen"> 
            <header className="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-40">
              <nav className="max-w-6xl mx-auto px-4 md:px-6 py-4 flex justify-between items-center">
                <Link href="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400">쏘가리 Q.E.A</Link>
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