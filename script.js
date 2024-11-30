const apiBase = "https://taskmaster-be-h65e.onrender.com/api";  // Backend URL
let isLogin = true;  // Start with login form
let token = null;  // JWT token placeholder

const authForm = document.getElementById("authForm");
const toggleToRegister = document.getElementById("toggleToRegister");
const toggleToLogin = document.getElementById("toggleToLogin");
const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");
const taskContainer = document.getElementById("task-container");
const logoutBtn = document.getElementById("logout-btn");
const taskForm = document.getElementById("task-form");
const tasksContainer = document.getElementById("tasks");

toggleToRegister.addEventListener("click", (e) => {
  e.preventDefault();
  isLogin = false;
  toggleForms();
});

toggleToLogin.addEventListener("click", (e) => {
  e.preventDefault();
  isLogin = true;
  toggleForms();
});

function toggleForms() {
  if (isLogin) {
    loginForm.style.display = "block";
    registerForm.style.display = "none";
    taskContainer.style.display = "none";
  } else {
    loginForm.style.display = "none";
    registerForm.style.display = "block";
    taskContainer.style.display = "none";
  }
}

authForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  console.log('working');
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const name = document.getElementById("name") ? document.getElementById("name").value : null;

  const endpoint = isLogin ? "/auth/login" : "/auth/register";
  const requestData = isLogin ? { email, password } : { name, email, password };

  try {
    const response = await fetch(apiBase + endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestData),
    });

    const data = await response.json();

    if (response.ok) {
      if (isLogin) {
        token = data.token;
        alert("Login successful!");
        showTaskManagement();
      } else {
        alert("Registration successful! Please log in.");
        toggleToLogin.click(); // Switch to login form after successful registration
      }
    } else {
      alert(data.message || "Error occurred during registration/login");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred. Please try again.");
  }
});


authForms.addEventListener("submit", async (e) => {
  e.preventDefault();
  console.log('working-reg');
  const email = document.getElementById("emailr").value;
  const password = document.getElementById("passwordr").value;
  const name = document.getElementById("name") ? document.getElementById("name").value : null;

  const endpoint = isLogin ? "/auth/login" : "/auth/register";
  const requestData = isLogin ? { email, password } : { name, email, password };

  try {
    const response = await fetch(apiBase + endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestData),
    });

    const data = await response.json();

    if (response.ok) {
      if (isLogin) {
        token = data.token;
        alert("Login successful!");
        showTaskManagement();
      } else {
        alert("Registration successful! Please log in.");
        toggleToLogin.click(); // Switch to login form after successful registration
      }
    } else {
      alert(data.message || "Error occurred during registration/login");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred. Please try again.");
  }
});

logoutBtn.addEventListener("click", () => {
  token = null;
  alert("Logged out successfully");
  showLoginForm();
});

taskForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = document.getElementById("title").value;
  const description = document.getElementById("description").value;
  const deadline = document.getElementById("deadline").value;
  const priority = document.getElementById("priority").value;

  try {
    const response = await fetch(apiBase + "/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ title, description, deadline, priority }),
    });

    const data = await response.json();

    if (response.ok) {
      alert("Task added successfully");
      displayTasks();
    } else {
      alert(data.message || "Error occurred while adding task");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred while adding task");
  }
});


// Get filter values
const priorityFilter = document.getElementById("priority-filter");
const dueDateFilter = document.getElementById("due-date-filter");

priorityFilter.addEventListener("change", displayTasks);
dueDateFilter.addEventListener("change", displayTasks);

const searchBar = document.getElementById("search-bar");

searchBar.addEventListener("input", displayTasks);


async function displayTasks() {
    try {
      const response = await fetch(apiBase + "/tasks", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,  // Ensure the token is correctly set
        },
      });
  
      const data = await response.json();
  
      if (response.ok) {
        // Clear the previous tasks
        tasksContainer.innerHTML = '';
  
        // Check if there are tasks
        if (data.length === 0) {
          tasksContainer.innerHTML = "<p>No tasks available.</p>";
          return;
        }


      // Get search query
      const searchQuery = searchBar.value.toLowerCase();

      // Apply filtering and search based on the query
      const filteredTasks = data.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchQuery) || task.description.toLowerCase().includes(searchQuery);

        // Filter by Priority
        const priorityMatch = priorityFilter.value === 'all' || task.priority === priorityFilter.value;

        // Filter by Due Date
        const now = new Date();
        const taskDate = new Date(task.deadline);
        let dateMatch = true;

        if (dueDateFilter.value === 'past') {
          dateMatch = taskDate < now;
        } else if (dueDateFilter.value === 'today') {
          dateMatch = taskDate.toDateString() === now.toDateString();
        } else if (dueDateFilter.value === 'future') {
          dateMatch = taskDate > now;
        }

        return matchesSearch && priorityMatch && dateMatch;
      });

      // Map over the filtered tasks and render them
      tasksContainer.innerHTML = filteredTasks.map(task => `
        <div class="task-item">
          <h3>${task.title}</h3>
          <p>${task.description}</p>
          <p><strong>Priority:</strong> ${task.priority}</p>
          <p><strong>Deadline:</strong> ${new Date(task.deadline).toLocaleDateString()}</p>
          <button class="delete-btn" data-id="${task._id}">Delete</button>
        </div>
      `).join('');

      // Add event listeners to each Delete button
      document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', async (event) => {
          const taskId = event.target.dataset.id;
          await deleteTask(taskId);
        });
      });
  
      } else {
        alert(data.message || "Error occurred while fetching tasks");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while fetching tasks");
    }
  }
  


  async function deleteTask(taskId) {
  try {
    const response = await fetch(apiBase + `/tasks/${taskId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,  // Ensure the token is correctly set
      },
    });

    const data = await response.json();

    if (response.ok) {
      alert('Task deleted successfully!');
      // Re-fetch tasks to update the task list
      displayTasks();
    } else {
      alert(data.message || "Error occurred while deleting the task");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred while deleting the task");
  }
}

  
function showLoginForm() {
  loginForm.style.display = "block";
  taskContainer.style.display = "none";
}

function showTaskManagement() {
  loginForm.style.display = "none";
  taskContainer.style.display = "block";
  displayTasks();
}

toggleForms();  // Initialize the login form view



// {
//     "email": "johndoe@example.com",
//     "password": "password123"
//   }
