export interface Tournament {
  id: number;
  name: string;
  sport?: 'cricket' | 'soccer' | 'basketball';
  format: 'league' | 'knockout' | 'group_knockout';
  overs: number;
  teams_count: number;
  status: 'draft' | 'active' | 'completed';
  is_auction_enabled: boolean;
  base_budget: number;
  created_at: string;
}

export interface Team {
  id: number;
  tournament_id: number;
  name: string;
  short_name: string;
  logo_url?: string;
  manager_name: string;
  payment_status: 'pending' | 'paid';
  status: 'pending' | 'approved' | 'rejected';
  remaining_budget: number;
  players?: Player[];
}

export interface Player {
  id: number;
  team_id?: number;
  tournament_id: number;
  name: string;
  age: number;
  role: 'batsman' | 'bowler' | 'all_rounder' | 'wk' | 'forward' | 'midfielder' | 'defender' | 'goalkeeper' | 'point_guard' | 'shooting_guard' | 'small_forward' | 'power_forward' | 'center';
  base_price: number;
  sold_price: number;
  is_sold: boolean;
  image_url?: string;
  phone?: string;
  sport?: string;
}

export interface Match {
  id: number;
  tournament_id: number;
  team1_id: number;
  team2_id: number;
  team1_name?: string;
  team2_name?: string;
  venue: string;
  match_date: string;
  status: 'scheduled' | 'live' | 'completed';
  winner_id?: number;
  toss_winner_id?: number;
  toss_decision?: 'bat' | 'bowl';
  current_innings: number;
  sport?: 'cricket' | 'soccer' | 'basketball';
  team1_score?: number;
  team2_score?: number;
}

export interface Innings {
  id: number;
  match_id: number;
  innings_number: number;
  batting_team_id: number;
  bowling_team_id: number;
  runs: number;
  wickets: number;
  overs_bowled: number;
}

export interface Product {
  id: number;
  name: string;
  category: string;
  description: string;
  price: number;
  image_url: string;
  selling_options: string; // JSON string
  stock: number;
  created_at: string;
}

export interface Order {
  id: number;
  product_id: number;
  product_name?: string;
  customer_name: string;
  customer_email: string;
  customer_mobile: string;
  customer_address: string;
  quantity: number;
  total_price: number;
  status: 'pending' | 'shipped' | 'delivered';
  created_at: string;
}

export interface Ground {
  id: number;
  name: string;
  location: string;
  description: string;
  price_per_hour: number;
  image_url: string;
  amenities: string; // JSON string
  created_at: string;
}

export interface GroundBooking {
  id: number;
  ground_id: number;
  ground_name?: string;
  ground_image?: string;
  ground_location?: string;
  customer_name: string;
  customer_email: string;
  customer_mobile: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  total_price: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  payment_method: string;
  payment_details: string;
  created_at: string;
}

export interface Sponsor {
  id: number;
  tournament_id: number;
  name: string;
  website_url?: string;
  banner_url?: string;
  created_at: string;
}
