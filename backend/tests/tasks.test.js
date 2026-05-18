const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const { createApp } = require('../src/app');
const { Task } = require('../src/models/Task');

let mongoServer;
let app;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  app = createApp();
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Task.deleteMany({});
});

describe('GET /api/health', () => {
  it('returns ok status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('POST /api/tasks', () => {
  it('creates a task with defaults', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ title: 'Write report' });

    expect(res.status).toBe(201);
    expect(res.body.task).toMatchObject({
      title: 'Write report',
      status: 'todo',
      priority: 'medium',
      category: 'general',
    });
    expect(res.body.task.id).toBeDefined();
  });

  it('rejects missing title', async () => {
    const res = await request(app).post('/api/tasks').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
  });

  it('rejects invalid status enum', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ title: 'x', status: 'banana' });
    expect(res.status).toBe(400);
  });

  it('accepts a due date and category', async () => {
    const due = '2026-12-31T00:00:00.000Z';
    const res = await request(app)
      .post('/api/tasks')
      .send({ title: 'Submit CPD', dueDate: due, category: 'university', priority: 'high' });

    expect(res.status).toBe(201);
    expect(res.body.task.category).toBe('university');
    expect(res.body.task.priority).toBe('high');
    expect(new Date(res.body.task.dueDate).toISOString()).toBe(due);
  });
});

describe('GET /api/tasks', () => {
  beforeEach(async () => {
    await Task.create([
      { title: 'A', status: 'todo', priority: 'low', category: 'work' },
      { title: 'B', status: 'in-progress', priority: 'high', category: 'work' },
      { title: 'C', status: 'done', priority: 'medium', category: 'home' },
    ]);
  });

  it('returns all tasks', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(3);
    expect(res.body.tasks).toHaveLength(3);
  });

  it('filters by status', async () => {
    const res = await request(app).get('/api/tasks?status=done');
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(1);
    expect(res.body.tasks[0].title).toBe('C');
  });

  it('filters by priority', async () => {
    const res = await request(app).get('/api/tasks?priority=high');
    expect(res.body.count).toBe(1);
    expect(res.body.tasks[0].title).toBe('B');
  });

  it('filters by category', async () => {
    const res = await request(app).get('/api/tasks?category=work');
    expect(res.body.count).toBe(2);
  });

  it('searches by title text', async () => {
    const res = await request(app).get('/api/tasks?search=A');
    expect(res.body.count).toBe(1);
    expect(res.body.tasks[0].title).toBe('A');
  });

  it('rejects an invalid status filter', async () => {
    const res = await request(app).get('/api/tasks?status=nope');
    expect(res.status).toBe(400);
  });
});

describe('PATCH /api/tasks/:id', () => {
  it('updates a task', async () => {
    const created = await Task.create({ title: 'Old' });
    const res = await request(app)
      .patch(`/api/tasks/${created.id}`)
      .send({ title: 'New', status: 'done' });

    expect(res.status).toBe(200);
    expect(res.body.task.title).toBe('New');
    expect(res.body.task.status).toBe('done');
  });

  it('returns 404 for missing task', async () => {
    const id = new mongoose.Types.ObjectId().toString();
    const res = await request(app).patch(`/api/tasks/${id}`).send({ title: 'x' });
    expect(res.status).toBe(404);
  });

  it('returns 400 for invalid id format', async () => {
    const res = await request(app).patch('/api/tasks/not-an-id').send({ title: 'x' });
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/tasks/:id', () => {
  it('deletes a task', async () => {
    const created = await Task.create({ title: 'Bye' });
    const res = await request(app).delete(`/api/tasks/${created.id}`);
    expect(res.status).toBe(200);
    expect(await Task.countDocuments()).toBe(0);
  });

  it('returns 404 if not found', async () => {
    const id = new mongoose.Types.ObjectId().toString();
    const res = await request(app).delete(`/api/tasks/${id}`);
    expect(res.status).toBe(404);
  });
});

describe('GET /api/tasks/stats', () => {
  it('returns aggregated counts', async () => {
    await Task.create([
      { title: 'A', status: 'todo', priority: 'low', category: 'work' },
      { title: 'B', status: 'todo', priority: 'high', category: 'work' },
      { title: 'C', status: 'done', priority: 'medium', category: 'home' },
    ]);

    const res = await request(app).get('/api/tasks/stats');
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(3);
    expect(res.body.status.todo).toBe(2);
    expect(res.body.status.done).toBe(1);
    expect(res.body.priority.low).toBe(1);
    expect(res.body.priority.high).toBe(1);
    expect(res.body.categories).toEqual(expect.arrayContaining(['work', 'home']));
  });
});
