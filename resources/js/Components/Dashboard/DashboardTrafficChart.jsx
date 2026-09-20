import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from 'recharts';

export default function DashboardTrafficChart({ isAdmin, chartData = [] }) {
    return (
        <div className="overflow-hidden rounded-[28px] border border-slate-100/90 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-[#161b24] lg:col-span-2">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="font-heading text-lg font-bold text-slate-900 dark:text-white">
                        {isAdmin ? 'Tráfico Global de la Plataforma' : 'Actividad y Tráfico de Visitas'}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Telemetría cookieless en los últimos 7 días.
                    </p>
                </div>
            </div>

            <div className="mt-6 h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--brand-primary, #2787F5)" stopOpacity={0.25} />
                                <stop offset="95%" stopColor="var(--brand-primary, #2787F5)" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
                        <XAxis
                            dataKey="day"
                            stroke="#94a3b8"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#94a3b8"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            allowDecimals={false}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#161b24',
                                borderColor: '#334155',
                                borderRadius: '16px',
                                color: '#ffffff',
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="views"
                            name="Visitas"
                            stroke="var(--brand-primary, #2787F5)"
                            strokeWidth={2.5}
                            fillOpacity={1}
                            fill="url(#viewsGrad)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

