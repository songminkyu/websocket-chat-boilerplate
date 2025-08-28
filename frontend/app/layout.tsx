import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#3b82f6',
};

export const metadata: Metadata = {
  title: 'WebSocket Chat Platform',
  description: 'Real-time chat platform with WebSocket/STOMP protocol support',
  keywords: ['chat', 'websocket', 'stomp', 'real-time', 'messaging'],
  authors: [{ name: 'System Architecture Team' }],
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
  },
};

/**
 * Root layout component for the chat application
 * 
 * Features:
 * - Responsive design with proper viewport configuration
 * - Font optimization with Inter typeface
 * - Global CSS and Tailwind setup
 * - SEO and accessibility optimizations
 * - PWA support preparation
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* Preconnect to optimize font loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        
        {/* DNS prefetch for backend connections */}
        <link rel="dns-prefetch" href="//localhost:3001" />
      </head>
      <body 
        className={`
          ${inter.className} 
          min-h-screen bg-secondary-50 text-secondary-900 antialiased
          selection:bg-primary-100 selection:text-primary-900
        `}
        suppressHydrationWarning={true}
      >
        {/* Skip to main content link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 z-50 px-4 py-2 bg-primary-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          Skip to main content
        </a>

        {/* Main application */}
        <main id="main-content" className="min-h-screen">
          {children}
        </main>

        {/* Development indicators */}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed bottom-2 left-2 px-2 py-1 bg-warning-500 text-warning-50 text-xs rounded-md font-mono z-50">
            DEV
          </div>
        )}
      </body>
    </html>
  );
}