import { databaseService as db } from "../models/queryModel";
import { validateRequiredFields } from "./validationService";
import { publishEvent as broadcast } from "./eventService";

export const getSettingsPayment = async (req, res) => {
    const upi = await db.prepare("SELECT value FROM settings WHERE key = 'payment_receiver_upi'").get() as any;
    const bank = await db.prepare("SELECT value FROM settings WHERE key = 'payment_receiver_bank'").get() as any;
    const name = await db.prepare("SELECT value FROM settings WHERE key = 'payment_receiver_name'").get() as any;
    
    res.json({
      upi: upi?.value || '',
      bank: bank?.value || '',
      name: name?.value || ''
    });
  };

export const postSettingsPayment = async (req, res) => {
    const { upi, bank, name } = req.body;
    
    await db.prepare("UPDATE settings SET value = ? WHERE key = 'payment_receiver_upi'").run(upi);
    await db.prepare("UPDATE settings SET value = ? WHERE key = 'payment_receiver_bank'").run(bank);
    await db.prepare("UPDATE settings SET value = ? WHERE key = 'payment_receiver_name'").run(name);
    
    res.json({ success: true });
  };

export const getTournamentsByIdChat = async (req, res) => {
    try {
      const messages = await db.prepare("SELECT * FROM team_chats WHERE tournament_id = ? ORDER BY created_at ASC").all(req.params.id);
      res.json(messages);
    } catch (e: any) {
      res.status(500).json({ error: "Request failed" });
    }
  };

export const postTournamentsByIdChat = async (req, res) => {
    try {
      const { sender_name, team_name, message } = req.body;
      const info = await db.prepare(`
        INSERT INTO team_chats (tournament_id, sender_name, team_name, message)
        VALUES (?, ?, ?, ?)
      `).run(req.params.id, sender_name, team_name, message);
      
      const newMessage = {
        id: info.lastInsertRowid,
        tournament_id: parseInt(req.params.id),
        sender_name,
        team_name,
        message,
        created_at: new Date().toISOString()
      };
      
      broadcast({
        type: "TEAM_CHAT_MESSAGE",
        tournament_id: req.params.id,
        message: newMessage
      });
      
      res.json(newMessage);
    } catch (e: any) {
      res.status(500).json({ error: "Request failed" });
    }
  };

export const putTournamentsByIdRules = async (req, res) => {
    try {
      const { rules } = req.body;
      await db.prepare("UPDATE tournaments SET rules = ? WHERE id = ?").run(rules, req.params.id);
      res.json({ success: true, rules });
    } catch (e: any) {
      res.status(500).json({ error: "Request failed" });
    }
  };

export const getTournamentsByIdGallery = async (req, res) => {
    try {
      const images = await db.prepare("SELECT * FROM tournament_gallery WHERE tournament_id = ? ORDER BY created_at DESC").all(req.params.id);
      res.json(images);
    } catch (e: any) {
      res.status(500).json({ error: "Request failed" });
    }
  };

export const postTournamentsByIdGallery = async (req, res) => {
    try {
      const { image_url, caption } = req.body;
      const info = await db.prepare(`
        INSERT INTO tournament_gallery (tournament_id, image_url, caption)
        VALUES (?, ?, ?)
      `).run(req.params.id, image_url, caption || '');
      res.json({
        id: info.lastInsertRowid,
        tournament_id: parseInt(req.params.id),
        image_url,
        caption
      });
    } catch (e: any) {
      res.status(500).json({ error: "Request failed" });
    }
  };

