'use client';

import { useEffect, useState } from 'react';

import {
  ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell,
} from 'recharts';

import { CircleDollarSign, ShoppingCart, Clock3, UserCheck,  UserPlus, ClipboardCheck, Package, Tag, Users as UsersIcon } from 'lucide-react';

import { useAuthStore } from '../../store/auth-store';

import { getAdminStats, getAnalytics, type AdminStats, type AnalyticsData, getAdminCustomers } from '../../lib/admin';

import Link from 'next/link';


function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatNaira(value: number) {
  return `₦${value.toLocaleString()}`;
}



export default function AdminOverviewPage() {
  const accessToken = useAuthStore((s) => s.accessToken);

const [stats, setStats] = useState<AdminStats | null>(null);
const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

const [recentCustomers, setRecentCustomers] = useState<
  { firstName: string; lastName: string; createdAt: string }[]
>([]);

useEffect(() => {
  getAdminStats(accessToken)
    .then(setStats)
    .catch(() => {});

  getAnalytics(accessToken)
    .then(setAnalytics)
    .catch(() => {});
}, [accessToken]);

useEffect(() => {
  getAdminCustomers(accessToken)
    .then((customers) => {
      setRecentCustomers(customers.slice(0, 5));
    })
    .catch(() => {});
}, [accessToken]);

if (!stats) return <p className="text-slate-500">Loading...</p>;


  const cards = [
    { label: 'Total Revenue', value: formatNaira(stats.totalRevenue), icon: CircleDollarSign, tone: 'bg-violet-100 text-violet-600' },
    { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingCart, tone: 'bg-indigo-100 text-indigo-600' },
    { label: 'Pending Orders', value: stats.pendingOrders, icon: Clock3, tone: 'bg-amber-100 text-amber-600' },
    { label: 'Active Customers', value: stats.totalCustomers, icon: UserCheck, tone: 'bg-sky-100 text-sky-600' },
  ];

    const orderStatusData = [
    { name: 'Delivered', value: stats.deliveredOrders, color: '#10b981' },
    { name: 'Shipped', value: stats.shippedOrders, color: '#38bdf8' },
    { name: 'Processing', value: stats.processingOrders, color: '#f59e0b' },
    { name: 'Paid', value: stats.paidOrders, color: '#8b5cf6' },
    { name: 'Pending', value: stats.pendingOrders, color: '#94a3b8' },
    { name: 'Cancelled', value: stats.cancelledOrders, color: '#ef4444' },
  ].filter((s) => s.value > 0);

  const totalRevenueTop = (analytics?.topCategories ?? []).reduce((s, c) => s + c.value, 0) || 1;
  const totalBrandRevenue = (analytics?.topBrands ?? []).reduce((s, b) => s + b.value, 0) || 1;

    const activityFeed = [
    ...stats.recentOrders.map((o) => ({
      type: 'order' as const,
      title: `New order #${o.id.slice(0, 8).toUpperCase()}`,
      subtitle: `${o.user.firstName} ${o.user.lastName} — ₦${Number(o.total).toLocaleString()}`,
      timestamp: o.createdAt,
    })),
    ...recentCustomers.map((c) => ({
      type: 'customer' as const,
      title: 'New customer',
      subtitle: `${c.firstName} ${c.lastName}`,
      timestamp: c.createdAt,
    })),
  ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 6);

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">{getGreeting()}, Admin 👋</h1>
          <p className="mt-1 text-sm text-slate-500">Here&apos;s what&apos;s happening at Prolific Store today.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-full ${c.tone}`}>
                <c.icon size={17} />
              </div>
              <span className="text-xs font-medium text-slate-500">{c.label}</span>
            </div>
            <p className="mt-2.5 text-xl font-bold text-slate-900">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Marketplace Performance</h2>
            <div className="flex items-center gap-4 text-[10px] text-slate-500">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-violet-600" />Revenue</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-sky-400" />Orders</span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={analytics?.revenueByDay ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f4" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(d) => d.slice(5)} />
                <YAxis yAxisId="left" tick={{ fontSize: 10 }} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip formatter={(value, name) => (name === 'revenue' ? formatNaira(Number(value)) : value)} />
                <Bar yAxisId="left" dataKey="revenue" fill="#7c3aed" radius={[4, 4, 0, 0]} barSize={18} />
                <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#38bdf8" strokeWidth={2.5} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-2 text-sm font-bold text-slate-900">Order Status</h2>
          <div className="flex items-center gap-5">
            <div className="relative h-32 w-32 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={orderStatusData} dataKey="value" nameKey="name" innerRadius={40} outerRadius={62} strokeWidth={0}>
                    {orderStatusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-base font-bold text-slate-900">{stats.totalOrders}</span>
                <span className="text-[9px] text-slate-400">Total Orders</span>
              </div>
            </div>
            <div className="flex-1 space-y-2.5">
              {orderStatusData.map((s) => (
                <div key={s.name} className="flex items-center gap-2 text-xs">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="flex-1 text-slate-600">{s.name}</span>
                  <span className="font-medium text-slate-700">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-2 text-sm font-bold text-slate-900">Top Categories</h2>
          <div className="divide-y divide-slate-100">
            {(analytics?.topCategories ?? []).map((c) => (
              <div key={c.name} className="flex items-center gap-2.5 py-2.5 text-sm">
                <span className="flex-1 text-slate-600">{c.name}</span>
                <span className="font-semibold text-slate-800">{formatNaira(c.value)}</span>
                <span className="w-12 text-right text-xs text-slate-400">
                  {((c.value / totalRevenueTop) * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-2 text-sm font-bold text-slate-900">Top Brands</h2>
          <div className="divide-y divide-slate-100">
            {(analytics?.topBrands ?? []).map((b) => (
              <div key={b.name} className="flex items-center gap-2.5 py-2.5 text-sm">
                <span className="flex-1 text-slate-600">{b.name}</span>
                <span className="font-semibold text-slate-800">{formatNaira(b.value)}</span>
                <span className="w-12 text-right text-xs text-slate-400">
                  {((b.value / totalBrandRevenue) * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_260px]">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-2 text-sm font-bold text-slate-900">Recent Activity</h2>
          <ul className="divide-y divide-slate-100">
            {activityFeed.length === 0 ? (
              <p className="py-4 text-sm text-slate-400">No recent activity yet.</p>
            ) : (
              activityFeed.map((item, i) => (
                <li key={i} className="flex items-center gap-3 py-2.5">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    item.type === 'order' ? 'bg-emerald-100 text-emerald-600' : 'bg-violet-100 text-violet-600'
                  }`}>
                    {item.type === 'order' ? <ShoppingCart size={14} /> : <UserPlus size={14} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800">{item.title}</p>
                    <p className="truncate text-xs text-slate-400">{item.subtitle}</p>
                  </div>
                  <span className="shrink-0 text-xs text-slate-400">
                    {new Date(item.timestamp).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-2 text-sm font-bold text-slate-900">Quick Actions</h2>
          <div className="flex flex-col gap-1.5">
            {[
              { label: 'Review Orders', href: '/orders', icon: ClipboardCheck },
              { label: 'Manage Products', href: '/products', icon: Package },
              { label: 'Manage Categories', href: '/categories', icon: Tag },
              { label: 'View Customers', href: '/customers', icon: UsersIcon },
            ].map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:border-violet-200 hover:bg-violet-50"
              >
                <action.icon size={16} className="text-violet-600" />
                {action.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-2 text-sm font-bold text-slate-900">Recent Orders</h2>
        <ul className="divide-y divide-slate-100">
          {stats.recentOrders.map((o) => (
            <li key={o.id} className="flex items-center justify-between py-2.5 text-sm">
              <span className="text-slate-600">{o.user.firstName} {o.user.lastName} — #{o.id.slice(0, 8).toUpperCase()}</span>
              <span className="font-semibold text-slate-800">{formatNaira(Number(o.total))}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}