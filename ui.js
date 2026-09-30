export function showTasks(tasks) {

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
            const priorityBadge = element.priority
            ? element.priorityColor
                ? `<span class="badge priority" style="background-color: ${element.priorityColor}; color: contrast-color(${element.priorityColor})">${element.priority}</span>`
                : `<span class="badge priority-${priorityClass}">${element.priority}</span>`
            : `<span class="badge priority-${priorityClass}">No Priority</span>`;
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
                    <div>
                        ${element.duration && !element.isComplete
                            ? `<button class="start-timer-btn" id="start-timer-btn">Start ${element.duration} minute timer</button>`
                            : ``
                        }
                        ${!element.isComplete
                            ? `<button class="edit-btn">Edit task</button>`
                            : ''
                        }

                        <button class="delete-btn">Remove</button>
                    </div>
                </div>
            `
        });

        container.innerHTML = generatedHTML;
    }
}

export function toggleModal (modalId, shouldShow){

    const modal = document.getElementById(modalId);
    if (shouldShow)
        modal.showModal();
    else
        modal.close();
}

export function showSyncStatus(message, status){

    const statusMessage = document.getElementById("sync-status");

    if (!message)
        return;

    statusMessage.className = "sync-status";
    statusMessage.classList.add(status);
    statusMessage.textContent = message;

    if (status !== 'offline')
        setTimeout(() => {
            statusMessage.classList.add("hidden");
    }, 3000);
}

export function resetFormContent(formId){
    document.getElementById(formId).reset();
}

export function initializeDurationSelection() {
    const durationBtns = document.querySelectorAll(".duration-btn");
    const customInput = document.getElementById("custom-time");

    customInput.addEventListener("change", (event) => {
        const time = Number(event.target.value);
        if (event.target.value !== "" && time <= 0){
            alert("You can not set the duration of a task less than 1!");
            event.target.value = "";
        }
    }); 

    durationBtns.forEach(button => {
        button.addEventListener("click", () => {
            if (button.classList.contains("selected")){
                button.classList.remove("selected");
                customInput.style.display = "none";
                customInput.value = "";
            } else {
                durationBtns.forEach(btn => btn.classList.remove("selected"));
                button.classList.add("selected");

                if (!button.classList.contains("custom-duration")){
                    customInput.style.display = "none";
                    customInput.value = "";
                } else {
                    customInput.style.display = "block";
                    customInput.focus();
                }
            }
        });
    });
}

export function initializePrioritySelection() {
    const priorityBtns = document.querySelectorAll(".priority-btn");
    const customInput = document.getElementById("custom-priority");
    const customColor = document.getElementById("priority-color");

    customInput.addEventListener("change", (event) => {
        const priority = event.target.value;
        if (priority === ""){
            alert("Cannot set an empty priority!");
            event.target.value = "";
        }
    });

    priorityBtns.forEach(button => {
        button.addEventListener("click", () => {
            if (button.classList.contains("selected")){
                button.classList.remove("selected");
                customInput.style.display = "none";
                customColor.style.display = "none";
                customInput.value = "";
                customColor.value = "#000000";
            } else {
                priorityBtns.forEach(btn => btn.classList.remove("selected"));
                button.classList.add("selected");

                if (!button.classList.contains("custom-priority")){
                    customInput.style.display = "none";
                    customColor.style.display = "none";
                    customInput.value = "";
                    customColor.value = "#000000";
                } else {
                    customInput.style.display = "block";
                    customColor.style.display = "block";
                    customInput.focus();
                }
            }
        });
    });
}

export function updateHeaderUI(activeTasksCount, isCloudConfigured) {
    const container = document.getElementById("greeting");
    const syncStatus = document.getElementById("sync-status");

    if (!isCloudConfigured) {
        showSyncStatus("The cloud saving is off due to missing credentials", "offline");
    } else if (syncStatus.classList.contains("offline")) {
        syncStatus.className = "sync-status hidden";
    }

    container.textContent = `My Tasks: ${activeTasksCount}`;
}

export function resetTaskFormUI() {
    resetFormContent("add-task-form");

    const customTime = document.getElementById("custom-time");
    if (customTime) customTime.style.display = "none";

    const customPriority = document.getElementById("custom-priority");
    if (customPriority) customPriority.style.display = "none";

    const customColor = document.getElementById("priority-color");
    if (customColor) {
        customColor.value = "#000000";
        customColor.style.display = "none";
    }

    document.querySelectorAll(".duration-btn, .priority-btn").forEach(btn => {
        btn.classList.remove("selected");
    });
}

export function updateFocusTimer(timerElement, remainingTime){
    const minutes = Math.floor(remainingTime / 60);
    const seconds = (remainingTime % 60);

    const formattedMins = String(minutes).padStart(2, '0');
    const formattedSec = String(seconds).padStart(2, '0');

    timerElement.textContent = formattedMins + " : " + formattedSec;
}

export function playSound(){
    const audioCtx = new window.AudioContext;
    const oscillator = audioCtx.createOscillator();
    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
    oscillator.connect(audioCtx.destination);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.5);
}