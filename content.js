function createSidebar() {
    // Check if the sidebar already exists
    if (document.getElementById('tasks-sidebar')) {
      return;
    }
  
    // Create the sidebar container
    const sidebar = document.createElement('div');
    sidebar.id = 'tasks-sidebar';
  
    // Create an iframe to embed Google Tasks (Full UI)
    const tasksFrame = document.createElement('iframe');
    tasksFrame.src = 'https://tasks.google.com/'; // Embed the full Tasks UI
    tasksFrame.style.width = '100%';
    tasksFrame.style.height = '100%';
    tasksFrame.style.border = 'none';
  
    sidebar.appendChild(tasksFrame);
    document.body.appendChild(sidebar);
  
    // Adjust the YouTube content to make space for the sidebar
    const content = document.getElementById('page-manager'); // You might need to adjust this selector based on YouTube's layout
    if (content) {
      content.style.marginRight = '300px'; // Adjust the margin based on your sidebar width
    }
  }
  
  // Call the function to create the sidebar when the page loads
  window.addEventListener('load', createSidebar);
  
  // Mutation Observer to handle YouTube's dynamic content loading
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (!document.getElementById('tasks-sidebar') && window.location.pathname === '/') {
        createSidebar();
      }
    });
  });
  
  observer.observe(document.body, { childList: true, subtree: true });