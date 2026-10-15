import express from "express";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

// Determine DB location - in Vercel or AWS Lambda, the root directory is read-only, so use /tmp
const isServerless = !!process.env.VERCEL || !!process.env.VERCEL_ENV || !!process.env.NOW_REGION || !!process.env.AWS_LAMBDA_FUNCTION_NAME;
const dbDir = isServerless ? "/tmp" : process.cwd();
const dbPath = path.join(dbDir, "tournament.db");

if (isServerless && !fs.existsSync(dbPath)) {
  const possibleSeedLocations = [
    path.join(process.cwd(), "tournament.db"),
    path.join(__dirname, "tournament.db"),
    path.join(__dirname, "../tournament.db")
  ];
  let seeded = false;
  for (const seedPath of possibleSeedLocations) {
    if (fs.existsSync(seedPath)) {
      try {
        fs.copyFileSync(seedPath, dbPath);
        console.log(`[Vercel DB] Seeded database copied from ${seedPath} to ${dbPath}`);
        seeded = true;
        break;
      } catch (err) {
        console.warn(`[Vercel DB] Could not copy seed database from ${seedPath}:`, err);
      }
    }
  }
}

process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT EXCEPTION]', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('[UNHANDLED REJECTION]', reason);
});

let db: any;
try {
  db = new Database(dbPath);
} catch (dbErr) {
  console.error("[DB ERROR] Failed to initialize better-sqlite3:", dbErr);
  db = {
    prepare: () => ({
      all: () => [],
      get: () => null,
      run: () => ({ lastInsertRowid: 1, changes: 1 })
    }),
    exec: () => {},
    transaction: (fn: any) => () => fn()
  };
}

// Initialize Database Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    plan TEXT DEFAULT 'starter', -- 'starter', 'pro'
    is_admin BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS tournaments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    sport TEXT DEFAULT 'cricket',
    format TEXT NOT NULL, -- 'league', 'knockout', 'group_knockout'
    overs INTEGER NOT NULL,
    teams_count INTEGER NOT NULL,
    status TEXT DEFAULT 'draft', -- 'draft', 'active', 'completed'
    is_auction_enabled BOOLEAN DEFAULT 0,
    base_budget INTEGER DEFAULT 10000000,
    sport_options TEXT,
    start_date TEXT,
    end_date TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Safe migrations for existing databases
try {
  db.exec("ALTER TABLE tournaments ADD COLUMN start_date TEXT;");
} catch (e) {}
try {
  db.exec("ALTER TABLE tournaments ADD COLUMN end_date TEXT;");
} catch (e) {}

db.exec(`

  CREATE TABLE IF NOT EXISTS teams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tournament_id INTEGER,
    name TEXT NOT NULL,
    short_name TEXT,
    logo_url TEXT,
    manager_name TEXT,
    payment_status TEXT DEFAULT 'pending', -- 'pending', 'paid'
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    remaining_budget INTEGER DEFAULT 0,
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id)
  );

  CREATE TABLE IF NOT EXISTS players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    team_id INTEGER,
    tournament_id INTEGER,
    name TEXT NOT NULL,
    age INTEGER,
    role TEXT, -- 'batsman', 'bowler', 'all_rounder', 'wk'
    base_price INTEGER DEFAULT 0,
    sold_price INTEGER DEFAULT 0,
    is_sold BOOLEAN DEFAULT 0,
    image_url TEXT,
    FOREIGN KEY (team_id) REFERENCES teams(id),
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id)
  );

  CREATE TABLE IF NOT EXISTS matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tournament_id INTEGER,
    team1_id INTEGER,
    team2_id INTEGER,
    venue TEXT,
    match_date DATETIME,
    status TEXT DEFAULT 'scheduled', -- 'scheduled', 'live', 'completed'
    winner_id INTEGER,
    toss_winner_id INTEGER,
    toss_decision TEXT, -- 'bat', 'bowl'
    current_innings INTEGER DEFAULT 1,
    live_stream_url TEXT,
    striker_id INTEGER,
    non_striker_id INTEGER,
    bowler_id INTEGER,
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id),
    FOREIGN KEY (team1_id) REFERENCES teams(id),
    FOREIGN KEY (team2_id) REFERENCES teams(id)
  );

  CREATE TABLE IF NOT EXISTS innings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    match_id INTEGER,
    innings_number INTEGER,
    batting_team_id INTEGER,
    bowling_team_id INTEGER,
    runs INTEGER DEFAULT 0,
    wickets INTEGER DEFAULT 0,
    overs_bowled REAL DEFAULT 0.0,
    FOREIGN KEY (match_id) REFERENCES matches(id)
  );

  CREATE TABLE IF NOT EXISTS balls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    innings_id INTEGER,
    over_number INTEGER,
    ball_number INTEGER,
    batsman_id INTEGER,
    bowler_id INTEGER,
    runs INTEGER,
    extras INTEGER DEFAULT 0,
    extra_type TEXT, -- 'wide', 'no_ball', 'bye', 'leg_bye'
    wicket_type TEXT, -- 'bowled', 'caught', 'lbw', etc.
    wicket_player_id INTEGER,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (innings_id) REFERENCES innings(id)
  );

  CREATE TABLE IF NOT EXISTS points_table (
    tournament_id INTEGER,
    team_id INTEGER,
    played INTEGER DEFAULT 0,
    won INTEGER DEFAULT 0,
    lost INTEGER DEFAULT 0,
    tied INTEGER DEFAULT 0,
    nrr REAL DEFAULT 0.0,
    points INTEGER DEFAULT 0,
    PRIMARY KEY (tournament_id, team_id),
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id),
    FOREIGN KEY (team_id) REFERENCES teams(id)
  );

  CREATE TABLE IF NOT EXISTS match_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    match_id INTEGER,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    event_type TEXT NOT NULL, -- 'goal', 'point', 'wicket', 'card', 'commentary'
    team_id INTEGER,
    player_id INTEGER,
    description TEXT,
    FOREIGN KEY (match_id) REFERENCES matches(id)
  );

  CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tournament_id INTEGER,
    description TEXT NOT NULL,
    amount INTEGER NOT NULL,
    category TEXT, -- 'venue', 'umpire', 'equipment', 'other'
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id)
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    image_url TEXT,
    selling_options TEXT, -- JSON string for options like sizes, colors
    stock INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_mobile TEXT NOT NULL,
    customer_address TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    total_price REAL NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'shipped', 'delivered'
    payment_method TEXT,
    payment_details TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id)
  );

  CREATE TABLE IF NOT EXISTS grounds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    description TEXT,
    price_per_hour REAL NOT NULL,
    image_url TEXT,
    amenities TEXT, -- JSON string
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS ground_bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ground_id INTEGER,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_mobile TEXT NOT NULL,
    booking_date DATE NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    total_price REAL NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'confirmed', 'cancelled'
    payment_method TEXT,
    payment_details TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ground_id) REFERENCES grounds(id)
  );

  CREATE TABLE IF NOT EXISTS sponsors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tournament_id INTEGER,
    name TEXT NOT NULL,
    website_url TEXT,
    banner_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id)
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS team_chats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tournament_id INTEGER NOT NULL,
    sender_name TEXT NOT NULL,
    team_name TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id)
  );

  CREATE TABLE IF NOT EXISTS tournament_gallery (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tournament_id INTEGER NOT NULL,
    image_url TEXT NOT NULL,
    caption TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id)
  );

  CREATE TABLE IF NOT EXISTS auction_invites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tournament_id INTEGER NOT NULL,
    player_name TEXT,
    email TEXT,
    phone TEXT,
    sport TEXT DEFAULT 'cricket',
    notes TEXT,
    invite_code TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'registered', 'declined'
    registered_player_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id)
  );
`);

// Ensure phone, sport, and sport_details columns exist in the players table
try {
  db.prepare("ALTER TABLE players ADD COLUMN phone TEXT").run();
} catch (e) {
  // Ignored if column already exists
}
try {
  db.prepare("ALTER TABLE players ADD COLUMN sport TEXT").run();
} catch (e) {
  // Ignored if column already exists
}
try {
  db.prepare("ALTER TABLE players ADD COLUMN sport_details TEXT").run();
} catch (e) {
  // Ignored if column already exists
}

// Initialize default settings
const initSettings = () => {
  const defaultSettings = [
    { key: 'payment_receiver_upi', value: 'admin@upi' },
    { key: 'payment_receiver_bank', value: 'Bank: HDFC, A/C: 1234567890, IFSC: HDFC0001234' },
    { key: 'payment_receiver_name', value: 'CricEdgPro Admin' }
  ];

  for (const setting of defaultSettings) {
    const exists = db.prepare("SELECT 1 FROM settings WHERE key = ?").get(setting.key);
    if (!exists) {
      db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)").run(setting.key, setting.value);
    }
  }
};
initSettings();

// Migrations for existing databases
const migrate = () => {
  const tables = {
    tournaments: ['is_auction_enabled', 'base_budget', 'rules', 'sport', 'sport_options'],
    teams: ['remaining_budget'],
    players: ['tournament_id', 'base_price', 'sold_price', 'is_sold', 'image_url', 'phone', 'sport', 'sport_details'],
    matches: ['live_stream_url', 'striker_id', 'non_striker_id', 'bowler_id', 'team1_score', 'team2_score'],
    orders: ['payment_method', 'payment_details']
  };

  for (const [table, columns] of Object.entries(tables)) {
    const info = db.prepare(`PRAGMA table_info(${table})`).all() as any[];
    const existingColumns = info.map(c => c.name);
    
    for (const column of columns) {
      if (!existingColumns.includes(column)) {
        try {
          let type = 'INTEGER DEFAULT 0';
          if (column.includes('enabled') || column.includes('is_')) {
            type = 'BOOLEAN DEFAULT 0';
          } else if (column.includes('image_url') || column.includes('name') || column.includes('method') || column.includes('details') || column === 'rules' || column === 'sport' || column === 'sport_options') {
            type = 'TEXT';
          }
          db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
          console.log(`Added column ${column} to ${table}`);
        } catch (e) {
          console.error(`Error adding column ${column} to ${table}:`, e);
        }
      }
    }
  }
};

migrate();

// Auto-seed initial tournaments if database is fresh (e.g. freshly deployed on Vercel /tmp)
try {
  const tournamentCount = (db.prepare("SELECT count(*) as count FROM tournaments").get() as any)?.count || 0;
  if (tournamentCount === 0) {
    const info = db.prepare(`
      INSERT INTO tournaments (name, sport, format, overs, teams_count, status, is_auction_enabled, base_budget, start_date, end_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'Premier League 2026',
      'cricket',
      'league',
      20,
      4,
      'active',
      1,
      10000000,
      '2026-04-01',
      '2026-04-15'
    );
    const tournamentId = info.lastInsertRowid;
    
    // Seed initial teams
    db.prepare("INSERT INTO teams (tournament_id, name, short_name, remaining_budget, status, payment_status) VALUES (?, ?, ?, ?, ?, ?)").run(tournamentId, 'Chennai Thunderbolts', 'CT', 10000000, 'approved', 'paid');
    db.prepare("INSERT INTO teams (tournament_id, name, short_name, remaining_budget, status, payment_status) VALUES (?, ?, ?, ?, ?, ?)").run(tournamentId, 'Mumbai Strikers', 'MS', 10000000, 'approved', 'paid');
    
    // Seed sample players
    db.prepare("INSERT INTO players (tournament_id, name, age, role, base_price, is_sold, sport) VALUES (?, ?, ?, ?, ?, ?, ?)").run(tournamentId, 'Vetri Vel', 24, 'all_rounder', 200000, 0, 'cricket');
    db.prepare("INSERT INTO players (tournament_id, name, age, role, base_price, is_sold, sport) VALUES (?, ?, ?, ?, ?, ?, ?)").run(tournamentId, 'Aarav Sharma', 26, 'batsman', 150000, 0, 'cricket');
    db.prepare("INSERT INTO players (tournament_id, name, age, role, base_price, is_sold, sport) VALUES (?, ?, ?, ?, ?, ?, ?)").run(tournamentId, 'Karthik Raja', 23, 'bowler', 120000, 0, 'cricket');
    db.prepare("INSERT INTO players (tournament_id, name, age, role, base_price, is_sold, sport) VALUES (?, ?, ?, ?, ?, ?, ?)").run(tournamentId, 'Rohan Patel', 28, 'wk', 180000, 0, 'cricket');
    console.log('[AUTO-SEED] Seeded initial tournament, teams, and players');
  }
} catch (e) {
  console.warn('[AUTO-SEED] Non-fatal auto-seed notice:', e);
}

function updatePointsTable(tournamentId: number) {
  try {
    const teams = db.prepare("SELECT id FROM teams WHERE tournament_id = ?").all(tournamentId) as any[];
    
    db.transaction(() => {
      // Clear current entries in points_table for this tournament
      db.prepare("DELETE FROM points_table WHERE tournament_id = ?").run(tournamentId);
      
      for (const team of teams) {
        const teamId = team.id;
        
        // Count played
        const playedCount = (db.prepare(`
          SELECT COUNT(*) as count FROM matches 
          WHERE tournament_id = ? 
            AND (team1_id = ? OR team2_id = ?) 
            AND status = 'completed'
        `).get(tournamentId, teamId, teamId) as any).count || 0;
        
        // Count won
        const wonCount = (db.prepare(`
          SELECT COUNT(*) as count FROM matches 
          WHERE tournament_id = ? 
            AND winner_id = ? 
            AND status = 'completed'
        `).get(tournamentId, teamId) as any).count || 0;
        
        // Count lost (where winner_id is not null and is not equal to teamId)
        const lostCount = (db.prepare(`
          SELECT COUNT(*) as count FROM matches 
          WHERE tournament_id = ? 
            AND (team1_id = ? OR team2_id = ?) 
            AND winner_id IS NOT NULL 
            AND winner_id != ? 
            AND status = 'completed'
        `).get(tournamentId, teamId, teamId, teamId) as any).count || 0;
        
        // Count tied / no result (where winner_id is null)
        const tiedCount = (db.prepare(`
          SELECT COUNT(*) as count FROM matches 
          WHERE tournament_id = ? 
            AND (team1_id = ? OR team2_id = ?) 
            AND winner_id IS NULL 
            AND status = 'completed'
        `).get(tournamentId, teamId, teamId) as any).count || 0;
        
        const points = wonCount * 2 + tiedCount * 1;
        
        // Insert/Replace into points_table
        db.prepare(`
          INSERT INTO points_table (tournament_id, team_id, played, won, lost, tied, points)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(tournamentId, teamId, playedCount, wonCount, lostCount, tiedCount, points);
      }
    })();
  } catch (error) {
    console.error("Error updating points table:", error);
  }
}

export const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Enable CORS for external API consumers / preview domains
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Normalized URL rewrite for Vercel serverless functions
if (isServerless) {
  app.use((req, res, next) => {
    const matchedPath =
      (req.headers["x-matched-path"] as string) ||
      (req.headers["x-forwarded-uri"] as string) ||
      (req.headers["x-original-url"] as string);

    if (matchedPath && matchedPath.startsWith("/api") && req.url !== matchedPath) {
      req.url = matchedPath;
    } else if (!req.url.startsWith("/api") && !req.url.startsWith("/assets")) {
      req.url = "/api" + (req.url.startsWith("/") ? req.url : "/" + req.url);
    }
    next();
  });
}

// Request logger
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url}`);
  const originalJson = res.json;
  res.json = function(body) {
    console.log(`[RESPONSE] ${req.method} ${req.url} - Status ${res.statusCode}`);
    return originalJson.call(this, body);
  };
  next();
});

// Broadcast handler (no-op in serverless, active in standalone websocket mode)
let broadcast = (_data: any) => {};

// API Health Check
app.get(["/api", "/api/health", "/health"], (req, res) => {
  res.json({
    status: "ok",
    app: "KYNTRIVO",
    version: "1.0.0",
    serverless: isServerless,
    timestamp: new Date().toISOString()
  });
});

  // Auth APIs
  app.post("/api/auth/register", (req, res) => {
    const { name, email, password, plan } = req.body;
    try {
      const isAdmin = (plan === 'pro' || plan === 'organizer') ? 1 : 0;
      const info = db.prepare(
        "INSERT INTO users (name, email, password, plan, is_admin) VALUES (?, ?, ?, ?, ?)"
      ).run(name, email, password, plan || 'starter', isAdmin);
      const user = db.prepare("SELECT id, name, email, plan, is_admin FROM users WHERE id = ?").get(info.lastInsertRowid);
      res.json(user);
    } catch (e: any) {
      if (e.message.includes('UNIQUE constraint failed')) {
        res.status(400).json({ error: "Email already exists" });
      } else {
        res.status(500).json({ error: "Registration failed" });
      }
    }
  });

  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare("SELECT id, name, email, plan, is_admin FROM users WHERE email = ? AND password = ?").get(email, password);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    res.json(user);
  });

  // API Routes
  app.get("/api/tournaments", (req, res) => {
    const tournaments = db.prepare("SELECT * FROM tournaments ORDER BY created_at DESC").all();
    res.json(tournaments);
  });

   app.post("/api/tournaments", (req, res) => {
    try {
      const { name, format, overs, teams_count, is_auction_enabled, base_budget, sport, sport_options, start_date, end_date } = req.body;
      const info = db.prepare(
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
      console.error("Error in POST /api/tournaments:", e);
      res.status(500).json({ error: e.message || "Failed to create tournament" });
    }
  });

  app.put("/api/tournaments/:id", (req, res) => {
    try {
      const { name, format, overs, teams_count, is_auction_enabled, base_budget, status, sport, sport_options, start_date, end_date } = req.body;
      db.prepare(`
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
      console.error(`Error in PUT /api/tournaments/${req.params.id}:`, e);
      res.status(500).json({ error: e.message || "Failed to update tournament" });
    }
  });

  app.delete("/api/tournaments/:id", (req, res) => {
    try {
      const transaction = db.transaction(() => {
        // Delete related matches, teams, players, etc.
        const teams = db.prepare("SELECT id FROM teams WHERE tournament_id = ?").all(req.params.id) as any[];
        for (const team of teams) {
          db.prepare("DELETE FROM players WHERE team_id = ?").run(team.id);
        }
        db.prepare("DELETE FROM teams WHERE tournament_id = ?").run(req.params.id);
        db.prepare("DELETE FROM matches WHERE tournament_id = ?").run(req.params.id);
        db.prepare("DELETE FROM players WHERE tournament_id = ?").run(req.params.id);
        db.prepare("DELETE FROM points_table WHERE tournament_id = ?").run(req.params.id);
        db.prepare("DELETE FROM tournaments WHERE id = ?").run(req.params.id);
        return { success: true };
      });
      res.json(transaction());
    } catch (e: any) {
      console.error(`Error in DELETE /api/tournaments/${req.params.id}:`, e);
      res.status(500).json({ error: e.message || "Failed to delete tournament" });
    }
  });

  app.get("/api/tournaments/:id", (req, res) => {
    try {
      const tournament = db.prepare("SELECT * FROM tournaments WHERE id = ?").get(req.params.id);
      if (!tournament) {
        return res.status(404).json({ error: "Tournament not found" });
      }
      const teams = db.prepare("SELECT * FROM teams WHERE tournament_id = ?").all(req.params.id);
      
      // Fetch players for each team
      const teamsWithPlayers = teams.map(team => {
        const players = db.prepare("SELECT * FROM players WHERE team_id = ?").all(team.id);
        return { ...team, players };
      });

      const matches = db.prepare(`
        SELECT m.*, t1.name as team1_name, t2.name as team2_name 
        FROM matches m
        LEFT JOIN teams t1 ON m.team1_id = t1.id
        LEFT JOIN teams t2 ON m.team2_id = t2.id
        WHERE m.tournament_id = ?
      `).all(req.params.id);
      res.json({ ...tournament, teams: teamsWithPlayers, matches });
    } catch (e: any) {
      console.error(`Error in GET /api/tournaments/${req.params.id}:`, e);
      res.status(500).json({ error: e.message || "Failed to fetch tournament" });
    }
  });

  app.post("/api/tournaments/:id/teams", (req, res) => {
    const { name, manager_name, logo_url } = req.body;
    const tournament = db.prepare("SELECT base_budget FROM tournaments WHERE id = ?").get(req.params.id);
    const info = db.prepare(
      "INSERT INTO teams (tournament_id, name, manager_name, logo_url, remaining_budget) VALUES (?, ?, ?, ?, ?)"
    ).run(req.params.id, name, manager_name, logo_url, tournament.base_budget);
    res.json({ id: info.lastInsertRowid });
  });

  app.put("/api/teams/:id", (req, res) => {
    const { name, manager_name, status, remaining_budget, logo_url } = req.body;
    db.prepare(`
      UPDATE teams 
      SET name = ?, manager_name = ?, status = ?, remaining_budget = ?, logo_url = ?
      WHERE id = ?
    `).run(name, manager_name, status, remaining_budget, logo_url, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/teams/:id", (req, res) => {
    const transaction = db.transaction(() => {
      db.prepare("DELETE FROM players WHERE team_id = ?").run(req.params.id);
      db.prepare("DELETE FROM teams WHERE id = ?").run(req.params.id);
      return { success: true };
    });
    res.json(transaction());
  });

  app.post("/api/tournaments/:id/generate-fixtures", (req, res) => {
    const teams = db.prepare("SELECT id FROM teams WHERE tournament_id = ? AND status = 'approved'").all(req.params.id) as any[];
    if (teams.length < 2) return res.status(400).json({ error: "Not enough approved teams" });

    const tournament = db.prepare("SELECT format FROM tournaments WHERE id = ?").get(req.params.id);
    
    // Simple Round Robin for League
    if (tournament.format === 'league') {
      const transaction = db.transaction(() => {
        for (let i = 0; i < teams.length; i++) {
          for (let j = i + 1; j < teams.length; j++) {
            // Check if match already exists
            const exists = db.prepare("SELECT id FROM matches WHERE tournament_id = ? AND ((team1_id = ? AND team2_id = ?) OR (team1_id = ? AND team2_id = ?))").get(req.params.id, teams[i].id, teams[j].id, teams[j].id, teams[i].id);
            
            if (!exists) {
              db.prepare(`
                INSERT INTO matches (tournament_id, team1_id, team2_id, venue, match_date)
                VALUES (?, ?, ?, ?, ?)
              `).run(req.params.id, teams[i].id, teams[j].id, "Main Ground", new Date().toISOString());
            }
          }
        }
        return { success: true };
      });
      res.json(transaction());
    } else {
      res.json({ success: true });
    }
  });

  app.post("/api/tournaments/:id/matches", (req, res) => {
    const { team1_id, team2_id, venue, match_date } = req.body;
    if (!team1_id || !team2_id) {
      return res.status(400).json({ error: "Team 1 and Team 2 are required" });
    }
    if (String(team1_id) === String(team2_id)) {
      return res.status(400).json({ error: "Teams must be different" });
    }
    try {
      const info = db.prepare(`
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
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/teams/:id/approve", (req, res) => {
    db.prepare("UPDATE teams SET status = 'approved' WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/teams", (req, res) => {
    try {
      const tournamentId = req.query.tournament_id;
      let query = "SELECT t.*, tr.name as tournament_name FROM teams t LEFT JOIN tournaments tr ON t.tournament_id = tr.id";
      const params: any[] = [];
      if (tournamentId) {
        query += " WHERE t.tournament_id = ?";
        params.push(tournamentId);
      }
      query += " ORDER BY t.name ASC";
      const teams = db.prepare(query).all(...params);
      res.json(teams);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/teams/:id/players", (req, res) => {
    const { name, age, role, base_price, tournament_id, image_url, phone, sport, sport_details } = req.body;
    const teamId = req.params.id === "0" ? null : req.params.id;
    const detailsStr = typeof sport_details === 'object' ? JSON.stringify(sport_details) : (sport_details || null);
    const info = db.prepare(
      "INSERT INTO players (team_id, tournament_id, name, age, role, base_price, image_url, phone, sport, sport_details) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).run(teamId, tournament_id, name, age, role, base_price || 0, image_url || null, phone || null, sport || null, detailsStr);
    res.json({ id: info.lastInsertRowid });
  });

  app.post("/api/players", (req, res) => {
    try {
      const { name, age, role, base_price, tournament_id, team_id, image_url, phone, sport, sport_details } = req.body;
      const tId = team_id && team_id !== "0" && team_id !== 0 ? team_id : null;
      const tourId = tournament_id && tournament_id !== "0" && tournament_id !== 0 ? tournament_id : null;
      const detailsStr = typeof sport_details === 'object' ? JSON.stringify(sport_details) : (sport_details || null);
      const info = db.prepare(
        "INSERT INTO players (team_id, tournament_id, name, age, role, base_price, image_url, phone, sport, sport_details) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
      ).run(tId, tourId, name, age || 22, role || 'all_rounder', base_price || 0, image_url || null, phone || null, sport || 'cricket', detailsStr);
      res.json({ success: true, id: info.lastInsertRowid });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.put("/api/players/:id", (req, res) => {
    const { name, age, role, base_price, image_url, team_id, is_sold, sold_price, phone, sport, sport_details } = req.body;
    const detailsStr = typeof sport_details === 'object' ? JSON.stringify(sport_details) : (sport_details || null);
    db.prepare(`
      UPDATE players 
      SET name = ?, age = ?, role = ?, base_price = ?, image_url = ?, team_id = ?, is_sold = ?, sold_price = ?, phone = ?, sport = ?, sport_details = ?
      WHERE id = ?
    `).run(name, age, role, base_price, image_url, team_id, is_sold ? 1 : 0, sold_price, phone || null, sport || null, detailsStr, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/players/:id", (req, res) => {
    db.prepare("DELETE FROM players WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.post("/api/auction/unsell", (req, res) => {
    const { player_id } = req.body;
    const player = db.prepare("SELECT * FROM players WHERE id = ?").get(player_id);
    if (!player) return res.status(404).json({ error: "Player not found" });

    const transaction = db.transaction(() => {
      db.prepare("UPDATE teams SET remaining_budget = remaining_budget + ? WHERE id = ?").run(player.sold_price, player.team_id);
      db.prepare("UPDATE players SET is_sold = 0, team_id = NULL, sold_price = 0 WHERE id = ?").run(player_id);
      broadcast({ type: "AUCTION_UPDATE" });
      return { success: true };
    });
    res.json(transaction());
  });

  app.get("/api/tournaments/:id/auction/pool", (req, res) => {
    try {
      const players = db.prepare("SELECT * FROM players WHERE tournament_id = ? AND is_sold = 0 ORDER BY id ASC").all(req.params.id);
      res.json(players);
    } catch (e: any) {
      console.error(`Error in GET /api/tournaments/${req.params.id}/auction/pool:`, e);
      res.status(500).json({ error: e.message || "Failed to fetch auction pool" });
    }
  });

  app.put("/api/tournaments/:id/auction/pool/reorder", (req, res) => {
    try {
      const { player_ids } = req.body; // ordered array of IDs
      if (!Array.isArray(player_ids)) {
        return res.status(400).json({ error: "player_ids array expected" });
      }
      broadcast({ type: "AUCTION_UPDATE" });
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/players", (req, res) => {
    const players = db.prepare(`
      SELECT p.*, t.name as team_name, tr.name as tournament_name 
      FROM players p 
      LEFT JOIN teams t ON p.team_id = t.id
      LEFT JOIN tournaments tr ON p.tournament_id = tr.id
      ORDER BY p.id DESC
    `).all();
    res.json(players);
  });

  // --- Auction Player Invites Endpoints ---
  app.get("/api/tournaments/:id/auction/invites", (req, res) => {
    try {
      const invites = db.prepare(`
        SELECT ai.*, p.name as registered_player_name, p.role as registered_player_role
        FROM auction_invites ai
        LEFT JOIN players p ON ai.registered_player_id = p.id
        WHERE ai.tournament_id = ?
        ORDER BY ai.created_at DESC
      `).all(req.params.id);
      res.json(invites);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/tournaments/:id/auction/invites", (req, res) => {
    try {
      const tournamentId = req.params.id;
      const { player_name, email, phone, sport, notes } = req.body;
      
      // Generate unique random 8-character code
      const code = 'INV-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const info = db.prepare(`
        INSERT INTO auction_invites (tournament_id, player_name, email, phone, sport, notes, invite_code, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
      `).run(tournamentId, player_name || null, email || null, phone || null, sport || 'cricket', notes || null, code);

      const invite = db.prepare("SELECT * FROM auction_invites WHERE id = ?").get(info.lastInsertRowid);
      res.json({ success: true, invite });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete("/api/auction/invites/:id", (req, res) => {
    try {
      db.prepare("DELETE FROM auction_invites WHERE id = ?").run(req.params.id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/auction/invite/:code", (req, res) => {
    try {
      const code = req.params.code;
      const invite = db.prepare(`
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
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/auction/invite/register", (req, res) => {
    try {
      const { invite_code, tournament_id, name, age, role, sport, sport_details, phone, email, base_price, image_url } = req.body;
      
      const tourId = tournament_id;
      if (!tourId) return res.status(400).json({ error: "Tournament ID is required" });

      const detailsStr = typeof sport_details === 'object' ? JSON.stringify(sport_details) : (sport_details || null);

      const transaction = db.transaction(() => {
        // Insert athlete into auction pool (is_sold = 0, team_id = NULL)
        const info = db.prepare(`
          INSERT INTO players (team_id, tournament_id, name, age, role, base_price, image_url, phone, sport, sport_details, is_sold, sold_price)
          VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0)
        `).run(tourId, name, age || 22, role || 'all_rounder', base_price || 100000, image_url || null, phone || null, sport || 'cricket', detailsStr);

        const newPlayerId = info.lastInsertRowid;

        // If registered via a specific invite code, mark that invite as registered
        if (invite_code) {
          db.prepare(`
            UPDATE auction_invites 
            SET status = 'registered', registered_player_id = ?
            WHERE invite_code = ?
          `).run(newPlayerId, invite_code);
        }

        return { playerId: newPlayerId };
      });

      const result = transaction();
      broadcast({ type: "AUCTION_UPDATE" });
      res.json({ success: true, playerId: result.playerId });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/auction/sell", (req, res) => {
    const { player_id, team_id, sold_price } = req.body;
    const transaction = db.transaction(() => {
      db.prepare("UPDATE players SET team_id = ?, sold_price = ?, is_sold = 1 WHERE id = ?").run(team_id, sold_price, player_id);
      db.prepare("UPDATE teams SET remaining_budget = remaining_budget - ? WHERE id = ?").run(sold_price, team_id);
      return { success: true };
    });
    const result = transaction();
    broadcast({ type: "AUCTION_UPDATE", player_id, team_id, sold_price });
    res.json(result);
  });

  app.get("/api/tournaments/:id/matches", (req, res) => {
    const matches = db.prepare(`
      SELECT m.*, t1.name as team1_name, t2.name as team2_name 
      FROM matches m
      LEFT JOIN teams t1 ON m.team1_id = t1.id
      LEFT JOIN teams t2 ON m.team2_id = t2.id
      WHERE m.tournament_id = ?
    `).all(req.params.id);
    res.json(matches);
  });

  app.post("/api/matches/:id/start", (req, res) => {
    const match = db.prepare("SELECT * FROM matches WHERE id = ?").get(req.params.id);
    db.prepare("UPDATE matches SET status = 'live' WHERE id = ?").run(req.params.id);
    
    // Create first innings
    db.prepare(`
      INSERT INTO innings (match_id, innings_number, batting_team_id, bowling_team_id)
      VALUES (?, 1, ?, ?)
    `).run(req.params.id, match.team1_id, match.team2_id);
    
    res.json({ success: true });
  });

  app.post("/api/matches/:id/end", (req, res) => {
    const { winner_id } = req.body;
    db.prepare("UPDATE matches SET status = 'completed', winner_id = ? WHERE id = ?").run(winner_id || null, req.params.id);
    
    // Auto calculate and update raw standings in the points table
    const m = db.prepare("SELECT tournament_id FROM matches WHERE id = ?").get(req.params.id) as any;
    if (m && m.tournament_id) {
      updatePointsTable(m.tournament_id);
    }

    broadcast({ type: "MATCH_ENDED", match_id: req.params.id });
    res.json({ success: true });
  });

  app.get("/api/matches/live", (req, res) => {
    const matches = db.prepare(`
      SELECT m.*, t1.name as team1_name, t2.name as team2_name, tr.sport
      FROM matches m
      JOIN teams t1 ON m.team1_id = t1.id
      JOIN teams t2 ON m.team2_id = t2.id
      JOIN tournaments tr ON m.tournament_id = tr.id
      WHERE m.status = 'live'
    `).all();
    
    const liveMatches = matches.map(match => {
      const innings = db.prepare(`
        SELECT i.*, t1.name as batting_team_name, t2.name as bowling_team_name
        FROM innings i
        JOIN teams t1 ON i.batting_team_id = t1.id
        JOIN teams t2 ON i.bowling_team_id = t2.id
        WHERE i.match_id = ?
      `).all(match.id);
      return { ...match, innings };
    });
    
    res.json(liveMatches);
  });

  app.get("/api/matches", (req, res) => {
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
      const matches = db.prepare(query).all(...params) as any[];
      const result = matches.map(match => {
        const innings = db.prepare(`
          SELECT i.*, t1.name as batting_team_name, t2.name as bowling_team_name
          FROM innings i
          LEFT JOIN teams t1 ON i.batting_team_id = t1.id
          LEFT JOIN teams t2 ON i.bowling_team_id = t2.id
          WHERE i.match_id = ?
        `).all(match.id);
        return { ...match, innings };
      });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/matches", (req, res) => {
    const { tournament_id, team1_id, team2_id, venue, match_date, status } = req.body;
    if (!tournament_id || !team1_id || !team2_id) {
      return res.status(400).json({ error: "Tournament, Team 1, and Team 2 are required" });
    }
    if (String(team1_id) === String(team2_id)) {
      return res.status(400).json({ error: "Team 1 and Team 2 must be different" });
    }
    try {
      const info = db.prepare(`
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
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/matches/:id/quick-score", (req, res) => {
    const { runs, wickets, overs_bowled, status, team1_score, team2_score, current_innings_index } = req.body;
    try {
      const match = db.prepare("SELECT * FROM matches WHERE id = ?").get(req.params.id) as any;
      if (!match) return res.status(404).json({ error: "Match not found" });

      if (status) {
        db.prepare("UPDATE matches SET status = ? WHERE id = ?").run(status, req.params.id);
      }
      if (team1_score !== undefined || team2_score !== undefined) {
        db.prepare("UPDATE matches SET team1_score = ?, team2_score = ? WHERE id = ?").run(
          team1_score ?? match.team1_score ?? 0,
          team2_score ?? match.team2_score ?? 0,
          req.params.id
        );
      }

      // Check or update innings
      const allInnings = db.prepare("SELECT * FROM innings WHERE match_id = ? ORDER BY id ASC").all(req.params.id) as any[];
      let targetInnings = allInnings[current_innings_index || 0];

      if (!targetInnings && (runs !== undefined || wickets !== undefined || overs_bowled !== undefined)) {
        const info = db.prepare(`
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
        targetInnings = db.prepare("SELECT * FROM innings WHERE id = ?").get(info.lastInsertRowid);
      } else if (targetInnings && (runs !== undefined || wickets !== undefined || overs_bowled !== undefined)) {
        db.prepare(`
          UPDATE innings 
          SET runs = ?, wickets = ?, overs_bowled = ?
          WHERE id = ?
        `).run(
          runs ?? targetInnings.runs,
          wickets ?? targetInnings.wickets,
          overs_bowled ?? targetInnings.overs_bowled,
          targetInnings.id
        );
        targetInnings = db.prepare("SELECT * FROM innings WHERE id = ?").get(targetInnings.id);
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
      res.status(500).json({ error: e.message });
    }
  });

  app.put("/api/matches/:id", (req, res) => {
    const { match_date, venue, status } = req.body;
    db.prepare("UPDATE matches SET match_date = ?, venue = ?, status = ? WHERE id = ?").run(match_date, venue, status, req.params.id);
    
    // Auto calculate and update standings in the points table
    const m = db.prepare("SELECT tournament_id FROM matches WHERE id = ?").get(req.params.id) as any;
    if (m && m.tournament_id) {
      updatePointsTable(m.tournament_id);
    }

    res.json({ success: true });
  });

  app.delete("/api/matches/:id", (req, res) => {
    const m = db.prepare("SELECT tournament_id FROM matches WHERE id = ?").get(req.params.id) as any;
    const transaction = db.transaction(() => {
      const innings = db.prepare("SELECT id FROM innings WHERE match_id = ?").all(req.params.id) as any[];
      innings.forEach(inn => {
        db.prepare("DELETE FROM balls WHERE innings_id = ?").run(inn.id);
      });
      db.prepare("DELETE FROM innings WHERE match_id = ?").run(req.params.id);
      db.prepare("DELETE FROM matches WHERE id = ?").run(req.params.id);
      return { success: true };
    });
    const result = transaction();
    
    // Auto calculate standings after deletion
    if (m && m.tournament_id) {
      updatePointsTable(m.tournament_id);
    }

    res.json(result);
  });

  app.post("/api/matches/:id/score", (req, res) => {
    const { innings_id, over_number, ball_number, batsman_id, bowler_id, runs, extras, extra_type, wicket_type, wicket_player_id } = req.body;
    
    const transaction = db.transaction(() => {
      db.prepare(`
        INSERT INTO balls (innings_id, over_number, ball_number, batsman_id, bowler_id, runs, extras, extra_type, wicket_type, wicket_player_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(innings_id, over_number, ball_number, batsman_id, bowler_id, runs, extras, extra_type, wicket_type, wicket_player_id);

      // Update innings summary
      const totalRuns = runs + extras;
      const isWicket = wicket_type ? 1 : 0;
      
      // Calculate overs
      const currentInnings = db.prepare("SELECT * FROM innings WHERE id = ?").get(innings_id);
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

      db.prepare(`
        UPDATE innings 
        SET runs = runs + ?, wickets = wickets + ?, overs_bowled = ?
        WHERE id = ?
      `).run(totalRuns, isWicket, newOvers, innings_id);

      return db.prepare(`
        SELECT i.*, t1.name as batting_team_name, t2.name as bowling_team_name
        FROM innings i
        JOIN teams t1 ON i.batting_team_id = t1.id
        JOIN teams t2 ON i.bowling_team_id = t2.id
        WHERE i.id = ?
      `).get(innings_id);
    });

    const updatedInnings = transaction();
    broadcast({ type: "SCORE_UPDATE", match_id: req.params.id, innings: updatedInnings });
    res.json(updatedInnings);
  });

  app.post("/api/matches/:id/score-generic", (req, res) => {
    try {
      const { team1_score, team2_score, description, event_type, player_id, team_id } = req.body;
      
      let eventId: number | null = null;
      db.transaction(() => {
        db.prepare(`
          UPDATE matches 
          SET team1_score = ?, team2_score = ? 
          WHERE id = ?
        `).run(team1_score || 0, team2_score || 0, req.params.id);

        if (description) {
          const info = db.prepare(`
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
      res.status(500).json({ error: e.message });
    }
  });

  app.put("/api/matches/:id/settings", (req, res) => {
    const { 
      toss_winner_id, 
      toss_decision, 
      striker_id, 
      non_striker_id, 
      bowler_id, 
      live_stream_url,
      status
    } = req.body;

    db.prepare(`
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
    const m = db.prepare("SELECT tournament_id FROM matches WHERE id = ?").get(req.params.id) as any;
    if (m && m.tournament_id) {
      updatePointsTable(m.tournament_id);
    }

    broadcast({ type: "MATCH_SETTINGS_UPDATE", match_id: req.params.id });
    res.json({ success: true });
  });

  app.post("/api/matches/:id/events", (req, res) => {
    const { event_type, team_id, player_id, description } = req.body;
    const info = db.prepare(
      "INSERT INTO match_events (match_id, event_type, team_id, player_id, description) VALUES (?, ?, ?, ?, ?)"
    ).run(req.params.id, event_type, team_id, player_id, description);
    
    broadcast({ type: "MATCH_EVENT", match_id: req.params.id, event: { id: info.lastInsertRowid, event_type, team_id, player_id, description, timestamp: new Date().toISOString() } });
    res.json({ id: info.lastInsertRowid });
  });

  app.get("/api/matches/:id/events", (req, res) => {
    const events = db.prepare("SELECT * FROM match_events WHERE match_id = ? ORDER BY timestamp DESC").all(req.params.id);
    res.json(events);
  });

  app.get("/api/tournaments/:id/expenses", (req, res) => {
    const expenses = db.prepare("SELECT * FROM expenses WHERE tournament_id = ? ORDER BY date DESC").all(req.params.id);
    res.json(expenses);
  });

  // Sponsor APIs
  app.get("/api/tournaments/:id/sponsors", (req, res) => {
    const sponsors = db.prepare("SELECT * FROM sponsors WHERE tournament_id = ? ORDER BY created_at DESC").all(req.params.id);
    res.json(sponsors);
  });

  app.get("/api/sponsors/active", (req, res) => {
    const sponsors = db.prepare(`
      SELECT s.*, t.name as tournament_name 
      FROM sponsors s 
      JOIN tournaments t ON s.tournament_id = t.id 
      WHERE t.status != 'completed'
      LIMIT 10
    `).all();
    res.json(sponsors);
  });

  app.post("/api/tournaments/:id/sponsors", (req, res) => {
    const { name, website_url, banner_url } = req.body;
    const info = db.prepare(
      "INSERT INTO sponsors (tournament_id, name, website_url, banner_url) VALUES (?, ?, ?, ?)"
    ).run(req.params.id, name, website_url, banner_url);
    res.json({ id: info.lastInsertRowid });
  });

  app.delete("/api/sponsors/:id", (req, res) => {
    db.prepare("DELETE FROM sponsors WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/admin/analytics/:tournamentId", (req, res) => {
    const tournamentId = req.params.tournamentId;
    
    // Financial Analytics
    const expenses = db.prepare("SELECT SUM(amount) as total FROM expenses WHERE tournament_id = ?").get(tournamentId) as any;
    const registrations = db.prepare("SELECT SUM(sold_price) as total FROM players WHERE tournament_id = ? AND is_sold = 1").get(tournamentId) as any;
    
    // Match Analytics
    const matchesCount = db.prepare("SELECT COUNT(*) as count FROM matches WHERE tournament_id = ?").get(tournamentId) as any;
    const completedMatches = db.prepare("SELECT COUNT(*) as count FROM matches WHERE tournament_id = ? AND status = 'completed'").get(tournamentId) as any;
    
    // Player Stats (Top Run Scorers)
    const topScorers = db.prepare(`
      SELECT p.id, p.name, t.name as team_name, SUM(b.runs) as total_runs, 
             COUNT(b.id) as balls_faced
      FROM players p
      JOIN teams t ON p.team_id = t.id
      JOIN balls b ON b.batsman_id = p.id
      WHERE t.tournament_id = ?
      GROUP BY p.id
      ORDER BY total_runs DESC
      LIMIT 10
    `).all(tournamentId);

    // Bowler Stats (Top Wicket Takers)
    const topBowlers = db.prepare(`
      SELECT p.id, p.name, t.name as team_name, COUNT(b.id) FILTER (WHERE b.wicket_type IS NOT NULL) as wickets,
             SUM(b.runs + b.extras) as runs_conceded,
             COUNT(b.id) as balls_bowled
      FROM players p
      JOIN teams t ON p.team_id = t.id
      JOIN balls b ON b.bowler_id = p.id
      WHERE t.tournament_id = ?
      GROUP BY p.id
      ORDER BY wickets DESC
      LIMIT 10
    `).all(tournamentId);

    // Team Standings
    const ptCount = (db.prepare("SELECT COUNT(*) as count FROM points_table WHERE tournament_id = ?").get(tournamentId) as any).count || 0;
    const teams = db.prepare("SELECT id FROM teams WHERE tournament_id = ?").all(tournamentId);
    
    if (ptCount < teams.length) {
      updatePointsTable(Number(tournamentId));
    }

    // Retrieve standings calculated and stored in the points table
    const standings = db.prepare(`
      SELECT t.id, t.name, pt.played, pt.won as wins, pt.lost as losses, pt.tied, pt.points
      FROM teams t
      LEFT JOIN points_table pt ON t.id = pt.team_id AND pt.tournament_id = t.tournament_id
      WHERE t.tournament_id = ?
      ORDER BY COALESCE(pt.points, 0) DESC, COALESCE(pt.won, 0) DESC
    `).all(tournamentId).map((item: any) => ({
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
  });

  // Home Page Featured Data
  app.get("/api/featured/products", (req, res) => {
    const products = db.prepare("SELECT * FROM products LIMIT 4").all();
    res.json(products);
  });

  app.get("/api/featured/grounds", (req, res) => {
    const grounds = db.prepare("SELECT * FROM grounds LIMIT 3").all();
    res.json(grounds);
  });

  app.post("/api/tournaments/:id/expenses", (req, res) => {
    const { description, amount, category, date } = req.body;
    const info = db.prepare(
      "INSERT INTO expenses (tournament_id, description, amount, category, date) VALUES (?, ?, ?, ?, ?)"
    ).run(req.params.id, description, amount, category, date || new Date().toISOString());
    res.json({ id: info.lastInsertRowid });
  });

  app.put("/api/expenses/:id", (req, res) => {
    const { description, amount, category, date } = req.body;
    db.prepare(
      "UPDATE expenses SET description = ?, amount = ?, category = ?, date = ? WHERE id = ?"
    ).run(description, amount, category, date, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/expenses/:id", (req, res) => {
    db.prepare("DELETE FROM expenses WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/innings/:id/undo", (req, res) => {
    const transaction = db.transaction(() => {
      const lastBall = db.prepare("SELECT * FROM balls WHERE innings_id = ? ORDER BY id DESC LIMIT 1").get(req.params.id);
      if (!lastBall) return { success: false, error: "No balls to undo" };

      // Update innings summary
      const totalRuns = lastBall.runs + lastBall.extras;
      const isWicket = lastBall.wicket_type ? 1 : 0;
      
      const currentInnings = db.prepare("SELECT * FROM innings WHERE id = ?").get(req.params.id);
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

      db.prepare(`
        UPDATE innings 
        SET runs = runs - ?, wickets = wickets - ?, overs_bowled = ?
        WHERE id = ?
      `).run(totalRuns, isWicket, newOvers, req.params.id);

      db.prepare("DELETE FROM balls WHERE id = ?").run(lastBall.id);
      
      const updatedInnings = db.prepare(`
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
    res.json(transaction());
  });

  app.get("/api/tournaments/:id/stats", (req, res) => {
    try {
      const tournament = db.prepare("SELECT sport FROM tournaments WHERE id = ?").get(req.params.id) as { sport: string } | undefined;
      const sport = tournament?.sport || 'cricket';

      const players = db.prepare(`
        SELECT p.*, t.name as team_name 
        FROM players p
        JOIN teams t ON p.team_id = t.id
        WHERE p.tournament_id = ?
      `).all(req.params.id) as any[];

      const stats = players.map(player => {
        if (sport === 'soccer' || sport === 'basketball') {
          const soccerStats = db.prepare(`
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
          const batting = db.prepare(`
            SELECT SUM(runs) as runs, COUNT(*) as balls, 
            SUM(CASE WHEN runs = 4 THEN 1 ELSE 0 END) as fours,
            SUM(CASE WHEN runs = 6 THEN 1 ELSE 0 END) as sixes
            FROM balls 
            WHERE batsman_id = ?
          `).get(player.id) as any;

          const bowling = db.prepare(`
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
      });

      res.json(stats.sort((a, b) => b.mvp_points - a.mvp_points));
    } catch (e: any) {
      console.error(`Error in GET /api/tournaments/${req.params.id}/stats:`, e);
      res.status(500).json({ error: e.message || "Failed to fetch tournament stats" });
    }
  });

  // Shopping API Routes
  app.get("/api/products", (req, res) => {
    const products = db.prepare("SELECT * FROM products ORDER BY created_at DESC").all();
    res.json(products);
  });

  app.get("/api/products/:id", (req, res) => {
    const product = db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  });

  app.post("/api/products", (req, res) => {
    const { name, category, description, price, image_url, selling_options, stock } = req.body;
    const info = db.prepare(`
      INSERT INTO products (name, category, description, price, image_url, selling_options, stock)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(name, category, description, price, image_url, selling_options, stock || 0);
    res.json({ id: info.lastInsertRowid });
  });

  app.put("/api/products/:id", (req, res) => {
    const { name, category, description, price, image_url, selling_options, stock } = req.body;
    db.prepare(`
      UPDATE products 
      SET name = ?, category = ?, description = ?, price = ?, image_url = ?, selling_options = ?, stock = ?
      WHERE id = ?
    `).run(name, category, description, price, image_url, selling_options, stock, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/products/:id", (req, res) => {
    db.prepare("DELETE FROM products WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/orders", (req, res) => {
    const orders = db.prepare(`
      SELECT o.*, p.name as product_name 
      FROM orders o
      JOIN products p ON o.product_id = p.id
      ORDER BY o.created_at DESC
    `).all();
    res.json(orders);
  });

  app.get("/api/orders/:id", (req, res) => {
    const order = db.prepare(`
      SELECT o.*, p.name as product_name, p.image_url as product_image
      FROM orders o
      JOIN products p ON o.product_id = p.id
      WHERE o.id = ?
    `).get(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  });

  app.post("/api/orders", (req, res) => {
    const { product_id, customer_name, customer_email, customer_mobile, customer_address, quantity, total_price, payment_method, payment_details } = req.body;
    const info = db.prepare(`
      INSERT INTO orders (product_id, customer_name, customer_email, customer_mobile, customer_address, quantity, total_price, payment_method, payment_details)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(product_id, customer_name, customer_email, customer_mobile, customer_address, quantity, total_price, payment_method, payment_details);
    res.json({ id: info.lastInsertRowid });
  });

  app.put("/api/orders/:id/status", (req, res) => {
    const { status } = req.body;
    db.prepare("UPDATE orders SET status = ? WHERE id = ?").run(status, req.params.id);
    res.json({ success: true });
  });

  // Ground Booking APIs
  app.get("/api/grounds", (req, res) => {
    const grounds = db.prepare("SELECT * FROM grounds ORDER BY created_at DESC").all();
    res.json(grounds);
  });

  app.get("/api/grounds/:id", (req, res) => {
    const ground = db.prepare("SELECT * FROM grounds WHERE id = ?").get(req.params.id);
    res.json(ground);
  });

  app.post("/api/grounds", (req, res) => {
    const { name, location, description, price_per_hour, image_url, amenities } = req.body;
    const info = db.prepare(`
      INSERT INTO grounds (name, location, description, price_per_hour, image_url, amenities)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(name, location, description, price_per_hour, image_url, amenities);
    res.json({ id: info.lastInsertRowid });
  });

  app.put("/api/grounds/:id", (req, res) => {
    const { name, location, description, price_per_hour, image_url, amenities } = req.body;
    db.prepare(`
      UPDATE grounds 
      SET name = ?, location = ?, description = ?, price_per_hour = ?, image_url = ?, amenities = ?
      WHERE id = ?
    `).run(name, location, description, price_per_hour, image_url, amenities, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/grounds/:id", (req, res) => {
    db.prepare("DELETE FROM grounds WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/bookings", (req, res) => {
    const bookings = db.prepare(`
      SELECT b.*, g.name as ground_name, g.image_url as ground_image
      FROM ground_bookings b
      JOIN grounds g ON b.ground_id = g.id
      ORDER BY b.created_at DESC
    `).all();
    res.json(bookings);
  });

  app.post("/api/bookings", (req, res) => {
    const { ground_id, customer_name, customer_email, customer_mobile, booking_date, start_time, end_time, total_price, payment_method, payment_details } = req.body;
    const info = db.prepare(`
      INSERT INTO ground_bookings (ground_id, customer_name, customer_email, customer_mobile, booking_date, start_time, end_time, total_price, payment_method, payment_details)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(ground_id, customer_name, customer_email, customer_mobile, booking_date, start_time, end_time, total_price, payment_method, payment_details);
    res.json({ id: info.lastInsertRowid });
  });

  app.put("/api/bookings/:id/status", (req, res) => {
    const { status } = req.body;
    db.prepare("UPDATE ground_bookings SET status = ? WHERE id = ?").run(status, req.params.id);
    res.json({ success: true });
  });

  app.get("/api/bookings/:id", (req, res) => {
    const booking = db.prepare(`
      SELECT b.*, g.name as ground_name, g.location as ground_location, g.image_url as ground_image
      FROM ground_bookings b
      JOIN grounds g ON b.ground_id = g.id
      WHERE b.id = ?
    `).get(req.params.id);
    res.json(booking);
  });

  // Settings APIs
  app.get("/api/settings/payment", (req, res) => {
    const upi = db.prepare("SELECT value FROM settings WHERE key = 'payment_receiver_upi'").get() as any;
    const bank = db.prepare("SELECT value FROM settings WHERE key = 'payment_receiver_bank'").get() as any;
    const name = db.prepare("SELECT value FROM settings WHERE key = 'payment_receiver_name'").get() as any;
    
    res.json({
      upi: upi?.value || '',
      bank: bank?.value || '',
      name: name?.value || ''
    });
  });

  app.post("/api/settings/payment", (req, res) => {
    const { upi, bank, name } = req.body;
    
    db.prepare("UPDATE settings SET value = ? WHERE key = 'payment_receiver_upi'").run(upi);
    db.prepare("UPDATE settings SET value = ? WHERE key = 'payment_receiver_bank'").run(bank);
    db.prepare("UPDATE settings SET value = ? WHERE key = 'payment_receiver_name'").run(name);
    
    res.json({ success: true });
  });

  // Team Chat APIs
  app.get("/api/tournaments/:id/chat", (req, res) => {
    try {
      const messages = db.prepare("SELECT * FROM team_chats WHERE tournament_id = ? ORDER BY created_at ASC").all(req.params.id);
      res.json(messages);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/tournaments/:id/chat", (req, res) => {
    try {
      const { sender_name, team_name, message } = req.body;
      const info = db.prepare(`
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
      res.status(500).json({ error: e.message });
    }
  });

  // Tournament Rules APIs
  app.put("/api/tournaments/:id/rules", (req, res) => {
    try {
      const { rules } = req.body;
      db.prepare("UPDATE tournaments SET rules = ? WHERE id = ?").run(rules, req.params.id);
      res.json({ success: true, rules });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Tournament Gallery APIs
  app.get("/api/tournaments/:id/gallery", (req, res) => {
    try {
      const images = db.prepare("SELECT * FROM tournament_gallery WHERE tournament_id = ? ORDER BY created_at DESC").all(req.params.id);
      res.json(images);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/tournaments/:id/gallery", (req, res) => {
    try {
      const { image_url, caption } = req.body;
      const info = db.prepare(`
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
      res.status(500).json({ error: e.message });
    }
  });

  // Global Error Handler for API routes
  app.use((err: any, req: any, res: any, next: any) => {
    console.error("EXPRESS ERROR:", err);
    res.status(500).json({ error: err.message || "Internal Server Error", stack: err.stack });
  });

  async function startStandaloneServer() {
    const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });

    server.on("error", (e: any) => {
      if (e.code === 'EADDRINUSE') {
        console.error(`[SERVER ERROR] Port ${PORT} is already in use. Set PORT=3001 or free up port ${PORT}.`);
      } else {
        console.error("[SERVER ERROR]", e);
      }
    });

    try {
      const { WebSocketServer } = await import("ws");
      const wss = new WebSocketServer({ server });
      const clients = new Set<any>();

      wss.on("connection", (ws) => {
        clients.add(ws);
        ws.on("close", () => clients.delete(ws));
      });

      broadcast = (data: any) => {
        const message = JSON.stringify(data);
        clients.forEach((client) => {
          if (client.readyState === 1) { // WebSocket.OPEN
            client.send(message);
          }
        });
      };
    } catch (wsErr) {
      console.warn("WebSocket initialization warning:", wsErr);
    }

    // Vite middleware for development
    if (process.env.NODE_ENV !== "production") {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), "dist");
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }
  }

  // Only start HTTP listener if not running in a serverless environment like Vercel
  if (!isServerless) {
    startStandaloneServer().catch(err => {
      console.error("Failed to start standalone server:", err);
    });
  }

  export default app;
