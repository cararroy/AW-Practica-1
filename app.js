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

app.get("/my_profile", middleWareAccessControl, (request, response) => {
    let dataUser = daoU.getUserProfile(request.session.currentUser, (err, result) => {
        if (err) {
            console.error(err);
        } else {
            response.render("my_profile", {
                name : result.nombre_completo,
                fecha_nacimiento: result.fecha_nacimiento,
                genero: result.genero,
                puntuacion: result.puntuacion
            });
        }
    });
});

app.get("/new_user", function(request, response) {
    response.render("new_user");
});

app.post("/new_user", function(request, response) {
    let email = daoU.insertUser(request.body.email, request.body.password, request.body.img, request.body.nombre_completo, request.body.sexo, request.body.fecha, (err) => {
        if (err) {
            console.error(err);
        } else {
            request.session.currentUser = request.body.email;
            response.redirect("/my_profile");
        }
    });
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

app.get("/logout", function(request, response) {
    request.session.destroy();
    response.redirect("/login");
});

app.get("/user_image", (request, response) => {
    daoU.getUserImageName(request.session.currentUser, (err, cadena) => {
        if (err || cadena === null) {
            let img = __dirname.concat("/public/img/NoProfile.png");
            response.sendFile(img);
        } else {
            let img = __dirname.concat("/public/icons/".concat(cadena));
            response.sendFile(img);
        }
    });
});