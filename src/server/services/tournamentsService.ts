import { databaseService as db } from "../models/queryModel";
import { validateRequiredFields } from "./validationService";
import { publishEvent as broadcast } from "./eventService";
import { isServerless } from "./runtimeConfig";

export const getRoot = async (req, res) => {
  res.json({
    status: "ok",
    app: "GameZM",
    version: "1.0.0",
    serverless: isServerless,
    timestamp: new Date().toISOString()
  });
};

export const getHealth = async (req, res) => {
  res.json({
    status: "ok",
    app: "GameZM",
    version: "1.0.0",
    serverless: isServerless,
    timestamp: new Date().toISOString()
  });
};

export const getHealthRoot = async (req, res) => {
  res.json({
    status: "ok",
    app: "GameZM",
    version: "1.0.0",
    serverless: isServerless,
    timestamp: new Date().toISOString()
  });
};

export const getTournaments = async (req, res) => {
    const tournaments = await db.prepare("SELECT * FROM tournaments ORDER BY created_at DESC").all();
    res.json(tournaments);
  };

export const postTournaments = async (req, res) => {
    try {
      const validationError = validateRequiredFields(req.body, ["name", "format", "overs", "teams_count"]);
      if (validationError) return res.status(400).json({ error: validationError });
      const { name, format, overs, teams_count, is_auction_enabled, base_budget, sport, sport_options, start_date, end_date } = req.body;
      const info = await db.prepare(
        "INSERT INTO tournaments (name, format, overs, teams_count, is_auction_enabled, base_budget, sport, sport_options, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
      ).run(
        name, 
        format, 
        overs, 
        teams_count, 
        is_auction_enabled ? 1 : 0, 
        base_budget || 10000000, 
        sport || 'cricket', 
        sport_options ? (typeof sport_options === 'string' ? sport_options : JSON.stringify(sport_options)) : null,
        start_date || null,
        end_date || null
      );
      res.json({ id: info.lastInsertRowid });
    } catch (e: any) {
      console.error("Tournament create failed:", e?.code || "unexpected_error");
      res.status(500).json({ error: "Failed to create tournament" });
    }
  };

export const putTournamentsById = async (req, res) => {
    try {
      const { name, format, overs, teams_count, is_auction_enabled, base_budget, status, sport, sport_options, start_date, end_date } = req.body;
      await db.prepare(`
        UPDATE tournaments 
        SET name = ?, format = ?, overs = ?, teams_count = ?, is_auction_enabled = ?, base_budget = ?, status = ?, sport = ?, sport_options = ?, start_date = COALESCE(?, start_date), end_date = COALESCE(?, end_date)
        WHERE id = ?
      `).run(
        name, 
        format, 
        overs, 
        teams_count, 
        is_auction_enabled ? 1 : 0, 
        base_budget, 
        status, 
        sport || 'cricket', 
        sport_options ? (typeof sport_options === 'string' ? sport_options : JSON.stringify(sport_options)) : null, 
        start_date || null,
        end_date || null,
        req.params.id
      );
      res.json({ success: true });
    } catch (e: any) {
      console.error("Tournament update failed:", e?.code || "unexpected_error");
      res.status(500).json({ error: "Failed to update tournament" });
    }
  };

export const deleteTournamentsById = async (req, res) => {
    try {
      const transaction = db.transaction(async () => {
        // Delete related matches, teams, players, etc.
        const teams = await db.prepare("SELECT id FROM teams WHERE tournament_id = ?").all(req.params.id) as any[];
        for (const team of teams) {
          await db.prepare("DELETE FROM players WHERE team_id = ?").run(team.id);
        }
        await db.prepare("DELETE FROM teams WHERE tournament_id = ?").run(req.params.id);
        await db.prepare("DELETE FROM matches WHERE tournament_id = ?").run(req.params.id);
        await db.prepare("DELETE FROM players WHERE tournament_id = ?").run(req.params.id);
        await db.prepare("DELETE FROM points_table WHERE tournament_id = ?").run(req.params.id);
        await db.prepare("DELETE FROM tournaments WHERE id = ?").run(req.params.id);
        return { success: true };
      });
      res.json(await transaction());
    } catch (e: any) {
      console.error("Tournament delete failed:", e?.code || "unexpected_error");
      res.status(500).json({ error: "Failed to delete tournament" });
    }
  };

export const getTournamentsById = async (req, res) => {
    try {
      const tournament = await db.prepare("SELECT * FROM tournaments WHERE id = ?").get(req.params.id);
      if (!tournament) {
        return res.status(404).json({ error: "Tournament not found" });
      }
      const teams = await db.prepare("SELECT * FROM teams WHERE tournament_id = ?").all(req.params.id);
      
      // Fetch players for each team
      const teamsWithPlayers = await Promise.all(teams.map(async (team) => {
        const players = await db.prepare("SELECT * FROM players WHERE team_id = ?").all(team.id);
        return { ...team, players };
      }));

      const matches = await db.prepare(`
        SELECT m.*, t1.name as team1_name, t2.name as team2_name 
        FROM matches m
        LEFT JOIN teams t1 ON m.team1_id = t1.id
        LEFT JOIN teams t2 ON m.team2_id = t2.id
        WHERE m.tournament_id = ?
      `).all(req.params.id);
      res.json({ ...tournament, teams: teamsWithPlayers, matches });
    } catch (e: any) {
      console.error("Tournament retrieval failed:", e?.code || "unexpected_error");
      res.status(500).json({ error: "Failed to fetch tournament" });
    }
  };

export const postTournamentsByIdMatches = async (req, res) => {
    const { team1_id, team2_id, venue, match_date } = req.body;
    if (!team1_id || !team2_id) {
      return res.status(400).json({ error: "Team 1 and Team 2 are required" });
    }
    if (String(team1_id) === String(team2_id)) {
      return res.status(400).json({ error: "Teams must be different" });
    }
    try {
      const info = await db.prepare(`
        INSERT INTO matches (tournament_id, team1_id, team2_id, venue, match_date, status)
        VALUES (?, ?, ?, ?, ?, 'scheduled')
      `).run(
        req.params.id,
        team1_id,
        team2_id,
        venue || "Main Ground",
        match_date || new Date().toISOString()
      );
      res.json({ success: true, match_id: info.lastInsertRowid });
    } catch (e: any) {
      res.status(500).json({ error: "Request failed" });
    }
  };

export const getTournamentsByIdMatches = async (req, res) => {
    const matches = await db.prepare(`
      SELECT m.*, t1.name as team1_name, t2.name as team2_name 
      FROM matches m
      LEFT JOIN teams t1 ON m.team1_id = t1.id
      LEFT JOIN teams t2 ON m.team2_id = t2.id
      WHERE m.tournament_id = ?
    `).all(req.params.id);
    res.json(matches);
  };

export const deleteInningsByIdUndo = async (req, res) => {
    const transaction = db.transaction(async () => {
      const lastBall = await db.prepare("SELECT * FROM balls WHERE innings_id = ? ORDER BY id DESC LIMIT 1").get(req.params.id);
      if (!lastBall) return { success: false, error: "No balls to undo" };

      // Update innings summary
      const totalRuns = lastBall.runs + lastBall.extras;
      const isWicket = lastBall.wicket_type ? 1 : 0;
      
      const currentInnings = await db.prepare("SELECT * FROM innings WHERE id = ?").get(req.params.id);
      let newOvers = currentInnings.overs_bowled;
      let balls = Math.round((newOvers % 1) * 10);
      let overs = Math.floor(newOvers);
      
      if (lastBall.extra_type !== 'wide' && lastBall.extra_type !== 'no_ball') {
        balls--;
        if (balls < 0) {
          balls = 5;
          overs--;
        }
      }
      newOvers = overs + (balls / 10);

      await db.prepare(`
        UPDATE innings 
        SET runs = runs - ?, wickets = wickets - ?, overs_bowled = ?
        WHERE id = ?
      `).run(totalRuns, isWicket, newOvers, req.params.id);

      await db.prepare("DELETE FROM balls WHERE id = ?").run(lastBall.id);
      
      const updatedInnings = await db.prepare(`
        SELECT i.*, t1.name as batting_team_name, t2.name as bowling_team_name
        FROM innings i
        JOIN teams t1 ON i.batting_team_id = t1.id
        JOIN teams t2 ON i.bowling_team_id = t2.id
        WHERE i.id = ?
      `).get(req.params.id);
      const matchId = currentInnings.match_id;
      broadcast({ type: "SCORE_UPDATE", match_id: matchId, innings: updatedInnings });
      
      return { success: true };
    });
    res.json(await transaction());
  };



