import { GoogleGenAI } from "@google/genai";

const getGeminiApiKey = () => {
  const importMetaKey = typeof import.meta !== "undefined" ? (import.meta as any).env?.VITE_GEMINI_API_KEY : undefined;
  const processKey = typeof process !== "undefined" ? process.env?.GEMINI_API_KEY : undefined;
  return (importMetaKey || processKey || "").trim();
};

const geminiApiKey = getGeminiApiKey();
const ai = geminiApiKey ? new GoogleGenAI({ apiKey: geminiApiKey }) : null;

export const geminiService = {
  async getMatchInsight(match: any, innings: any, events: any[]) {
    if (!ai) return "AI insights are unavailable without an API key.";

    const isCricket = !match.sport || match.sport === 'cricket';
    const prompt = isCricket ? `
      You are a professional cricket commentator. Provide a concise (2-3 sentences), exciting, and technical match insight based on the current score and recent events.
      
      Match: ${match.team1_name} vs ${match.team2_name}
      Current Batting Team: ${innings?.batting_team_name}
      Score: ${innings?.runs}/${innings?.wickets} (${innings?.overs_bowled} overs)
      Recent Events: ${events.slice(0, 5).map(e => e.description).join(', ')}
      
      Focus on the match situation, run rate, and momentum.
    ` : `
      You are a professional sports commentator for ${match.sport === 'soccer' ? 'Football/Soccer' : 'Basketball'}. Provide a concise (2-3 sentences), exciting, and tactical match insight based on the current score and recent events.
      
      Match: ${match.team1_name} vs ${match.team2_name}
      Score: ${match.team1_name} ${match.team1_score ?? 0} - ${match.team2_score ?? 0} ${match.team2_name}
      Recent Events: ${events.slice(0, 5).map(e => e.description).join(', ')}
      
      Focus on the game situation, tempo, standout scoring plays, defensive/offensive strategies, and team momentum.
    `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          temperature: 0.7,
        }
      });
      return response.text;
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Unable to generate AI insight at this moment.";
    }
  },

  async getPlayerScoutReport(player: any, stats: any) {
    if (!ai) return "Scout report unavailable.";

    const prompt = `
      You are a professional cricket scout. Analyze this player and provide a punchy "Scout Analysis" (max 300 characters).
      
      Player: ${player.name}
      Role: ${player.role}
      Specialization: ${player.specialization}
      Stats: 
      - Matches: ${stats.matches}
      - Total Runs: ${stats.totalRuns}
      - Total Wickets: ${stats.totalWickets}
      - Avg Economy: ${stats.avgEconomy}
      
      Highlight their key strength and potential value in a tournament.
    `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          temperature: 0.7,
        }
      });
      return response.text;
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Scout analysis unavailable.";
    }
  }
};
