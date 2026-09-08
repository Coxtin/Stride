const API_URL = "./tasks.json";
let selectedDuration = null;
let selectedPriority = null;

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

async function loadTasksFromLocalStorage() {

    try {

        const container = document.getElementById("task-list");
        const currentTasks = JSON.parse(localStorage.getItem("tasks"));

        if (currentTasks === null){
            container.innerHTML = `
              <div class="empty-list">

                    <p>
                        No task registered yet! Press the button to add one!
                    </p>
                   

                </div>
            `
            return;
        }
        showTasks(currentTasks);

    } catch (error) {
        console.error("There was an error while finding for saved tasks: ", error);
    }

}

async function showTasks(tasks) {

    const container = document.getElementById("task-list");

    if (tasks.length === 0){
        container.innerHTML = `
            <div class="empty-list">

                <p>
                    No task registered yet! Press the button to add one!
                </p>
                <button class="add-task-button">Add a task</button>

            </div>
        `
    }
    else {
        let generatedHTML = '';
        tasks.forEach(element => {
            generatedHTML += `
                <div class="task-card" id="${element.id}">
                        ${element.taskName} - ${element.priority} ${element.duration ? "- " + element.duration : ""}
                        <button class="delete-btn">Remove task</button>
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

    const taskListUpdated = tasks.filter((obj) => obj.id !== id);

    localStorage.setItem("tasks", JSON.stringify(taskListUpdated));

    showTasks(taskListUpdated);


}

async function saveTask() {

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

    showTasks(tasksArray);

    taskNameInput.value = "";
    selectedDuration = null;
    selectedPriority = null;

    document.querySelectorAll(".selection-btn").forEach(selection => {
        selection.classList.remove("selected");
    })

    document.getElementById("modal").close();
}

document.addEventListener("DOMContentLoaded", () => {
    
    loadTasksFromLocalStorage();

    initializeDurationSelection();

    initializePrioritySelection();

    const modal = document.getElementById("modal");

    const taskListContainer = document.getElementById("task-list");

    taskListContainer.addEventListener("click", (event) => {

        if (event.target.classList.contains("delete-btn")){

            const selectedTask = event.target.closest(".task-card");
            const taskId = selectedTask.id;

            removeTask(taskId);

        }

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





