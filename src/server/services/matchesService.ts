import { databaseService as db } from "../models/queryModel";
import { validateRequiredFields } from "./validationService";
import { publishEvent as broadcast } from "./eventService";
import { updatePointsTable } from "./standingsService";

export const postMatchesByIdStart = async (req, res) => {
    const match = await db.prepare("SELECT * FROM matches WHERE id = ?").get(req.params.id);
    await db.prepare("UPDATE matches SET status = 'live' WHERE id = ?").run(req.params.id);
    
    // Create first innings
    await db.prepare(`
      INSERT INTO innings (match_id, innings_number, batting_team_id, bowling_team_id)
      VALUES (?, 1, ?, ?)
    `).run(req.params.id, match.team1_id, match.team2_id);
    
    res.json({ success: true });
  };

export const postMatchesByIdEnd = async (req, res) => {
    const { winner_id } = req.body;
    await db.prepare("UPDATE matches SET status = 'completed', winner_id = ? WHERE id = ?").run(winner_id || null, req.params.id);
    
    // Auto calculate and update raw standings in the points table
    const m = await db.prepare("SELECT tournament_id FROM matches WHERE id = ?").get(req.params.id) as any;
    if (m && m.tournament_id) {
      await updatePointsTable(m.tournament_id);
    }

    broadcast({ type: "MATCH_ENDED", match_id: req.params.id });
    res.json({ success: true });
  };

export const getMatchesLive = async (req, res) => {
    const matches = await db.prepare(`
      SELECT m.*, t1.name as team1_name, t2.name as team2_name, tr.sport
      FROM matches m
      JOIN teams t1 ON m.team1_id = t1.id
      JOIN teams t2 ON m.team2_id = t2.id
      JOIN tournaments tr ON m.tournament_id = tr.id
      WHERE m.status = 'live'
    `).all();
    
    const liveMatches = await Promise.all(matches.map(async (match) => {
      const innings = await db.prepare(`
        SELECT i.*, t1.name as batting_team_name, t2.name as bowling_team_name
        FROM innings i
        JOIN teams t1 ON i.batting_team_id = t1.id
        JOIN teams t2 ON i.bowling_team_id = t2.id
        WHERE i.match_id = ?
      `).all(match.id);
      return { ...match, innings };
    }));
    
    res.json(liveMatches);
  };

export const getMatches = async (req, res) => {
    try {
      const tournamentId = req.query.tournament_id;
      let query = `
        SELECT m.*, t1.name as team1_name, t2.name as team2_name, tr.name as tournament_name, tr.sport
        FROM matches m
        LEFT JOIN teams t1 ON m.team1_id = t1.id
        LEFT JOIN teams t2 ON m.team2_id = t2.id
        LEFT JOIN tournaments tr ON m.tournament_id = tr.id
      `;
      const params: any[] = [];
      if (tournamentId) {
        query += " WHERE m.tournament_id = ?";
        params.push(tournamentId);
      }
      query += " ORDER BY m.id DESC LIMIT 50";
      const matches = await db.prepare(query).all(...params) as any[];
      const result = await Promise.all(matches.map(async (match) => {
        const innings = await db.prepare(`
          SELECT i.*, t1.name as batting_team_name, t2.name as bowling_team_name
          FROM innings i
          LEFT JOIN teams t1 ON i.batting_team_id = t1.id
          LEFT JOIN teams t2 ON i.bowling_team_id = t2.id
          WHERE i.match_id = ?
        `).all(match.id);
        return { ...match, innings };
      }));
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };

export const postMatches = async (req, res) => {
    const { tournament_id, team1_id, team2_id, venue, match_date, status } = req.body;
    if (!tournament_id || !team1_id || !team2_id) {
      return res.status(400).json({ error: "Tournament, Team 1, and Team 2 are required" });
    }
    if (String(team1_id) === String(team2_id)) {
      return res.status(400).json({ error: "Team 1 and Team 2 must be different" });
    }
    try {
      const info = await db.prepare(`
        INSERT INTO matches (tournament_id, team1_id, team2_id, venue, match_date, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        tournament_id,
        team1_id,
        team2_id,
        venue || "Main Ground",
        match_date || new Date().toISOString(),
        status || 'scheduled'
      );
      broadcast({ type: "MATCH_CREATED", match_id: info.lastInsertRowid, tournament_id });
      res.json({ success: true, match_id: info.lastInsertRowid });
    } catch (e: any) {
      res.status(500).json({ error: "Request failed" });
    }
  };

export const postMatchesByIdQuickScore = async (req, res) => {
    const { runs, wickets, overs_bowled, status, team1_score, team2_score, current_innings_index } = req.body;
    try {
      const match = await db.prepare("SELECT * FROM matches WHERE id = ?").get(req.params.id) as any;
      if (!match) return res.status(404).json({ error: "Match not found" });

      if (status) {
        await db.prepare("UPDATE matches SET status = ? WHERE id = ?").run(status, req.params.id);
      }
      if (team1_score !== undefined || team2_score !== undefined) {
        await db.prepare("UPDATE matches SET team1_score = ?, team2_score = ? WHERE id = ?").run(
          team1_score ?? match.team1_score ?? 0,
          team2_score ?? match.team2_score ?? 0,
          req.params.id
        );
      }

      // Check or update innings
      const allInnings = await db.prepare("SELECT * FROM innings WHERE match_id = ? ORDER BY id ASC").all(req.params.id) as any[];
      let targetInnings = allInnings[current_innings_index || 0];

      if (!targetInnings && (runs !== undefined || wickets !== undefined || overs_bowled !== undefined)) {
        const info = await db.prepare(`
          INSERT INTO innings (match_id, batting_team_id, bowling_team_id, runs, wickets, overs_bowled)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(
          req.params.id,
          match.team1_id,
          match.team2_id,
          runs || 0,
          wickets || 0,
          overs_bowled || 0
        );
        targetInnings = await db.prepare("SELECT * FROM innings WHERE id = ?").get(info.lastInsertRowid);
      } else if (targetInnings && (runs !== undefined || wickets !== undefined || overs_bowled !== undefined)) {
        await db.prepare(`
          UPDATE innings 
          SET runs = ?, wickets = ?, overs_bowled = ?
          WHERE id = ?
        `).run(
          runs ?? targetInnings.runs,
          wickets ?? targetInnings.wickets,
          overs_bowled ?? targetInnings.overs_bowled,
          targetInnings.id
        );
        targetInnings = await db.prepare("SELECT * FROM innings WHERE id = ?").get(targetInnings.id);
      }

      broadcast({ 
        type: "SCORE_UPDATE", 
        match_id: req.params.id, 
        innings: targetInnings,
        team1_score: team1_score ?? match.team1_score,
        team2_score: team2_score ?? match.team2_score,
        status: status || match.status
      });

      res.json({ success: true, innings: targetInnings, match });
    } catch (e: any) {
      res.status(500).json({ error: "Request failed" });
    }
  };

export const putMatchesById = async (req, res) => {
    const { match_date, venue, status } = req.body;
    await db.prepare("UPDATE matches SET match_date = ?, venue = ?, status = ? WHERE id = ?").run(match_date, venue, status, req.params.id);
    
    // Auto calculate and update standings in the points table
    const m = await db.prepare("SELECT tournament_id FROM matches WHERE id = ?").get(req.params.id) as any;
    if (m && m.tournament_id) {
      await updatePointsTable(m.tournament_id);
    }

    res.json({ success: true });
  };

export const deleteMatchesById = async (req, res) => {
    const m = await db.prepare("SELECT tournament_id FROM matches WHERE id = ?").get(req.params.id) as any;
    const transaction = db.transaction(async () => {
      const innings = await db.prepare("SELECT id FROM innings WHERE match_id = ?").all(req.params.id) as any[];
      for (const inn of innings) {
        await db.prepare("DELETE FROM balls WHERE innings_id = ?").run(inn.id);
      }
      await db.prepare("DELETE FROM innings WHERE match_id = ?").run(req.params.id);
      await db.prepare("DELETE FROM matches WHERE id = ?").run(req.params.id);
      return { success: true };
    });
    const result = await transaction();
    
    // Auto calculate standings after deletion
    if (m && m.tournament_id) {
      await updatePointsTable(m.tournament_id);
    }

    res.json(result);
  };

export const postMatchesByIdScore = async (req, res) => {
    const { innings_id, over_number, ball_number, batsman_id, bowler_id, runs, extras, extra_type, wicket_type, wicket_player_id } = req.body;
    
    const transaction = db.transaction(async () => {
      await db.prepare(`
        INSERT INTO balls (innings_id, over_number, ball_number, batsman_id, bowler_id, runs, extras, extra_type, wicket_type, wicket_player_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(innings_id, over_number, ball_number, batsman_id, bowler_id, runs, extras, extra_type, wicket_type, wicket_player_id);

      // Update innings summary
      const totalRuns = runs + extras;
      const isWicket = wicket_type ? 1 : 0;
      
      // Calculate overs
      const currentInnings = await db.prepare("SELECT * FROM innings WHERE id = ?").get(innings_id);
      let newOvers = currentInnings.overs_bowled;
      let balls = Math.round((newOvers % 1) * 10);
      let overs = Math.floor(newOvers);
      
      if (extra_type !== 'wide' && extra_type !== 'no_ball') {
        balls++;
        if (balls >= 6) {
          overs++;
          balls = 0;
        }
      }
      newOvers = overs + (balls / 10);

      await db.prepare(`
        UPDATE innings 
        SET runs = runs + ?, wickets = wickets + ?, overs_bowled = ?
        WHERE id = ?
      `).run(totalRuns, isWicket, newOvers, innings_id);

      return await db.prepare(`
        SELECT i.*, t1.name as batting_team_name, t2.name as bowling_team_name
        FROM innings i
        JOIN teams t1 ON i.batting_team_id = t1.id
        JOIN teams t2 ON i.bowling_team_id = t2.id
        WHERE i.id = ?
      `).get(innings_id);
    });

    const updatedInnings = await transaction();
    broadcast({ type: "SCORE_UPDATE", match_id: req.params.id, innings: updatedInnings });
    res.json(updatedInnings);
  };

export const postMatchesByIdScoreGeneric = async (req, res) => {
    try {
      const { team1_score, team2_score, description, event_type, player_id, team_id } = req.body;
      
      let eventId: number | null = null;
      await db.transaction(async () => {
        await db.prepare(`
          UPDATE matches 
          SET team1_score = ?, team2_score = ? 
          WHERE id = ?
        `).run(team1_score || 0, team2_score || 0, req.params.id);

        if (description) {
          const info = await db.prepare(`
            INSERT INTO match_events (match_id, event_type, team_id, player_id, description)
            VALUES (?, ?, ?, ?, ?)
          `).run(req.params.id, event_type || 'commentary', team_id || null, player_id || null, description);
          eventId = Number(info.lastInsertRowid);
        }
      })();

      broadcast({ 
        type: "SCORE_UPDATE_GENERIC", 
        match_id: req.params.id, 
        team1_score: team1_score || 0, 
        team2_score: team2_score || 0,
        event: description ? { 
          id: eventId,
          event_type: event_type || 'commentary', 
          team_id, 
          player_id, 
          description, 
          timestamp: new Date().toISOString() 
        } : null
      });

      res.json({ success: true, team1_score, team2_score });
    } catch (e: any) {
      res.status(500).json({ error: "Request failed" });
    }
  };

export const putMatchesByIdSettings = async (req, res) => {
    const { 
      toss_winner_id, 
      toss_decision, 
      striker_id, 
      non_striker_id, 
      bowler_id, 
      live_stream_url,
      status
    } = req.body;

    await db.prepare(`
      UPDATE matches 
      SET toss_winner_id = ?, toss_decision = ?, striker_id = ?, non_striker_id = ?, bowler_id = ?, live_stream_url = ?, status = ?
      WHERE id = ?
    `).run(
      toss_winner_id || null, 
      toss_decision || null, 
      striker_id || null, 
      non_striker_id || null, 
      bowler_id || null, 
      live_stream_url || null,
      status || 'live',
      req.params.id
    );

    // Auto calculate and update standings in the points table
    const m = await db.prepare("SELECT tournament_id FROM matches WHERE id = ?").get(req.params.id) as any;
    if (m && m.tournament_id) {
      await updatePointsTable(m.tournament_id);
    }

    broadcast({ type: "MATCH_SETTINGS_UPDATE", match_id: req.params.id });
    res.json({ success: true });
  };

export const postMatchesByIdEvents = async (req, res) => {
    const { event_type, team_id, player_id, description } = req.body;
    const info = await db.prepare(
      "INSERT INTO match_events (match_id, event_type, team_id, player_id, description) VALUES (?, ?, ?, ?, ?)"
    ).run(req.params.id, event_type, team_id, player_id, description);
    
    broadcast({ type: "MATCH_EVENT", match_id: req.params.id, event: { id: info.lastInsertRowid, event_type, team_id, player_id, description, timestamp: new Date().toISOString() } });
    res.json({ id: info.lastInsertRowid });
  };

export const getMatchesByIdEvents = async (req, res) => {
    const events = await db.prepare("SELECT * FROM match_events WHERE match_id = ? ORDER BY timestamp DESC").all(req.params.id);
    res.json(events);
  };

