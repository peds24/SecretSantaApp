// app/layout.tsx
import type { ReactNode } from 'react';

export const metadata = {
  title: 'Secret Santa',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
