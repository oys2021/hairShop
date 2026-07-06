import {
  Activity,
  Box,
  Gauge,
  LogOut,
  PackagePlus,
  ReceiptText,
  Search,
  ShoppingCart,
  Tags,
  User,
  Users,
} from 'lucide-react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import Button from '../components/Button.jsx';
import Logo from '../components/Logo.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const salesLinks = [
  { to: '/sales', label: 'Sales List', icon: ReceiptText, end: true },
  { to: '/sales/new', label: 'New Sale', icon: ShoppingCart },
];

const roleNames = {
  owner: 'Owner',
  admin: 'Administrator',
  manager: 'Manager',
  cashier: 'Cashier',
};

function NavSection({ title, items }) {
  if (!items.length) {
    return null;
  }

  return (
    <section className="space-y-2">
      <p className="px-3 text-xs font-black uppercase text-slate-500">{title}</p>
      <div className="space-y-1">
        {items.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
      </div>
    </section>
  );
}

function NavItem({ to, label, icon: Icon, end = false }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        [
          'group relative flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-bold transition',
          isActive
            ? 'bg-orange-50 text-brand-orange'
            : 'text-slate-600 hover:bg-slate-50 hover:text-brand-ink',
        ].join(' ')
      }
    >
      {({ isActive }) => (
        <>
          <span className={`absolute left-0 h-6 w-1 rounded-r-full ${isActive ? 'bg-brand-orange' : 'bg-transparent'}`} />
          <span
            className={[
              'grid h-8 w-8 place-items-center rounded-lg transition',
              isActive ? 'bg-brand-orange text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-orange-50 group-hover:text-brand-orange',
            ].join(' ')}
          >
            <Icon size={17} />
          </span>
          <span className="min-w-0 flex-1 truncate">{label}</span>
        </>
      )}
    </NavLink>
  );
}

function MobileNav({ items }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-slate-200 bg-white px-2 py-2 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] lg:hidden">
      {items.slice(0, 4).map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              [
                'flex flex-col items-center gap-1 rounded-lg px-2 py-2 text-xs font-bold',
                isActive ? 'bg-orange-50 text-brand-orange' : 'text-slate-500',
              ].join(' ')
            }
          >
            <Icon size={18} />
            <span className="w-full truncate text-center">{item.label.replace(' List', '')}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}

function getCurrentLabel(pathname, sections) {
  const items = sections.flatMap((section) => section.items);
  const exact = items.find((item) => item.end ? pathname === item.to : pathname.startsWith(item.to));
  return exact?.label ?? 'Dashboard';
}

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const role = user?.role ?? 'cashier';
  const isOwner = role === 'owner';
  const isAdmin = role === 'admin';
  const isManager = role === 'manager';
  const showProducts = isOwner || isAdmin || isManager;
  const showManagement = isOwner || isAdmin || isManager;

  const workspaceLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: Gauge, end: true },
    ...(isOwner || isAdmin ? [{ to: '/audit-logs', label: 'Audit Logs', icon: Activity }] : []),
  ];

  const inventoryLinks = showProducts
    ? [
        { to: '/products', label: 'Products', icon: Box, end: true },
        { to: '/products/new', label: 'Add Product', icon: PackagePlus },
        { to: '/categories', label: 'Categories', icon: Tags },
      ]
    : [];

  const managementLinks = showManagement
    ? [
        { to: '/customers', label: 'Customers', icon: Users },
        { to: '/users', label: 'Users', icon: User },
      ]
    : [];

  const sections = [
    { title: 'Workspace', items: workspaceLinks },
    { title: 'Inventory', items: inventoryLinks },
    { title: 'Register', items: salesLinks },
    { title: 'People', items: managementLinks },
  ];
  const mobileItems = [workspaceLinks[0], ...salesLinks, ...(inventoryLinks.length ? [inventoryLinks[0]] : managementLinks.slice(0, 1))].filter(Boolean);
  const currentLabel = getCurrentLabel(location.pathname, sections);
  const userInitial = (user?.username ?? 'A').charAt(0).toUpperCase();

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-brand-ink">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[288px] border-r border-slate-200 bg-white lg:flex lg:flex-col">
        <div className="border-b border-slate-200 px-6 py-6">
          <Logo />

          <div className="mt-6 grid grid-cols-[1fr_auto] items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-500">Role</p>
              <p className="mt-1 truncate text-sm font-black">{roleNames[role] ?? role}</p>
            </div>
            <StatusBadge tone="orange">Online</StatusBadge>
          </div>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-4 py-6">
          {sections.map((section) => (
            <NavSection key={section.title} {...section} />
          ))}
        </nav>

        <div className="border-t border-slate-200 p-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-brand-navy text-sm font-black text-white">
                {userInitial}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-black">{user?.username ?? 'Unknown user'}</p>
                <p className="text-xs font-bold text-slate-500">{user?.email ?? 'No email'}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-sm font-bold text-slate-600 transition hover:bg-orange-50 hover:text-brand-orange"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-[288px]">
        <header className="sticky top-0 z-10 flex min-h-[82px] items-center gap-4 border-b border-slate-200 bg-white/95 px-5 backdrop-blur sm:px-8">
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <div className="lg:hidden">
              <Logo />
            </div>
            <div className="hidden min-w-0 lg:block">
              <p className="text-xs font-bold text-brand-muted">Current view</p>
              <h1 className="truncate text-xl font-black">{currentLabel}</h1>
            </div>
          </div>

          <label className="relative hidden w-full max-w-[420px] md:block">
            <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="control h-10 w-full border-slate-200 bg-slate-50 pl-11" placeholder="Search products, sales, customers" />
          </label>

          <div className="ml-auto flex items-center gap-3">
            <Button onClick={() => navigate('/sales/new')} className="hidden min-w-28 sm:inline-flex">
              Add Sale
            </Button>
            <div className="hidden items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 sm:flex">
              <div className="relative grid h-10 w-10 place-items-center rounded-lg bg-slate-100 font-black text-slate-600">
                {userInitial}
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-brand-green ring-2 ring-white" />
              </div>
              <div>
                <p className="text-sm font-black">{user?.username ?? 'Admin'}</p>
                <p className="text-xs text-brand-muted">{roleNames[role] ?? role}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="px-5 pb-24 pt-8 sm:px-8 lg:pb-10">
          <Outlet />
        </main>
      </div>

      <MobileNav items={mobileItems} />
    </div>
  );
}
