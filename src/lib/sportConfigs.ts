export interface SportAttributeConfig {
  key: string;
  label: string;
  type: 'select' | 'text' | 'number';
  options?: { value: string; label: string }[];
  placeholder?: string;
  unit?: string;
  defaultValue?: string | number;
  description?: string;
}

export interface SportRoleConfig {
  value: string;
  label: string;
  badgeColor?: string;
}

export interface SportDefinition {
  id: string;
  name: string;
  icon: string;
  color: string;
  bgGradient: string;
  badgeClass: string;
  roles: SportRoleConfig[];
  attributes: SportAttributeConfig[];
  tournamentSettings: {
    formatName: string;
    durationLabel: string;
    defaultOversOrSets: number;
    ruleFields: {
      key: string;
      label: string;
      type: 'select' | 'number' | 'toggle';
      options?: { value: string | number; label: string }[];
      defaultValue: any;
      description?: string;
    }[];
  };
}

export const SPORTS_CONFIG: Record<string, SportDefinition> = {
  cricket: {
    id: 'cricket',
    name: 'Cricket',
    icon: '🏏',
    color: '#10b981',
    bgGradient: 'from-emerald-500/20 to-teal-500/10',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    roles: [
      { value: 'batsman', label: 'Top-Order Batsman' },
      { value: 'bowler', label: 'Specialist Bowler' },
      { value: 'all_rounder', label: 'All-Rounder' },
      { value: 'wk', label: 'Wicket-Keeper Batsman' },
    ],
    attributes: [
      {
        key: 'batting_style',
        label: 'Batting Style',
        type: 'select',
        options: [
          { value: 'Right-hand bat', label: 'Right-hand bat' },
          { value: 'Left-hand bat', label: 'Left-hand bat' },
        ],
        defaultValue: 'Right-hand bat',
      },
      {
        key: 'bowling_style',
        label: 'Bowling Style',
        type: 'select',
        options: [
          { value: 'Right-arm Fast', label: 'Right-arm Fast' },
          { value: 'Right-arm Medium', label: 'Right-arm Medium' },
          { value: 'Right-arm Off-Spin', label: 'Right-arm Off-Spin' },
          { value: 'Right-arm Leg-Spin', label: 'Right-arm Leg-Spin' },
          { value: 'Left-arm Fast', label: 'Left-arm Fast' },
          { value: 'Left-arm Orthodox Spin', label: 'Left-arm Orthodox Spin' },
          { value: 'Left-arm Chinaman', label: 'Left-arm Chinaman' },
          { value: 'None / Non-bowler', label: 'None / Non-bowler' },
        ],
        defaultValue: 'Right-arm Medium',
      },
      {
        key: 'jersey_number',
        label: 'Jersey Number',
        type: 'number',
        placeholder: 'e.g. 18',
        defaultValue: 7,
      },
      {
        key: 'batting_avg',
        label: 'Batting Average',
        type: 'number',
        placeholder: 'e.g. 42.5',
        unit: 'avg',
        defaultValue: 38,
      },
      {
        key: 'strike_rate',
        label: 'Strike Rate',
        type: 'number',
        placeholder: 'e.g. 138.5',
        unit: 'S/R',
        defaultValue: 135,
      },
      {
        key: 'wickets',
        label: 'Career Wickets',
        type: 'number',
        placeholder: 'e.g. 35',
        defaultValue: 12,
      },
      {
        key: 'economy',
        label: 'Bowling Economy',
        type: 'number',
        placeholder: 'e.g. 7.4',
        unit: 'rpo',
        defaultValue: 7.2,
      },
    ],
    tournamentSettings: {
      formatName: 'T20 / Limited Overs Cricket',
      durationLabel: 'Overs per Inning',
      defaultOversOrSets: 20,
      ruleFields: [
        {
          key: 'overs',
          label: 'Overs per Inning',
          type: 'number',
          defaultValue: 20,
          description: 'Standard T20 is 20 overs, Super 8 is 8 overs',
        },
        {
          key: 'balls_per_over',
          label: 'Balls per Over',
          type: 'select',
          options: [
            { value: 6, label: '6 Balls (Standard ICC/BCCI)' },
            { value: 8, label: '8 Balls (Super Over / Custom)' },
          ],
          defaultValue: 6,
        },
        {
          key: 'powerplay_overs',
          label: 'Powerplay Overs',
          type: 'number',
          defaultValue: 6,
          description: 'Mandatory fielding restriction overs',
        },
      ],
    },
  },

  badminton: {
    id: 'badminton',
    name: 'Badminton',
    icon: '🏸',
    color: '#06b6d4',
    bgGradient: 'from-cyan-500/20 to-blue-500/10',
    badgeClass: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    roles: [
      { value: 'singles_specialist', label: "Men's / Women's Singles" },
      { value: 'doubles_specialist', label: 'Doubles Specialist' },
      { value: 'mixed_doubles', label: 'Mixed Doubles Specialist' },
      { value: 'all_court', label: 'All-Round Shuttle Pro' },
    ],
    attributes: [
      {
        key: 'dominant_hand',
        label: 'Dominant Hand',
        type: 'select',
        options: [
          { value: 'Right-handed', label: 'Right-handed' },
          { value: 'Left-handed (Southpaw)', label: 'Left-handed (Southpaw)' },
        ],
        defaultValue: 'Right-handed',
      },
      {
        key: 'play_style',
        label: 'Badminton Playing Style',
        type: 'select',
        options: [
          { value: 'Attacking / Steep Smasher', label: 'Attacking / Steep Smasher 💥' },
          { value: 'Defensive / Rally Builder', label: 'Defensive / Rally Builder 🛡️' },
          { value: 'Deceptive Net Specialist', label: 'Deceptive Net Specialist 🕸️' },
          { value: 'Fast Counter-Attacker', label: 'Fast Counter-Attacker ⚡' },
          { value: 'All-Court Balanced', label: 'All-Court Balanced 🎯' },
        ],
        defaultValue: 'Attacking / Steep Smasher',
      },
      {
        key: 'smash_speed',
        label: 'Top Smash Speed',
        type: 'number',
        placeholder: 'e.g. 360',
        unit: 'km/h',
        defaultValue: 340,
        description: 'Peak recorded overhead smash velocity',
      },
      {
        key: 'racquet_tension',
        label: 'Racquet String Tension',
        type: 'select',
        options: [
          { value: '24 lbs (Beginner / High Repulsion)', label: '24 lbs (High Repulsion)' },
          { value: '26 lbs (Intermediate Club)', label: '26 lbs (Intermediate Club)' },
          { value: '28 lbs (Advanced Control)', label: '28 lbs (Advanced Control)' },
          { value: '30+ lbs (Professional Tournament)', label: '30+ lbs (Pro High Tension)' },
        ],
        defaultValue: '28 lbs (Advanced Control)',
      },
      {
        key: 'racquet_model',
        label: 'Racquet Model / Brand',
        type: 'text',
        placeholder: 'e.g. Yonex Astrox 88D Pro / Victor Thruster',
        defaultValue: 'Yonex Astrox 88D Pro',
      },
      {
        key: 'state_ranking',
        label: 'Ranking / Seed',
        type: 'text',
        placeholder: 'e.g. State Seed #4 / Club Top 10',
        defaultValue: 'State Seed #5',
      },
      {
        key: 'win_rate',
        label: 'Match Win Rate',
        type: 'number',
        placeholder: 'e.g. 78',
        unit: '%',
        defaultValue: 72,
      },
    ],
    tournamentSettings: {
      formatName: 'BWF Badminton Championship',
      durationLabel: 'Sets per Match',
      defaultOversOrSets: 3,
      ruleFields: [
        {
          key: 'match_format',
          label: 'Match Structure',
          type: 'select',
          options: [
            { value: 'best_of_3', label: 'Best of 3 Sets (Standard BWF)' },
            { value: 'single_set', label: 'Single Set Sprint (21 Points)' },
            { value: 'best_of_5', label: 'Best of 5 Sets (Marathon)' },
          ],
          defaultValue: 'best_of_3',
        },
        {
          key: 'points_per_set',
          label: 'Points per Set',
          type: 'select',
          options: [
            { value: 21, label: '21 Points (Standard BWF Rally Points)' },
            { value: 15, label: '15 Points (Fast Format)' },
            { value: 11, label: '11 Points (Sprint)' },
          ],
          defaultValue: 21,
        },
        {
          key: 'deuce_cap',
          label: 'Deuce Point Cap (Golden Point)',
          type: 'select',
          options: [
            { value: 30, label: '30 Points (Official BWF Rule: First to 30 Wins)' },
            { value: 25, label: '25 Points' },
            { value: 29, label: '29 Points' },
          ],
          defaultValue: 30,
        },
        {
          key: 'shuttle_type',
          label: 'Shuttlecock Specification',
          type: 'select',
          options: [
            { value: 'feather', label: 'Feather Goose/Duck Shuttle (BWF Grade)' },
            { value: 'nylon', label: 'Nylon / Synthetic Shuttle (Yonex Mavis)' },
          ],
          defaultValue: 'feather',
        },
        {
          key: 'interval_rule',
          label: 'Interval at 11 Points',
          type: 'toggle',
          defaultValue: true,
          description: '60-second coaching interval when leading score reaches 11',
        },
      ],
    },
  },

  tennis: {
    id: 'tennis',
    name: 'Tennis',
    icon: '🎾',
    color: '#eab308',
    bgGradient: 'from-yellow-500/20 to-amber-500/10',
    badgeClass: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    roles: [
      { value: 'singles_specialist', label: 'Singles Specialist' },
      { value: 'doubles_specialist', label: 'Doubles / Net Volleyer' },
      { value: 'baseline_hitter', label: 'Aggressive Baseliner' },
      { value: 'all_court', label: 'All-Court Player' },
      { value: 'serve_volleyer', label: 'Serve & Volley Specialist' },
    ],
    attributes: [
      {
        key: 'dominant_hand',
        label: 'Dominant Hand & Backhand',
        type: 'select',
        options: [
          { value: 'Right-handed (Two-Handed Backhand)', label: 'Right-hand (Two-Handed Backhand)' },
          { value: 'Right-handed (One-Handed Backhand)', label: 'Right-hand (One-Handed Backhand)' },
          { value: 'Left-handed (Two-Handed Backhand)', label: 'Left-hand (Two-Handed Backhand)' },
          { value: 'Left-handed (One-Handed Backhand)', label: 'Left-hand (One-Handed Backhand)' },
        ],
        defaultValue: 'Right-handed (Two-Handed Backhand)',
      },
      {
        key: 'preferred_surface',
        label: 'Preferred Court Surface',
        type: 'select',
        options: [
          { value: 'Hard Court', label: 'Hard Court 🟦' },
          { value: 'Clay Court', label: 'Clay Court (Roland Garros style) 🟫' },
          { value: 'Grass Court', label: 'Grass Court (Wimbledon style) 🟩' },
          { value: 'Synthetic / Carpet', label: 'Synthetic / Carpet 🟥' },
          { value: 'All Surfaces', label: 'All Surfaces Adaptable 🌟' },
        ],
        defaultValue: 'Hard Court',
      },
      {
        key: 'first_serve_speed',
        label: '1st Serve Speed',
        type: 'number',
        placeholder: 'e.g. 195',
        unit: 'km/h',
        defaultValue: 185,
        description: 'Flat first serve peak velocity',
      },
      {
        key: 'play_style',
        label: 'Court Tactical Style',
        type: 'select',
        options: [
          { value: 'Aggressive Baseliner (Heavy Topspin)', label: 'Aggressive Baseliner (Heavy Topspin)' },
          { value: 'Serve & Volley Net Rusher', label: 'Serve & Volley Net Rusher' },
          { value: 'Counter-Puncher / Wall Grinder', label: 'Counter-Puncher / Wall Grinder' },
          { value: 'All-Court Shotmaker', label: 'All-Court Shotmaker' },
        ],
        defaultValue: 'Aggressive Baseliner (Heavy Topspin)',
      },
      {
        key: 'utr_rating',
        label: 'UTR / Club Rating',
        type: 'text',
        placeholder: 'e.g. UTR 8.5 / NTRP 4.5',
        defaultValue: 'UTR 8.2',
      },
      {
        key: 'racquet_specs',
        label: 'Racquet Specification',
        type: 'text',
        placeholder: 'e.g. Wilson Pro Staff 97 / Babolat Pure Aero',
        defaultValue: 'Babolat Pure Aero (300g)',
      },
      {
        key: 'forehand_rating',
        label: 'Forehand Rating (1-10)',
        type: 'number',
        placeholder: '8.5',
        unit: '/10',
        defaultValue: 8.5,
      },
    ],
    tournamentSettings: {
      formatName: 'Grand Tennis Open',
      durationLabel: 'Sets per Match',
      defaultOversOrSets: 3,
      ruleFields: [
        {
          key: 'match_format',
          label: 'Match Format',
          type: 'select',
          options: [
            { value: 'best_of_3', label: 'Best of 3 Sets (Standard ATP/WTA Tour)' },
            { value: 'pro_set', label: 'Pro Set (First to 8 Games, Win by 2)' },
            { value: 'fast4', label: 'Fast4 Tennis (First to 4 Games per Set)' },
            { value: 'best_of_5', label: 'Best of 5 Sets (Grand Slam Men)' },
          ],
          defaultValue: 'best_of_3',
        },
        {
          key: 'games_per_set',
          label: 'Games to Win Set',
          type: 'select',
          options: [
            { value: 6, label: '6 Games (Tie-break at 6-6)' },
            { value: 4, label: '4 Games (Fast4 / Short Sets)' },
            { value: 8, label: '8 Games (Pro Set)' },
          ],
          defaultValue: 6,
        },
        {
          key: 'deuce_scoring',
          label: 'Deuce Rule',
          type: 'select',
          options: [
            { value: 'advantage', label: 'Standard Advantage (Ad-in / Ad-out)' },
            { value: 'no_ad', label: 'No-Ad Sudden Death (Deciding Point at Deuce)' },
          ],
          defaultValue: 'advantage',
        },
        {
          key: 'final_tiebreak',
          label: 'Deciding Set Tie-Break',
          type: 'select',
          options: [
            { value: 'super_tiebreak_10', label: '10-Point Super Tie-Break (Match Tie-break)' },
            { value: 'standard_tiebreak_7', label: '7-Point Standard Tie-Break' },
            { value: 'advantage_set', label: 'Full Set Advantage (Win by 2 games)' },
          ],
          defaultValue: 'super_tiebreak_10',
        },
        {
          key: 'court_surface',
          label: 'Tournament Court Surface',
          type: 'select',
          options: [
            { value: 'hard', label: 'Acrylic Hard Court (Plexicushion)' },
            { value: 'clay', label: 'Red Clay / Har-Tru' },
            { value: 'grass', label: 'Natural Grass' },
            { value: 'synthetic', label: 'Synthetic Turf / Carpet' },
          ],
          defaultValue: 'hard',
        },
      ],
    },
  },

  soccer: {
    id: 'soccer',
    name: 'Football (Soccer)',
    icon: '⚽',
    color: '#3b82f6',
    bgGradient: 'from-blue-500/20 to-indigo-500/10',
    badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    roles: [
      { value: 'forward', label: 'Forward / Striker' },
      { value: 'midfielder', label: 'Midfielder' },
      { value: 'defender', label: 'Defender' },
      { value: 'goalkeeper', label: 'Goalkeeper' },
    ],
    attributes: [
      {
        key: 'preferred_foot',
        label: 'Preferred Foot',
        type: 'select',
        options: [
          { value: 'Right', label: 'Right Foot' },
          { value: 'Left', label: 'Left Foot' },
          { value: 'Both / Ambidextrous', label: 'Both / Ambidextrous' },
        ],
        defaultValue: 'Right',
      },
      {
        key: 'jersey_number',
        label: 'Jersey Number',
        type: 'number',
        placeholder: '10',
        defaultValue: 10,
      },
      {
        key: 'primary_position',
        label: 'Specialized Position',
        type: 'select',
        options: [
          { value: 'Center Forward / Striker (ST)', label: 'Center Forward / Striker (ST)' },
          { value: 'Left / Right Winger (LW/RW)', label: 'Left / Right Winger (LW/RW)' },
          { value: 'Central Attacking Mid (CAM)', label: 'Central Attacking Mid (CAM)' },
          { value: 'Box-to-Box Midfielder (CM)', label: 'Box-to-Box Midfielder (CM)' },
          { value: 'Defensive Midfielder (CDM)', label: 'Defensive Midfielder (CDM)' },
          { value: 'Center-Back (CB)', label: 'Center-Back (CB)' },
          { value: 'Full-Back / Wing-Back (LB/RB)', label: 'Full-Back / Wing-Back (LB/RB)' },
          { value: 'Sweeper Goalkeeper (GK)', label: 'Sweeper Goalkeeper (GK)' },
        ],
        defaultValue: 'Center Forward / Striker (ST)',
      },
      {
        key: 'goals_season',
        label: 'Goals Last Season',
        type: 'number',
        placeholder: '14',
        defaultValue: 12,
      },
      {
        key: 'assists_season',
        label: 'Assists Last Season',
        type: 'number',
        placeholder: '8',
        defaultValue: 6,
      },
      {
        key: 'sprint_speed',
        label: 'Top Sprint Speed',
        type: 'number',
        placeholder: '33.2',
        unit: 'km/h',
        defaultValue: 31.5,
      },
    ],
    tournamentSettings: {
      formatName: 'Football League / Cup',
      durationLabel: 'Half Duration (Mins)',
      defaultOversOrSets: 45,
      ruleFields: [
        {
          key: 'half_duration',
          label: 'Half Duration (Minutes)',
          type: 'number',
          defaultValue: 45,
          description: 'Standard 45 mins per half (90 mins total)',
        },
        {
          key: 'max_subs',
          label: 'Max Substitutions per Match',
          type: 'number',
          defaultValue: 5,
        },
        {
          key: 'extra_time',
          label: 'Enable Extra Time',
          type: 'toggle',
          defaultValue: false,
          description: '2x15m extra periods if drawn in knockout',
        },
        {
          key: 'offside_active',
          label: 'Enforce Offside Rule',
          type: 'toggle',
          defaultValue: true,
        },
      ],
    },
  },

  basketball: {
    id: 'basketball',
    name: 'Basketball',
    icon: '🏀',
    color: '#f97316',
    bgGradient: 'from-orange-500/20 to-red-500/10',
    badgeClass: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    roles: [
      { value: 'point_guard', label: 'Point Guard (PG)' },
      { value: 'shooting_guard', label: 'Shooting Guard (SG)' },
      { value: 'small_forward', label: 'Small Forward (SF)' },
      { value: 'power_forward', label: 'Power Forward (PF)' },
      { value: 'center', label: 'Center (C)' },
    ],
    attributes: [
      {
        key: 'height',
        label: 'Height',
        type: 'text',
        placeholder: "e.g. 6'4\" or 193cm",
        defaultValue: "6'2\"",
      },
      {
        key: 'jersey_number',
        label: 'Jersey Number',
        type: 'number',
        placeholder: '23',
        defaultValue: 23,
      },
      {
        key: 'shooting_hand',
        label: 'Shooting Hand',
        type: 'select',
        options: [
          { value: 'Right', label: 'Right Hand' },
          { value: 'Left', label: 'Left Hand' },
        ],
        defaultValue: 'Right',
      },
      {
        key: 'ppg',
        label: 'Points Per Game (PPG)',
        type: 'number',
        placeholder: '18.4',
        defaultValue: 16.5,
      },
      {
        key: 'three_pt_percentage',
        label: '3PT Shooting %',
        type: 'number',
        placeholder: '38.5',
        unit: '%',
        defaultValue: 36,
      },
      {
        key: 'rpg',
        label: 'Rebounds Per Game (RPG)',
        type: 'number',
        placeholder: '6.2',
        defaultValue: 5.5,
      },
    ],
    tournamentSettings: {
      formatName: 'Basketball Tournament',
      durationLabel: 'Quarter Duration (Mins)',
      defaultOversOrSets: 12,
      ruleFields: [
        {
          key: 'quarter_duration',
          label: 'Quarter Duration (Minutes)',
          type: 'number',
          defaultValue: 12,
          description: 'NBA standard 12 mins, FIBA standard 10 mins',
        },
        {
          key: 'shot_clock',
          label: 'Shot Clock (Seconds)',
          type: 'number',
          defaultValue: 24,
        },
        {
          key: 'foul_out_limit',
          label: 'Foul Out Limit',
          type: 'number',
          defaultValue: 5,
        },
      ],
    },
  },
};

export const ALL_SPORTS = Object.values(SPORTS_CONFIG);

export const getSportConfig = (sportName?: string): SportDefinition => {
  const normalized = (sportName || 'cricket').toLowerCase().trim();
  return SPORTS_CONFIG[normalized] || SPORTS_CONFIG['cricket'];
};

export const getSportRoles = (sportName?: string): SportRoleConfig[] => {
  return getSportConfig(sportName).roles;
};

export const parseSportDetails = (details: any): Record<string, any> => {
  if (!details) return {};
  if (typeof details === 'object') return details;
  try {
    return JSON.parse(details);
  } catch (e) {
    return {};
  }
};
