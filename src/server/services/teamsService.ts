import { databaseService as db } from "../models/queryModel";
import { validateRequiredFields } from "./validationService";
import { publishEvent as broadcast } from "./eventService";

export const postTournamentsByIdTeams = async (req, res) => {
    const { name, manager_name, logo_url } = req.body;
    const tournament = await db.prepare("SELECT base_budget FROM tournaments WHERE id = ?").get(req.params.id);
    const info = await db.prepare(
      "INSERT INTO teams (tournament_id, name, manager_name, logo_url, remaining_budget) VALUES (?, ?, ?, ?, ?)"
    ).run(req.params.id, name, manager_name, logo_url, tournament.base_budget);
    res.json({ id: info.lastInsertRowid });
  };

export const putTeamsById = async (req, res) => {
    const { name, manager_name, status, remaining_budget, logo_url } = req.body;
    await db.prepare(`
      UPDATE teams 
      SET name = ?, manager_name = ?, status = ?, remaining_budget = ?, logo_url = ?
      WHERE id = ?
    `).run(name, manager_name, status, remaining_budget, logo_url, req.params.id);
    res.json({ success: true });
  };

export const deleteTeamsById = async (req, res) => {
    const transaction = db.transaction(async () => {
      await db.prepare("DELETE FROM players WHERE team_id = ?").run(req.params.id);
      await db.prepare("DELETE FROM teams WHERE id = ?").run(req.params.id);
      return { success: true };
    });
    res.json(await transaction());
  };

export const postTournamentsByIdGenerateFixtures = async (req, res) => {
    const teams = await db.prepare("SELECT id FROM teams WHERE tournament_id = ? AND status = 'approved'").all(req.params.id) as any[];
    if (teams.length < 2) return res.status(400).json({ error: "Not enough approved teams" });

    const tournament = await db.prepare("SELECT format FROM tournaments WHERE id = ?").get(req.params.id);
    
    // Simple Round Robin for League
    if (tournament.format === 'league') {
      const transaction = db.transaction(async () => {
        for (let i = 0; i < teams.length; i++) {
          for (let j = i + 1; j < teams.length; j++) {
            // Check if match already exists
            const exists = await db.prepare("SELECT id FROM matches WHERE tournament_id = ? AND ((team1_id = ? AND team2_id = ?) OR (team1_id = ? AND team2_id = ?))").get(req.params.id, teams[i].id, teams[j].id, teams[j].id, teams[i].id);
            
            if (!exists) {
              await db.prepare(`
                INSERT INTO matches (tournament_id, team1_id, team2_id, venue, match_date)
                VALUES (?, ?, ?, ?, ?)
              `).run(req.params.id, teams[i].id, teams[j].id, "Main Ground", new Date().toISOString());
            }
          }
        }
        return { success: true };
      });
      res.json(await transaction());
    } else {
      res.json({ success: true });
    }
  };

export const postTeamsByIdApprove = async (req, res) => {
    await db.prepare("UPDATE teams SET status = 'approved' WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  };

export const getTeams = async (req, res) => {
    try {
      const tournamentId = req.query.tournament_id;
      let query = "SELECT t.*, tr.name as tournament_name FROM teams t LEFT JOIN tournaments tr ON t.tournament_id = tr.id";
      const params: any[] = [];
      if (tournamentId) {
        query += " WHERE t.tournament_id = ?";
        params.push(tournamentId);
      }
      query += " ORDER BY t.name ASC";
      const teams = await db.prepare(query).all(...params);
      res.json(teams);
    } catch (e: any) {
      res.status(500).json({ error: "Request failed" });
    }
  };

