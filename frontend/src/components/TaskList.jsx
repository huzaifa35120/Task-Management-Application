import TaskItem from './TaskItem.jsx';

export default function TaskList({ tasks, meta, onUpdate, onDelete, loading, error }) {
  if (loading) {
    return (
      <div className="state state--loading">
        <div className="spinner" /> Loading tasks…
      </div>
    );
  }

  if (error) {
    return <div className="state state--error">Error: {error}</div>;
  }

  if (tasks.length === 0) {
    return (
      <div className="state state--empty">
        <h3>No tasks yet</h3>
        <p>Add your first task using the form above.</p>
      </div>
    );
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          meta={meta}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
