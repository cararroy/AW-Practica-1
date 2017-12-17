"use strict";

/**
 * Proporciona operaciones para la gestión de amigos
 * en la base de datos.
 */
class DAOQuestions {
    /**
     * Inicializa el DAO de preguntas.
     * 
     * @param {Pool} pool Pool de conexiones MySQL. Todas las operaciones
     *                    sobre la BD se realizarán sobre este pool.
     */
    constructor(pool) {
        this.pool = pool;
    }

    /**
     * Devuelve todos los amigos de un determinado usuario.
     * 
     * La función callback ha de tener dos parámetros: un objeto
     * de tipo Error (si se produce, o null en caso contrario), y
     * la lista de amigos (o undefined, en caso de error).
     * 
     * @param {string} email Identificador del usuario.
     * @param {function} callback Función callback.
     */
    
    // Funciones

    newQuestion(question, options, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err);
                return;
            }
            // insertar pregunta en tabla questions y devolver id
            connection.query("INSERT INTO questions(texto_pregunta) VALUES (?)", [question], (err, result) => {
                if (err) {
                    callback(err);
                    return;
                } else if (options.length !== 0) {
                    let arrayInterrogaciones = [];
                    let arrayInsert = [];
                    for (let i = 0; i < options.length; i++) {
                        arrayInterrogaciones.push("(?, ?)");
                        arrayInsert.push(result.insertId);
                        arrayInsert.push(options[i]);
                    }
                    let cadenaInsert = "INSERT INTO answer_options(id_question, texto_respuesta) VALUES " + arrayInterrogaciones.join(",");
                    connection.query(cadenaInsert, arrayInsert, (err, result) => {
                        if (err) {
                            callback(err);
                            return;
                        } else {
                            callback(null);
                        }
                    });
                } else {
                    connection.release();
                    callback(err);
                }
            });
        });
    }

    // Obtener todas las preguntas de la base de datos
    randomQuestions(callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err);
                return;
            }
            connection.query("SELECT * FROM questions", (err, result) => {
                connection.release();
                callback(null, result);
            });
        });
    }

    // Obtener una pregunta (en el apartado 3 tb el resto de aciertos de adivinar)
    getQuestionPage(question, currentUser, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err);
                return;
            }
            connection.query("SELECT * FROM questions WHERE id=?", [question], (err, result) => {
                connection.query("SELECT COUNT(*) AS respondida FROM answers WHERE email_usuario=? AND id_question=?", [currentUser, question], (err, respondida) => {
                    
                    // Obtener todos los amigos que ha respondido a esa pregunta
                    // SELECT email_usuario FROM answers WHERE id_question=10 AND email_usuario IN (SELECT email FROM users as u JOIN friends as f WHERE (f.email1="cararroy@gmail.com" OR f.email2="cararroy@gmail.com") AND (f.email1 = u.email OR f.email2 = u.email) AND u.email<>"cararroy@gmail.com" AND f.confirmado = 1)
                    connection.query("SELECT nombre_completo, email, img, adivinado FROM users LEFT JOIN answer_other ON (logged_user=? AND friend=email AND id_question=?) where email IN (SELECT email_usuario FROM answers WHERE id_question=? AND email_usuario IN (SELECT email FROM users as u JOIN friends as f WHERE (f.email1=? OR f.email2=?) AND (f.email1 = u.email OR f.email2 = u.email) AND u.email<>? AND f.confirmado = 1))", 
                    [currentUser, question, question, currentUser, currentUser, currentUser], (err, amigos) => {
                        console.log(amigos);
                        connection.release();
                        callback(null, result, respondida, amigos);
                    });
                });
            });
        });
    }

    getQuestionAndOptions(question, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err);
                return;
            }
            connection.query("SELECT id_answer, texto_respuesta FROM answer_options WHERE id_question=?", [question], (err, respuestas) => {
                connection.query("SELECT * FROM questions WHERE id=?", [question], (err, result) => {
                    connection.release();
                    callback(null, result, respuestas);                    
                });
            });
        });
    }

    answerMyQuestion(user, question, answer, answerText, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err);
                return;
            }
            if (answer === "otraRespuesta") {
                connection.query("INSERT INTO answer_options(id_question, texto_respuesta) VALUES (?, ?)", [question, answerText], (err, result) => {
                    connection.query("INSERT INTO answers VALUES (?, ?, ?)", [user, question, result.insertId], (err) => {
                        connection.release();
                        callback(null);
                    });
                });
            } else {
                connection.query("INSERT INTO answers VALUES (?, ?, ?)", [user, question, answer], (err) => {
                    connection.release();
                    callback(null);
                });
            }
        });
    }

}

module.exports = {
    DAOQuestions: DAOQuestions
}