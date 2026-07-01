// app/layout.tsx
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Simulador de Concursos - Questões com IA',
  description: 'Prepare-se para concursos públicos com questões geradas por inteligência artificial. Simulados completos, gabaritos comentados e análise de desempenho.',
  keywords: ['concursos', 'simulador', 'questões', 'IA', 'estudos'],
  openGraph: {
    title: 'Simulador de Concursos - Questões com IA',
    description: 'Prepare-se com questões geradas por inteligência artificial',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#0F2F5B',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className="bg-white dark:bg-slate-900">
      <body className={`${inter.className} min-h-screen antialiased bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-50 transition-colors`}>
        {children}
      </body>
    </html>
  );
}
