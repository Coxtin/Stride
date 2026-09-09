const API_URL = "./tasks.json";
let selectedDuration = null;
let selectedPriority = null;

function countCurrentTasks () {

    const container = document.getElementById("greeting");
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

    durationBtns.forEach(button => {

        button.addEventListener("click", () => {
            
            durationBtns.forEach(btn => {
                btn.classList.remove("selected");
            });

            button.classList.add("selected");

            if (!button.classList.contains("custom-duration"))
                selectedDuration = Number(button.dataset.duration);

            console.log("Taskul dureaza: ", selectedDuration, " timp");

        });
    })

}

function initializePrioritySelection() {

    const priorityBtns = document.querySelectorAll(".priority-btn");

    priorityBtns.forEach(button => {

        button.addEventListener("click", () => {
            
            priorityBtns.forEach(btn => {
                btn.classList.remove("selected");
            });

            button.classList.add("selected");

            selectedPriority = button.textContent;

            console.log("Taskul are prioritatea: ", selectedPriority);
        });
    })

}

async function removeTask(id){

    const tasks = JSON.parse(localStorage.getItem("tasks"));

    if (!tasks){
        console.log("There is no task with such id to delete!");
        return;
    }

    const taskListUpdated = tasks.filter((obj) => obj.id !== id);

    localStorage.setItem("tasks", JSON.stringify(taskListUpdated));

    countCurrentTasks();
    showTasks(taskListUpdated);

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

    countCurrentTasks();
    showTasks(tasksArray);

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
    countCurrentTasks();
    showTasks(tasksArrayUpdated);
}

document.addEventListener("DOMContentLoaded", () => {
    
    countCurrentTasks();

    loadTasksFromLocalStorage();

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