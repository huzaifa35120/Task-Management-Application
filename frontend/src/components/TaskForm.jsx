import { useEffect, useState } from 'react';

const EMPTY = {
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  category: 'general',
  dueDate: '',
};

function toDateInput(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const tzOffset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tzOffset).toISOString().slice(0, 10);
}

export default function TaskForm({
  meta,
  initial,
  onSubmit,
  onCancel,
  submitLabel = 'Add task',
  busy = false,
}) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initial) {
      setForm({
        title: initial.title ?? '',
        description: initial.description ?? '',
        status: initial.status ?? 'todo',
        priority: initial.priority ?? 'medium',
        category: initial.category ?? 'general',
        dueDate: toDateInput(initial.dueDate),
      });
    } else {
      setForm(EMPTY);
    }
    setError(null);
  }, [initial]);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);

    const trimmed = form.title.trim();
    if (!trimmed) {
      setError('Please enter a title.');
      return;
    }

    const payload = {
      title: trimmed,
      description: form.description.trim(),
      status: form.status,
      priority: form.priority,
      category: form.category.trim() || 'general',
      dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
    };

    try {
      await onSubmit(payload);
      if (!initial) setForm(EMPTY);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    }
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <div className="task-form__row">
        <label className="field field--grow">
          <span>Title</span>
          <input
            type="text"
            value={form.title}
            onChange={(e) => update('title', e.target.value)}
            placeholder="What needs to be done?"
            maxLength={120}
            required
          />
        </label>
        <label className="field">
          <span>Due date</span>
          <input
            type="date"
            value={form.dueDate}
            onChange={(e) => update('dueDate', e.target.value)}
          />
        </label>
      </div>

      <label className="field">
        <span>Description</span>
        <textarea
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
          placeholder="Optional notes or details"
          rows={2}
          maxLength={2000}
        />
      </label>

      <div className="task-form__row">
        <label className="field">
          <span>Status</span>
          <select value={form.status} onChange={(e) => update('status', e.target.value)}>
            {meta.statuses.map((s) => (
              <option key={s} value={s}>
                {labelForStatus(s)}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Priority</span>
          <select value={form.priority} onChange={(e) => update('priority', e.target.value)}>
            {meta.priorities.map((p) => (
              <option key={p} value={p}>
                {capitalize(p)}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Category</span>
          <input
            type="text"
            value={form.category}
            onChange={(e) => update('category', e.target.value)}
            placeholder="e.g. work, study, personal"
            maxLength={40}
          />
        </label>
      </div>

      {error && <div className="form-error">{error}</div>}

      <div className="task-form__actions">
        {onCancel && (
          <button type="button" className="btn btn--ghost" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn btn--primary" disabled={busy}>
          {busy ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
}

function labelForStatus(s) {
  if (s === 'in-progress') return 'In progress';
  return capitalize(s);
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
