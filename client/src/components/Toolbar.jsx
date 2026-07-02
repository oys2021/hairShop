import { Columns3, ListFilter, Search, SlidersHorizontal } from 'lucide-react';
import Button from './Button.jsx';

export default function Toolbar({
  placeholder,
  actionLabel,
  onAction,
  extra,
  searchValue = '',
  onSearchChange,
  onFilter,
  onSort,
  onColumns,
  filterLabel = 'Filter',
  sortLabel = 'Sort',
  columnsLabel = 'Columns',
  filterActive = false,
  columnsActive = false,
}) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          className="w-11 px-0"
          aria-label={filterLabel}
          aria-pressed={filterActive}
          disabled={!onFilter}
          onClick={onFilter}
          variant={filterActive ? 'primary' : 'secondary'}
        >
          <ListFilter size={18} />
        </Button>
        <label className="relative block w-full max-w-sm md:w-[336px]">
          <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="control w-full pl-11"
            placeholder={placeholder}
            value={searchValue}
            onChange={(event) => onSearchChange?.(event.target.value)}
          />
        </label>
        <Button variant="secondary" disabled={!onSort} onClick={onSort}>
          <SlidersHorizontal size={17} />
          {sortLabel}
        </Button>
        <Button
          variant={columnsActive ? 'primary' : 'secondary'}
          disabled={!onColumns}
          onClick={onColumns}
          aria-pressed={columnsActive}
        >
          <Columns3 size={17} />
          {columnsLabel}
        </Button>
        {extra}
      </div>
      {actionLabel ? (
        <Button onClick={onAction} disabled={!onAction} className="md:min-w-36">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
