export const TOKEN = {
    get github_token() { 
        return localStorage.getItem("github_token") || null;
    },
    get gist_id() {
        return localStorage.getItem("gist_id") || null;
    }
}