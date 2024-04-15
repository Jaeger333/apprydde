




const userSelect = document.getElementById("users");
const userSelect2 = document.getElementById("users2");
const userSelect3 = document.getElementById("users3");
const currentUserSelect = document.getElementById("currentUser");
const currentUserAssignedTasks = document.getElementById("currentUserAssignedTasks");
const assignedTaskSelect = document.getElementById("assignedTasks");
const assignedTaskSelect2 = document.getElementById("assignedTasks2");
const taskSelect = document.getElementById("tasks");
const taskHistory = document.getElementById("taskHistory");
const taskHistory2 = document.getElementById("taskHistory2");
const taskHistory3 = document.getElementById("taskHistory3");
const leaderboard = document.getElementById("leaderboard");
const monthLeaderboard = document.getElementById("monthLeaderboard");
const yearSelect = document.getElementById("year");
const monthSelect = document.getElementById("month");

const btnLeaderboard = document.getElementById('btnLeaderboard');
const btnMonthLeaderboard = document.getElementById('btnMonthLeaderboard');
const btnCurrentUserCompletedTasks = document.getElementById('btnCurrentUserCompletedTasks');
const btnAllCompletedTasks = document.getElementById('btnAllCompletedTasks');




//usersSelect.onchange = fetchTaskDone;

class User {
  constructor(id, username) {
  this.id = id;
  this.username = username;
  }
}




let users = null
let tasks = null
let familyPoints = null;
let done = null;
let thisUser = null




async function main() {
  console.log("main")
  await fetchData()
}


async function fetchData() {
  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()
  
  console.log("fetchData")
  await fetchCurrentUser()
  console.log("fetchCurrentUser")
  await fetchUsers(userSelect)
  console.log("fetchUsers")
  await fetchUsers(userSelect2)
  console.log("fetchUsers")
  await fetchUsers(userSelect3)
  console.log("fetchUsers")
  await fetchAssignedTasks(currentUserSelect, assignedTaskSelect)
  console.log("fetchAssignedTasks")
  await fetchAssignedTasks(currentUserSelect, currentUserAssignedTasks)
  console.log("fetchAssignedTasks")
  await fetchAssignedTasks2(userSelect2)
  console.log("fetchAssignedTasks2")
  await fetchTasks()
  console.log("fetchTasks")
  await fetchCompletedTasks()
  console.log("fetchCompletedTasks")
  await fetchCompletedTasks2(currentUserSelect, taskHistory2)
  console.log("fetchCompletedTasks2")
  await fetchCompletedTasks2(userSelect3, taskHistory3)
  console.log("fetchCompletedTasks2")
  await fetchLeaderboard()
  console.log("fetchLeaderboard")
  await fetchMonthLeaderboard()
  console.log("fetchMonthLeaderboard")
  await fetchUserInfo()
  console.log("fetchUserInfo")

  btnLeaderboard.addEventListener('click', () => showDiv('leaderboardDiv'));
  btnMonthLeaderboard.addEventListener('click', () => showDiv('monthLeaderboardDiv'));

  userSelect2.addEventListener('change', async () => {
    await fetchAssignedTasks2(userSelect2);
  });
  userSelect3.addEventListener('change', async () => {
    await fetchCompletedTasks2(userSelect3, taskHistory3);
  });
  btnCurrentUserCompletedTasks.addEventListener('click', () => showDiv2('currentUserCompletedTasksDiv'));
  btnAllCompletedTasks.addEventListener('click', () => showDiv2('allCompletedTasksDiv'));
  };

  
document.addEventListener('DOMContentLoaded', main)



async function fetchCurrentUser() {
  try {
      const response = await fetch('/currentUser')

      if (response.headers.get("content-type").includes("text/html")) {
        window.location.href = "/login.html";
        return;
    }
      
      let user = await response.json()
      console.log('user:', user)
      thisUser = new User(user[0], user[1])
      console.log('thisuser:', thisUser)
      populateCurrentUser(thisUser);
      fetchAssignedTasks(currentUserSelect)
  } catch (error) {
      console.log('Failed to fetch thisUser:', error);
  }
}

function populateCurrentUser(user) {
  currentUserSelect.innerHTML = "";
  console.log(user)
  const option = document.createElement("option");
  option.value = user.id;
  option.textContent = user.username
  currentUserSelect.appendChild(option);
}


async function fetchCompletedTasks() {
  try {
    const response = await fetch('/completedTasks')

    tasks = await response.json()
    console.log(tasks)
    populateCompletedTasks(tasks);
  } catch (error) {
    console.log('Failed to fetch tasks:', error);
  }
}


function populateCompletedTasks(tasks) {
  taskHistory.innerHTML = "";
  console.log(tasks)
  for (let i = 0; i<tasks.length; i++) {
    const option = document.createElement("option");
    option.value = tasks[i].id;
    option.textContent = `${tasks[i].name} (${tasks[i].points} pts), ${tasks[i].username}, ${tasks[i].completed}`
    taskHistory.appendChild(option);
  }
}


async function fetchCompletedTasks2(selection, selection2) {
  try {
    console.log("fetchCurrentUserCompletedTasks started:", selection.value)
    const selectedUser = selection.value
    console.log("fetchCurrentUserCompletedTasks started:", selectedUser)
    const response = await fetch(`/currentUserCompletedTasks/${selectedUser}`)

    tasks = await response.json()
    console.log("fetchCurrentUserCompletedTasks completed:", tasks)
    populateCompletedTasks2(tasks, selection2);
  } catch (error) {
    console.log('Failed to fetch currentUserCompletedTasks:', error);
  }
}


function populateCompletedTasks2(tasks, selection2) {
  selection2.innerHTML = "";
  console.log(tasks)
  for (let i = 0; i<tasks.length; i++) {
    const option = document.createElement("option");
    option.value = tasks[i].id;
    option.textContent = `${tasks[i].name} (${tasks[i].points} pts), ${tasks[i].username}, ${tasks[i].completed}`
    selection2.appendChild(option);
  }
}


async function fetchLeaderboard() {
  try {
    const response = await fetch('/leaderboard')

    tasks = await response.json()
    console.log(tasks)


    console.log(tasks)

    populateLeaderboard(tasks);
  } catch (error) {
    console.log('Failed to fetch leaderboard:', error);
  }
}

function populateLeaderboard(tasks) {
  leaderboard.innerHTML = "";
  console.log(tasks)
  for (let i = 0; i<tasks.length; i++) {
    const option = document.createElement("option");
    option.value = tasks[i].id;
    option.textContent = `${i+1}. ${tasks[i].username}, (${tasks[i].total_points} pts)`
    leaderboard.appendChild(option);
  }
}


async function fetchMonthLeaderboard() {
  try {
    const response = await fetch('/monthLeaderboard')

    tasks = await response.json()
    console.log(tasks)


    console.log(tasks)

    populateMonthLeaderboard(tasks);
  } catch (error) {
    console.log('Failed to fetch leaderboard:', error);
  }
}

function populateMonthLeaderboard(tasks) {
  monthLeaderboard.innerHTML = "";
  console.log(tasks)
  for (let i = 0; i<tasks.length; i++) {
    const option = document.createElement("option");
    option.value = tasks[i].id;
    option.textContent = `${i+1}. ${tasks[i].username}, (${tasks[i].total_points} pts)`
    monthLeaderboard.appendChild(option);
  }
}

function showDiv(div) {
  console.log("showDiv")
  document.getElementById('leaderboardDiv').style.display = div === 'leaderboardDiv' ? 'block' : 'none';
  document.getElementById('monthLeaderboardDiv').style.display = div === 'monthLeaderboardDiv' ? 'block' : 'none';
}

function showDiv2(div) {
  console.log("showDiv2")
  document.getElementById('currentUserCompletedTasksDiv').style.display = div === 'currentUserCompletedTasksDiv' ? 'block' : 'none';
  document.getElementById('allCompletedTasksDiv').style.display = div === 'allCompletedTasksDiv' ? 'block' : 'none';
}

async function fetchAssignedTasks(selection, selection2) {
  try {
    // Get the selected user
    const selectedUser = selection.value;

    // Fetch the tasks for the selected user
    const response = await fetch(`/assignedTasks/${selectedUser}`);
    const tasks = await response.json();
    populateAssignedTasks(tasks, selection2);
  } catch (error) {
    console.log('Failed to fetch assigned tasks:', error);
  }
}

function populateAssignedTasks(tasks, selection2) {
  selection2.innerHTML = "";
  console.log(tasks)
  for (let i = 0; i<tasks.length; i++) {
    const option = document.createElement("option");
    option.value = tasks[i].id;
    option.textContent = `${tasks[i].name} (${tasks[i].points} pts)`
    selection2.appendChild(option);
  }
}

async function fetchAssignedTasks2(selection) {
  try {
    // Get the selected user
    const selectedUser = selection.value;

    // Fetch the tasks for the selected user
    const response = await fetch(`/assignedTasks2/${selectedUser}`);
    const tasks = await response.json();
    populateAssignedTasks2(tasks);
  } catch (error) {
    console.log('Failed to fetch assigned tasks:', error);
  }
}

function populateAssignedTasks2(tasks) {
  assignedTaskSelect2.innerHTML = "";
  console.log(tasks)
  for (let i = 0; i<tasks.length; i++) {
    const option = document.createElement("option");
    option.value = tasks[i].id;
    option.textContent = `${tasks[i].name} (${tasks[i].points} pts)`
    assignedTaskSelect2.appendChild(option);
  }
}


async function fetchTasks() {
  try {
    const response = await fetch('/tasks')

    tasks = await response.json()
    console.log(tasks)
    populateTasks(tasks);
  } catch (error) {
    console.log('Failed to fetch tasks:', error);
  }
}

function populateTasks(tasks) {
  taskSelect.innerHTML = "";
  console.log(tasks)
  for (let i = 0; i<tasks.length; i++) {
    const option = document.createElement("option");
    option.value = tasks[i].id;
    option.textContent = `${tasks[i].name} (${tasks[i].points} pts)`
    taskSelect.appendChild(option);
  }
}


async function fetchUsers(selection) {
  try {
    const response = await fetch('/users')

    users = await response.json()
    console.log(users)
    populateUsers(users, selection);
  } catch (error) {
    console.log('Failed to fetch users:', error);
  }
}



function populateUsers(users, selection) {
  selection.innerHTML = "";
  console.log(users)
  for (let i = 0; i<users.length; i++) {
    const option = document.createElement("option");
    option.value = users[i].id;
    option.textContent = users[i].username
    selection.appendChild(option);
  }
}









