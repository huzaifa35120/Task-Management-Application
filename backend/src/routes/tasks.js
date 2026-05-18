const express = require('express');
const { body, param, query } = require('express-validator');

const { validate } = require('../middleware/validate');
const { TASK_STATUSES, TASK_PRIORITIES } = require('../models/Task');
const {
  listTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getStats,
} = require('../controllers/taskController');

const router = express.Router();

const idValidator = param('id').isMongoId().withMessage('Invalid task id');

router.get(
  '/',
  [
    query('status').optional().isIn(TASK_STATUSES).withMessage('Invalid status filter'),
    query('priority').optional().isIn(TASK_PRIORITIES).withMessage('Invalid priority filter'),
    query('category').optional().isString().trim().isLength({ max: 40 }),
    query('search').optional().isString().trim().isLength({ max: 120 }),
    query('sort').optional().isIn(['newest', 'oldest', 'due', 'priority']),
  ],
  validate,
  listTasks
);

router.get('/stats', getStats);

router.get('/:id', [idValidator], validate, getTask);

router.post(
  '/',
  [
    body('title').isString().trim().notEmpty().withMessage('Title is required')
      .isLength({ max: 120 }).withMessage('Title cannot exceed 120 characters'),
    body('description').optional().isString().trim().isLength({ max: 2000 }),
    body('status').optional().isIn(TASK_STATUSES),
    body('priority').optional().isIn(TASK_PRIORITIES),
    body('category').optional().isString().trim().isLength({ max: 40 }),
    body('dueDate').optional({ nullable: true }).isISO8601().withMessage('dueDate must be a valid ISO date'),
  ],
  validate,
  createTask
);

router.patch(
  '/:id',
  [
    idValidator,
    body('title').optional().isString().trim().notEmpty().isLength({ max: 120 }),
    body('description').optional().isString().trim().isLength({ max: 2000 }),
    body('status').optional().isIn(TASK_STATUSES),
    body('priority').optional().isIn(TASK_PRIORITIES),
    body('category').optional().isString().trim().isLength({ max: 40 }),
    body('dueDate').optional({ nullable: true }).isISO8601(),
  ],
  validate,
  updateTask
);

router.delete('/:id', [idValidator], validate, deleteTask);

module.exports = router;
