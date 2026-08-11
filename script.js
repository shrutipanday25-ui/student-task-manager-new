const titleInput = document.getElementById("title");
const categoryInput = document.getElementById("category");
const priorityInput = document.getElementById("priority");
const deadlineInput = document.getElementById("deadline");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");
const searchInput = document.getElementById("search");

const totalElement = document.getElementById("total");
const pendingElement = document.getElementById("pending");
const completedElement = document.getElementById("completed");

let tasks = [];

async function loadTasks() {
  try {
    const response = await fetch("/api/tasks");

    if (!response.ok) {
      throw new Error("Failed to load tasks");
    }

    tasks = await response.json();

    displayTasks();
    updateStats();
  } catch (error) {
    console.log(error);
    taskList.innerHTML = `
      <div class="empty">
        Unable to load tasks
      </div>
    `;
  }
}

async function addTask() {
  const title = titleInput.value.trim();
  const category = categoryInput.value;
  const priority = priorityInput.value;
  const deadline = deadlineInput.value;

  if (!title || !deadline) {
    alert("Please enter task title and deadline");
    return;
  }

  try {
    addTaskBtn.disabled = true;
    addTaskBtn.textContent = "Adding...";

    const response = await fetch("/api/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title,
        category,
        priority,
        deadline
      })
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message);
      return;
    }

    tasks.push(data);

    titleInput.value = "";
    deadlineInput.value = "";

    displayTasks();
    updateStats();
  } catch (error) {
    console.log(error);
    alert("Something went wrong");
  } finally {
    addTaskBtn.disabled = false;
    addTaskBtn.textContent = "+ Add Task";
  }
}

async function toggleTask(id) {
  try {
    const response = await fetch(`/api/tasks/${id}`, {
      method: "PUT"
    });

    const updatedTask = await response.json();

    tasks = tasks.map(task =>
      task.id === updatedTask.id ? updatedTask : task
    );

    displayTasks();
    updateStats();
  } catch (error) {
    console.log(error);
  }
}

async function deleteTask(id) {
  try {
    await fetch(`/api/tasks/${id}`, {
      method: "DELETE"
    });

    tasks = tasks.filter(task => task.id !== id);

    displayTasks();
    updateStats();
  } catch (error) {
    console.log(error);
  }
}

function displayTasks() {
  const searchText = searchInput.value.toLowerCase();

  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchText)
  );

  if (filteredTasks.length === 0) {
    taskList.innerHTML = `
      <div class="empty">
        No tasks yet. Add a new task to get started.
      </div>
    `;
    return;
  }

  taskList.innerHTML = filteredTasks.map(task => `
    <div class="task-card ${task.completed ? "completed-task" : ""}">

      <div class="task-top">
        <div class="task-title">
          ${task.title}
        </div>
      </div>

      <div class="task-info">
        <span class="tag">
          ${task.category}
        </span>

        <span class="priority">
          ${task.priority}
        </span>
      </div>

      <div class="deadline">
        📅 Deadline: ${task.deadline}
      </div>

      <div class="task-actions">

        <button
          class="complete-btn"
          onclick="toggleTask(${task.id})"
        >
          ${task.completed ? "Mark Pending" : "Complete"}
        </button>

        <button
          class="delete-btn"
          onclick="deleteTask(${task.id})"
        >
          Delete
        </button>

      </div>

    </div>
  `).join("");
}

function updateStats() {
  const total = tasks.length;

  const completed = tasks.filter(
    task => task.completed
  ).length;

  const pending = total - completed;

  totalElement.textContent = total;
  pendingElement.textContent = pending;
  completedElement.textContent = completed;
}

addTaskBtn.addEventListener("click", addTask);

searchInput.addEventListener("input", displayTasks);

loadTasks();