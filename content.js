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

    loadTasks();
}

function loadTasks() {
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
        <button class="retry-button" onclick="loadTasks()">Retry</button>
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
        taskElement.dataset.taskId = task.id;
        taskElement.dataset.listId = task.listId;

        const dueDate = task.due ? new Date(task.due).toLocaleDateString() : '';

        taskElement.innerHTML = `
        <div class="task-checkbox"></div>
        <span class="task-title">${task.title || 'Untitled Task'}</span>
        ${dueDate ? `<span class="task-due">${dueDate}</span>` : ''}
      `;

        const checkbox = taskElement.querySelector('.task-checkbox');
        checkbox.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleTask(task.listId, task.id, !task.completed);
        });

        tasksList.appendChild(taskElement);
    });
}

function toggleTask(listId, taskId) {
    const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
    if (!taskElement) return;

    const currentState = taskElement.classList.contains('task-completed');

    // Optimistically update UI
    taskElement.classList.toggle('task-completed', !currentState);

    // Add animation class for feedback
    taskElement.classList.add('task-updating');

    chrome.runtime.sendMessage({
        action: 'updateTask',
        listId: listId,
        taskId: taskId,
        completed: !currentState
    }, response => {
        taskElement.classList.remove('task-updating');

        if (response.error) {
            console.error('Failed to update task:', response.error);
            // Revert UI change if update failed
            taskElement.classList.toggle('task-completed', currentState);

            // Show error message
            showToast('Failed to update task. Please try again.');
        } else {
            // Show success message
            showToast(!currentState ? 'Task completed' : 'Task uncompleted');
        }
    });
}


function showToast(message) {
    const existingToast = document.querySelector('.task-toast');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = 'task-toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    // Remove toast after animation
    setTimeout(() => {
        toast.classList.add('task-toast-hide');
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

window.addEventListener('load', createTasksSidebar);
