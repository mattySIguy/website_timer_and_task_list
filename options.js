document.addEventListener('DOMContentLoaded', () => {
    // Load existing time limit on page load
    chrome.storage.local.get(['dailyTimeLimit'], (data) => {
        const timeLimitInput = document.getElementById('timeLimit');
        timeLimitInput.value = data.dailyTimeLimit || 60; // Default to 60 if not set
    });

    // Load existing websites on page load
    chrome.storage.local.get(['monitoredWebsites'], (data) => {
        const websites = data.monitoredWebsites || [];
        displayWebsites(websites);
    });

    // Load existing checklist on page load
    displayChecklist();

    // Save daily time limit functionality
    document.getElementById('timeLimit').addEventListener('change', () => {
        const timeLimit = document.getElementById('timeLimit').value;
        chrome.storage.local.set({ dailyTimeLimit: parseInt(timeLimit, 10) }, () => {
            alert('Daily time limit updated!');
        });
    });

    // Add website functionality
    document.getElementById('addWebsite').addEventListener('click', () => {
        const website = document.getElementById('website').value;
        if (website) {
            chrome.storage.local.get(['monitoredWebsites'], (data) => {
                const websites = data.monitoredWebsites || [];
                websites.push(website);
                chrome.storage.local.set({ monitoredWebsites: websites }, () => {
                    displayWebsites(websites); // Update the display immediately
                    document.getElementById('website').value = ''; // Clear input
                });
            });
        } else {
            alert("Please enter a website URL.");
        }
    });

    // Add checklist item functionality
    document.getElementById('addChecklistItem').addEventListener('click', () => {
        const checklistItem = document.getElementById('checklistItem').value;
        if (checklistItem) {
            chrome.storage.local.get(['checklist'], (data) => {
                const checklist = data.checklist || [];
                checklist.push({ name: checklistItem, completed: false });
                chrome.storage.local.set({ checklist: checklist }, () => {
                    displayChecklist(); // Update the display immediately
                    document.getElementById('checklistItem').value = ''; // Clear input
                });
            });
        } else {
            alert("Please enter a checklist item.");
        }
    });

    // Function to display monitored websites
    function displayWebsites(websites = []) {
        const websiteList = document.getElementById('websiteList');
        websiteList.innerHTML = ''; // Clear existing list
        websites.forEach((site, index) => {
            const li = document.createElement('li');
            li.textContent = site;

            // Create a remove button
            const removeButton = document.createElement('button');
            removeButton.textContent = 'Remove';
            removeButton.addEventListener('click', () => {
                removeWebsite(index);
            });

            li.appendChild(removeButton); // Append the button to the list item
            websiteList.appendChild(li); // Append the list item to the list
        });
    }

    // Function to remove a website
    function removeWebsite(index) {
        chrome.storage.local.get(['monitoredWebsites'], (data) => {
            const websites = data.monitoredWebsites || [];
            websites.splice(index, 1); // Remove the website at the specified index
            chrome.storage.local.set({ monitoredWebsites: websites }, () => {
                displayWebsites(websites); // Update the display after removal
            });
        });
    }

    // Function to display checklist items
    function displayChecklist() {
        const checklistElement = document.getElementById('checklist');
        chrome.storage.local.get(['checklist'], (data) => {
            const checklist = data.checklist || [];
            checklistElement.innerHTML = ''; // Clear existing items

            checklist.forEach((task, index) => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <input type="checkbox" id="task-${index}" ${task.completed ? 'checked' : ''} />
                    <label for="task-${index}">${task.name}</label>
                    <button class="remove-task" data-index="${index}">x</button>
                `;
                checklistElement.appendChild(li);

                // Add event listener for checkbox
                document.getElementById(`task-${index}`).addEventListener('change', () => {
                    task.completed = !task.completed;
                    chrome.storage.local.set({ checklist: checklist });
                });

                // Add event listener for remove button
                li.querySelector('.remove-task').addEventListener('click', () => {
                    removeTask(index);
                });
            });
        });
    }

    // Function to remove a task
    function removeTask(index) {
        chrome.storage.local.get(['checklist'], (data) => {
            const checklist = data.checklist || [];
            checklist.splice(index, 1); // Remove the task at the specified index
            chrome.storage.local.set({ checklist: checklist }, () => {
                displayChecklist(); // Update the display after removal
            });
        });
    }
});
