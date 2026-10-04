import AuthProvider from '@/providers/AuthProvider';
import './globals.css';

import { Be_Vietnam_Pro } from 'next/font/google';
import { getThemeStyles } from '@/lib/theme-injector';
import ToastContainer from '@/features/toast/components/ToastContainer';

const beVietnam = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-be-vietnam',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dynamicThemeCSS = getThemeStyles();
  return (
    <html lang="vi" className={beVietnam.className}>
      <head>
        {/* Inject theme từ theme.config.json */}
        <style dangerouslySetInnerHTML={{ __html: dynamicThemeCSS }} />
      </head>
      <body className="antialiased min-h-screen">
        <AuthProvider>
          {children}
          <ToastContainer />
        </AuthProvider>
      </body>
    </html>
  );
}