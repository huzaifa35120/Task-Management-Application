# TaskFlow

A full-stack task management web application built for the COMP4060 CPD project.
Frontend in **React (Vite)**, backend in **Node.js + Express + MongoDB**, tested with
**Jest + Supertest**.

> Authentication is intentionally skipped in this build — every visitor sees the
> same shared task list. The schema, routes, and middleware are structured so a
> JWT layer can be dropped in later without re-architecting.

## Features

- Create, read, update, and delete tasks
- Filter by status (`todo`, `in-progress`, `done`), priority (`low`, `medium`, `high`),
  category, and free-text search
- Sort by newest, oldest, due date, or priority
- Categories and due dates with overdue highlighting
- Live status counters
- Dark mode toggle (respects system preference, persisted in `localStorage`)
- Optimistic updates with rollback on error
- Validated REST API with consistent error envelopes
- 17 automated API tests covering happy paths and validation failures

## Project structure

```
CPD-Project/
├── backend/
│   ├── src/
│   │   ├── app.js              # Express app factory (used by server + tests)
│   │   ├── index.js            # Entry point: connects DB, starts server
│   │   ├── config/db.js        # Mongo connection helper
│   │   ├── models/Task.js      # Mongoose schema + enums
│   │   ├── controllers/        # Request handlers
│   │   ├── routes/             # Express routers
│   │   └── middleware/         # Validation + error handling
│   └── tests/tasks.test.js     # Jest + Supertest suite (in-memory MongoDB)
└── frontend/
    ├── index.html
    └── src/
        ├── App.jsx
        ├── api/tasks.js        # Fetch-based API client
        ├── components/         # Header, TaskForm, TaskFilters, TaskList, TaskItem
        ├── contexts/ThemeContext.jsx
        └── styles/index.css
```

## Prerequisites

- Node.js 18+
- npm 9+
- MongoDB Community Edition running locally:
  ```bash
  brew tap mongodb/brew
  brew install mongodb-community
  brew services start mongodb-community
  ```
  Verify it's listening with `mongosh --eval "db.adminCommand('ping')"` — you
  should see `{ ok: 1 }`.

> The test suite uses `mongodb-memory-server` and does **not** need a running
> MongoDB instance. The development server can also be run without MongoDB by
> setting `USE_MEMORY_DB=true` in `backend/.env` (data won't persist between
> restarts).

## Setup

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env       # then edit MONGODB_URI if needed
npm run dev                # starts http://localhost:5050 with nodemon
```

`.env` keys:

| Key             | Default                                   | Notes                                                        |
| --------------- | ----------------------------------------- | ------------------------------------------------------------ |
| `PORT`          | `5050`                                    | API port (5000 is taken by macOS AirPlay)                    |
| `MONGODB_URI`   | `mongodb://127.0.0.1:27017/taskflow`      | Local Mongo or Atlas string. Required unless `USE_MEMORY_DB` |
| `USE_MEMORY_DB` | unset                                     | Set to `true` to run with in-memory MongoDB (no install)     |
| `NODE_ENV`      | `development`                             |                                                              |
| `CLIENT_ORIGIN` | `http://localhost:5173`                   | Allowed CORS origin for the client                           |

### 2. Frontend

```bash
cd frontend
npm install
npm run dev                # starts http://localhost:5173
```

Vite proxies `/api/*` requests to `http://localhost:5050`, so no extra config
is required as long as the backend is running.

### 3. Tests

```bash
cd backend
npm test
```

### 4. Inspecting the database

With MongoDB running, you can poke around the database directly:

```bash
mongosh taskflow
> db.tasks.countDocuments()
> db.tasks.find().pretty()
> db.tasks.find({ status: "done" })
```

## REST API

Base URL: `http://localhost:5050/api`

| Method | Endpoint           | Purpose                               |
| ------ | ------------------ | ------------------------------------- |
| GET    | `/health`          | Liveness probe                        |
| GET    | `/meta`            | Allowed status & priority enums       |
| GET    | `/tasks`           | List tasks (supports filters/sort)    |
| GET    | `/tasks/stats`     | Aggregated counts by status/priority  |
| GET    | `/tasks/:id`       | Fetch a single task                   |
| POST   | `/tasks`           | Create a task                         |
| PATCH  | `/tasks/:id`       | Update one or more fields             |
| DELETE | `/tasks/:id`       | Delete a task                         |

### Query parameters for `GET /tasks`

| Param      | Values                                     |
| ---------- | ------------------------------------------ |
| `status`   | `todo` \| `in-progress` \| `done`          |
| `priority` | `low` \| `medium` \| `high`                |
| `category` | any string                                 |
| `search`   | full-text match on title and description   |
| `sort`     | `newest` \| `oldest` \| `due` \| `priority`|

### Task shape

```json
{
  "id": "65fbd...",
  "title": "Write CPD reflection",
  "description": "Cover LO1–LO5 with concrete evidence.",
  "status": "in-progress",
  "priority": "high",
  "category": "university",
  "dueDate": "2026-05-31T00:00:00.000Z",
  "createdAt": "2026-05-03T08:20:11.812Z",
  "updatedAt": "2026-05-03T09:01:42.001Z"
}
```

### Error format

All errors return an envelope of the form:

```json
{ "error": "Validation failed", "details": [{ "field": "title", "message": "Title is required" }] }
```

## Mapping back to the CPD proposal

| Learning outcome           | How it's covered                                                              |
| -------------------------- | ----------------------------------------------------------------------------- |
| **LO1** RESTful API        | Express app with versioned routes, validation, structured errors              |
| **LO2** MongoDB CRUD       | Mongoose `Task` model with enums, indexes, and full CRUD via the controller   |
| **LO3** Authentication     | Deferred per the current scope; auth middleware seam is in place              |
| **LO4** Automated tests    | 17-case Jest + Supertest suite using `mongodb-memory-server`                  |
| **LO5** Full-stack         | React frontend consuming the API via Vite dev proxy, with optimistic updates  |

The "over-estimation off-ramp" items are also included: dark mode, categories +
due dates, and a clean componentised UI ready for a CI workflow.
