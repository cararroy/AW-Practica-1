"use strict";

const express = require("express");
const mysql = require("mysql");
const path = require("path");
const bodyParser = require("body-parser");
const config = require("./config");
//const daoTasks = require("./dao_tasks");
const daoUsers = require("./dao_users");
const daoFriends = require("./dao_friends");
const expressSession = require("express-session");
const expressMysqlSession = require("express-mysql-session");
var expressValidator = require("express-validator");

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
app.use(expressValidator({
    customValidators: {
        // funciones personalizadas para validar
        fechaValida: function(param) {
            
            if(param === "" || param < new Date().toLocaleDateString("es-ES", {year: "numeric", month: "2-digit", day: "2-digit"}))
                return true;
            else 
                return false;
        }
    }
}));

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
    response.render("login", { errorMsg : null, email: "", password: ""});
});

let daoU = new daoUsers.DAOUsers(pool);
let daoF = new daoFriends.DAOFriends(pool);

app.post("/login", function(request, response) {
    let email = daoU.isUserCorrect(request.body.email, request.body.password, (err, existe) => {
        if (err) {
            console.error(err);
        } else if (!existe) {
            response.render("login", { errorMsg : "Dirección de correo y/o contraseña no válidas", email: request.body.email, password: request.body.password});
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

app.get("/friends", middleWareAccessControl, (request, response) => {
    daoF.getAllFriends(request.session.currentUser, (err, rowsFriends, rowsRequests) => {
        if (err) {
            console.error(err);
        }
        response.render("friends", {
            name: request.session.name,
            puntuacion: request.session.puntuacion, 
            friends: rowsFriends,
            requests: rowsRequests
            // requests: result
        });
    });
});

app.get("/search", middleWareAccessControl, (request, response) => {
    response.render("search", {name: request.session.name, puntuacion: request.session.puntuacion, resultado: {}, friends: []});
});

app.post("/search", middleWareAccessControl, (request, response) => {
    let buscar = request.body.search.trim()
    if (buscar !== '') {
        daoF.searchFriends(buscar, request.session.currentUser, (err, result) => {
            if (err) {
                console.error(err);
            }
            response.render("search", {name: request.session.name, puntuacion: request.session.puntuacion, resultado: buscar, friends: result});
        });
    } else {
        response.render("search", {name: request.session.name, puntuacion: request.session.puntuacion, resultado: '', friends: []});
    }
});

/*
app.get("/friends", middleWareAccessControl, (request, response) => {
    daoF.getAllRequests(request.session.currentUser, (err, result) => { 
        if (err) {
            console.error(err);
            console.log(result);
        }
        response.render("friends", {
            requests: result
        });
    });
});
*/

app.get("/my_profile", middleWareAccessControl, (request, response) => {
    let dataUser = daoU.getUserProfile(request.session.currentUser, (err, result) => {
        if (err) {
            console.error(err);
        } else {
            request.session.name = result.nombre_completo;
            request.session.puntuacion = result.puntuacion;
            response.render("my_profile", {
                name : result.nombre_completo,
                fecha_nacimiento: result.edad,
                genero: result.genero,
                puntuacion: result.puntuacion
            });
        }
    });
});

app.get("/new_user", function(request, response) {
    response.render("new_user", {errores: [], usuario: {}, userExist: "", sex: false, genero: ["", "", ""]});
});

app.post("/new_user", function(request, response) {
    request.checkBody("nombre_completo", "Nombre de usuario vacío").notEmpty();
    request.checkBody("nombre_completo", "Nombre de usuario no válido").matches(/^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]+$/); // Sólo letras y espacios
    request.checkBody("password", "La contraseña no tiene entre 6 y 10 caracteres").isLength({ min: 6, max: 10 });
    request.checkBody("email", "Dirección de correo no válida").isEmail();
    request.checkBody("fecha", "Fecha de nacimiento no válida").fechaValida();
    request.getValidationResult().then((result) => {
        let sex = ["", "", ""];
        sex[request.body.sexo] = "checked";
        var usuarioIncorrecto = {
            nombre_completo: request.body.nombre_completo,
            password: request.body.password,
            email: request.body.email,
            genero: sex,
            fecha: request.body.fecha
        };
        if (result.isEmpty() && request.body.sexo !== undefined) {
            daoU.existUser(request.body.email, (err, userExists) => {
                if (err) {
                    console.error(err);
                } else if (userExists) { // Email ya existente en la base de datos
                    response.render("new_user", {errores: result.mapped(), usuario: usuarioIncorrecto, userExist: request.body.email, sex: false, genero: sex});
                } else { // Email valido
                    daoU.insertUser(request.body.email, request.body.password, request.body.img, request.body.nombre_completo, request.body.sexo, request.body.fecha, (err) => {
                        if (err) { 
                            console.error(err);
                        } else {
                            request.session.currentUser = request.body.email;
                            response.redirect("/my_profile");
                        }
                    });
                }
            });
            
        } else {
            let sexoMsg = false;
            if (request.body.sexo === undefined)
                sexoMsg = true;
            
            response.render("new_user", {errores: result.mapped(), usuario: usuarioIncorrecto, userExist: "", sex: sexoMsg, genero: sex});
        }
    });
});

app.get("/edit", function(request, response) {
    let dataUser = daoU.getUserProfile(request.session.currentUser, (err, result) => {
        if (err) {
            console.error(err);
        } else {
            let sex = ["", "", ""];
            sex[result.sexoNum] = "checked";
            var usuarioCorrecto = {
                email: request.session.currentUser,
                password: result.password,
                name : result.nombre_completo,
                fecha: result.fecha_nacimiento,
                genero: sex,
                puntuacion: result.puntuacion
            };
            response.render("edit", {name: request.session.name, puntuacion: request.session.puntuacion, errores: [], usuario: usuarioCorrecto, userExist: "", sex: false, genero: sex});
        }
    });
});

app.post("/edit", function(request, response) {
    request.checkBody("nombre_completo", "Nombre de usuario vacío").notEmpty();
    request.checkBody("nombre_completo", "Nombre de usuario no válido").matches(/^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]+$/); // Sólo letras y espacios
    request.checkBody("password", "La contraseña no tiene entre 6 y 10 caracteres").isLength({ min: 6, max: 10 });
    request.checkBody("fecha", "Fecha de nacimiento no válida").fechaValida();
    request.getValidationResult().then((result) => {
        let sex = ["", "", ""];
        sex[request.body.sexo] = "checked";
        var usuarioIncorrecto = {
            name: request.body.nombre_completo,
            password: request.body.password,
            email: request.session.currentUser,
            genero: sex,
            fecha: request.body.fecha,
            puntuacion: result.puntuacion
        };
        if (result.isEmpty()) {
            let email = daoU.editProfile(request.session.currentUser, request.body.password, request.body.img, request.body.nombre_completo, request.body.sexo, request.body.fecha, (err) => {
                if (err) {
                    console.error(err);
                } else {
                    //request.session.currentUser = request.body.email;
                    response.redirect("/my_profile");
                }
            });
            
        } else {
                        
            response.render("edit", {name: request.session.name, puntuacion: request.session.puntuacion, errores: result.mapped(), usuario: usuarioIncorrecto, userExist: "", sex: false, genero: sex});
        }
    });
});

app.get("/question-view", function(request, response) {
    response.render("question_view");
});

app.get("/random", function(request, response) {
    response.render("random");
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