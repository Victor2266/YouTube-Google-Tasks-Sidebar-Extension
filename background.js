let accessToken = null;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getTasks') {
        getAllTasks()
            .then(tasks => {
                sendResponse({ tasks: tasks });
            })
            .catch(error => {
                console.error('Error in getTasks:', error);
                sendResponse({ error: error.message });
            });
        return true;
    }

    if (request.action === 'updateTask') {
        updateTask(request.listId, request.taskId, request.completed)
            .then(() => {
                sendResponse({ success: true });
            })
            .catch(error => {
                console.error('Error updating task:', error);
                sendResponse({ error: error.message });
            });
        return true;
    }
});

async function getAccessToken() {
    try {
        const result = await chrome.identity.getAuthToken({
            interactive: true,
            scopes: ['https://www.googleapis.com/auth/tasks']
        });

        console.log('Auth token retrieved:', result ? 'success' : 'failed');
        accessToken = result.token;
        return accessToken;
    } catch (error) {
        console.error('Detailed auth error:', error);
        throw new Error(`Authentication failed: ${error.message}`);
    }
}

async function updateTask(listId, taskId, completed) {
    if (!accessToken) {
        await getAccessToken();
    }

    const response = await fetch(
        `https://www.googleapis.com/tasks/v1/lists/${listId}/tasks/${taskId}`,
        {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                id: taskId,
                status: completed ? 'completed' : 'needsAction',
                completed: completed ? new Date().toISOString() : null
            })
        }
    );

    if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error response:', errorText);
        throw new Error(`Failed to update task: ${response.status} ${response.statusText}`);
    }

    return response.json();
}

async function getTaskLists() {
    if (!accessToken) {
        await getAccessToken();
    }

    const response = await fetch(
        'https://www.googleapis.com/tasks/v1/users/@me/lists',
        {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/json'
            }
        }
    );

    if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error response:', errorText);

        if (response.status === 401) {
            accessToken = null;
            return getTaskLists();
        }

        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.items || [];
}

async function getTasksForList(listId) {
    const response = await fetch(
        `https://www.googleapis.com/tasks/v1/lists/${listId}/tasks`,
        {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/json'
            }
        }
    );

    if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error response:', errorText);
        throw new Error(`Failed to fetch tasks for list ${listId}`);
    }

    const data = await response.json();
    return data.items || [];
}

async function getAllTasks() {
    try {
        console.log('Fetching task lists...');
        const lists = await getTaskLists();

        if (!lists || lists.length === 0) {
            console.log('No task lists found');
            return [];
        }

        console.log(`Found ${lists.length} task lists`);

        const firstList = lists[0];
        console.log(`Fetching tasks from list: ${firstList.title}`);

        const tasks = await getTasksForList(firstList.id);
        console.log(`Retrieved ${tasks ? tasks.length : 0} tasks`);

        return tasks
            .filter(task => !task.deleted && !task.hidden) // Keep completed tasks for accurate ordering, filter in content.js
            .map(task => ({
                id: task.id,
                listId: firstList.id,
                title: task.title,
                completed: task.status === 'completed',
                due: task.due,
                position: task.position, // Keep the position
            }))
            .sort((a, b) => a.position.localeCompare(b.position)); // Sort by position
    } catch (error) {
        console.error('Error fetching all tasks:', error);
        throw error;
    }
}

async function updateTask(listId, taskId, completed) {
    if (!accessToken) {
        await getAccessToken();
    }

    // For completing tasks
    let updateBody = {
        id: taskId
    };

    if (completed) {
        updateBody.status = 'completed';
        updateBody.completed = new Date().toISOString();
    } else {
        // For uncompleting tasks
        updateBody.status = 'needsAction';
        updateBody.completed = null;
    }

    const response = await fetch(
        `https://www.googleapis.com/tasks/v1/lists/${listId}/tasks/${taskId}`,
        {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(updateBody)
        }
    );

    if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error response:', errorText);
        throw new Error(`Failed to update task: ${response.status} ${response.statusText}`);
    }

    const updatedTask = await response.json();
    return updatedTask;
}