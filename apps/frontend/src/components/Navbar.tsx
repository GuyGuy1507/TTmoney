'use client';

import { useState } from 'react';
import { FiLogOut, FiUser } from 'react-icons/fi';
import useAuthStore from '@/store/authStore';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter();
  const user = useAuthStore((state: any) => state.user);
  const logout = useAuthStore((state: any) => state.logout);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-4 md:px-6 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="text-lg font-semibold text-gray-800 truncate">TTMoney</div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg flex items-center"
          >
            <FiUser size={20} />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <div className="px-4 py-3 border-b border-gray-200">
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 flex items-center space-x-2"
              >
                <FiLogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
