'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronDown, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/auth-store';
import { NAV_SECTIONS } from '../../lib/nav-data';
import { ToastHost } from '../../components/toast';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const logout = useAuthStore((s) => s.logout);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!isInitialized) return;
    if (!user || !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      router.push('/login');
    }
  }, [isInitialized, user, router]);

  if (!isInitialized || !user || !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
    return <div className="flex min-h-screen items-center justify-center text-ink/50">Loading...</div>;
  }

  return (
    <div className="flex min-h-screen bg-[#f8f9fc]">
      <aside className="flex w-64 shrink-0 flex-col bg-[#100d2b] text-white">
        <div className="border-b border-white/10 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-violet-400 to-indigo-600">
              <span className="text-lg font-black text-white">P</span>
            </div>

            <div>
              <span className="text-base font-semibold">
                Prolific <span className="text-violet-300">Store</span>
              </span>
              <p className="text-[10px] text-slate-400">Admin Dashboard</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          {NAV_SECTIONS.map((section) => {
            const Icon = section.icon;
            const isActive = section.href === pathname;

            if (section.children) {
              const isOpen = expanded === section.label;

              return (
                <div key={section.label}>
                  <button
                    onClick={() => setExpanded(isOpen ? null : section.label)}
                    disabled={!section.enabled}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                      section.enabled
                        ? 'text-slate-300 hover:bg-white/6 hover:text-white'
                        : 'cursor-not-allowed text-slate-600'
                    }`}
                  >
                    <Icon size={16} />

                    <span className="flex-1 text-left">{section.label}</span>

                    <ChevronDown
                      size={13}
                      className={isOpen ? 'rotate-180' : ''}
                    />
                  </button>

                  {isOpen && (
                    <div className="ml-8 flex flex-col gap-0.5 py-1">
                      {section.children.map((child) =>
                        child.enabled && child.href ? (
                          <Link
                            key={child.label}
                            href={child.href}
                            className={`rounded-lg px-3 py-2 text-sm ${
                              pathname === child.href
                                ? 'bg-violet-600/20 font-medium text-violet-300'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            {child.label}
                          </Link>
                        ) : (
                          <span
                            key={child.label}
                            className="cursor-not-allowed rounded-lg px-3 py-2 text-sm text-slate-600"
                          >
                            {child.label}
                          </span>
                        ),
                      )}
                    </div>
                  )}
                </div>
              );
            }

            return section.enabled && section.href ? (
              <Link
                key={section.label}
                href={section.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                  isActive
                    ? 'bg-linear-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-900/20'
                    : 'text-slate-300 hover:bg-white/6 hover:text-white'
                }`}
              >
                <Icon size={16} />
                {section.label}
              </Link>
            ) : (
              <div
                key={section.label}
                className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600"
              >
                <Icon size={16} />
                {section.label}
              </div>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-3">
          <button
            onClick={() => logout().then(() => router.push('/login'))}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8">{children}</main>
      <ToastHost />
    </div>
  );
}
