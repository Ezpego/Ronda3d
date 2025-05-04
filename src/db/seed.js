import "dotenv/config.js";
import { db } from "./db-connection.js";
import bcrypt from "bcrypt";

console.log("Creando administrador");

const generatePassword = async () => {
    try {
        const passAdmin = await bcrypt.hash(process.env.PASSWORD_ADMIN, 12);
        return passAdmin;
    } catch (error) {
        console.error("Error al generar la contraseña:", error);
        throw error;
    }
};

const main = async () => {
    try {
        const password = await generatePassword();
        const emailAdmin = process.env.EMAIL_ADMIN;
        const nameAdmin = process.env.NAME_ADMIN;
        const usernameAdmin = process.env.USERNAME_ADMIN;

        await db.query(
            `INSERT INTO users (username, name, email, password, isAdministrator) VALUES (?, ?, ?, ?, ?)`,
            [usernameAdmin, nameAdmin, emailAdmin, password, true]
        );

        console.log("Usuario administrador creado correctamente");
        
        await db.end();
    } catch (error) {
        console.error("Error durante la ejecución:", error);
    }
};

main();
