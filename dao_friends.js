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
                connection.query("SELECT img, nombre_completo FROM facebluff.users JOIN facebluff.friends ON email1 = email OR email2 = email WHERE confirmado = 1", [email], (err, rows) => {
                    connection.release();
                    if (err) {
                        callback(err);
                    } else {
                        let friends = [];
                        rows.forEach(row => {
                            let amigos = {
                                img: row.img,
                                nombre_completo: row.nombre_completo
                            };
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