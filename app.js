const API_URL = "./tasks.json";
let selectedDuration = null;
let selectedPriority = null;
let timeForSync = null;

function showHeader () {

    const container = document.getElementById("greeting");
    const syncStatus = document.getElementById("sync-status");
    const tasksArray = JSON.parse(localStorage.getItem("tasks"));

    if (!tasksArray)
        return 0;

    let count = 0;

    tasksArray.forEach((element) => {
        if (!element.isComplete)
            count++;
    });

    container.textContent = "My Tasks: " + String(count);

}

async function loadTasksFromFile() {

    try {

        const response = await fetch(API_URL);

        if (!response.ok){
            // console.error("Nu am putut prelua datele: ", response.error);
            // return;
            throw new Error("Eroare la incarcarea datelor locale!");
        }

        const data = await response.json();

        showTasks(data);
        

    } catch (error){
        console.error("Nu am putut citi fisierul .json: ", error);
    }

}

function loadTasksFromLocalStorage() {

    try {

        const container = document.getElementById("task-list");
        const currentTasks = JSON.parse(localStorage.getItem("tasks"));

        if (currentTasks === null){
            container.innerHTML = `
              <div class="empty-list">
                    <p>No tasks registered yet! Click the button above to add one!</p>
                </div>
            `
            return;
        }
        showTasks(currentTasks);

    } catch (error) {
        console.error("There was an error while finding for saved tasks: ", error);
    }
}

async function loadTasksFromGist() {

    const token = localStorage.getItem("github_token");
    const gistId = localStorage.getItem("gist_id");

    if (!token || !gistId){
        console.log("There is no github token or gist!");
        loadTasksFromLocalStorage();
        return;
    }

    if (!navigator.onLine){
        loadTasksFromLocalStorage();
        return;
    }

    try {

        console.log("Trying to update tasks from gist...");
        const response = await fetch (`https://api.github.com/gists/${gistId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': `application/vnd.github.v3+json`
            },
        });

        if (!response.ok){
            throw new Error(`Error while trying to fetch online saved tasks: ${response.status}`);
        }

        const data = await response.json();
        const content = data.files['tasks.json'].content;
        const tasksContent = JSON.parse(content || "[]");

        localStorage.setItem("tasks", JSON.stringify(tasksContent));
        showTasks(tasksContent);
        console.log("Tasks from gist have been uploaded!");
    } catch (error){
        console.error("There was an error while fetching the online tasks:", error);
        loadTasksFromLocalStorage();
    }

}

async function cloudSync(tasksArray) {

    const token = localStorage.getItem("github_token");
    const gistId = localStorage.getItem("gist_id");

    if (!token || !gistId){
        console.log("There is no github token or gist id");
        return;
    }

    if (!navigator.onLine){
        showSyncStatus("Offline! Local Save Only!", "offline");
        return;
    }

    showSyncStatus("Saving to Cloud...", "saving");

    try {

        const response = await fetch (`https://api.github.com/gists/${gistId}`, {
            method: "PATCH",
            keepalive: true,
            headers: {
                "Authorization": `Bearer ${token}`,
                "Accept": "application/vnd.github.v3+json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                files: {
                    'tasks.json': {
                        content: JSON.stringify(tasksArray)
                    }
                }
            })
        });

        if (!response.ok){
            throw new Error(`The sync could not be complete, because: ${response.status}`);
        }

        showSyncStatus("All changes saved!", "success");

        console.log("The sync has been successfully completed!");

    } catch (error){
        console.error(`There was an error updating online tasks: ${error}`);
        showSyncStatus("Sync failed! Will retry later.", "error");
    }

}

function scheduleCloudSync(tasksArray) {
    if (timeForSync !== null)
        clearTimeout(timeForSync);

    timeForSync = setTimeout(() => {
        cloudSync(tasksArray);
    }, 2000);
}

function showTasks(tasks) {

    const container = document.getElementById("task-list");

    if (tasks.length === 0){
        container.innerHTML = `
            <div class="empty-list">
                <p>No tasks registered yet! Click the button above to add one!</p>
            </div>
        `
    }
    else {
        let generatedHTML = '';
        tasks.forEach(element => {
            const priorityClass = element.priority ? element.priority.toLowerCase() : 'none';
            const priorityBadge = element.priority ? `<span class="badge priority-${priorityClass}">${element.priority}</span>` : `<span class="badge priority-${priorityClass}">No Priority</span>`;
            const durationBadge = element.duration ? `<span class="badge duration">${element.duration} min</span>` : `<span class="badge duration">No duration</span>`;
            
            generatedHTML += `
                <div class="task-card ${element.isComplete ? "completed" : "" }" id="${element.id}">
                    <div class="task-info">
                        <h3 class="task-title">${element.taskName}</h3>
                        <div class="task-meta">
                            ${priorityBadge}
                            ${durationBadge}
                        </div>
                    </div>
                    <button class="delete-btn">Remove</button>
                </div>
            `
        });

        container.innerHTML = generatedHTML;
    }
}

function initializeDurationSelection() {

    const durationBtns = document.querySelectorAll(".duration-btn");
    const customInput = document.getElementById("custom-time");

    customInput.addEventListener("change", (event) => {

        const time = Number(event.target.value);
        if (event.target.value !== "" && time <= 0){
            alert("You can not set the duration of a task less than 1!");
            event.target.value = "";
            selectedDuration = 0;
            return;
        }
        selectedDuration = time;
        console.log("Custom time updated to: ", selectedDuration);
    }); 

    durationBtns.forEach(button => {

        button.addEventListener("click", () => {
            
            if (button.classList.contains("selected")){
                button.classList.remove("selected");
                selectedDuration = null;
                customInput.style.display = "none";
                customInput.value = "";
            } else {

                durationBtns.forEach(btn => {
                    btn.classList.remove("selected");
                });

                button.classList.add("selected");

                if (!button.classList.contains("custom-duration")){
                    customInput.style.display = "none";
                    customInput.value = "";
                    selectedDuration = Number(button.dataset.duration);
                } else {
                    customInput.style.display = "block";
                    customInput.focus();
                    selectedDuration = Number(customInput.value) || 0;
                }

                console.log("The task takes : ", selectedDuration, " time to finish");
            }
        });
    });
}

function initializePrioritySelection() {

    const priorityBtns = document.querySelectorAll(".priority-btn");
    const customInput = document.getElementById("custom-priority");

    customInput.addEventListener("change", (event) => {

        const priority = event.target.value;

        if (priority === ""){
            alert("Cannot set an empty priority!");
            event.target.value = "";
            selectedPriority = "";
            return;
        }

        selectedPriority = priority;
        console.log("The priority of the task is :", selectedPriority);

    });

    priorityBtns.forEach(button => {

        button.addEventListener("click", () => {
            
            if (button.classList.contains("selected")){
                button.classList.remove("selected");
                selectedPriority = null;
                customInput.style.display = "none";
                customInput.value = "";
            } else {

                priorityBtns.forEach(btn => {
                    btn.classList.remove("selected");
                });

                button.classList.add("selected");

                if (!button.classList.contains("custom-priority")){
                    customInput.style.display = "none";
                    customInput.value = "";
                    selectedPriority = button.textContent;
                } else {
                    customInput.style.display = "block";
                    customInput.focus();
                    selectedPriority = customInput.value || "";
                }

                console.log("The task is : ", selectedPriority, " important");
            }
        });
    })

}

function removeTask(id){

    const tasks = JSON.parse(localStorage.getItem("tasks"));

    if (!tasks){
        console.log("There is no task with such id to delete!");
        return;
    }

    const taskListUpdated = tasks.filter((obj) => obj.id !== id);

    localStorage.setItem("tasks", JSON.stringify(taskListUpdated));

    showHeader();
    showTasks(taskListUpdated);
    scheduleCloudSync(taskListUpdated);

}

function saveTask() {

    const taskNameInput = document.getElementById("task-name");
    const taskName = taskNameInput.value.trim();
    
    if (taskName === ''){
        alert("The new task has no name!");
        return;
    }

    const newTask = {
        id: "task-" + Date.now(),
        taskName: taskName,
        priority: selectedPriority,
        duration: selectedDuration,
        isComplete: false,
        createdAt: new Date().toISOString(),
        needSync: true
    }

    console.log("The new task: ", newTask);

    const savedTasks = localStorage.getItem("tasks");
    let tasksArray = [];


    if (savedTasks !== null)
        tasksArray = JSON.parse(savedTasks);

    tasksArray.push(newTask);

    localStorage.setItem("tasks", JSON.stringify(tasksArray));

    showHeader();
    showTasks(tasksArray);
    scheduleCloudSync(tasksArray);

    taskNameInput.value = "";
    selectedDuration = null;
    selectedPriority = null;

    document.querySelectorAll(".selection-btn").forEach(selection => {
        selection.classList.remove("selected");
    })

    document.getElementById("modal").close();
}

function checkTask(id){

    const tasksArray = JSON.parse(localStorage.getItem("tasks"));

    if (!tasksArray)
        return;

    const tasksArrayUpdated = tasksArray.map((element) => {
        if (element.id === id){
            return {...element, isComplete: !element.isComplete}
        }
        return element;
    });

    localStorage.setItem("tasks", JSON.stringify(tasksArrayUpdated));
    //console.log("The task with the following id: ", id, " was checked/unchecked")
    showHeader();
    showTasks(tasksArrayUpdated);
    scheduleCloudSync(tasksArrayUpdated);
}

function showSyncStatus (message, status){

    const statusMessage = document.getElementById("sync-status");

    if (!statusMessage)
        return;

    statusMessage.className = "sync-status";
    statusMessage.classList.add(status);
    statusMessage.textContent = message;

    if (status !== 'offline')
        setTimeout(() => {
            statusMessage.classList.add('hidden');
    }, 3000);
}

document.addEventListener("DOMContentLoaded", async () => {

    await loadTasksFromGist();

    showHeader();

    initializeDurationSelection();

    initializePrioritySelection();

    const modal = document.getElementById("modal");

    const taskListContainer = document.getElementById("task-list");

    taskListContainer.addEventListener("click", (event) => {

        console.log("The card was pressed!");
        const selectedTask = event.target.closest(".task-card");

        if (!selectedTask){
            console.log("No task!");
            return;
        }

        const taskId = selectedTask.id;

        console.log("Tasks's id: ", taskId);

        const deleteButton = event.target.closest(".delete-btn")
        
        if (deleteButton)
            removeTask(taskId);
        else
            checkTask(taskId);
    });

    document.getElementById("openModal").addEventListener("click", () => {
        modal.showModal();
    });

    document.getElementById("closeModal").addEventListener("click", () => {
        modal.close();
    });

    document.getElementById("add-task-form").addEventListener("submit", (event) => {
        event.preventDefault();
        saveTask();
    });
});

document.addEventListener("visibilitychange", () => {

    if (document.visibilityState === 'hidden'){

        if (timeForSync !== null){

            clearTimeout(timeForSync);
            timeForSync = null;

            console.log("Tab closed! Forcing cloud saving...");

            const savedTasks = JSON.parse(localStorage.getItem("tasks"));

            if (savedTasks)
                cloudSync(savedTasks);
        }
    }
});

window.addEventListener("online", () => {
    console.log("Back online! Syncing ...");
    const savedTasks = JSON.parse(localStorage.getItem("tasks"));

    if (savedTasks){
        cloudSync(savedTasks);
    }
});

window.addEventListener("offline", () => {
    showSyncStatus("Offline! Local Save Only.", "offline");
    console.log("There is no internet! Only local save!");
})