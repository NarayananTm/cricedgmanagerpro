import { databaseService as db } from "../models/queryModel";
import { validateRequiredFields } from "./validationService";
import { publishEvent as broadcast } from "./eventService";

export const postAuthRegister = async (req, res) => {
    const validationError = validateRequiredFields(req.body, ["name", "email", "password"]);
    if (validationError) return res.status(400).json({ error: validationError });
    const { name, email, password, plan } = req.body;
    try {
      const isAdmin = plan === 'pro' || plan === 'organizer' ? 1 : 0;
      const info = await db.prepare(
        "INSERT INTO users (name, email, password, plan, is_admin) VALUES (?, ?, ?, ?, ?)"
      ).run(name, email, password, plan || 'starter', isAdmin);
      const user = await db.prepare("SELECT id, name, email, plan, is_admin FROM users WHERE id = ?").get(info.lastInsertRowid);
      res.json(user);
    } catch (e: any) {
      if (e.code === '23505') {
        res.status(400).json({ error: "Email already exists" });
      } else {
        res.status(500).json({ error: "Registration failed" });
      }
    }
  };

export const postAuthLogin = async (req, res) => {
    const validationError = validateRequiredFields(req.body, ["email", "password"]);
    if (validationError) return res.status(400).json({ error: validationError });
    const { email, password } = req.body;
    const user = await db.prepare("SELECT id, name, email, plan, is_admin FROM users WHERE email = ? AND password = ?").get(email, password);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    res.json(user);
  };

