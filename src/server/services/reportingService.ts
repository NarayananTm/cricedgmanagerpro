import { databaseService as db } from "../models/queryModel";
import { validateRequiredFields } from "./validationService";
import { publishEvent as broadcast } from "./eventService";
import { updatePointsTable } from "./standingsService";

export const getTournamentsByIdExpenses = async (req, res) => {
    const expenses = await db.prepare("SELECT * FROM expenses WHERE tournament_id = ? ORDER BY date DESC").all(req.params.id);
    res.json(expenses);
  };

export const getTournamentsByIdSponsors = async (req, res) => {
    const sponsors = await db.prepare("SELECT * FROM sponsors WHERE tournament_id = ? ORDER BY created_at DESC").all(req.params.id);
    res.json(sponsors);
  };

export const getSponsorsActive = async (req, res) => {
    const sponsors = await db.prepare(`
      SELECT s.*, t.name as tournament_name 
      FROM sponsors s 
      JOIN tournaments t ON s.tournament_id = t.id 
      WHERE t.status != 'completed'
      LIMIT 10
    `).all();
    res.json(sponsors);
  };

export const postTournamentsByIdSponsors = async (req, res) => {
    const { name, website_url, banner_url } = req.body;
    const info = await db.prepare(
      "INSERT INTO sponsors (tournament_id, name, website_url, banner_url) VALUES (?, ?, ?, ?)"
    ).run(req.params.id, name, website_url, banner_url);
    res.json({ id: info.lastInsertRowid });
  };

export const deleteSponsorsById = async (req, res) => {
    await db.prepare("DELETE FROM sponsors WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  };

export const getAdminAnalyticsByTournamentId = async (req, res) => {
    const tournamentId = req.params.tournamentId;
    
    // Financial Analytics
    const expenses = await db.prepare("SELECT SUM(amount) as total FROM expenses WHERE tournament_id = ?").get(tournamentId) as any;
    const registrations = await db.prepare("SELECT SUM(sold_price) as total FROM players WHERE tournament_id = ? AND is_sold = 1").get(tournamentId) as any;
    
    // Match Analytics
    const matchesCount = await db.prepare("SELECT COUNT(*) as count FROM matches WHERE tournament_id = ?").get(tournamentId) as any;
    const completedMatches = await db.prepare("SELECT COUNT(*) as count FROM matches WHERE tournament_id = ? AND status = 'completed'").get(tournamentId) as any;
    
    // Player Stats (Top Run Scorers)
    const topScorers = await db.prepare(`
      SELECT p.id, p.name, t.name as team_name, SUM(b.runs) as total_runs, 
             COUNT(b.id) as balls_faced
      FROM players p
      JOIN teams t ON p.team_id = t.id
      JOIN balls b ON b.batsman_id = p.id
      WHERE t.tournament_id = ?
      GROUP BY p.id, p.name, t.name
      ORDER BY total_runs DESC
      LIMIT 10
    `).all(tournamentId);

    // Bowler Stats (Top Wicket Takers)
    const topBowlers = await db.prepare(`
      SELECT p.id, p.name, t.name as team_name, COUNT(b.id) FILTER (WHERE b.wicket_type IS NOT NULL) as wickets,
             SUM(b.runs + b.extras) as runs_conceded,
             COUNT(b.id) as balls_bowled
      FROM players p
      JOIN teams t ON p.team_id = t.id
      JOIN balls b ON b.bowler_id = p.id
      WHERE t.tournament_id = ?
      GROUP BY p.id, p.name, t.name
      ORDER BY wickets DESC
      LIMIT 10
    `).all(tournamentId);

    // Team Standings
    const ptCount = (await db.prepare("SELECT COUNT(*) as count FROM points_table WHERE tournament_id = ?").get(tournamentId) as any).count || 0;
    const teams = await db.prepare("SELECT id FROM teams WHERE tournament_id = ?").all(tournamentId);
    
    if (ptCount < teams.length) {
      await updatePointsTable(Number(tournamentId));
    }

    // Retrieve standings calculated and stored in the points table
    const standings = (await db.prepare(`
      SELECT t.id, t.name, pt.played, pt.won as wins, pt.lost as losses, pt.tied, pt.points
      FROM teams t
      LEFT JOIN points_table pt ON t.id = pt.team_id AND pt.tournament_id = t.tournament_id
      WHERE t.tournament_id = ?
      ORDER BY COALESCE(pt.points, 0) DESC, COALESCE(pt.won, 0) DESC
    `).all(tournamentId)).map((item: any) => ({
      id: item.id,
      name: item.name,
      played: item.played || 0,
      wins: item.wins || 0,
      losses: item.losses || 0,
      tied: item.tied || 0,
      points: item.points || 0
    }));

    res.json({
      financials: {
        totalExpenses: expenses.total || 0,
        auctionRevenue: registrations.total || 0,
        netBalance: (registrations.total || 0) - (expenses.total || 0)
      },
      summary: {
        totalMatches: matchesCount.count,
        completedMatches: completedMatches.count,
        activeTeams: teams.length
      },
      topScorers,
      topBowlers,
      standings
    });
  };

export const getFeaturedProducts = async (req, res) => {
    const products = await db.prepare("SELECT * FROM products LIMIT 4").all();
    res.json(products);
  };

export const getFeaturedGrounds = async (req, res) => {
    const grounds = await db.prepare("SELECT * FROM grounds LIMIT 3").all();
    res.json(grounds);
  };

export const postTournamentsByIdExpenses = async (req, res) => {
    const { description, amount, category, date } = req.body;
    const info = await db.prepare(
      "INSERT INTO expenses (tournament_id, description, amount, category, date) VALUES (?, ?, ?, ?, ?)"
    ).run(req.params.id, description, amount, category, date || new Date().toISOString());
    res.json({ id: info.lastInsertRowid });
  };

export const putExpensesById = async (req, res) => {
    const { description, amount, category, date } = req.body;
    await db.prepare(
      "UPDATE expenses SET description = ?, amount = ?, category = ?, date = ? WHERE id = ?"
    ).run(description, amount, category, date, req.params.id);
    res.json({ success: true });
  };

export const deleteExpensesById = async (req, res) => {
    await db.prepare("DELETE FROM expenses WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  };

export const getTournamentsByIdStats = async (req, res) => {
    try {
      const tournament = await db.prepare("SELECT sport FROM tournaments WHERE id = ?").get(req.params.id) as { sport: string } | undefined;
      const sport = tournament?.sport || 'cricket';

      const players = await db.prepare(`
        SELECT p.*, t.name as team_name 
        FROM players p
        JOIN teams t ON p.team_id = t.id
        WHERE p.tournament_id = ?
      `).all(req.params.id) as any[];

      const stats = await Promise.all(players.map(async (player) => {
        if (sport === 'soccer' || sport === 'basketball') {
          const soccerStats = await db.prepare(`
            SELECT 
              SUM(CASE WHEN event_type = 'goal' THEN 1 ELSE 0 END) as goals,
              SUM(CASE WHEN event_type = 'card' THEN 1 ELSE 0 END) as yellow_cards,
              SUM(CASE WHEN event_type = 'card_red' THEN 1 ELSE 0 END) as red_cards,
              SUM(CASE WHEN event_type = 'foul' THEN 1 ELSE 0 END) as fouls,
              SUM(CASE WHEN event_type = 'point' THEN 1 ELSE 0 END) as basketball_points
            FROM match_events me
            JOIN matches m ON me.match_id = m.id
            WHERE me.player_id = ? AND m.tournament_id = ?
          `).get(player.id, req.params.id) as any;

          const goals = soccerStats?.goals || 0;
          const yellow_cards = soccerStats?.yellow_cards || 0;
          const red_cards = soccerStats?.red_cards || 0;
          const fouls = soccerStats?.fouls || 0;
          const basketball_points = soccerStats?.basketball_points || 0;

          const mvp_points = sport === 'soccer'
            ? goals * 15 - yellow_cards * 2 - red_cards * 5 - fouls * 1
            : basketball_points * 5 - fouls * 1;

          return {
            ...player,
            goals,
            yellow_cards,
            red_cards,
            fouls,
            basketball_points,
            mvp_points,
            batting: { runs: 0, balls: 0, fours: 0, sixes: 0, sr: "0.0" },
            bowling: { wickets: 0, runs: 0, overs: "0.0", econ: "0.00" }
          };
        } else {
          const batting = await db.prepare(`
            SELECT SUM(runs) as runs, COUNT(*) as balls, 
            SUM(CASE WHEN runs = 4 THEN 1 ELSE 0 END) as fours,
            SUM(CASE WHEN runs = 6 THEN 1 ELSE 0 END) as sixes
            FROM balls 
            WHERE batsman_id = ?
          `).get(player.id) as any;

          const bowling = await db.prepare(`
            SELECT COUNT(*) as balls, SUM(runs + extras) as runs_conceded,
            SUM(CASE WHEN wicket_type IS NOT NULL THEN 1 ELSE 0 END) as wickets
            FROM balls 
            WHERE bowler_id = ?
          `).get(player.id) as any;

          return {
            ...player,
            batting: {
              runs: batting.runs || 0,
              balls: batting.balls || 0,
              fours: batting.fours || 0,
              sixes: batting.sixes || 0,
              sr: batting.balls > 0 ? ((batting.runs / batting.balls) * 100).toFixed(1) : "0.0"
            },
            bowling: {
              wickets: bowling.wickets || 0,
              runs: bowling.runs_conceded || 0,
              overs: (Math.floor((bowling.balls || 0) / 6) + ((bowling.balls || 0) % 6) / 10).toFixed(1),
              econ: bowling.balls > 0 ? (((bowling.runs_conceded || 0) / (bowling.balls / 6))).toFixed(2) : "0.00"
            },
            mvp_points: (batting.runs || 0) + (bowling.wickets || 0) * 20 + (batting.sixes || 0) * 2 + (batting.fours || 0)
          };
        }
      }));

      res.json(stats.sort((a, b) => b.mvp_points - a.mvp_points));
    } catch (e: any) {
      console.error("Tournament stats retrieval failed:", e?.code || "unexpected_error");
      res.status(500).json({ error: "Failed to fetch tournament stats" });
    }
  };

