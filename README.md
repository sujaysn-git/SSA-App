# Open Tasks Kanban

A lightweight browser application for tracking open tasks in a Kanban view. It runs without a build step and stores tasks in the browser's `localStorage`.

## Features

- Add tasks with a title, details, priority, and optional due date.
- Track work across Backlog, To Do, In Progress, and Done columns.
- Move tasks with action buttons or drag and drop.
- Search tasks by title or details.
- View live totals for all tasks, open tasks, and completed tasks.
- Clear completed tasks when you are ready to archive the board.

## Run locally

Open `index.html` directly in a browser, or serve the folder with a static server:

```bash
python3 -m http.server 8000
```

Then visit <http://localhost:8000>.
