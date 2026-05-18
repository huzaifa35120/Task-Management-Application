import { useCallback, useEffect, useMemo, useState } from 'react';

import Header from './components/Header.jsx';
import TaskForm from './components/TaskForm.jsx';
import TaskFilters from './components/TaskFilters.jsx';
import TaskList from './components/TaskList.jsx';
import { tasksApi } from './api/tasks.js';

const DEFAULT_META = { statuses: ['todo', 'in-progress', 'done'], priorities: ['low', 'medium', 'high'] };

const DEFAULT_FILTERS = {
  search: '',
  status: '',
  priority: '',
  category: '',
  sort: 'newest',
};

export default function App() {
  const [meta, setMeta] = useState(DEFAULT_META);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    tasksApi.meta().then(setMeta).catch(() => {
      // Fall back to defaults; backend may be down.
    });
  }, []);

  const refreshStats = useCallback(async () => {
    try {
      const data = await tasksApi.stats();
      setStats(data);
    } catch (err) {
      // Non-fatal: show whatever we have.
      console.warn('Failed to load stats', err);
    }
  }, []);

  const loadTasks = useCallback(
    async (filterValues) => {
      setLoading(true);
      setError(null);
      try {
        const data = await tasksApi.list(filterValues);
        setTasks(data.tasks);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    const id = setTimeout(() => {
      loadTasks(filters);
    }, filters.search ? 250 : 0);
    return () => clearTimeout(id);
  }, [filters, loadTasks]);

  useEffect(() => {
    refreshStats();
  }, [tasks.length, refreshStats]);

  const showToast = useCallback((message, tone = 'info') => {
    setToast({ message, tone });
    setTimeout(() => setToast(null), 2500);
  }, []);

  async function handleCreate(payload) {
    setCreating(true);
    try {
      await tasksApi.create(payload);
      await loadTasks(filters);
      await refreshStats();
      showToast('Task added', 'success');
    } finally {
      setCreating(false);
    }
  }

  async function handleUpdate(id, payload) {
    const previous = tasks;
    setTasks((current) =>
      current.map((task) => (task.id === id ? { ...task, ...payload } : task))
    );
    try {
      await tasksApi.update(id, payload);
      await loadTasks(filters);
      await refreshStats();
    } catch (err) {
      setTasks(previous);
      showToast(err.message || 'Update failed', 'error');
      throw err;
    }
  }

  async function handleDelete(id) {
    const previous = tasks;
    setTasks((current) => current.filter((task) => task.id !== id));
    try {
      await tasksApi.remove(id);
      await refreshStats();
      showToast('Task deleted', 'success');
    } catch (err) {
      setTasks(previous);
      showToast(err.message || 'Delete failed', 'error');
    }
  }

  const categories = useMemo(() => {
    const fromStats = stats?.categories ?? [];
    const fromTasks = tasks.map((t) => t.category).filter(Boolean);
    return Array.from(new Set([...fromStats, ...fromTasks])).sort();
  }, [stats, tasks]);

  return (
    <div className="app">
      <Header stats={stats} />

      <main className="main">
        <section className="card">
          <div className="card__header">
            <h2>Add a task</h2>
            <p className="card__subtitle">Capture what you need to do — set a priority, category, and due date.</p>
          </div>
          <TaskForm meta={meta} onSubmit={handleCreate} busy={creating} />
        </section>

        <section className="card">
          <div className="card__header">
            <h2>Your tasks</h2>
            <p className="card__subtitle">
              {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} shown
            </p>
          </div>

          <TaskFilters
            meta={meta}
            filters={filters}
            categories={categories}
            onChange={setFilters}
            onReset={() => setFilters(DEFAULT_FILTERS)}
          />

          <TaskList
            tasks={tasks}
            meta={meta}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            loading={loading}
            error={error}
          />
        </section>
      </main>

      <footer className="footer">
        TaskFlow · COMP4060 CPD project
      </footer>

      {toast && <div className={`toast toast--${toast.tone}`}>{toast.message}</div>}
    </div>
  );
}
