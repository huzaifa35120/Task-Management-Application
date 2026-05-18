import { useState } from 'react';
import TaskForm from './TaskForm.jsx';

const STATUS_LABELS = {
  todo: 'To do',
  'in-progress': 'In progress',
  done: 'Done',
};

const NEXT_STATUS = {
  todo: 'in-progress',
  'in-progress': 'done',
  done: 'todo',
};

export default function TaskItem({ task, meta, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);

  const overdue = isOverdue(task);

  async function handleQuickStatus() {
    setBusy(true);
    try {
      await onUpdate(task.id, { status: NEXT_STATUS[task.status] });
    } finally {
      setBusy(false);
    }
  }

  async function handleSave(payload) {
    setBusy(true);
    try {
      await onUpdate(task.id, payload);
      setEditing(false);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete "${task.title}"?`)) return;
    setBusy(true);
    try {
      await onDelete(task.id);
    } finally {
      setBusy(false);
    }
  }

  if (editing) {
    return (
      <li className="task-item task-item--editing">
        <TaskForm
          meta={meta}
          initial={task}
          onSubmit={handleSave}
          onCancel={() => setEditing(false)}
          submitLabel="Save changes"
          busy={busy}
        />
      </li>
    );
  }

  return (
    <li className={`task-item task-item--${task.status}${overdue ? ' task-item--overdue' : ''}`}>
      <button
        type="button"
        className={`task-item__check task-item__check--${task.status}`}
        onClick={handleQuickStatus}
        disabled={busy}
        title={`Mark as ${STATUS_LABELS[NEXT_STATUS[task.status]]}`}
        aria-label={`Mark as ${STATUS_LABELS[NEXT_STATUS[task.status]]}`}
      >
        {task.status === 'done' ? <CheckIcon /> : task.status === 'in-progress' ? <DotIcon /> : null}
      </button>

      <div className="task-item__body">
        <div className="task-item__header">
          <h3 className="task-item__title">{task.title}</h3>
          <div className="task-item__badges">
            <span className={`badge badge--priority badge--priority-${task.priority}`}>
              {task.priority}
            </span>
            <span className="badge badge--category">{task.category}</span>
            <span className={`badge badge--status badge--status-${task.status}`}>
              {STATUS_LABELS[task.status]}
            </span>
          </div>
        </div>

        {task.description && <p className="task-item__desc">{task.description}</p>}

        <div className="task-item__meta">
          {task.dueDate && (
            <span className={`task-item__due${overdue ? ' task-item__due--overdue' : ''}`}>
              <CalendarIcon /> {formatDate(task.dueDate)}
              {overdue && task.status !== 'done' && <span> · overdue</span>}
            </span>
          )}
          <span className="task-item__created">Created {formatRelative(task.createdAt)}</span>
        </div>
      </div>

      <div className="task-item__actions">
        <button
          type="button"
          className="icon-btn"
          onClick={() => setEditing(true)}
          disabled={busy}
          title="Edit"
          aria-label="Edit task"
        >
          <EditIcon />
        </button>
        <button
          type="button"
          className="icon-btn icon-btn--danger"
          onClick={handleDelete}
          disabled={busy}
          title="Delete"
          aria-label="Delete task"
        >
          <TrashIcon />
        </button>
      </div>
    </li>
  );
}

function isOverdue(task) {
  if (!task.dueDate || task.status === 'done') return false;
  return new Date(task.dueDate).getTime() < Date.now() - 24 * 60 * 60 * 1000 + 1;
}

function formatDate(value) {
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatRelative(value) {
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(value).toLocaleDateString();
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12l5 5L20 7" />
    </svg>
  );
}
function DotIcon() {
  return (
    <svg viewBox="0 0 24 24" width="10" height="10">
      <circle cx="12" cy="12" r="5" fill="currentColor" />
    </svg>
  );
}
function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}
function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    </svg>
  );
}
