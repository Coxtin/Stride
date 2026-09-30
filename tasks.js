import { resetTaskFormUI } from "./ui.js";
import { toggleModal } from "./ui.js";

let tasksArray = JSON.parse(localStorage.getItem("tasks")) || [];

let selectedPriority = null;
let selectedPriorityColor = null;
let selectedDuration = null;
let currentEditTaskId = null;
let currentFocusTaskId = null;
let currentFocusInterval = null;

export function saveTask(taskName, parsedDuration, parsedPriority, parsedPriorityColor) {
    
    if (parsedDuration !== undefined) selectedDuration = parsedDuration;
    if (parsedPriority !== undefined) selectedPriority = parsedPriority;
    if (parsedPriorityColor !== undefined) selectedPriorityColor = parsedPriorityColor;

    const shouldEdit = currentEditTaskId !== null;

    if (shouldEdit){

        tasksArray = tasksArray.map(task => {
            if (task.id === currentEditTaskId){
                return {
                    ...task,
                    taskName: taskName,
                    priority: selectedPriority,
                    priorityColor: selectedPriorityColor,
                    duration: selectedDuration
                }
            }
            return task;
        });
        console.log("Changes made");

    } else {

        const newTask = {
            id: "task-" + Date.now(),
            taskName: taskName,
            priority: selectedPriority,
            priorityColor: selectedPriorityColor,
            duration: selectedDuration,
            isComplete: false,
            createdAt: new Date().toISOString()
        }
        tasksArray.push(newTask);

        console.log("The new task: ", newTask);
    }

    localStorage.setItem("tasks", JSON.stringify(tasksArray));
    
    resetTaskFormUI();
    resetTaskState();
   
    return tasksArray;
}

export function resetTaskState() {
    currentEditTaskId = null;
    selectedDuration = null;
    selectedPriority = null;
    selectedPriorityColor = null;
    const modalTitle = document.querySelector("#modal h2");
    if (modalTitle) modalTitle.textContent = "Enter a new task";
}

export function removeTask(id){

    if (!tasksArray){
        console.log("There is no task with such id to delete!");
        return;
    }

    tasksArray = tasksArray.filter((obj) => obj.id !== id);

    localStorage.setItem("tasks", JSON.stringify(tasksArray));

    return tasksArray;

}

export function checkTask(id){

    if (!tasksArray)
        return;

    tasksArray = tasksArray.map((element) => {
        if (element.id === id){
            return {...element, isComplete: !element.isComplete}
        }
        return element;
    });

    localStorage.setItem("tasks", JSON.stringify(tasksArray));
    return tasksArray;
    
}

export function editTask(taskId){

    const taskToEdit = tasksArray.find(task => task.id === taskId);

    if (!taskToEdit){
        alert("There is no task to edit!");
        return;
    }

    currentEditTaskId = taskId;

    document.querySelector("#modal h2").textContent = "Edit task";
    document.getElementById("task-name").value = taskToEdit.taskName;
    selectedDuration = taskToEdit.duration || null;
    selectedPriority = taskToEdit.priority || null;
    selectedPriorityColor = taskToEdit.priorityClass || null;

}

export function loadTasksFromLocalStorage() {

    try {

        const container = document.getElementById("task-list");

        if (tasksArray === null){
            container.innerHTML = `
              <div class="empty-list">
                    <p>No tasks registered yet! Click the button above to add one!</p>
                </div>
            `
            return;
        }
       
        return tasksArray;

    } catch (error) {
        console.error("There was an error while finding for saved tasks: ", error);
    }
}

export function startFocusMode(taskId, onStart, onTick, onFinish) {

    console.log("Start focusing...");

    const task = tasksArray.find(task => task.id === taskId);

    if (!task){
        alert("There is no task!");
        return false;
    }

    if (!task.duration || task.duration <= 0){
        return false;
    }

    currentFocusTaskId = taskId;
    let remainingTime = Number(task.duration) * 60;

    if (onStart) onStart(task.taskName, remainingTime);

    if (currentFocusInterval) clearInterval(currentFocusInterval);

    currentFocusInterval = setInterval(() => {
        remainingTime--;

        if (onTick) onTick(remainingTime);

        if (remainingTime <= 0){
            clearInterval(currentFocusInterval);
            if (onFinish) onFinish();
        }
    }, 1000);

    return true;
}



export function stopFocusMode() {
    if (currentFocusInterval) {
        clearInterval(currentFocusInterval);
        currentFocusInterval = null;
    }
}

export function finishFocusMode() {
    stopFocusMode();
    const updatedTasks = checkTask(currentFocusTaskId);
    currentFocusTaskId = null;
    return updatedTasks;
}

export function updateTasksArray(newTasks) {
    if (newTasks) {
        tasksArray = newTasks;
    }
}