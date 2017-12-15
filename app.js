"use strict";

const express = require("express");
const mysql = require("mysql");
const path = require("path");
const bodyParser = require("body-parser");
const config = require("./config");
const daoUsers = require("./dao_users");
const daoFriends = require("./dao_friends");
const expressSession = require("express-session");
const expressMysqlSession = require("express-mysql-session");
const expressValidator = require("express-validator");
const multer = require("multer");
const fs = require("fs");
const morgan = require("morgan");

const upload = multer({ dest: path.join(__dirname, "uploads") });
const ficherosEstaticos = path.join(__dirname, "public");
const MySQLStore = expressMysqlSession(expressSession);

const sessionStore = new MySQLStore({
    host: config.mysqlConfig.host,
    user: config.mysqlConfig.user,
    password: config.mysqlConfig.password,
    database: config.mysqlConfig.database
});

const app = express();

app.use(morgan("dev"));
app.use(express.static(ficherosEstaticos));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator({
    customValidators: {
        // Funciones personalizadas para validar
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
        //
        let dataUser = daoU.getUserProfile(request.session.currentUser, (err, result) => {
            if (err) {
                console.error(err);
                response.end(err.message);
            } else {
    
                // De estas variables obtenemos los datos del usuario en las vistas
                response.locals.name = result.nombre_completo;
                response.locals.puntuacion = result.puntuacion;
                response.locals.img = result.img;
                console.log(request.url);
                console.log(response.locals);
                next();
            }
        });
        //
        
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

// DAO's
let daoU = new daoUsers.DAOUsers(pool);
let daoF = new daoFriends.DAOFriends(pool);


// Manejadores de ruta LOGIN

app.get("/login", function(request, response) {
    response.render("login", { errorMsg : null, email: "", password: ""});
});

app.post("/login", function(request, response) {
    let email = daoU.isUserCorrect(request.body.email, request.body.password, (err, existe) => {
        if (err) {
            console.error(err);
        } else if (!existe) {
            response.render("login", { errorMsg : "Dirección de correo y/o contraseña no válidas", email: request.body.email, password: request.body.password});
        } else {
            // Atributo de sesión para saber en todo momento qué usuario está logeado
            request.session.currentUser = request.body.email;
            response.redirect("/my_profile");
        }
    });
});

// Manejadores de ruta SIGNUP

app.get("/new_user", function(request, response) {
    response.render("new_user", {errores: [], usuario: {}, userExist: "", sex: false, genero: ["", "", ""]});
});

app.post("/new_user", upload.single("foto"), function(request, response) {
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
                    let img;
                    if (request.file === undefined)
                        img = "NoProfile";
                    else
                        img = request.file.filename;
                    daoU.insertUser(request.body.email, request.body.password, img, request.body.nombre_completo, request.body.sexo, request.body.fecha, (err) => {
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

// Manejador de ruta MY_PROFILE

app.get("/my_profile", middleWareAccessControl, (request, response) => {
    let dataUser = daoU.getUserProfile(request.session.currentUser, (err, result) => {
        if (err) {
            console.error(err);
        } else {
            response.render("my_profile", {
                fecha_nacimiento: result.edad,
                genero: result.genero
            });
        }
    });
});

// Manejadores de ruta EDIT_PROFILE

app.get("/edit", middleWareAccessControl, function(request, response) {
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
            response.render("edit", {errores: [], usuario: usuarioCorrecto, userExist: "", sex: false, genero: sex});
        }
    });
});

app.post("/edit", middleWareAccessControl, upload.single("foto"), function(request, response) {
    let img;
    if (!request.file)
        img = "mantener";
    else
        img = request.file.filename;
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
            puntuacion: result.puntuacion,
            imagen: img
        };
        if (result.isEmpty()) {
            
            let email = daoU.editProfile(request.session.currentUser, request.body.password, img, request.body.nombre_completo, request.body.sexo, request.body.fecha, (err) => {
                if (err) {
                    console.error(err);
                } else {
                    response.redirect("/my_profile");
                }
            });
            
        } else {
                        
            response.render("edit", {errores: result.mapped(), usuario: usuarioIncorrecto, userExist: "", sex: false, genero: sex});
        }
    });
});

// Manejador de ruta FRIENDS

app.get("/friends", middleWareAccessControl, (request, response) => {
    daoF.getAllFriends(request.session.currentUser, (err, rowsFriends, rowsRequests) => {
        if (err) {
            console.error(err);
        }
        response.render("friends", {
            friends: rowsFriends,
            requests: rowsRequests
        });
    });
});

////// ACEPTAR O RECHAZAR AMISTAD ¿?¿?¿? -> response.locals¿?

app.post("/friends", middleWareAccessControl, (request, response) => {
    if (request.body.action === 'Aceptar') {
        daoF.acceptRequest(request.body.email, request.session.currentUser, (err) => {
            if (err) {
                console.error(err);
            }
            response.redirect("friends");
        });
    } else {
        daoF.denieRequest(request.body.email, request.session.currentUser, (err) => {
            if (err) {
                console.error(err);
            }
            response.redirect("friends");
        });
    }
});

// Manejadores de ruta SEARCH_USERS

app.get("/search", middleWareAccessControl, (request, response) => {
    response.render("search", {resultado: '', friends: []});
});

app.post("/search", middleWareAccessControl, (request, response) => {
    let buscar = request.body.search.trim()
    if (buscar !== '') {
        daoF.searchFriends(buscar, request.session.currentUser, (err, result) => {
            if (err) {
                console.error(err);
            }
            response.render("search", {resultado: buscar, friends: result});
        });
    } else {
        response.redirect("/search");
    }
});

// Manejadores de ruta REQUESTS_FRIENDSHIP

app.post("/requestFriendship", middleWareAccessControl, (request, response) => {
    daoF.requestFriendship(request.session.currentUser, request.body.email, (err) => {
        if (err) {
            console.error(err);
        }
        response.redirect("friends");
    });
});

// Manejador de ruta LOGOUT

app.get("/logout", function(request, response) {
    request.session.destroy();
    response.redirect("/login");
});

// Manejador de ruta GET_IMG_PROFILE

app.get("/imagen/:filename", middleWareAccessControl, (request, response) => {
    response.sendFile(path.join(__dirname, "uploads", request.params.filename));
});


// Manejadores de ruta sin implementar

app.get("/answer", function(request, response) {
    response.render("answer");
});

app.get("/answer-other", function(request, response) {
    response.render("answer_other");
});

app.get("/question-view", function(request, response) {
    response.render("question_view");
});

app.get("/random", function(request, response) {
    response.render("random");
});