import type { Metadata, Viewport } from 'next';
import { AuthProvider } from '@/lib/auth-context';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'FitoGramme — Coach & Nutrition Platform',
    template: '%s | FitoGramme',
  },
  description:
    'FitoGramme est une plateforme d\'assistance IA pour coachs sportifs, nutritionnistes et clients. Suivi des repas en darija, recommandations personnalisées et programmes d\'entraînement.',
  keywords: ['fitness', 'nutrition', 'coach', 'tunisie', 'darija', 'programme', 'repas'],
  authors: [{ name: 'FitoGramme Team' }],
  robots: 'index, follow',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Cairo:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
