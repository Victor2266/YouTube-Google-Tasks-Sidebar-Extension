async function createTasksSidebar() {
    // Create sidebar container
    const sidebar = document.createElement('div');
    sidebar.className = 'tasks-sidebar';
    sidebar.innerHTML = `
      <h2>My Tasks</h2>
      <div id="tasks-list">
        <div class="loading-spinner">Loading tasks...</div>
      </div>
    `;
    document.body.appendChild(sidebar);
  
    // Adjust main content
    const content = document.querySelector('ytd-app');
    if (content) {
      content.style.marginRight = '350px';
    }
  
    try {
      // Get tasks from background script
      chrome.runtime.sendMessage({ action: 'getTasks' }, response => {
        if (response.error) {
          showError(response.error);
        } else if (response.tasks) {
          displayTasks(response.tasks);
        } else {
          showError('Unable to load tasks. Please try signing in again.');
        }
      });
    } catch (error) {
      showError('Failed to communicate with the extension. Please try reloading the page.');
    }
  }
  
  function showError(message) {
    const tasksList = document.getElementById('tasks-list');
    tasksList.innerHTML = `
      <div class="error-message">
        ${message}
        <br>
        <button onclick="location.reload()">Retry</button>
      </div>
    `;
  }
  
  function displayTasks(tasks) {
    const tasksList = document.getElementById('tasks-list');
    
    if (!tasks || tasks.length === 0) {
      tasksList.innerHTML = '<p>No tasks found</p>';
      return;
    }
  
    tasksList.innerHTML = '';
    tasks.forEach(task => {
      const taskElement = document.createElement('div');
      taskElement.className = `task-item ${task.completed ? 'task-completed' : ''}`;
      taskElement.textContent = task.title || 'Untitled Task';
      tasksList.appendChild(taskElement);
    });
  }
  
  // Wait for YouTube to load
  window.addEventListener('load', createTasksSidebar);