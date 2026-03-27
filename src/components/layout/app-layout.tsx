// src/components/layout/app-layout.tsx
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './sidebar';
import { Header } from './header';

export function AppLayout() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <div className="min-h-screen bg-[var(--background)] transition-colors duration-300">
            <Sidebar
                collapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            />

            <div
                className={`transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'pl-[72px]' : 'pl-[280px]'
                    }`}
            >
                <Header />

                <main className="p-8 max-w-[1600px] mx-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
