import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import DataTable from '../components/DataTable.jsx';
import InlineNotice from '../components/InlineNotice.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { getApiPage } from '../lib/api.js';
import { useApiResource } from '../lib/useApiResource.js';

const ACTIONS = [
  { value: '', label: 'All actions' },
  { value: 'login', label: 'Login' },
  { value: 'logout', label: 'Logout' },
  { value: 'create', label: 'Create' },
  { value: 'update', label: 'Update' },
  { value: 'delete', label: 'Delete' },
  { value: 'upload', label: 'Upload' },
];

const ENTITY_TYPES = [
  { value: '', label: 'All types' },
  { value: 'product', label: 'Product' },
  { value: 'sale', label: 'Sale' },
  { value: 'customer', label: 'Customer' },
  { value: 'user', label: 'User' },
  { value: 'category', label: 'Category' },
  { value: 'image', label: 'Image' },
];

function formatDate(isoDate) {
  const date = new Date(isoDate);
  return date.toLocaleString();
}

function formatAction(action) {
  return action.charAt(0).toUpperCase() + action.slice(1);
}

function formatChanges(changes) {
  if (!changes) return '-';
  if (typeof changes === 'string') {
    try {
      changes = JSON.parse(changes);
    } catch {
      return changes;
    }
  }
  return JSON.stringify(changes, null, 2);
}

export default function AuditLogsPage() {
  const [filters, setFilters] = useState({
    action: '',
    entityType: '',
  });
  const [expandedId, setExpandedId] = useState(null);

  const queryParams = new URLSearchParams({
    limit: 50,
    offset: 0,
    ...(filters.action && { action: filters.action }),
    ...(filters.entityType && { entityType: filters.entityType }),
  }).toString();

  const logs = useApiResource(() => getApiPage(`/audit-logs?${queryParams}`), [queryParams]);

  const columns = [
    {
      header: 'Action',
      render: (log) => <span className="font-medium">{formatAction(log.action)}</span>,
    },
    {
      header: 'Entity',
      render: (log) => log.entityType ? `${log.entityType}${log.entityId ? ` (${log.entityId})` : ''}` : '-',
    },
    {
      header: 'User',
      render: (log) => log.userUsername,
    },
    {
      header: 'Date/Time',
      render: (log) => formatDate(log.createdAt),
    },
    {
      header: 'IP Address',
      render: (log) => log.ipAddress || '-',
    },
    {
      header: 'Details',
      render: (log) => (
        <button
          className="rounded bg-brand-orange px-3 py-1 text-xs font-bold text-white hover:bg-orange-600"
          onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
        >
          {expandedId === log.id ? 'Hide' : 'Show'}
        </button>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Audit Logs"
        subtitle="View system activity, user actions, and changes to records."
      />
      <InlineNotice loading={logs.loading} error={logs.error} />

      <div className="mb-6 flex gap-4">
        <div>
          <label className="block text-sm font-bold text-brand-text mb-2">Action</label>
          <select
            className="control"
            value={filters.action}
            onChange={(e) => setFilters({ ...filters, action: e.target.value })}
          >
            {ACTIONS.map((action) => (
              <option key={action.value} value={action.value}>
                {action.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold text-brand-text mb-2">Entity Type</label>
          <select
            className="control"
            value={filters.entityType}
            onChange={(e) => setFilters({ ...filters, entityType: e.target.value })}
          >
            {ENTITY_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="panel overflow-x-auto">
        <DataTable columns={columns} rows={logs.data?.data ?? []} />
      </div>

      {expandedId && (
        <div className="mt-6 panel p-6">
          {(() => {
            const log = logs.data?.data.find((l) => l.id === expandedId);
            if (!log) return null;
            return (
              <div>
                <h3 className="mb-4 text-sm font-bold">Details</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-bold text-brand-muted">ID</p>
                    <p className="font-mono">{log.id}</p>
                  </div>
                  <div>
                    <p className="font-bold text-brand-muted">Action</p>
                    <p>{formatAction(log.action)}</p>
                  </div>
                  {log.entityType && (
                    <div>
                      <p className="font-bold text-brand-muted">Entity Type</p>
                      <p>{log.entityType}</p>
                    </div>
                  )}
                  {log.entityId && (
                    <div>
                      <p className="font-bold text-brand-muted">Entity ID</p>
                      <p className="font-mono">{log.entityId}</p>
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-brand-muted">User</p>
                    <p>{log.userUsername}</p>
                  </div>
                  <div>
                    <p className="font-bold text-brand-muted">IP Address</p>
                    <p>{log.ipAddress || '-'}</p>
                  </div>
                  <div>
                    <p className="font-bold text-brand-muted">Timestamp</p>
                    <p>{formatDate(log.createdAt)}</p>
                  </div>
                  {log.changes && (
                    <div>
                      <p className="font-bold text-brand-muted">Changes</p>
                      <pre className="mt-2 overflow-x-auto rounded bg-slate-50 p-3 text-xs">
                        {JSON.stringify(log.changes, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </>
  );
}
