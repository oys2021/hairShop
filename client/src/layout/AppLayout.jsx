import {
  Activity,
  Box,
  ChevronDown,
  ChevronRight,
  Gauge,
  Search,
  ShoppingCart,
  User,
  Users,
} from 'lucide-react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import Button from '../components/Button.jsx';
import Logo from '../components/Logo.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

const mainNav = [
  { to: '/dashboard', label: 'Dashboard', icon: Gauge },
  { to: '/audit-logs', label: 'Audit Logs', icon: Activity },
];

const managementNav = [
  { to: '/users', label: 'Users', icon: User },
  { to: '/customers', label: 'Customers', icon: Users },
];

const productLinks = [
  { to: '/products', label: 'Product List' },
  { to: '/products/new', label: 'Add Product' },
  { to: '/categories', label: 'Category List' },
  { to: '/categories/new', label: 'Add Category' },
];

const salesLinks = [
  { to: '/sales', label: 'Sales List' },
  { to: '/sales/new', label: 'New Sales' },
];

function SidebarLink({ to, label, icon: Icon, active, expanded }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          'group flex h-11 items-center gap-4 rounded-lg px-4 text-sm font-bold transition',
          active || isActive ? 'bg-orange-50 text-brand-orange' : 'text-slate-500 hover:bg-slate-50 hover:text-brand-ink',
        ].join(' ')
      }
    >
      <span
        className={[
          'flex h-7 w-7 items-center justify-center rounded-lg text-xs',
          active ? 'bg-brand-orange text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-white',
        ].join(' ')}
      >
        <Icon size={15} />
      </span>
      <span className="flex-1">{label}</span>
      {expanded === true ? <ChevronDown size={15} /> : expanded === false ? <ChevronRight size={15} /> : null}
    </NavLink>
  );
}

function NestedLink({ to, label }) {
  return (
    <NavLink
      to={to}
      end={to === '/products' || to === '/sales'}
      className={({ isActive }) =>
        [
          'flex h-10 items-center gap-3 rounded-2xl px-3 text-sm transition',
          isActive
            ? 'bg-orange-100 text-brand-orange font-semibold'
            : 'text-slate-600 hover:bg-slate-100 hover:text-brand-ink',
        ].join(' ')
      }
    >
      {({ isActive }) => (
        <>
          <span className={`h-2.5 w-2.5 rounded-full border ${isActive ? 'border-brand-orange bg-brand-orange' : 'border-slate-300'}`} />
          {label}
        </>
      )}
    </NavLink>
  );
}

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const productOpen = location.pathname.startsWith('/products') || location.pathname.startsWith('/categories');
  const salesOpen = location.pathname.startsWith('/sales');

  return (
    <div className="min-h-screen bg-brand-page text-brand-ink">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[252px] border-r border-brand-line bg-white lg:flex lg:flex-col">
        <div className="px-9 py-7">
          <Logo />
        </div>

        <nav className="flex-1 space-y-5 px-5">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-3">
            <p className="px-3 pb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Quick access</p>
            <div className="space-y-2">
              {mainNav.map((item) => (
                <SidebarLink key={item.label} to={item.to} label={item.label} icon={item.icon} />
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-3">
            <div className="mb-3 flex items-center justify-between gap-3 px-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              <span>Products</span>
              <span className="text-slate-400">{productLinks.length}</span>
            </div>
            <SidebarLink
              to="/products"
              label="Product catalog"
              icon={Box}
              expanded={productOpen}
              active={productOpen}
            />
            {productOpen ? (
              <div className="mt-2 space-y-1 rounded-3xl bg-white p-2 shadow-sm">
                {productLinks.map((link) => (
                  <NestedLink key={link.to} {...link} />
                ))}
              </div>
            ) : null}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-3">
            <div className="mb-3 flex items-center justify-between gap-3 px-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              <span>Sales</span>
              <span className="text-slate-400">{salesLinks.length}</span>
            </div>
            <SidebarLink
              to="/sales"
              label="Sales workspace"
              icon={ShoppingCart}
              expanded={salesOpen}
              active={salesOpen}
            />
            {salesOpen ? (
              <div className="mt-2 space-y-1 rounded-3xl bg-white p-2 shadow-sm">
                {salesLinks.map((link) => (
                  <NestedLink key={link.to} {...link} />
                ))}
              </div>
            ) : null}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-3">
            <p className="px-3 pb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Management</p>
            <div className="space-y-2">
              {managementNav.map((item) => (
                <SidebarLink key={item.label} to={item.to} label={item.label} icon={item.icon} />
              ))}
            </div>
          </div>
        </nav>

        <div className="mx-7 mb-8 border-t border-brand-line pt-6">
          <p className="text-xs text-slate-400">Signed in as</p>
          <p className="mt-2 text-sm font-black">Administrator</p>
          <StatusBadge>Online</StatusBadge>
        </div>
      </aside>

      <div className="lg:pl-[252px]">
        <header className="sticky top-0 z-10 flex h-[84px] items-center justify-between border-b border-slate-100 bg-white px-5 sm:px-10">
          <div className="flex items-center gap-4 lg:hidden">
            <Logo />
          </div>
          <label className="relative hidden w-[404px] md:block">
            <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="control w-full pl-12" placeholder="Products, sales, customers" />
          </label>
          <div className="ml-auto flex items-center gap-5">
            <Button onClick={() => navigate('/sales/new')} className="hidden min-w-28 sm:inline-flex">
              Add Sale
            </Button>
            <div className="flex items-center gap-3">
              <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 font-black text-slate-500">
                A
                <span className="absolute bottom-1 right-1 h-2.5 w-2.5 rounded-full bg-brand-green ring-2 ring-white" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-black">Admin</p>
                <p className="text-xs text-brand-muted">Owner</p>
              </div>
            </div>
          </div>
        </header>

        <main className="px-5 py-9 sm:px-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
