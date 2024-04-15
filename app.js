const multer = require('multer');
const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const sqlite3 = require('better-sqlite3')
const db = sqlite3('./users.db', {verbose: console.log})
const session = require('express-session')
const dotenv = require('dotenv');
const upload = multer(); 

dotenv.config()


const saltRounds = 10
const app = express()
const staticPath = path.join(__dirname, 'public')


app.use(express.urlencoded({ extended: true }));


app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))



// Define your middleware and routes here


app.use(express.static(staticPath));

app.post('/login', upload.none(), (req, res) => {
    console.log(req.body)
    try {
        let user = checkUserPassword(req.body.username, req.body.password) 
        if ( user != null) {
            req.session.loggedIn = true
            req.session.username = req.body.username
            req.session.userrole = user.role
            req.session.userid = user.userid
            if (user.role === "Parent") {
                req.session.isAdmin = true
            } else {
                req.session.isAdmin = false
            }
    
        //res.redirect('/');
        // Pseudocode - Adjust according to your actual frontend framework or vanilla JS
 
        } 

        if (user == null || !req.session.loggedIn) {
            res.json(null);
        }
        else {res.json(user)}

    }
    catch {
       
       res.json(null);
    }

})



app.post('/register', (req, res) => {
    console.log("registerUser", req.body);
    const reguser = req.body;
    const user = addUser(reguser.username, reguser.mobile, reguser.email, reguser.password, reguser.role)
    // Redirect to user list or confirmation page after adding user
    if (user)   {
        req.session.loggedIn = true
        req.session.username = user.username
        req.session.userrole = user.role
        req.session.userid = user.id

        req.session.loggedIn = true
        res.redirect('/app.html');
        // Pseudocode - Adjust according to your actual frontend framework or vanilla JS
        if (req.session.loggedIn) {
            res.send(true)
        } 

    } 
    res.send(true)
});



//app.use(checkLoggedIn); // Apply globally if needed, or selectively to certain routes

 function checkUserPassword(username, password, ){
    const sql = db.prepare('SELECT user.id as userid, user.username, role.name as role, password FROM user inner join role on user.roleId = role.id   WHERE username  = ?');
    let user = sql.get(username);
    if (user && bcrypt.compareSync(password, user.password)) {
        return user 
    } else {
        null;
    }
}

function checkLoggedIn(req, res, next) {
    console.log('CheckLoggedIn')
    if (!req.session.loggedIn) {
        res.sendFile(path.join(__dirname, "./public/login.html"));
    } else {
        next();
    }

}

function checkIsAdmin(req, res, next) {
    console.log('checkIsAdmin')
    if (!req.session.isAdmin) {
        res.sendFile(path.join(__dirname, "/public/app.html"));
    } else {
        next();
    }

}




app.post('/user-add', (req, res) => {
    console.log(req.body)
    addUser(req.body.username, req.body.mobile, req.body.email, req.body.password, req.body.role)
    res.sendFile(path.join(__dirname, "public/app.html"));
     
});
 

 
app.get('/logout', (req, res) => {
    req.session.destroy()
    res.sendFile(path.join(__dirname, "public/login.html"));
})

function addUser(username, mobile, email, password, roleId) {
    //Denne funksjonen må endres slik at man hasher passordet før man lagrer til databasen
    //rolle skal heller ikke være hardkodet.
    const saltRounds = 10
    const hash = bcrypt.hashSync(password, saltRounds)
    let sql = db.prepare("INSERT INTO user (username, mobile, email, password, roleId) " + 
                         " values (?, ?, ?, ?, ?)")
    const info = sql.run(username, mobile, email, hash, roleId)
    
    //sql=db.prepare('select user.id as userid, username, task.id as taskid, timedone, task.name as task, task.points from done inner join task on done.idtask = task.id where iduser = ?)')
    sql = db.prepare('SELECT user.id as userId, user.username, role.name AS role FROM user INNER JOIN role on user.roleId = role.id WHERE user.id  = ?');
    let rows = sql.all(info.lastInsertRowid)  
    console.log("rows.length", rows.length)

    return rows[0]
}

app.post('/assignTask-add', (req, res) => {
    console.log("assignTask-add", req.body);
    const task = addAssignedTask(req.body.taskid, req.body.userid)
    res.redirect('/admin.html')
});

function addAssignedTask(userid, taskid) {
    const currentDate = new Date().toISOString(); // Get current date and time in ISO format
    
    let sql = db.prepare("INSERT INTO assigned_task (taskId, userId, assigned, completed) " + 
                         " values (?, ?, ?, ?)")
    const info = sql.run(userid, taskid, currentDate, "")
}

app.post('/task-add-done', checkLoggedIn, (req, res, next) => {
    console.log(req.body)

    addTaskDone(req.body.user, req.body.taskid)
    if (req.session.isAdmin) {
        res.redirect('/admin.html')
    } else {
        res.redirect('/app.html')
    }

});

function addTaskDone(user, taskid) {
    const currentDate = new Date().toISOString(); // Get current date and time in ISO format

    // Assuming 'db' is your database connection
    const sql = db.prepare("UPDATE assigned_task SET completed = ? WHERE id = ? AND completed = '' OR completed IS NULL");
    const info = sql.run(currentDate, taskid);
}


app.post('/task-add', checkIsAdmin, (req, res) => {
    console.log(req.body)

    addTask(req.body.taskName, req.body.taskPoints)
    res.redirect('/admin.html')

});

function addTask(taskName, taskPoints) {

    // Assuming 'db' is your database connection
    const sql = db.prepare("INSERT INTO task (name, points) " + 
                         " values (?, ?)")
    const info = sql.run(taskName, taskPoints);
}



app.get('/assignedTasks/:userId', checkLoggedIn, (req, res) => {
    const sql = db.prepare("SELECT assigned_task.id, task.name, task.points FROM assigned_task INNER JOIN task ON assigned_task.taskId = task.id WHERE (assigned_task.completed = '' OR assigned_task.completed IS NULL) AND assigned_task.userId = ?");
    let rows = sql.all(req.params.userId);
    console.log("rows.length", rows.length);

    res.send(rows);
});

app.get('/assignedTasks2/:userId', checkLoggedIn, checkIsAdmin, (req, res) => {
    const sql = db.prepare("SELECT assigned_task.id, task.name, task.points FROM assigned_task INNER JOIN task ON assigned_task.taskId = task.id WHERE (assigned_task.completed = '' OR assigned_task.completed IS NULL) AND assigned_task.userId = ?");
    let rows = sql.all(req.params.userId);
    console.log("rows.length", rows.length);

    res.send(rows);
});


app.get('/tasks', checkLoggedIn, checkIsAdmin, (req, res) => {
    const sql = db.prepare("SELECT id, name, points FROM task");
    let rows = sql.all();
    console.log("rows.length", rows.length);

    res.send(rows);
});


app.get('/users', checkLoggedIn, (req, res) => {
    const sql = db.prepare("SELECT id, username FROM user")
    let rows = sql.all()
    console.log("rows.length", rows.length)

    res.send(rows);
});

app.get('/userInfo/:userId', checkLoggedIn, (req, res) => {
    const sql = db.prepare("SELECT id, username, mobile, email, password, roleId FROM user WHERE id = ?")
    let rows = sql.all(req.params.userId)
    console.log("rows.length", rows.length)

    res.send(rows);
});


app.get('/completedTasks', checkLoggedIn, (req, res) => {
    const sql = db.prepare("SELECT assigned_task.id, assigned_task.completed, task.name, task.points, user.username FROM assigned_task INNER JOIN task ON assigned_task.taskId = task.id INNER JOIN user on assigned_task.userId = user.id WHERE completed != '' ORDER BY assigned_task.completed DESC");
    let rows = sql.all();
    console.log("rows.length", rows.length);

    res.send(rows);
});

app.get('/currentUserCompletedTasks/:userId', checkLoggedIn, (req, res) => {
    const sql = db.prepare("SELECT assigned_task.id, assigned_task.completed, task.name, task.points, user.username FROM assigned_task INNER JOIN task ON assigned_task.taskId = task.id INNER JOIN user on assigned_task.userId = user.id WHERE (completed != '' AND assigned_task.userId = ?) ORDER BY assigned_task.completed DESC");
    let rows = sql.all(req.params.userId);
    console.log("rows.length", rows.length);

    res.send(rows);
});

app.get('/leaderboard', checkLoggedIn, (req, res) => {
    const sql = db.prepare("SELECT user.username, SUM(task.points) AS total_points FROM assigned_task INNER JOIN user ON assigned_task.userId = user.id INNER JOIN task ON assigned_task.taskId = task.id WHERE completed != '' GROUP BY user.username ORDER BY total_points DESC")
    let rows = sql.all();
    console.log("rows.length", rows.length);

    res.send(rows);
});

app.get('/monthLeaderboard', checkLoggedIn, (req, res) => {
    // Get the current date
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + 1);
    // Get the first day of the current month
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    // Format the dates as YYYY-MM-DD HH:MM:SS to match DATETIME format
    const formattedCurrentDate = currentDate.toISOString().slice(0, 19).replace('T', ' ');
    const formattedStartOfMonth = startOfMonth.toISOString().slice(0, 19).replace('T', ' ');

    const sql = db.prepare(`
        SELECT user.username, SUM(task.points) AS total_points 
        FROM assigned_task 
        INNER JOIN user ON assigned_task.userId = user.id 
        INNER JOIN task ON assigned_task.taskId = task.id 
        WHERE completed BETWEEN ? AND ? 
        GROUP BY user.username 
        ORDER BY total_points DESC
    `);
    let rows = sql.all(formattedStartOfMonth, formattedCurrentDate);
    console.log("rows.length", rows.length);

    res.send(rows);
});





app.get('/currentUser', checkLoggedIn,  (req, res) => {
    
    console.log("currentUser", req.session.userid, req.session.username, req.session.userrole)
    res.send([req.session.userid, req.session.username, req.session.userrole]);
});



app.get('/', checkLoggedIn,(req, res) => {
    res.sendFile(path.join(__dirname, "public/app.html"));
  });
  


//denne må defineres etter middleware. 
//Jeg prøvde å flytte den opp, for å rydde i koden og da fungerte det ikke
app.use(express.static(staticPath));


app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});





