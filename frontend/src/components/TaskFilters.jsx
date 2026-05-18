export default function TaskFilters({ meta, filters, onChange, onReset, categories = [] }) {
  function update(field, value) {
    onChange({ ...filters, [field]: value });
  }

  const isFiltered = Object.values(filters).some((v) => v && v !== 'newest');

  return (
    <div className="filters">
      <div className="filters__group filters__search">
        <SearchIcon />
        <input
          type="search"
          placeholder="Search tasks…"
          value={filters.search || ''}
          onChange={(e) => update('search', e.target.value)}
        />
      </div>

      <div className="filters__group">
        <label>
          <span>Status</span>
          <select value={filters.status || ''} onChange={(e) => update('status', e.target.value)}>
            <option value="">All</option>
            {meta.statuses.map((s) => (
              <option key={s} value={s}>
                {s === 'in-progress' ? 'In progress' : capitalize(s)}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Priority</span>
          <select value={filters.priority || ''} onChange={(e) => update('priority', e.target.value)}>
            <option value="">All</option>
            {meta.priorities.map((p) => (
              <option key={p} value={p}>
                {capitalize(p)}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Category</span>
          <select value={filters.category || ''} onChange={(e) => update('category', e.target.value)}>
            <option value="">All</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Sort</span>
          <select value={filters.sort || 'newest'} onChange={(e) => update('sort', e.target.value)}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="due">Due date</option>
            <option value="priority">Priority</option>
          </select>
        </label>
      </div>

      {isFiltered && (
        <button type="button" className="btn btn--ghost btn--sm" onClick={onReset}>
          Clear
        </button>
      )}
    </div>
  );
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}
