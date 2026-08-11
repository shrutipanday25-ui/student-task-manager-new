const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 4000;

let tasks = [];

app.use(express.json());

app.use(express.static(path.join(__dirname, "..")));

app.get("/api/tasks", (req, res) => {
  res.json(tasks);
});

app.post("/api/tasks", (req, res) => {
  const { title, category, priority, deadline } = req.body;

  if (!title || !category || !priority || !deadline) {
    return res.status(400).json({
      message: "Please fill all fields"
    });
  }

  const task = {
    id: Date.now(),
    title,
    category,
    priority,
    deadline,
    completed: false
  };

  tasks.push(task);

  res.status(201).json(task);
});

app.put("/api/tasks/:id", (req, res) => {
  const id = Number(req.params.id);

  const task = tasks.find(task => task.id === id);

  if (!task) {
    return res.status(404).json({
      message: "Task not found"
    });
  }

  task.completed = !task.completed;

  res.json(task);
});

app.delete("/api/tasks/:id", (req, res) => {
  const id = Number(req.params.id);

  tasks = tasks.filter(task => task.id !== id);

  res.json({
    message: "Task deleted"
  });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});