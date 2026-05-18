const { Task, TASK_STATUSES, TASK_PRIORITIES } = require('../models/Task');

async function listTasks(req, res, next) {
  try {
    const { status, priority, category, search, sort } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      due: { dueDate: 1, createdAt: -1 },
      priority: { priority: 1, createdAt: -1 },
    };
    const sortBy = sortOptions[sort] || sortOptions.newest;

    const tasks = await Task.find(filter).sort(sortBy);
    res.json({ count: tasks.length, tasks });
  } catch (err) {
    next(err);
  }
}

async function getTask(req, res, next) {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ task });
  } catch (err) {
    next(err);
  }
}

async function createTask(req, res, next) {
  try {
    const { title, description, status, priority, category, dueDate } = req.body;
    const task = await Task.create({
      title,
      description,
      status,
      priority,
      category,
      dueDate: dueDate || null,
    });
    res.status(201).json({ task });
  } catch (err) {
    next(err);
  }
}

async function updateTask(req, res, next) {
  try {
    const updates = {};
    const allowed = ['title', 'description', 'status', 'priority', 'category', 'dueDate'];
    for (const key of allowed) {
      if (key in req.body) updates[key] = req.body[key];
    }

    const task = await Task.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ task });
  } catch (err) {
    next(err);
  }
}

async function deleteTask(req, res, next) {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ message: 'Task deleted', id: req.params.id });
  } catch (err) {
    next(err);
  }
}

async function getStats(req, res, next) {
  try {
    const [total, byStatus, byPriority, categories] = await Promise.all([
      Task.countDocuments(),
      Task.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Task.aggregate([{ $group: { _id: '$priority', count: { $sum: 1 } } }]),
      Task.distinct('category'),
    ]);

    const statusCounts = Object.fromEntries(TASK_STATUSES.map((s) => [s, 0]));
    byStatus.forEach((row) => {
      statusCounts[row._id] = row.count;
    });

    const priorityCounts = Object.fromEntries(TASK_PRIORITIES.map((p) => [p, 0]));
    byPriority.forEach((row) => {
      priorityCounts[row._id] = row.count;
    });

    res.json({
      total,
      status: statusCounts,
      priority: priorityCounts,
      categories: categories.sort(),
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getStats,
};
