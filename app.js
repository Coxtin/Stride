import { loadTasksFromGist, cloudSync, scheduleCloudSync, forceSync, isOnline } from "./api.js";
import { showTasks, showSyncStatus, toggleModal, initializeDurationSelection, initializePrioritySelection, updateHeaderUI, resetTaskFormUI, updateFocusTimer, playSound } from "./ui.js";
import * as task from "./tasks.js";

function showHeader () {
    const tasksArray = JSON.parse(localStorage.getItem("tasks")) || [];
    const activeTasksCount = tasksArray.filter(task => !task.isComplete).length;
    
    const token = localStorage.getItem("github_token");
    const gistId = localStorage.getItem("gist_id");
    const isCloudConfigured = Boolean(token && gistId);

    updateHeaderUI(activeTasksCount, isCloudConfigured);
}


document.addEventListener("DOMContentLoaded", async () => {

    let response = await loadTasksFromGist();

    if (response === null || response === "no-credentials"){
        response = await task.loadTasksFromLocalStorage();
    } else {
        task.updateTasksArray(response);
    }

    showTasks(response);
    showHeader();

    const loadingOverlay = document.getElementById("spinner-fullscreen");

    loadingOverlay.style.opacity = "0";
    loadingOverlay.style.transition = "opacity 0.5s ease";
    setTimeout(() => {
        loadingOverlay.style.display = "none"
    }, 500);

    showHeader();
    initializeDurationSelection();
    initializePrioritySelection();

    const taskListContainer = document.getElementById("task-list");
    const githubPAT = document.getElementById("github-PAT");
    const githubGistId = document.getElementById("github-gist-id");
    
    taskListContainer.addEventListener("click", async (event) => {
        console.log("The card was pressed!");
        const selectedTask = event.target.closest(".task-card");
        if (!selectedTask){
            console.log("No task!");
            return;
        }
        const taskId = selectedTask.id;
        let updatedTasks = null;
        console.log("Tasks's id: ", taskId);
        const deleteButton = event.target.closest(".delete-btn");
        const editButton = event.target.closest(".edit-btn");
        const openFocusModal = event.target.closest(".start-timer-btn");

        const token = localStorage.getItem("github_token");
        const gistId = localStorage.getItem("gist_id");
        const isCloudConfigured = Boolean(token && gistId);

        if (deleteButton){
            updatedTasks = task.removeTask(taskId);
            if (isCloudConfigured) showSyncStatus("Removing task...", "saving");
        }
        else if (openFocusModal){
            const focusTitle = document.getElementById("working-task-name");
            const focusTime = document.getElementById("working-task-time");
            
            task.startFocusMode(taskId, 
                (taskName, totalTime) => {
                    focusTitle.textContent = taskName;
                    toggleModal("focus-modal", true);
                    updateFocusTimer(focusTime, totalTime);
                },
                (remainingTime) => {
                    updateFocusTimer(focusTime, remainingTime);
                },
                () => {
                    focusTime.textContent = "00:00";
                    playSound();
                    alert("The time expired! Have you finished?");
                }
            );
            return;
        }
        else if(editButton){
            toggleModal("modal", true);
            task.editTask(taskId);
            return;
        }
        else {
            updatedTasks = task.checkTask(taskId);
            if (isCloudConfigured) showSyncStatus("Updating task...", "saving");
        }

        showTasks(updatedTasks);
        showHeader();

        if (isCloudConfigured) {
            const syncResult = await scheduleCloudSync(updatedTasks);
            
            if (syncResult === true){
                showSyncStatus("All changes saved!", "success");
            } else if (syncResult === false) {
                showSyncStatus("Something went wrong! Please try again!", "error");
            }
        }
    });
    document.getElementById("openModal").addEventListener("click", () => {
       toggleModal("modal", true);
    });

    document.getElementById("closeModal").addEventListener("click", () => {
        resetTaskFormUI();
        task.resetTaskState();
        toggleModal("modal", false);
    });

    document.getElementById("add-task-form").addEventListener("submit",async (event) => {
        event.preventDefault();

        if (!isOnline)
            return;

        const taskNameInput = document.getElementById("task-name");
        const taskName = taskNameInput ? taskNameInput.value.trim() : "";

        if (taskName === ''){
            alert("The new task has no name!");
            return;
        }

        let extractedDuration = undefined;
        const activeDurationBtn = document.querySelector(".duration-btn.selected");
        if (activeDurationBtn) {
            if (activeDurationBtn.classList.contains("custom-duration")) {
                extractedDuration = Number(document.getElementById("custom-time").value) || 0;
            } else {
                extractedDuration = Number(activeDurationBtn.dataset.duration);
            }
        }

        let extractedPriority = undefined;
        let extractedPriorityColor = undefined;
        const activePriorityBtn = document.querySelector(".priority-btn.selected");
        if (activePriorityBtn) {
            if (activePriorityBtn.classList.contains("custom-priority")) {
                extractedPriority = document.getElementById("custom-priority").value || "";
                extractedPriorityColor = document.getElementById("priority-color").value || "";
            } else {
                extractedPriority = activePriorityBtn.textContent;
            }
        }

        const updatedTasks = task.saveTask(taskName, extractedDuration, extractedPriority, extractedPriorityColor);
        toggleModal("modal", false);
        showTasks(updatedTasks);
        showHeader();

        const token = localStorage.getItem("github_token");
        const gistId = localStorage.getItem("gist_id");
        if (token && gistId) {
            showSyncStatus("Saving to cloud...", "saving");
            const syncResult = await scheduleCloudSync(updatedTasks);

            if (syncResult){
                showSyncStatus("All changes saved!", "success");
            } else {
                showSyncStatus("There was an error while updating", "error");
            }
        }
    });

    document.getElementById("open-settings-modal").addEventListener("click", () => {

        githubPAT.value = localStorage.getItem("github_token") || "";
        githubGistId.value = localStorage.getItem("gist_id") || "";
        toggleModal("settings-modal", true);

    });

    document.getElementById("close-settings-modal-btn").addEventListener("click", () => {
        toggleModal("settings-modal", false);
    });

    document.getElementById("submit-settings-btn").addEventListener("submit", async (event) => {

        event.preventDefault();

        const newToken = githubPAT.value.trim();
        const newGist = githubGistId.value.trim();

        if (newToken && newGist){
            localStorage.setItem("github_token", newToken);
            localStorage.setItem("gist_id", newGist);

            console.log("New cloud settings established! Syncing data...");
           
            toggleModal("settings-modal", false);

            showSyncStatus("Downloading content from cloud...", "saving");
            
            const updatedTasks = await loadTasksFromGist();
            if (updatedTasks && updatedTasks !== "no-credentials") {
                task.updateTasksArray(updatedTasks);
                showTasks(updatedTasks);
            } else {
                showTasks(updatedTasks);
            }

            showHeader();

            showSyncStatus("Cloud Sync Activated", "succes");
        } else {
            alert("You have to enter both values in the form!")
        }

    });
    
    document.getElementById("stop-timer-btn").addEventListener("click", () => {
        task.stopFocusMode();
        toggleModal("focus-modal", false);
    });

    document.getElementById("finish-btn").addEventListener("click", async () => {
        const updatedTasks = task.finishFocusMode();
        toggleModal("focus-modal", false);
        showHeader();
        showTasks(updatedTasks);

        const token = localStorage.getItem("github_token");
        const gistId = localStorage.getItem("gist_id");
        if (token && gistId) {
            showSyncStatus("Updating...", "saving");
            if (await scheduleCloudSync(updatedTasks)){
                showSyncStatus("All changes saved!", "success");
            } else {
                showSyncStatus("Something went wrong! Please try again!", "error");
            }
        }
    });
});

document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === 'hidden'){
        forceSync();
    }
});

window.addEventListener("online", () => {
    console.log("Back online! Syncing ...");
    showSyncStatus("Back online! Syncing ...", "saving");
    const savedTasks = JSON.parse(localStorage.getItem("tasks"));

    if (savedTasks){
        cloudSync(savedTasks);
    }
});

window.addEventListener("offline", () => {
    showSyncStatus("Offline! Local Save Only.", "offline");
    console.log("There is no internet! Only local save!");
})