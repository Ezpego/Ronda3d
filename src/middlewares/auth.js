import jwt from "jsonwebtoken";
import { db } from "../db/db-connection.js";

export async function authMiddleware(req, res, next) {
  const token = req.headers.authorization;
  console.log("Encabezados de la solicitud:", req.headers);
  console.log("token desde el backend", token);
  if (token) {
    try {
      const { id } = jwt.verify(token, process.env.JWT_SECRET);
      console.log("id desde el backend", id);
      const [[user]] = await db.execute(
        `SELECT id, name, email, isAdministrator, current_token  FROM users WHERE id = ? AND isEnabled = TRUE LIMIT  1`,
        [id]
      );
      //* COMPARAMOS EL TOKEN CON EL ALMACENADO EN current_token PARA HACER LA AUTENTICACIÓN.
      if (user && user.current_token === token) {
        req.currentUser = user;
        console.log("estoy en auth ", req.currentUser);
        console.log("hola, soy el id desde el backend :", user.id);
      }
    } catch (err) {
    }
  }
  next();
}
