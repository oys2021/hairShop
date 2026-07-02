export default function Logo({ dark = false }) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-12 w-12 place-items-center rounded-lg border border-orange-200 bg-orange-50 shadow-sm">
        <svg
          aria-hidden="true"
          className="h-9 w-9"
          fill="none"
          viewBox="0 0 40 40"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M24.5 7.5c5.2 2.2 8.1 6.1 8.1 11.3 0 5.6-3.7 10-9.4 11.5"
            stroke="#192B55"
            strokeLinecap="round"
            strokeWidth="2.6"
          />
          <path
            d="M26.8 12.2c2.3 1.9 3.4 4.1 3.4 6.7 0 3.8-2.5 6.5-6.4 7.6"
            stroke="#12B9D6"
            strokeLinecap="round"
            strokeWidth="2.6"
          />
          <rect fill="#FF9F2E" height="22" rx="5" width="12" x="8" y="12" />
          <path
            d="M11.5 12V9.8c0-1.6 1.2-2.8 2.8-2.8h3.1"
            stroke="#FF9F2E"
            strokeLinecap="round"
            strokeWidth="3"
          />
          <rect fill="#F7F9FB" height="10" rx="2.5" width="6" x="11" y="17" />
        </svg>
      </div>
      <div>
        <p className={`text-xl font-black leading-6 ${dark ? 'text-white' : 'text-brand-ink'}`}>HairMart POS</p>
        <p className={`text-xs ${dark ? 'text-indigo-100' : 'text-brand-muted'}`}>Hair product retail</p>
      </div>
    </div>
  );
}
