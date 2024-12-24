async function createTasksSidebar() {
    const sidebar = document.createElement('div');
    sidebar.className = 'tasks-sidebar';
    sidebar.innerHTML = `
      <div class="tasks-header">
        <h2>My Tasks</h2>
        <span class="tasks-count" id="tasks-count"></span>
      </div>
      <div id="tasks-list">
        <div class="loading-spinner">Loading tasks...</div>
      </div>
    `;
    document.body.appendChild(sidebar);

    const content = document.querySelector('ytd-app');
    if (content) {
        content.style.marginRight = '400px';
    }

    try {
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
        <button class="retry-button" onclick="location.reload()">Retry</button>
      </div>
    `;
  }
  
  function displayTasks(tasks) {
    const tasksList = document.getElementById('tasks-list');
    const tasksCount = document.getElementById('tasks-count');
    
    if (!tasks || tasks.length === 0) {
      tasksList.innerHTML = '<div class="task-item">No tasks found</div>';
      tasksCount.textContent = '0 tasks';
      return;
    }
  
    tasksCount.textContent = `${tasks.length} tasks`;
    tasksList.innerHTML = '';
    
    tasks.forEach(task => {
      const taskElement = document.createElement('div');
      taskElement.className = `task-item ${task.completed ? 'task-completed' : ''}`;
      
      const dueDate = task.due ? new Date(task.due).toLocaleDateString() : '';
      
      taskElement.innerHTML = `
        <div class="task-checkbox"></div>
        <span class="task-title">${task.title || 'Untitled Task'}</span>
        ${dueDate ? `<span class="task-due">${dueDate}</span>` : ''}
      `;
      
      tasksList.appendChild(taskElement);
    });
  }

// Wait for YouTube to load
window.addEventListener('load', createTasksSidebar);