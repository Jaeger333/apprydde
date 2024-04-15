async function main2() {
  
    await checkUserRole()
    console.log("checkUserRole")

}
  
  
async function checkUserRole() {
    await fetchUserRole()
    console.log("fetchUserRole")
};


document.addEventListener('DOMContentLoaded', main2)


async function fetchUserRole() {
    try {
        const response = await fetch('/currentUser')

        if (response.headers.get("content-type").includes("text/html")) {
            window.location.href = "/login.html";
            return;
        }
        
        let user = await response.json()
        console.log('user:', user)
        if (user[2] !== "Parent") {
            console.log('Child is logged in')
            window.location.href = "/app.html";
        } else {
            console.log('Parent is logged in')
        }
    } catch (error) {
        console.log('Failed to fetch thisUser:', error);
    }
}

