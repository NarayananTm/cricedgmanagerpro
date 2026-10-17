import { databaseService as db } from "../models/queryModel";
import { validateRequiredFields } from "./validationService";
import { publishEvent as broadcast } from "./eventService";

export const postTeamsByIdPlayers = async (req, res) => {
    const { name, age, role, base_price, tournament_id, image_url, phone, sport, sport_details } = req.body;
    const teamId = req.params.id === "0" ? null : req.params.id;
    const detailsStr = typeof sport_details === 'object' ? JSON.stringify(sport_details) : (sport_details || null);
    const info = await db.prepare(
      "INSERT INTO players (team_id, tournament_id, name, age, role, base_price, image_url, phone, sport, sport_details) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).run(teamId, tournament_id, name, age, role, base_price || 0, image_url || null, phone || null, sport || null, detailsStr);
    res.json({ id: info.lastInsertRowid });
  };

export const postPlayers = async (req, res) => {
    try {
      const { name, age, role, base_price, tournament_id, team_id, image_url, phone, sport, sport_details } = req.body;
      const tId = team_id && team_id !== "0" && team_id !== 0 ? team_id : null;
      const tourId = tournament_id && tournament_id !== "0" && tournament_id !== 0 ? tournament_id : null;
      const detailsStr = typeof sport_details === 'object' ? JSON.stringify(sport_details) : (sport_details || null);
      const info = await db.prepare(
        "INSERT INTO players (team_id, tournament_id, name, age, role, base_price, image_url, phone, sport, sport_details) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
      ).run(tId, tourId, name, age || 22, role || 'all_rounder', base_price || 0, image_url || null, phone || null, sport || 'cricket', detailsStr);
      res.json({ success: true, id: info.lastInsertRowid });
    } catch (e: any) {
      res.status(500).json({ error: "Request failed" });
    }
  };

export const putPlayersById = async (req, res) => {
    const { name, age, role, base_price, image_url, team_id, is_sold, sold_price, phone, sport, sport_details } = req.body;
    const detailsStr = typeof sport_details === 'object' ? JSON.stringify(sport_details) : (sport_details || null);
    await db.prepare(`
      UPDATE players 
      SET name = ?, age = ?, role = ?, base_price = ?, image_url = ?, team_id = ?, is_sold = ?, sold_price = ?, phone = ?, sport = ?, sport_details = ?
      WHERE id = ?
    `).run(name, age, role, base_price, image_url, team_id, is_sold ? 1 : 0, sold_price, phone || null, sport || null, detailsStr, req.params.id);
    res.json({ success: true });
  };

export const deletePlayersById = async (req, res) => {
    await db.prepare("DELETE FROM players WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  };

export const postAuctionUnsell = async (req, res) => {
    const { player_id } = req.body;
    const player = await db.prepare("SELECT * FROM players WHERE id = ?").get(player_id);
    if (!player) return res.status(404).json({ error: "Player not found" });

    const transaction = db.transaction(async () => {
      await db.prepare("UPDATE teams SET remaining_budget = remaining_budget + ? WHERE id = ?").run(player.sold_price, player.team_id);
      await db.prepare("UPDATE players SET is_sold = 0, team_id = NULL, sold_price = 0 WHERE id = ?").run(player_id);
      broadcast({ type: "AUCTION_UPDATE" });
      return { success: true };
    });
    res.json(await transaction());
  };

export const getTournamentsByIdAuctionPool = async (req, res) => {
    try {
      const players = await db.prepare("SELECT * FROM players WHERE tournament_id = ? AND is_sold = 0 ORDER BY id ASC").all(req.params.id);
      res.json(players);
    } catch (e: any) {
      console.error("Auction pool retrieval failed:", e?.code || "unexpected_error");
      res.status(500).json({ error: "Failed to fetch auction pool" });
    }
  };

export const putTournamentsByIdAuctionPoolReorder = async (req, res) => {
    try {
      const { player_ids } = req.body; // ordered array of IDs
      if (!Array.isArray(player_ids)) {
        return res.status(400).json({ error: "player_ids array expected" });
      }
      broadcast({ type: "AUCTION_UPDATE" });
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: "Request failed" });
    }
  };

export const getPlayers = async (req, res) => {
    const players = await db.prepare(`
      SELECT p.*, t.name as team_name, tr.name as tournament_name 
      FROM players p 
      LEFT JOIN teams t ON p.team_id = t.id
      LEFT JOIN tournaments tr ON p.tournament_id = tr.id
      ORDER BY p.id DESC
    `).all();
    res.json(players);
  };

export const getTournamentsByIdAuctionInvites = async (req, res) => {
    try {
      const invites = await db.prepare(`
        SELECT ai.*, p.name as registered_player_name, p.role as registered_player_role
        FROM auction_invites ai
        LEFT JOIN players p ON ai.registered_player_id = p.id
        WHERE ai.tournament_id = ?
        ORDER BY ai.created_at DESC
      `).all(req.params.id);
      res.json(invites);
    } catch (e: any) {
      res.status(500).json({ error: "Request failed" });
    }
  };

export const postTournamentsByIdAuctionInvites = async (req, res) => {
    try {
      const tournamentId = req.params.id;
      const { player_name, email, phone, sport, notes } = req.body;
      
      // Generate unique random 8-character code
      const code = 'INV-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const info = await db.prepare(`
        INSERT INTO auction_invites (tournament_id, player_name, email, phone, sport, notes, invite_code, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
      `).run(tournamentId, player_name || null, email || null, phone || null, sport || 'cricket', notes || null, code);

      const invite = await db.prepare("SELECT * FROM auction_invites WHERE id = ?").get(info.lastInsertRowid);
      res.json({ success: true, invite });
    } catch (e: any) {
      res.status(500).json({ error: "Request failed" });
    }
  };

export const deleteAuctionInvitesById = async (req, res) => {
    try {
      await db.prepare("DELETE FROM auction_invites WHERE id = ?").run(req.params.id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: "Request failed" });
    }
  };

export const getAuctionInviteByCode = async (req, res) => {
    try {
      const code = req.params.code;
      const invite = await db.prepare(`
        SELECT ai.*, tr.name as tournament_name, tr.sport as tournament_sport, tr.format as tournament_format, 
               tr.base_budget, tr.sport_options, tr.status as tournament_status
        FROM auction_invites ai
        JOIN tournaments tr ON ai.tournament_id = tr.id
        WHERE ai.invite_code = ?
      `).get(code);

      if (!invite) {
        return res.status(404).json({ error: "Invalid or expired auction invitation code" });
      }

      res.json(invite);
    } catch (e: any) {
      res.status(500).json({ error: "Request failed" });
    }
  };

export const postAuctionInviteRegister = async (req, res) => {
    try {
      const { invite_code, tournament_id, name, age, role, sport, sport_details, phone, email, base_price, image_url } = req.body;
      
      const tourId = tournament_id;
      if (!tourId) return res.status(400).json({ error: "Tournament ID is required" });

      const detailsStr = typeof sport_details === 'object' ? JSON.stringify(sport_details) : (sport_details || null);

      const transaction = db.transaction(async () => {
        // Insert athlete into auction pool (is_sold = 0, team_id = NULL)
        const info = await db.prepare(`
          INSERT INTO players (team_id, tournament_id, name, age, role, base_price, image_url, phone, sport, sport_details, is_sold, sold_price)
          VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0)
        `).run(tourId, name, age || 22, role || 'all_rounder', base_price || 100000, image_url || null, phone || null, sport || 'cricket', detailsStr);

        const newPlayerId = info.lastInsertRowid;

        // If registered via a specific invite code, mark that invite as registered
        if (invite_code) {
          await db.prepare(`
            UPDATE auction_invites 
            SET status = 'registered', registered_player_id = ?
            WHERE invite_code = ?
          `).run(newPlayerId, invite_code);
        }

        return { playerId: newPlayerId };
      });

      const result = await transaction();
      broadcast({ type: "AUCTION_UPDATE" });
      res.json({ success: true, playerId: result.playerId });
    } catch (e: any) {
      res.status(500).json({ error: "Request failed" });
    }
  };

export const postAuctionSell = async (req, res) => {
    const { player_id, team_id, sold_price } = req.body;
    const transaction = db.transaction(async () => {
      await db.prepare("UPDATE players SET team_id = ?, sold_price = ?, is_sold = 1 WHERE id = ?").run(team_id, sold_price, player_id);
      await db.prepare("UPDATE teams SET remaining_budget = remaining_budget - ? WHERE id = ?").run(sold_price, team_id);
      return { success: true };
    });
    const result = await transaction();
    broadcast({ type: "AUCTION_UPDATE", player_id, team_id, sold_price });
    res.json(result);
  };

