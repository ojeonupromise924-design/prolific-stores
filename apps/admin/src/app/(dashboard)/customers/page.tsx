'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '../../../store/auth-store';
import { getAdminCustomers, type AdminCustomer } from '../../../lib/admin';

export default function AdminCustomersPage() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);

  useEffect(() => {
    getAdminCustomers(accessToken).then(setCustomers).catch(() => {});
  }, [accessToken]);

  return (
    <div>
      <h1 className="text-2xl font-light text-ink">Customers</h1>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink/40">
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Orders</th>
              <th className="p-4">Joined</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-b border-line last:border-0">
                <td className="p-4">{c.firstName} {c.lastName}</td>
                <td className="p-4 text-ink/60">{c.email}</td>
                <td className="p-4 font-medium">{c.orderCount}</td>
                <td className="p-4 text-ink/50">
                  {new Date(c.createdAt).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}