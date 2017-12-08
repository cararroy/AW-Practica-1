"use strict";

const express = require("express");
const mysql = require("mysql");
const path = require("path");
const bodyParser = require("body-parser");
const config = require("./config");
//const daoTasks = require("./dao_tasks");
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
    response.render("index");
});