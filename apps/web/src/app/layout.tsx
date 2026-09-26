import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '../components/providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata = {
  title: 'Prolific Store',
  description: 'A technology-driven skincare marketplace and beauty ecosystem.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} data-scroll-behavior="smooth">
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}