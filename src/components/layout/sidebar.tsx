// src/components/layout/sidebar.tsx
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, LayoutDashboard, Activity } from 'lucide-react';
import { NAV_CONFIG } from '@/core/constants/nav-config';
import { useAuthStore } from '@/core/auth';
import { usePermissions } from '@/core/permissions';
import { IronCoreLogo } from '../branding/IronCoreLogo';
import { motion } from 'framer-motion';

interface SidebarProps {
    collapsed: boolean;
    onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
    const user = useAuthStore((s) => s.user);
    const { canDo } = usePermissions();
    const location = useLocation();

    const visibleItems = NAV_CONFIG.filter(
        (item) => user && item.roles.includes(user.role) && (!item.viewPermission || canDo(item.viewPermission))
    );

    return (
        <aside
            className={`
        fixed left-0 top-0 z-40 h-screen
        bg-[var(--background)] text-[var(--text-secondary)]
        border-r border-[var(--border)]
        transition-all duration-300 ease-in-out
        flex flex-col shadow-2xl
        ${collapsed ? 'w-[80px]' : 'w-[280px]'}
      `}
        >
            {/* Logo area - Premium Header */}
            <div className={`flex items-center h-20 px-8 border-b border-[var(--border)] ${collapsed ? 'justify-center px-0' : ''}`}>
               <IronCoreLogo iconOnly={collapsed} className="transition-all duration-300 scale-90 origin-left" />
            </div>

            {/* Navigation - SaaS Interface */}
            <nav className="flex-1 overflow-y-auto py-8 px-4 custom-scrollbar">
                <div className={`mb-6 px-4 ${collapsed ? 'hidden' : 'block'}`}>
                    <span className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.3em]">
                        CORE OPERATIONS
                    </span>
                </div>
                <ul className="space-y-1.5">
                    {visibleItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <li key={item.path}>
                                <NavLink
                                    to={item.path}
                                    className={`group relative flex items-center gap-4 px-4 py-3.5 rounded-xl text-[11px] font-bold uppercase tracking-[0.15em] transition-all duration-200
                                        ${isActive
                                            ? 'bg-[var(--surface)] text-white border border-[var(--border-strong)] shadow-lg'
                                            : 'hover:bg-[var(--surface-alt)] hover:text-white border border-transparent hover:border-[var(--border)]'
                                        }
                                        ${collapsed ? 'justify-center px-0 mx-auto w-12 h-12' : ''}
                                    `}
                                    title={collapsed ? item.label : undefined}
                                >
                                    <item.icon className={`w-5 h-5 shrink-0 transition-all duration-200 ${isActive ? 'text-[var(--primary)] scale-110' : 'text-[var(--text-secondary)] group-hover:text-white'}`} />
                                    {!collapsed && (
                                        <span className={`transition-opacity duration-200 ${isActive ? 'opacity-100' : 'opacity-80 group-hover:opacity-100'}`}>
                                            {item.label}
                                        </span>
                                    )}
                                    
                                    {/* Active Indicator Bar */}
                                    {isActive && (
                                        <motion.div 
                                            layoutId="activeIndicator"
                                            className="absolute left-0 w-1 h-6 bg-[var(--primary)] rounded-r-full shadow-[0_0_12px_var(--primary)]"
                                        />
                                    )}
                                </NavLink>
                            </li>
                        );
                    })}
                </ul>

                {/* Tactical Stats Section */}
                {!collapsed && (
                    <div className="mt-12 px-2">
                        <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border-strong)]/50 group hover:border-[var(--secondary)]/30 transition-all cursor-default">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <Activity className="w-4 h-4 text-[var(--secondary)]" />
                                    <span className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-[0.2em]">Operational Pulse</span>
                                </div>
                                <div className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse" />
                            </div>
                            <div className="space-y-3">
                                <div className="h-1 bg-[var(--surface-alt)] rounded-full overflow-hidden">
                                     <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: '85%' }}
                                        className="h-full bg-gradient-to-r from-[var(--secondary)] to-[var(--primary)]" 
                                     />
                                </div>
                                <div className="flex justify-between text-[9px] font-black text-[var(--text-tertiary)] uppercase tracking-widest">
                                    <span>CAPACITY</span>
                                    <span className="text-[var(--text-primary)]">85% OPTIMIZED</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </nav>

            {/* Footer - Hub Control */}
            <div className="p-6 border-t border-[var(--border)] bg-[var(--background)]">
                <button
                    onClick={onToggle}
                    className="w-full h-12 flex items-center justify-center rounded-xl
            text-[var(--text-tertiary)] bg-[var(--surface-alt)] border border-[var(--border)] hover:border-[var(--primary)]/50 hover:text-white
            transition-all duration-300 group relative overflow-hidden"
                >
                    {collapsed ? (
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                    ) : (
                        <div className="flex items-center gap-3 w-full px-4 justify-between">
                           <LayoutDashboard className="w-4 h-4 text-[var(--primary)]" />
                           <span className="text-[9px] font-black uppercase tracking-[0.2em] whitespace-nowrap">MINIMIZE INTERFACE</span>
                           <ChevronLeft className="w-4 h-4 text-[var(--text-tertiary)]" />
                        </div>
                    )}
                </button>
            </div>
        </aside>
    );
}
