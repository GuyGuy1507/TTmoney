'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
// import Navbar from '@/components/Navbar';
// import Sidebar from '@/components/Sidebar';
import '@/globals.css';

export default function RootLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/register';
  // const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isAuthPage) {
    return (
      <html lang="en">
        <body className="bg-light text-dark">
          {children}
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body className="bg-light text-dark">
        <div className="flex h-screen">
          {/* Sidebar - hidden */}
          {/* <div className="hidden w-64 bg-dark text-white">
            <Sidebar />
          </div> */}

          <div className="flex flex-1 flex-col overflow-hidden">
            {/* <Navbar /> */}
            <main className="flex-1 overflow-auto p-6">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
