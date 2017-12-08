"use strict";

const express = require("express");
const mysql = require("mysql");
const path = require("path");
const bodyParser = require("body-parser");
const config = require("./config");
//const daoTasks = require("./dao_tasks");
const daoUsers = require("./dao_users");
const expressSession = require("express-session");
const expressMysqlSession = require("express-mysql-session");

const MySQLStore = expressMysqlSession(expressSession);

const sessionStore = new MySQLStore({
    host: config.mysqlConfig.host,
    user: config.mysqlConfig.user,
    password: config.mysqlConfig.password,
    database: config.mysqlConfig.database
});

const app = express();

const ficherosEstaticos = path.join(__dirname, "public");

app.use(express.static(ficherosEstaticos));
app.use(bodyParser.urlencoded({ extended: false }));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

let pool = mysql.createPool({
    database: config.mysqlConfig.database,
    host: config.mysqlConfig.host,
    user: config.mysqlConfig.user,
    password: config.mysqlConfig.password
});

const middlewareSession = expressSession({
    saveUninitialized: false,
    secret: "foobar34",
    resave: false,
    store: sessionStore
});

app.use(middlewareSession);

// Middleware de Control de Acceso
function middleWareAccessControl (request, response, next) {
    if(request.session.currentUser) {
        response.locals.userEmail = request.session.currentUser;
        next();
    } else {
        response.redirect("/login");
    }
}

app.listen(config.port, function (err) {
    if (err) {
        console.log("No se ha podido iniciar el servidor.")
        console.log(err);
    } else {
        console.log(`Servidor escuchando en puerto ${config.port}.`);
    }
});

app.get("/login", function(request, response) {
    response.render("login", { errorMsg : null });
});

let daoU = new daoUsers.DAOUsers(pool);

app.post("/login", function(request, response) {
    let email = daoU.isUserCorrect(request.body.email, request.body.password, (err, existe) => {
        if (err) {
            console.error(err);
        } else if (!existe) {
            response.render("login", { errorMsg : "Dirección de correo y/o contraseña no válidas" });
        } else {
            request.session.currentUser = request.body.email;
            response.redirect("/my_profile");
        }
    });
});

app.get("/answer", function(request, response) {
    response.render("answer");
});
app.get("/answer-other", function(request, response) {
    response.render("answer_other");
});
app.get("/friends", function(request, response) {
    response.render("friends");
});
app.get("/my-profile", function(request, response) {
    response.render("my_profile");
});
app.get("/new-user", function(request, response) {
    response.render("new_user");
});
app.get("/question-view", function(request, response) {
    response.render("question_view");
});
app.get("/random", function(request, response) {
    response.render("random");
});
app.get("/search", function(request, response) {
    response.render("search");
});