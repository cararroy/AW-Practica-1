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
                } else if (question.texto_pregunta !== 0) {
                    console.log("entro aqui");
                    let arrayInterrogaciones = [];
                    let arrayInsert = [];
                    for (let i = 0; i < question.texto_pregunta; i++) {
                        arrayInterrogaciones.push("(?, ?)");
                        arrayInsert.push(result.insertId);
                        arrayInsert.push(question.texto_pregunta[i]);
                    }
                    console.log("arrayInterrogaciones" + arrayInterrogaciones);
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
                /*
                else {
                    // insertar respuestas en tabla answer_options con el id de la pregunta insertada arriba
                    connection.query("INSERT INTO answer_options(id_question, texto_respuesta) VALUES (?, ?)", [result.insertId, options], (err) => {
                        connection.release();
                        if (err) {
                            callback(err);
                            return;
                        }
                        callback(null);
                    });
                }
                */
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
    getQuestionPage(question, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err);
                return;
            }
            connection.query("SELECT * FROM questions WHERE id=?", [question], (err, result) => {
                connection.release();
                callback(null, result);
            });
        });
    }

}

module.exports = {
    DAOQuestions: DAOQuestions
}