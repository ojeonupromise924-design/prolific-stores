import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard, Store, ShoppingBag,
  CreditCard, Wallet, Percent, Truck, RotateCcw, ShieldAlert,
  UserCog, Megaphone, FileText, Star, ShieldCheck, AlertTriangle,
  BarChart3, Sparkles, Settings,
} from 'lucide-react';

export interface NavLink {
  label: string;
  href?: string;
  icon: LucideIcon;
  enabled: boolean;
  children?: { label: string; href?: string; enabled: boolean }[];
}

export const NAV_SECTIONS: NavLink[] = [
  { label: 'Overview', href: '/', icon: LayoutDashboard, enabled: true },
  {
    label: 'Marketplace', icon: Store, enabled: true,
    children: [
      { label: 'Sellers', enabled: false },
      { label: 'Products', href: '/products', enabled: true },
      { label: 'Brands', enabled: false },
      { label: 'Categories', href: '/categories', enabled: true },
      { label: 'Customers', href: '/customers', enabled: true },
    ],
  },
  { label: 'Orders', href: '/orders', icon: ShoppingBag, enabled: true },
  { label: 'Payments', icon: CreditCard, enabled: false },
  { label: 'Payouts', icon: Wallet, enabled: false },
  { label: 'Commissions', icon: Percent, enabled: false },
  { label: 'Logistics', icon: Truck, enabled: false },
  { label: 'Returns', icon: RotateCcw, enabled: false },
  { label: 'Disputes', icon: ShieldAlert, enabled: false },
  {
    label: 'Consultants', icon: UserCog, enabled: false,
    children: [
      { label: 'Verification', enabled: false },
      { label: 'Performance', enabled: false },
      { label: 'Appointments', enabled: false },
      { label: 'Payouts', enabled: false },
    ],
  },
  { label: 'Marketing', icon: Megaphone, enabled: false },
  { label: 'Content', icon: FileText, enabled: false },
  { label: 'Reviews', icon: Star, enabled: false },
  { label: 'Trust & Safety', icon: ShieldCheck, enabled: false },
  { label: 'Fraud & Risk', icon: AlertTriangle, enabled: false },
  { label: 'Analytics', icon: BarChart3, enabled: false },
  { label: 'AI Command Centre', icon: Sparkles, enabled: false },
  { label: 'Settings', icon: Settings, enabled: false },
];