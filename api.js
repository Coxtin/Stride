const GITHUB_GIST_URL = `https://api.github.com/gists`;
const GITHUB_GIST_NAME = `tasks.json`;
let timeForSync = null;
let currentResolve = null;

function getAPIConfig() {

    const token = localStorage.getItem("github_token");
    const gistId = localStorage.getItem("gist_id");

    if (!token || !gistId){
        return null;
    }

    return {
        url : `${GITHUB_GIST_URL}/${gistId}`,
        headers: {
            "Authorization" : `Bearer ${token}`,
            "Accept" : "application/vnd.github.v3+json"
        }
    };
}

export async function loadTasksFromGist() {

    if (!navigator.onLine){
        return null;
    }

    try {

        const config = getAPIConfig();
        if (!config) return "no-credentials";

        console.log("Trying to update tasks from gist...");
        
        const response = await fetch (config.url, {
            method: "GET",
            headers: config.headers,
            cache: "no-store"
        });

        if (!response.ok){
            throw new Error(`Error while trying to fetch online saved tasks: ${response.status}`);
        }

        const data = await response.json();
        const content = data.files[GITHUB_GIST_NAME].content;
        const tasksContent = JSON.parse(content || "[]");

        localStorage.setItem("tasks", JSON.stringify(tasksContent));

        console.log("Tasks from gist have been uploaded!");
        return tasksContent;

    } catch (error){
        console.error("Error while fetching from cloud:", error);
        return null;
    }
}

export async function cloudSync(tasksArray) {

    if (!navigator.onLine){
        return null;
    }

    try {

        const config = getAPIConfig();
        if (!config) return "no-credentials";

        const requestBody = {
            files: {
                [GITHUB_GIST_NAME] : {
                    content: JSON.stringify(tasksArray)
                }
            }
        }

        const response = await fetch (`${config.url}`, {
            method: "PATCH",
            keepalive: true,
            headers: config.headers,
            body: JSON.stringify(requestBody)
        });

        if (!response.ok){
            throw new Error(`The sync could not be complete, because: ${response.status}`);
        }

        console.log("The sync has been successfully completed!");
        return true;

    } catch (error){
        console.error(`There was an error updating online tasks: ${error}`);
        return false;
    }

}

export function scheduleCloudSync(tasksArray) {
    return new Promise((resolve) => {
        if (timeForSync !== null){
            clearTimeout(timeForSync);
            if (currentResolve) currentResolve("superseded");
        }

        currentResolve = resolve;

        timeForSync = setTimeout(async () => {
            timeForSync = null;
            const response = await cloudSync(tasksArray);
            currentResolve(response);
        }, 2000);
    });
}

export function forceSync() {
    if (timeForSync !== null) {
        clearTimeout(timeForSync);
        timeForSync = null;
        console.log("Tab closed! Forcing cloud saving...");
        const savedTasks = JSON.parse(localStorage.getItem("tasks"));
        if (savedTasks) cloudSync(savedTasks);
    }
}

export function isOnline(){
    return navigator.onLine;
}