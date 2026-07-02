const styles = {
  primary: 'btn btn-primary',
  secondary: 'btn btn-secondary',
  muted: 'btn btn-muted',
  danger: 'btn btn-danger',
  ghost: 'btn bg-slate-100 text-brand-ink hover:bg-slate-200',
};

export default function Button({ children, variant = 'primary', className = '', type = 'button', ...props }) {
  return (
    <button
      type={type}
      className={`${styles[variant] ?? styles.primary} disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
