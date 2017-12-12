"use strict";

/**
 * Proporciona operaciones para la gestión de amigos
 * en la base de datos.
 */
class DAOFriends {
    /**
     * Inicializa el DAO de amigos.
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
    getAllFriends(email, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err);
                return;
            } else {
                connection.query("SELECT * FROM users as u JOIN friends as f WHERE (f.email1=? OR f.email2=?) AND (f.email1 = u.email OR f.email2 = u.email) AND u.email<>? AND f.confirmado = 1", [email, email, email], (err, rows) => {
                    connection.release();
                    if (err) {
                        callback(err);
                        return;
                    }
                    callback(null, rows);
                });
            }
        });
    }

    searchFriends(cadena, usuario, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err);
                return;
            } else {
                cadena = "%" + cadena + "%"; 
                connection.query("SELECT nombre_completo FROM users WHERE nombre_completo LIKE ? AND email<>?", [cadena, usuario], (err, rows) => {
                    connection.release();
                    if (err) {
                        callback(err);
                        return;
                    }
                    callback(null, rows);
                });
            }
        });
    }

    getAllRequests(email, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err);
                return;
            } else {
                connection.query("SELECT * FROM users as u JOIN friends as f WHERE f.email1=? AND f.email2 = u.email AND f.confirmado = NULL;", [email], (err, rows) => {
                    connection.release();
                    console.log(rows);
                    if (err) {
                        callback(err);
                        return;
                    }
                    callback(null, rows);
                });
            }
        });
    }

}

module.exports = {
    DAOFriends: DAOFriends
}