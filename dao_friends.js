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
                // esto me patina por todos lados, revisar
                connection.query("SELECT email2 FROM friends WHERE confirmado=1 AND email1=?", [email], (err, rows) => {
                    connection.release();
                    if (err) {
                        callback(err);
                    } else {
                        let friends = [];
                        let last = 0;
                        let prev =- 1;
                        rows.forEach(row => {
                            let amigos = {
                                email: row.email2
                            };
                            if (last !== row.email2) {
                                last = row.email2;
                                friends.push(amigos);
                                prev++;
                            }
                        });
                        callback(null, friends);
                    }
                });
            }
        });
    }

}

module.exports = {
    DAOFriends: DAOFriends
}