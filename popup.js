// popup.js
document.addEventListener('DOMContentLoaded', () => {
    const timerElement = document.getElementById('timer');
    const checklistElement = document.getElementById('checklist');
    const resetButton = document.getElementById('reset');
    let updateInterval;

    function updateTimer() {
        chrome.storage.local.get(['timeSpent', 'dailyTimeLimit'], (data) => {
            const timeSpent = data.timeSpent || 0;
            const dailyTimeLimit = parseInt(data.dailyTimeLimit) || 60;
            const remainingTime = Math.max(0, dailyTimeLimit - timeSpent);
            
            // Calculate minutes and seconds
            const minutes = Math.floor(remainingTime);
            const seconds = Math.floor((remainingTime - minutes) * 60);
            
            // Update timer display
            timerElement.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            
            // If time is up, clear the interval
            if (remainingTime <= 0) {
                clearInterval(updateInterval);
                timerElement.textContent = '00:00';
            }
        });
    }

    // Start updating timer immediately and then every second
    updateTimer();
    updateInterval = setInterval(updateTimer, 1000);

    // Clean up interval when popup closes
    window.addEventListener('unload', () => {
        if (updateInterval) {
            clearInterval(updateInterval);
        }
    });

    // Reset checklist functionality
    resetButton.addEventListener('click', () => {
        const checklist = [
            { name: 'Task 1', completed: false },
            { name: 'Task 2', completed: false },
            { name: 'Task 3', completed: false }
        ];
        chrome.storage.local.set({ checklist: checklist }, () => {
            displayChecklist();
        });
    });

    function displayChecklist() {
        chrome.storage.local.get(['checklist'], (data) => {
            const checklist = data.checklist || [];
            checklistElement.innerHTML = '';
            
            checklist.forEach((task, index) => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <input type="checkbox" id="task-${index}" 
                        ${task.completed ? 'checked' : ''} />
                    <label for="task-${index}">${task.name}</label>
                `;
                checklistElement.appendChild(li);

                document.getElementById(`task-${index}`).addEventListener('change', (e) => {
                    task.completed = e.target.checked;
                    chrome.storage.local.set({ checklist: checklist });
                });
            });
        });
    }

    // Initial display of checklist
    displayChecklist();
});