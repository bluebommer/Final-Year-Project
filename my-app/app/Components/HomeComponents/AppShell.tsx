// Components/HomeComponents/AppShell.tsx
//
// Shared Navbar + Sidebar shell for every real app route (Home, Discover,
// Library, History, Settings). Owns the mobile/tablet drawer-open state so
// Navbar's hamburger button and Sidebar's off-canvas behavior can coordinate
// without a page-specific wiring — each page just wraps its own <main> in
// this instead of hand-rolling the Navbar/Sidebar boilerplate.
'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import styles from './styles/AppShell.module.css';

const Navbar = dynamic(() => import('./Navbar'));
const Sidebar = dynamic(() => import('./SideBar'));

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={styles.pageRoot}>
      <Navbar onMenuClick={() => setSidebarOpen(true)} />
      <div className={styles.pageBody}>
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        {children}
      </div>
    </div>
  );
}
