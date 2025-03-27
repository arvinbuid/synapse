import type {Metadata} from "next";

import {ClerkProvider} from "@clerk/nextjs";
import {Inter} from "next/font/google";
import "./globals.css";
import {ThemeProvider} from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";

const inter = Inter({subsets: ["latin"]});

export const metadata: Metadata = {
  title: "Synapse",
  description: "Fullstack Social Media Web Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang='en' suppressHydrationWarning>
        <body className={inter.className}>
          <ThemeProvider
            attribute='class'
            defaultTheme='system'
            enableSystem
            disableTransitionOnChange
          >
            <div className='min-h-screen'>
              <Navbar />

              <main className='py-8'>
                {/* Container to center the content */}
                <div className='max-w-7xl mx-auto px-4'>
                  <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
                    <div className='hidden lg:block col-span-3'>Sidebar</div>
                    <div className='lg:col-span-9'>{children}</div>
                  </div>
                </div>
              </main>
            </div>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
