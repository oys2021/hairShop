export default function InlineNotice({ error, loading, empty }) {
  if (loading) {
    return <div className="panel mt-7 px-6 py-5 text-sm font-bold text-brand-muted">Loading...</div>;
  }

  if (error) {
    return <div className="mt-7 rounded-lg bg-red-50 px-6 py-5 text-sm font-black text-brand-red">{error}</div>;
  }

  if (empty) {
    return <div className="panel mt-7 px-6 py-5 text-sm font-bold text-brand-muted">No records found.</div>;
  }

  return null;
}
