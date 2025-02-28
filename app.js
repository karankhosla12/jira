document.addEventListener('DOMContentLoaded', () => {
  const API_BASE_URL = 'https://tarks.karankhosla99.workers.dev';
  let currentUser = JSON.parse(localStorage.getItem('user'));

  // DOM Elements
  const loginForm = document.getElementById('login');
  const signupForm = document.getElementById('signup');
  const dashboard = document.getElementById('dashboard');
  const createTaskBtn = document.getElementById('create-task-btn');
  const createProjectBtn = document.getElementById('create-project-btn');
  const listProjectsBtn = document.getElementById('list-projects-btn');
  const tasksList = document.getElementById('tasks-list');
  const statusFilter = document.getElementById('status-filter');
  const assignedByFilter = document.getElementById('assigned-by-filter');
  const assignedToFilter = document.getElementById('assigned-to-filter');
  const projectFilter = document.getElementById('project-filter');
  const createTaskModal = document.getElementById('create-task-modal');
  const createProjectModal = document.getElementById('create-project-modal');
  const editTaskModal = document.getElementById('edit-task-modal');
  const closeModals = document.querySelectorAll('.close');

  // Show Signup Form
  document.getElementById('show-signup').addEventListener('click', () => {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('signup-form').style.display = 'block';
  });

  // Show Login Form
  document.getElementById('show-login').addEventListener('click', () => {
    document.getElementById('signup-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
  });

  // Login
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email_Id: email, password: password }),
    });

    if (response.ok) {
      const user = await response.json();
      localStorage.setItem('user', JSON.stringify(user));
      currentUser = user;
      showDashboard();
    } else {
      alert('Login failed');
    }
  });

  // Signup
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('signup-username').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const phone = document.getElementById('signup-phone').value;

    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email_Id: email, password: password, phoneNumber: phone }),
    });

    if (response.ok) {
      alert('Signup successful! Please login.');
      document.getElementById('signup-form').style.display = 'none';
      document.getElementById('login-form').style.display = 'block';
    } else {
      alert('Signup failed');
    }
  });

  // Show Dashboard
  function showDashboard() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('signup-form').style.display = 'none';
    dashboard.style.display = 'block';
    loadTasks();
    loadFilters();
  }

  // Load Tasks with Filters
  async function loadTasks() {
    const status = statusFilter.value;
    const assignedBy = assignedByFilter.value;
    const assignedTo = assignedToFilter.value;
    const projectId = projectFilter.value;

    let url = `${API_BASE_URL}/tasks`;
    if (status !== 'all' || assignedBy !== 'all' || assignedTo !== 'all' || projectId !== 'all') {
      url += `?status=${status}&assigned_by=${assignedBy}&assigned_to=${assignedTo}&projectid=${projectId}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.ok) {
      const tasks = await response.json();
      displayTasks(tasks);
    } else {
      alert('Failed to load tasks');
    }
  }

  // Display Tasks
  function displayTasks(tasks) {
    tasksList.innerHTML = tasks.map(task => `
      <div class="task">
        <h3>${task.taskname}</h3>
        <p>${task.taskdescription}</p>
        <p>Assigned to: ${task.assigned_to}</p>
        <p>Assigned by: ${task.assigned_by}</p>
        <p>Deadline: ${task.deadline}</p>
        <p>Status: ${task.status === 0 ? 'Open' : task.status === 1 ? 'In Progress' : 'Completed'}</p>
        <button onclick="openEditTaskModal('${task.taskid}')">Edit</button>
        <button onclick="deleteTask('${task.taskid}')">Delete</button>
      </div>
    `).join('');
  }

  // Open Edit Task Modal
  window.openEditTaskModal = async (taskId) => {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.ok) {
      const task = await response.json();
      document.getElementById('edit-task-id').value = task.taskid;
      document.getElementById('edit-task-name').value = task.taskname;
      document.getElementById('edit-task-description').value = task.taskdescription;
      document.getElementById('edit-assigned-to').value = task.assigned_to;
      document.getElementById('edit-deadline').value = task.deadline;
      document.getElementById('edit-status').value = task.status;
      editTaskModal.style.display = 'block';
    } else {
      alert('Failed to load task details');
    }
  };

  // Edit Task
  document.getElementById('edit-task-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const taskId = document.getElementById('edit-task-id').value;
    const taskName = document.getElementById('edit-task-name').value;
    const taskDescription = document.getElementById('edit-task-description').value;
    const assignedTo = document.getElementById('edit-assigned-to').value;
    const deadline = document.getElementById('edit-deadline').value;
    const status = document.getElementById('edit-status').value;

    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        taskname: taskName,
        taskdescription: taskDescription,
        assigned_to: assignedTo,
        deadline,
        status,
      }),
    });

    if (response.ok) {
      alert('Task updated successfully!');
      editTaskModal.style.display = 'none';
      loadTasks();
    } else {
      alert('Failed to update task');
    }
  });

  // Delete Task
  window.deleteTask = async (taskId) => {
    if (confirm('Are you sure you want to delete this task?')) {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Task deleted successfully!');
        loadTasks();
      } else {
        alert('Failed to delete task');
      }
    }
  };

  // Load Filters
  async function loadFilters() {
    const usersResponse = await fetch(`${API_BASE_URL}/users`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const projectsResponse = await fetch(`${API_BASE_URL}/projects`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (usersResponse.ok && projectsResponse.ok) {
      const users = await usersResponse.json();
      const projects = await projectsResponse.json();

      // Populate Assigned By Filter
      assignedByFilter.innerHTML = `
        <option value="all">Assigned By Anyone</option>
        ${users.map(user => `<option value="${user.email_Id}">${user.username}</option>`).join('')}
      `;

      // Populate Assigned To Filter
      assignedToFilter.innerHTML = `
        <option value="all">Assigned To Anyone</option>
        ${users.map(user => `<option value="${user.email_Id}">${user.username}</option>`).join('')}
      `;

      // Populate Project Filter
      projectFilter.innerHTML = `
        <option value="all">All Projects</option>
        ${projects.map(project => `<option value="${project.projectid}">${project.project_name}</option>`).join('')}
      `;
    } else {
      alert('Failed to load filters');
    }
  }

  // Apply Filters
  statusFilter.addEventListener('change', loadTasks);
  assignedByFilter.addEventListener('change', loadTasks);
  assignedToFilter.addEventListener('change', loadTasks);
  projectFilter.addEventListener('change', loadTasks);

  // Open Create Task Modal
  createTaskBtn.addEventListener('click', () => {
    createTaskModal.style.display = 'block';
  });

  // Create Task
  document.getElementById('create-task-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const taskName = document.getElementById('task-name').value;
    const taskDescription = document.getElementById('task-description').value;
    const assignedTo = document.getElementById('assigned-to').value;
    const deadline = document.getElementById('deadline').value;
    const projectId = document.getElementById('project-id').value;

    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        taskname: taskName,
        taskdescription: taskDescription,
        assigned_to: assignedTo,
        assigned_by: currentUser.email_Id,
        deadline,
        projectid: projectId,
        status: 0, // Default status: Open
      }),
    });

    if (response.ok) {
      alert('Task created successfully!');
      createTaskModal.style.display = 'none';
      loadTasks();
    } else {
      alert('Failed to create task');
    }
  });

  // Open Create Project Modal
  createProjectBtn.addEventListener('click', () => {
    createProjectModal.style.display = 'block';
  });

  // Create Project
  document.getElementById('create-project-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const projectName = document.getElementById('project-name').value;
    const projectDescription = document.getElementById('project-description').value;

    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project_name: projectName,
        project_description: projectDescription,
      }),
    });

    if (response.ok) {
      alert('Project created successfully!');
      createProjectModal.style.display = 'none';
      loadFilters();
    } else {
      alert('Failed to create project');
    }
  });

  // List All Projects
  listProjectsBtn.addEventListener('click', async () => {
    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.ok) {
      const projects = await response.json();
      alert(JSON.stringify(projects, null, 2));
    } else {
      alert('Failed to load projects');
    }
  });

  // Close Modals
  closeModals.forEach(close => {
    close.addEventListener('click', () => {
      createTaskModal.style.display = 'none';
      createProjectModal.style.display = 'none';
      editTaskModal.style.display = 'none';
    });
  });
});
