import './globals.css';

import { Analytics } from '@vercel/analytics/react';

export const metadata = {
  title: 'Tournado',
  description:
    'A user admin dashboard configured with Next.js, Postgres, NextAuth, Tailwind CSS, TypeScript, and Prettier.'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Brackets Viewer CDN */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/brackets-viewer@latest/dist/brackets-viewer.min.css"
        />
        <script
          src="https://cdn.jsdelivr.net/npm/brackets-viewer@latest/dist/brackets-viewer.min.js"
          defer
        ></script>
      </head>
      <body className="flex min-h-screen w-full flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
