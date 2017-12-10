"use strict";

/**
 * Proporciona operaciones para la gestión de usuarios
 * en la base de datos.
 */
class DAOUsers {
    /**
     * Inicializa el DAO de usuarios.
     * 
     * @param {Pool} pool Pool de conexiones MySQL. Todas las operaciones
     *                    sobre la BD se realizarán sobre este pool.
     */
    constructor(pool) {
        this.pool = pool;
    }

    /**
     * Determina si un determinado usuario aparece en la BD con la contraseña
     * pasada como parámetro.
     * 
     * Es una operación asíncrona, de modo que se llamará a la función callback
     * pasando, por un lado, el objeto Error (si se produce, o null en caso contrario)
     * y, por otro lado, un booleano indicando el resultado de la operación
     * (true => el usuario existe, false => el usuario no existe o la contraseña es incorrecta)
     * En caso de error error, el segundo parámetro de la función callback será indefinido.
     * 
     * @param {string} email Identificador del usuario a buscar
     * @param {string} password Contraseña a comprobar
     * @param {function} callback Función que recibirá el objeto error y el resultado
     */
    isUserCorrect(email, password, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                connection.release();
                callback(err);
            } else {
                connection.query("SELECT * FROM facebluff.users WHERE email=? AND password=?", [email, password], (err, result) => {
                    connection.release();
                    if (err) {
                        callback(err);
                    } else {
                        if(result.length === 0) {
                            result = false;
                        } else {
                            result = true;
                        }
                        callback(null, result);
                    }
                });
            }
        });
    }

    existUser(email, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                connection.release();
                callback(err);
            } else {
                connection.query("SELECT * FROM facebluff.users WHERE email=?", [email], (err, userExists) => {
                    connection.release();
                    if (err) {
                        callback(err);
                    } else {
                        if(userExists.length === 0) {
                            userExists = false;
                        } else {
                            userExists = true;
                        }
                        callback(null, userExists);
                    }
                });
            }
        });
    }

    insertUser(email, password, img, nombre_completo, genero, fecha_nacimiento, callback) {
        if (email !== '' && password !== '') {
            this.pool.getConnection((err, connection) => {
                if (err) {
                    connection.release();
                    callback(err);
                }
                connection.query("INSERT INTO facebluff.users VALUES (?, ?, ?, ?, ?, ?, 0)", 
                [email, password, img, nombre_completo, genero, fecha_nacimiento], (err) => {
                    if (err) {
                        connection.release();
                        callback(err);
                    } else {
                        connection.release();
                        callback(null);
                    }
                });
            });
        } else {
            callback(null);
        }
    }

    editProfile(email, password, img, nombre_completo, genero, fecha_nacimiento, callback) {
        if (nombre_completo !== '' && password !== '') {
            this.pool.getConnection((err, connection) => {
                if (err) {
                    connection.release();
                    callback(err);
                }
                connection.query("UPDATE facebluff.users SET password=?, img=?, nombre_completo=?, genero=?, fecha_nacimiento=? WHERE email=?", 
                [password, img, nombre_completo, genero, fecha_nacimiento, email], (err) => {
                    if (err) {
                        connection.release();
                        callback(err);
                    } else {
                        connection.release();
                        callback(null);
                    }
                });
            });
        } else {
            callback(null);
        }
    }

    getUserProfile(email, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                connection.release();
                callback(err);
            } else {
                connection.query("SELECT * FROM facebluff.users WHERE email=?", [email], (err, result) => {
                    connection.release();
                    if (err) {
                        callback(err);
                    } else {
                        // Obtener genero
                        let sexo;
                        if (result[0].genero === 0)
                            sexo = "Hombre";
                        else if (result[0].genero === 1)
                            sexo = "Mujer";
                        else
                            sexo = "Otro";
                        
                        // Obtener edad
                        let hoy = new Date();
                        let cumpleanos = new Date(result[0].fecha_nacimiento);
                        let edad = hoy.getFullYear() - cumpleanos.getFullYear();
                        let m = hoy.getMonth() - cumpleanos.getMonth();
                    
                        if (m < 0 || (m === 0 && hoy.getDate() < cumpleanos.getDate()))
                            edad--;
                        
                        let data = { 
                            nombre_completo: result[0].nombre_completo,
                            edad: 0,
                            genero: sexo,
                            sexoNum: result[0].genero,
                            puntuacion: result[0].puntuacion,
                            fecha_nacimiento: result[0].fecha_nacimiento,
                            password: result[0].password
                        };              
                        
                        if (result[0].fecha_nacimiento !== "0000-00-00") {
                            data.fecha_nacimiento = result[0].fecha_nacimiento.toLocaleDateString("es-ES", {year: "numeric", month: "2-digit", day: "2-digit"});
                            data.edad = edad;
                        }
                        
                        callback(null, data);
                    }
                });
            }
        });
    }

    /**
    * Obtiene el nombre de fichero que contiene la imagen de perfil de un usuario.
    *
    
    * Es una operación asíncrona, de modo que se llamará a la función callback
    * pasando, por un lado, el objeto Error (si se produce, o null en caso contrario)
    * y, por otro lado, una cadena con el nombre de la imagen de perfil (o undefined
    * en caso de producirse un error). Si el usuario no tiene imagen de perfil, dicha
    * cadena tomará el valor null.
    *
    * @param {string} email Identificador del usuario cuya imagen se quiere obtener
    * @param {function} callback Función que recibirá el objeto error y el resultado
    */
    getUserImageName(email, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err);
            } else {
                connection.query("SELECT img FROM users where email=?", [email], (err, result) => {
                    connection.release();
                    if (err) {
                        callback(err);
                    } else {
                        if (result.length > 0) {
                            callback(null, result[0].img);
                        } else {
                            callback(null, null);
                        }
                    }
                });
            }
        });
    }   
}

module.exports = {
    DAOUsers: DAOUsers
}