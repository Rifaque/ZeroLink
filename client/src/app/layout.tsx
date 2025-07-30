import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'ZeroLink',
  description: 'ZeroLink is a private real-time chat app built with modern web technologies like Next.js, Firebase, and WebSockets.',
  applicationName: 'ZeroLink',
  generator: 'Next.js',
  keywords: ['ZeroLink', 'chat app', 'real-time messaging', 'Next.js', 'WebSocket', 'Firebase', 'private chat', 'MERN', 'ZeroLink chat'],
  authors: [{ name: 'Rifaque Ahmed', url: 'https://github.com/Rifaque' }],
  creator: 'Rifaque Ahmed',
  publisher: 'Hub Zero',
  metadataBase: new URL('https://zerolink.hubzero.in'),

  openGraph: {
    title: 'ZeroLink – Real-Time Private Chat',
    description: 'A sleek and secure real-time chat app powered by Firebase and WebSockets.',
    url: 'https://zerolink.hubzero.in',
    siteName: 'ZeroLink',
    images: [
      {
        url: 'https://zerolink.hubzero.in/icons/icon-512.png', // Customize to match your actual OG image
        width: 512,
        height: 512,
        alt: 'ZeroLink Chat',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'ZeroLink – Real-Time Chat',
    description: 'A sleek and secure real-time chat app powered by Firebase and WebSockets.',
    creator: '@RifaqueRS',
    images: ['https://zerolink.hubzero.in/preview.png'],
  },

  robots: {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    'max-video-preview': -1,
    'max-image-preview': 'large',
    'max-snippet': -1,
  },
},


  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },

  manifest: '/site.webmanifest',
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
