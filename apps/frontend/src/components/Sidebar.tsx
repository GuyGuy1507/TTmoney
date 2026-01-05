'use client';

import { FiHome, FiTrendingUp, FiSettings, FiLogOut, FiTarget, FiDollarSign } from 'react-icons/fi';
import Link from 'next/link';

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const menuItems = [
    { name: 'Dashboard', icon: FiHome, href: '/' },
    { name: 'Incomes', icon: FiDollarSign, href: '/incomes' },
    { name: 'Expenses', icon: FiTrendingUp, href: '/expenses' },
    { name: 'Analytics', icon: FiTrendingUp, href: '/analytics' },
    { name: 'Goals', icon: FiTarget, href: '/goals' },
    { name: 'Settings', icon: FiSettings, href: '/settings' },
  ];

  const handleClose = () => {
    if (onClose) onClose();
  };

  return (
    <aside className="bg-dark text-white flex flex-col h-full">
      <div className="p-6 font-bold text-xl border-b border-gray-700 flex justify-between items-center">
        💰 ExpenseApp
        <button onClick={handleClose} className="p-2 rounded-full hover:bg-gray-700 focus:outline-none focus:ring lg:hidden">
          ✕
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <item.icon size={20} />
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors">
          <FiLogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
