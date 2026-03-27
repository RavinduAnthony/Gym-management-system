// src/features/dashboard/pages/dashboard-page.tsx
import { 
    Users, 
    CalendarCheck, 
    DollarSign, 
    Flame,
    TrendingUp,
    Zap
} from 'lucide-react';
import { useAuthStore } from '@/core/auth';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { AttendanceHeatmap } from '../components/AttendanceHeatmap';
import { StatCounter } from '@/components/ui/StatCounter';
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer 
} from 'recharts';
import { motion } from 'framer-motion';
import React from 'react';

const dummyData = [
    { name: 'Mon', revenue: 4000 },
    { name: 'Tue', revenue: 3000 },
    { name: 'Wed', revenue: 5000 },
    { name: 'Thu', revenue: 2780 },
    { name: 'Fri', revenue: 6890 },
    { name: 'Sat', revenue: 8390 },
    { name: 'Sun', revenue: 3490 },
];

export function DashboardPage() {
    const user = useAuthStore((s) => s.user);

    const stats = [
        { label: 'Total Athletes', value: 2482, icon: <Users />, trend: '+12%', color: 'var(--secondary)', suffix: '' },
        { label: 'Tactical Checks', value: 142, icon: <CalendarCheck />, trend: '+5%', color: 'var(--secondary)', suffix: '' },
        { label: 'Core Streak', value: 12, icon: <Flame />, trend: 'HOT', color: 'var(--primary)', suffix: ' Days' },
        { label: 'Capital Revenue', value: 12450, icon: <DollarSign />, trend: '+15%', color: 'var(--secondary)', prefix: '$' },
    ];

    return (
        <div className="space-y-8 py-8 animate-in fade-in duration-700">
            {/* SaaS Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 pt-2">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <div className="flex items-center gap-2 mb-3">
                         <div className="h-1.5 w-1.5 rounded-full bg-[var(--primary)] shadow-[0_0_8px_var(--primary)]" />
                         <span className="text-[var(--primary)] text-[10px] font-black uppercase tracking-[0.3em]">IronCore Management Center</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-display font-black text-white uppercase tracking-tighter leading-none">
                        Welcome, <span className="text-white opacity-80">{user?.firstName || 'Admin'}</span>
                    </h1>
                </motion.div>
                
                <div className="flex gap-4">
                    <Badge variant="success" className="h-11 px-6 text-[10px] font-black uppercase tracking-widest bg-[var(--surface-alt)] border-[var(--border)] text-[var(--success)] shadow-xl">
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse mr-3 shadow-[0_0_10px_var(--success)]" />
                        System Link Active
                    </Badge>
                </div>
            </div>

            {/* Premium Metric Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                    >
                        <Card className="p-7 border-[var(--border)] bg-[var(--surface)] shadow-2xl group relative overflow-hidden h-full premium-card" hover={false}>
                             <div className="flex justify-between items-start mb-8">
                                <div className="p-3 rounded-xl bg-[var(--surface-alt)] text-[var(--text-secondary)] group-hover:text-[var(--primary)] group-hover:bg-[var(--primary-light)] transition-all duration-300">
                                    {React.cloneElement(stat.icon as React.ReactElement, { size: 24, strokeWidth: 2.5 } as any)}
                                </div>
                                <div className="text-[9px] font-black text-[var(--success)] uppercase tracking-widest bg-[var(--success)]/5 px-2.5 py-1 rounded-full border border-[var(--success)]/20 shadow-sm">
                                    {stat.trend}
                                </div>
                             </div>
                             <div className="relative z-10">
                                <p className="text-[var(--text-tertiary)] text-[10px] font-black uppercase tracking-[0.2em] mb-2">{stat.label}</p>
                                <div className="text-4xl font-display font-black text-white leading-none tracking-tighter flex items-center gap-1">
                                    <StatCounter value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                                </div>
                             </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Intelligence Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="lg:col-span-2"
                >
                    <Card className="h-full border-[var(--border)] bg-[var(--surface)] p-8 shadow-2xl" hover={false}>
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
                            <div>
                                <h3 className="text-xl font-display font-black uppercase tracking-tighter text-white flex items-center gap-3">
                                    <TrendingUp className="w-6 h-6 text-[var(--secondary)]" /> FINANCIAL VELOCITY
                                </h3>
                                <p className="text-[9px] text-[var(--text-tertiary)] font-black uppercase tracking-[0.2em] mt-2">Analytical insights & capital growth</p>
                            </div>
                            <div className="flex bg-[var(--surface-alt)] p-1 rounded-xl border border-[var(--border)]">
                                <button className="px-5 py-2 text-[9px] font-black uppercase rounded-lg bg-[var(--secondary)] text-white shadow-lg">Daily</button>
                                <button className="px-5 py-2 text-[9px] font-black uppercase rounded-lg text-[var(--text-tertiary)] hover:text-white transition-colors">Monthly</button>
                            </div>
                        </div>
                        
                        <div className="h-[340px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={dummyData}>
                                    <defs>
                                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--secondary)" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="var(--secondary)" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.2} />
                                    <XAxis 
                                        dataKey="name" 
                                        stroke="var(--text-tertiary)" 
                                        fontSize={10} 
                                        fontWeight="900"
                                        tickLine={false} 
                                        axisLine={false}
                                        dy={15}
                                    />
                                    <YAxis 
                                        stroke="var(--text-tertiary)" 
                                        fontSize={10} 
                                        fontWeight="900"
                                        tickLine={false} 
                                        axisLine={false}
                                        tickFormatter={(val) => `$${val/1000}k`}
                                    />
                                    <Tooltip 
                                        cursor={{ stroke: 'var(--border)', strokeWidth: 1 }}
                                        contentStyle={{ 
                                            backgroundColor: 'var(--surface-alt)', 
                                            borderRadius: '12px', 
                                            border: '1px solid var(--border)',
                                            boxShadow: 'var(--shadow-card)',
                                            fontFamily: 'Inter',
                                            padding: '12px 16px'
                                        }}
                                        itemStyle={{ fontWeight: '900', color: 'var(--secondary)', textTransform: 'uppercase', fontSize: '10px' }}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="revenue" 
                                        stroke="var(--secondary)" 
                                        strokeWidth={4}
                                        fillOpacity={1} 
                                        fill="url(#colorRev)" 
                                        activeDot={{ r: 6, strokeWidth: 2, stroke: 'var(--surface)', fill: 'var(--secondary)' }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </motion.div>

                {/* Performance Analytics Column */}
                <div className="space-y-8 flex flex-col">
                    <AttendanceHeatmap />
                    
                    <Card className="flex-1 bg-[var(--surface)] border-[var(--border)] shadow-2xl relative overflow-hidden group p-8 premium-card">
                        <div className="relative z-10 flex flex-col h-full">
                            <h3 className="font-display font-black text-xl text-white uppercase tracking-tighter mb-8 flex items-center gap-3">
                                <Zap className="w-5 h-5 text-[var(--primary)]" /> STREAK ANALYTICS
                            </h3>
                            <div className="flex flex-col items-center justify-center flex-1 py-10">
                                <div className="text-8xl font-display font-black text-white leading-none relative">
                                    <StatCounter value={12} />
                                    <motion.div 
                                        animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.1, 0.05] }}
                                        transition={{ repeat: Infinity, duration: 4 }}
                                        className="absolute inset-0 bg-[var(--primary)] rounded-full blur-3xl -z-10"
                                    />
                                </div>
                                <div className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.3em] mt-6 text-center leading-relaxed">
                                    Facility Momentum: <br /> <span className="text-white">12 ACTIVE CYCLES</span>
                                </div>
                            </div>
                            
                            <div className="mt-8 pt-6 border-t border-[var(--border)]">
                                <div className="flex justify-between text-[9px] font-black uppercase text-[var(--text-tertiary)] tracking-widest mb-3">
                                    <span>Active Output</span>
                                    <span className="text-[var(--primary)]">MAXIMUM</span>
                                </div>
                                <div className="flex gap-1.5 h-1">
                                    {[1,1,1,1,1,1,1].map((v, i) => (
                                        <div 
                                            key={i} 
                                            className={`flex-1 rounded-full ${v ? 'bg-[var(--primary)]' : 'bg-[var(--surface-alt)]'}`} 
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
