import { databaseService as db } from "../models/queryModel";

export async function updatePointsTable(tournamentId: number) {
  try {
    const teams = await db.prepare("SELECT id FROM teams WHERE tournament_id = ?").all(tournamentId) as any[];
    
    await db.transaction(async () => {
      // Clear current entries in points_table for this tournament
      await db.prepare("DELETE FROM points_table WHERE tournament_id = ?").run(tournamentId);
      
      for (const team of teams) {
        const teamId = team.id;
        
        // Count played
        const playedCount = (await db.prepare(`
          SELECT COUNT(*) as count FROM matches 
          WHERE tournament_id = ? 
            AND (team1_id = ? OR team2_id = ?) 
            AND status = 'completed'
        `).get(tournamentId, teamId, teamId) as any).count || 0;
        
        // Count won
        const wonCount = (await db.prepare(`
          SELECT COUNT(*) as count FROM matches 
          WHERE tournament_id = ? 
            AND winner_id = ? 
            AND status = 'completed'
        `).get(tournamentId, teamId) as any).count || 0;
        
        // Count lost (where winner_id is not null and is not equal to teamId)
        const lostCount = (await db.prepare(`
          SELECT COUNT(*) as count FROM matches 
          WHERE tournament_id = ? 
            AND (team1_id = ? OR team2_id = ?) 
            AND winner_id IS NOT NULL 
            AND winner_id != ? 
            AND status = 'completed'
        `).get(tournamentId, teamId, teamId, teamId) as any).count || 0;
        
        // Count tied / no result (where winner_id is null)
        const tiedCount = (await db.prepare(`
          SELECT COUNT(*) as count FROM matches 
          WHERE tournament_id = ? 
            AND (team1_id = ? OR team2_id = ?) 
            AND winner_id IS NULL 
            AND status = 'completed'
        `).get(tournamentId, teamId, teamId) as any).count || 0;
        
        const points = wonCount * 2 + tiedCount * 1;
        
        // Insert/Replace into points_table
        await db.prepare(`
          INSERT INTO points_table (tournament_id, team_id, played, won, lost, tied, points)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(tournamentId, teamId, playedCount, wonCount, lostCount, tiedCount, points);
      }
    })();
  } catch (error) {
    console.error("Points-table update failed:", (error as any)?.code || "unexpected_error");
  }
}
