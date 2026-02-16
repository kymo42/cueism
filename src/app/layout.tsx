import type { Metadata } from 'next';
import './globals.css';
import ClientLayout from './client-layout';

export const metadata: Metadata = {
  title: {
    default: 'cueism — Custom 3D-Printed Billiard Accessories',
    template: '%s | cueism',
  },
  description:
    'Providing robust and good-quality billiard accessories, striving to both innovate for and service the needs of the average but discerning cue-based enthusiasts. Made in Australia.',
  keywords: ['billiards', 'pool', 'cue sports', 'accessories', '3D printed', 'chalk holder', 'Australia'],
  openGraph: {
    title: 'cueism — Custom 3D-Printed Billiard Accessories',
    description:
      'Crafting custom 3D-printed billiard gear for every player. Made by humans in Australia.',
    url: 'https://cueism.com',
    siteName: 'cueism',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
