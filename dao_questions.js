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
                }
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
            });
        });
    }

}

module.exports = {
    DAOQuestions: DAOQuestions
}