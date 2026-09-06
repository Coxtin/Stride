const API_URL = "./tasks.json";
let selectedDuration = null;

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

function showTasks(tasks) {

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
                        ${element.title}
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

document.addEventListener("DOMContentLoaded", () => {
    
    loadTasksFromFile();

    initializeDurationSelection();

    const modal = document.getElementById("modal");

    document.getElementById("openModal").addEventListener("click", () => {
        modal.showModal();
    });

    document.getElementById("closeModal").addEventListener("click", () => {
        modal.close();
    });
});





