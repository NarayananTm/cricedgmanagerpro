import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GraduationCap, 
  PlayCircle, 
  BookOpen, 
  Award, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Zap, 
  Trophy, 
  Search, 
  ChevronRight, 
  Lock, 
  Download, 
  BarChart2, 
  Dumbbell, 
  X, 
  Share2, 
  RotateCcw,
  Star,
  ShieldAlert,
  Flame,
  Bookmark,
  Check,
  Printer,
  FileText,
  ShieldCheck
} from 'lucide-react';
import { Footer } from './Footer';

// Types for Learning Content
export interface CourseLesson {
  id: string;
  title: string;
  sport: 'cricket' | 'soccer' | 'basketball' | 'tennis';
  category: 'Technique' | 'Rules & Umpiring' | 'Tactics & Formations' | 'Mental & Fitness';
  level: 'Beginner' | 'Intermediate' | 'Pro';
  duration: string;
  instructor: string;
  instructorRole: string;
  thumbnailUrl: string;
  description: string;
  videoUrl?: string;
  takeaways: string[];
  keyDiagram?: string;
  contentBody: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface CertifiedTrackOption {
  id: string;
  title: string;
  sport: 'cricket' | 'soccer' | 'basketball' | 'tennis' | 'all';
  certificationCode: string;
  issuer: string;
  level: 'Level 1' | 'Grassroots' | 'Master' | 'Pro License';
  badgeTitle: string;
  icon: string;
  description: string;
  requiredLessonIds: string[];
  requiredQuizId: string;
  skillsCertified: string[];
  certificateStyle: 'gold' | 'emerald' | 'dark';
}

export const CERTIFIED_TRACKS: CertifiedTrackOption[] = [
  {
    id: 'cert-cricket-l1',
    title: 'ICC Level-1 Certified Cricket Analyst & Coach',
    sport: 'cricket',
    certificationCode: 'ICC-CRK-2026-LV1',
    issuer: 'ICC & GameZM Accreditation Board',
    level: 'Level 1',
    badgeTitle: 'Certified Cricket Strategist 🏏',
    icon: '🏏',
    description: 'Master DRS Law 36 rulings, LBW impact angles, cover drive biomechanics, and T20 death bowling variations.',
    requiredLessonIds: ['cricket-101', 'cricket-rules-lbw', 'cricket-t20-bowling-variations'],
    requiredQuizId: 'quiz-cricket',
    skillsCertified: ['ICC Law 36 (LBW)', 'DRS Ball-Tracking', 'Stroke Biomechanics', 'Death Bowling Tactics'],
    certificateStyle: 'gold'
  },
  {
    id: 'cert-soccer-uefa',
    title: 'UEFA Grassroots Certified Football Tactical Specialist',
    sport: 'soccer',
    certificationCode: 'UEFA-SOC-2026-TAC',
    issuer: 'UEFA Grassroots & GameZM Academy',
    level: 'Grassroots',
    badgeTitle: 'Certified Football Tactical Analyst ⚽',
    icon: '⚽',
    description: 'Master FIFA Law 11 (Offside), set-piece physics, knuckleball trajectory, and high-press defensive line traps.',
    requiredLessonIds: ['soccer-offside-mastery', 'soccer-knuckleball-freekick'],
    requiredQuizId: 'quiz-soccer',
    skillsCertified: ['FIFA Law 11', 'VAR Offside Evaluation', 'Set-Piece Aerodynamics', 'Pressing Traps'],
    certificateStyle: 'emerald'
  },
  {
    id: 'cert-hoops-fiba',
    title: 'FIBA Certified Hoops IQ & Tactical Master',
    sport: 'basketball',
    certificationCode: 'FIBA-BB-2026-IQ',
    issuer: 'FIBA Hoops IQ & GameZM',
    level: 'Pro License',
    badgeTitle: 'Certified Hoops IQ Master 🏀',
    icon: '🏀',
    description: 'Accreditation in pick-and-roll read options, 24s shot clock strategy, B.E.E.F shooting biomechanics, and lane rules.',
    requiredLessonIds: ['basketball-pick-and-roll', 'basketball-shooting-mechanics'],
    requiredQuizId: 'quiz-basketball',
    skillsCertified: ['Pick & Roll Reads', 'B.E.E.F Mechanics', '24s Shot Clock Strategy', 'Penalty Foul Rules'],
    certificateStyle: 'dark'
  },
  {
    id: 'cert-tennis-itf',
    title: 'ITF Certified Tennis Umpire & Court Tactician',
    sport: 'tennis',
    certificationCode: 'ITF-TEN-2026-UMP',
    issuer: 'ITF Officiating & GameZM Academy',
    level: 'Master',
    badgeTitle: 'Certified Tennis Tactician 🎾',
    icon: '🎾',
    description: 'Official mastery in Grand Slam scoring, 7-point tie-break rotation, foot fault laws, and topspin kinetic chain physics.',
    requiredLessonIds: ['tennis-topspin-forehand', 'tennis-rules-scoring'],
    requiredQuizId: 'quiz-tennis',
    skillsCertified: ['Deuce & Advantage Laws', 'Tie-Break Rotation', 'Foot Fault Rules', 'Topspin Aerodynamics'],
    certificateStyle: 'gold'
  },
  {
    id: 'cert-multi-master',
    title: 'GameZM Multi-Sport Master Athletic Director',
    sport: 'all',
    certificationCode: 'GZM-ALL-2026-DIR',
    issuer: 'GameZM Executive Sports Accreditation Council',
    level: 'Master',
    badgeTitle: 'Certified Multi-Sport Director 🏆',
    icon: '🏆',
    description: 'Elite multi-sport credential verifying advanced understanding across all 4 major sports laws, coaching drills, and athletic management.',
    requiredLessonIds: ['cricket-101', 'soccer-offside-mastery', 'basketball-shooting-mechanics', 'tennis-topspin-forehand'],
    requiredQuizId: 'quiz-cricket',
    skillsCertified: ['Multi-Sport Officiating', 'Tournament Management', 'Athlete Biomechanics', 'Tactical Analysis'],
    certificateStyle: 'emerald'
  }
];

export interface SportQuiz {
  id: string;
  sport: 'cricket' | 'soccer' | 'basketball' | 'tennis';
  title: string;
  badgeTitle: string;
  icon: string;
  description: string;
  questions: QuizQuestion[];
}

const COURSES: CourseLesson[] = [
  // CRICKET
  {
    id: 'cricket-101',
    title: 'Mastering the Cover Drive & Bat Flow',
    sport: 'cricket',
    category: 'Technique',
    level: 'Intermediate',
    duration: '12 mins',
    instructor: 'Rahul Sharma',
    instructorRole: 'Former State Cricket Coach',
    thumbnailUrl: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&q=80&w=800',
    description: 'Learn step-by-step front foot positioning, head alignment over the ball, and high elbow stroke execution for a flawless cover drive.',
    takeaways: [
      'Position your lead foot right alongside the pitch of the ball',
      'Keep chin tucked in and eyes level at point of impact',
      'Follow through with a high front elbow pointing towards extra cover'
    ],
    contentBody: `The cover drive is widely regarded as one of cricket's most elegant yet technically demanding strokes. Executing it cleanly requires immaculate footwork, head stability, and control over wrist acceleration.

Key Principles:
1. Initial Stance & Trigger Movement: Maintain a relaxed setup with feet shoulder-width apart. As the bowler releases, take a controlled trigger step toward the off stump.
2. Transfer of Weight: Lean into the shot with your front knee bent, transferring 70% of body weight onto the front foot.
3. High Elbow & Extension: Swing the bat through a straight line. Avoid wristy rolling until impact is made right below your eye level.`
  },
  {
    id: 'cricket-rules-lbw',
    title: 'De-mystifying the LBW Rule & DRS Protocol',
    sport: 'cricket',
    category: 'Rules & Umpiring',
    level: 'Beginner',
    duration: '8 mins',
    instructor: 'Umpire Suresh Kumar',
    instructorRole: 'BCCI Level-2 Certified Umpire',
    thumbnailUrl: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&q=80&w=800',
    description: 'Complete breakdown of Pitching, Impact, and Hitting Wickets criteria under ICC Law 36, plus how DRS ball-tracking works in live matches.',
    takeaways: [
      'Ball must NOT pitch outside leg stump (Automatic NOT OUT)',
      'Impact must be in-line with wickets unless NO genuine stroke was played',
      'Ball-tracking projection must be hitting stumps (Umpire\'s Call boundary rules)'
    ],
    contentBody: `Under ICC Cricket Law 36 (Leg Before Wicket), an umpire must verify three sequential conditions before declaring a batsman OUT LBW:

1. Pitching Zone: The delivery must pitch either in-line with the stumps or on the off-side. If the ball pitches outside leg stump, the decision is automatically NOT OUT.
2. Point of Impact: The ball must strike the batsman's pad or body in-line with the stumps. EXCEPTION: If the batsman makes NO genuine offer to play a stroke, impact outside off stump can still be given OUT.
3. Projection (Wickets): The trajectory of the ball must go on to hit the stumps.`
  },
  {
    id: 'cricket-t20-bowling-variations',
    title: 'T20 Death Bowling: Knuckleballs & Wide Slower Yorkers',
    sport: 'cricket',
    category: 'Tactics & Formations',
    level: 'Pro',
    duration: '15 mins',
    instructor: 'Vikram Singh',
    instructorRole: 'Pace Bowling Specialist',
    thumbnailUrl: 'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?auto=format&fit=crop&q=80&w=800',
    description: 'Nail wide yorkers outside off-stump, seam position deception, and knuckleball grip techniques to restrict boundary hitting in death overs.',
    takeaways: [
      'Use the crease width to alter delivery angles into the batsmen',
      'Grip the ball with fingertips tucked into the seam for the knuckle ball',
      'Target the wide tramline 6 inches inside the off-side boundary line'
    ],
    contentBody: `Death bowling requires tactical intelligence and mental resilience. When batters are set to swing across the line, hitting a full length outside off stump prevents them from generating lever power.`
  },

  // SOCCER
  {
    id: 'soccer-offside-mastery',
    title: 'The Offside Law (Law 11) & Tactical Line Traps',
    sport: 'soccer',
    category: 'Rules & Umpiring',
    level: 'Beginner',
    duration: '10 mins',
    instructor: 'Coach Marco Rossi',
    instructorRole: 'UEFA A License Instructor',
    thumbnailUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=800',
    description: 'Learn when a player is in an offside position vs committing an offside offence, active play involvement, and defensive offside traps.',
    takeaways: [
      'A player is offside if closer to the opponent\'s goal line than both ball and second-last opponent',
      'Hands and arms are NOT considered when judging offside positions',
      'Receiving the ball directly from a Throw-in, Corner, or Goal Kick is NEVER offside'
    ],
    contentBody: `FIFA Law 11 outlines the Offside Rule. Being in an offside position itself is NOT an offense until the player becomes actively involved in play by interfering with play, interfering with an opponent, or gaining an advantage.`
  },
  {
    id: 'soccer-knuckleball-freekick',
    title: 'Curved Free-Kicks & Power Knuckle Shots',
    sport: 'soccer',
    category: 'Technique',
    level: 'Intermediate',
    duration: '14 mins',
    instructor: 'David Miller',
    instructorRole: 'Set Piece Specialist',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&q=80&w=800',
    description: 'How to strike the valve of the ball with minimal rotation to produce sudden dip and unpredictable aerodynamic movement.',
    takeaways: [
      'Strike with the hard bone on top of the foot near the big toe joint',
      'Follow through straight through the ball without twisting your ankle',
      'Aim 1 yard above the wall to trigger a late downward drop into the net'
    ],
    contentBody: `The knuckleball shot relies on creating turbulence behind the ball by minimizing spin. Striking the dead center with maximum power causes air currents to shift the ball unpredictably in flight.`
  },

  // BASKETBALL
  {
    id: 'basketball-pick-and-roll',
    title: 'Pick & Roll Offensive Dynamics & Read Options',
    sport: 'basketball',
    category: 'Tactics & Formations',
    level: 'Intermediate',
    duration: '11 mins',
    instructor: 'Coach Kareem Vance',
    instructorRole: 'Pro Hoops Tactical Specialist',
    thumbnailUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=800',
    description: 'Master the core modern basketball play: setting wide screens, roll to the rim, pop for 3-pointer, or pocket pass under pressure.',
    takeaways: [
      'Screeners must set wide feet and remain motionless before contact',
      'Ball handler must force the defender over the screen to create numerical advantage',
      'Read the hedge defender: pocket pass if hedged high, drive if defender drops'
    ],
    contentBody: `The Pick & Roll is the fundamental building block of modern basketball offenses. Properly timing screen setting and reading defense coverage leads to open shot creation.`
  },
  {
    id: 'basketball-shooting-mechanics',
    title: 'B.E.E.F Shooting Form & Free-Throw Routine',
    sport: 'basketball',
    category: 'Technique',
    level: 'Beginner',
    duration: '9 mins',
    instructor: 'Elena Rostova',
    instructorRole: 'National Shooting Coach',
    thumbnailUrl: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&q=80&w=800',
    description: 'Perfect Balance, Eyes, Elbows, and Follow-through mechanics for 85%+ consistency from the free throw line and perimeter.',
    takeaways: [
      'B = Balance feet shoulder-width square to basket',
      'E = Eyes focused on the back rim iron',
      'E = Elbow directly beneath the ball in L-shape',
      'F = Follow-through like reaching into a cookie jar'
    ],
    contentBody: `Great shooters are built through muscle memory. Applying the B.E.E.F acronym instills consistent biomechanics regardless of defender pressure.`
  },

  // TENNIS
  {
    id: 'tennis-topspin-forehand',
    title: 'Heavy Topspin Forehand & Kinetic Chain',
    sport: 'tennis',
    category: 'Technique',
    level: 'Intermediate',
    duration: '13 mins',
    instructor: 'Carlos Mendez',
    instructorRole: 'ATP Tour Certified Coach',
    thumbnailUrl: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&q=80&w=800',
    description: 'Generate 3000+ RPM rotation with a semi-western grip, low-to-high racket head path, and aggressive hip-shoulder unit turn.',
    takeaways: [
      'Drop racket head below the ball height before starting upward acceleration',
      'Brush up the back of the ball from 6 o\'clock to 12 o\'clock position',
      'Catch racket over opposite shoulder for full kinetic chain deceleration'
    ],
    contentBody: `Topspin creates downward aerodynamic Magnus effect forcing the ball into the court while allowing high clearance over the net.`
  },
  {
    id: 'tennis-rules-scoring',
    title: 'Tennis Scoring System, Deuce & Tie-Break Laws',
    sport: 'tennis',
    category: 'Rules & Umpiring',
    level: 'Beginner',
    duration: '7 mins',
    instructor: 'Referee Sarah Jenkins',
    instructorRole: 'ITF Grand Slam Umpire',
    thumbnailUrl: 'https://images.unsplash.com/photo-1530915512137-80b43550836a?auto=format&fit=crop&q=80&w=800',
    description: 'Clear breakdown of 15, 30, 40, Deuce, Advantage, Set wins, and the 7-point tie-break rotation rules.',
    takeaways: [
      'Games start at Love (0) -> 15 -> 30 -> 40 -> Game',
      'At 40-40 (Deuce), player must win two consecutive points (Advantage in -> Game)',
      'Tie-breaks are played at 6-6 in sets, first to 7 points with a 2-point lead'
    ],
    contentBody: `Tennis scoring has rich historical origin. Understanding love, deuce, advantage, and tie-break serving rotation ensures confidence on court.`
  }
];

const QUIZZES: SportQuiz[] = [
  {
    id: 'quiz-cricket',
    sport: 'cricket',
    title: 'Cricket Rules & Tactical Master Quiz',
    badgeTitle: 'Certified Cricket Strategist 🏏',
    icon: '🏏',
    description: 'Test your knowledge on ICC match laws, powerplay restrictions, LBW rulings, and bowling variations.',
    questions: [
      {
        id: 1,
        question: 'Under ICC Law 36 (LBW), if a spinner turns the ball and it pitches OUTSIDE Leg Stump before striking the batter\'s pad in front of middle stump, what is the umpire\'s verdict?',
        options: ['OUT (Leg Before Wicket)', 'NOT OUT (Pitched Outside Leg)', 'Umpire\'s Call', 'Dead Ball'],
        correctIndex: 1,
        explanation: 'According to Law 36, any ball pitching outside leg stump CANNOT be given OUT LBW under any circumstances.'
      },
      {
        id: 2,
        question: 'How many fielding players are permitted OUTSIDE the 30-yard circle during Mandatory Powerplay 1 (Overs 1-10) in a standard 50-over ODI match?',
        options: ['Maximum 2 players', 'Maximum 3 players', 'Maximum 4 players', 'Maximum 5 players'],
        correctIndex: 0,
        explanation: 'In ODI Powerplay 1 (Overs 1-10), a maximum of 2 fielders may be outside the 30-yard inner ring.'
      },
      {
        id: 3,
        question: 'What happens if a bowler steps over the front crease line (No-Ball) in a T20 match?',
        options: ['1 run penalty + re-bowl only', '1 run penalty + Free Hit on next delivery', '2 runs penalty', 'Wicket is disallowed only'],
        correctIndex: 1,
        explanation: 'A front-foot no-ball incurs a 1-run penalty and grants a Free Hit on the subsequent legal delivery.'
      },
      {
        id: 4,
        question: 'What stroke technique requires the batter to play with a high front elbow through the off-side between mid-off and cover?',
        options: ['Pull Shot', 'Cover Drive', 'Sweep Shot', 'Upper Cut'],
        correctIndex: 1,
        explanation: 'The Cover Drive is played off the front foot with a high elbow pointing toward extra cover.'
      },
      {
        id: 5,
        question: 'In a T20 innings, what is the maximum number of overs a single bowler can bowl?',
        options: ['3 Overs', '4 Overs', '5 Overs', '6 Overs'],
        correctIndex: 1,
        explanation: 'No bowler can bowl more than 20% of the total match overs in T20 (maximum 4 overs).'
      }
    ]
  },
  {
    id: 'quiz-soccer',
    sport: 'soccer',
    title: 'Soccer Offside & FIFA Law Certification',
    badgeTitle: 'Certified Football Tactical Analyst ⚽',
    icon: '⚽',
    description: 'Demonstrate expert mastery of FIFA Laws of the Game, VAR interventions, and set-piece rulings.',
    questions: [
      {
        id: 1,
        question: 'Can a player be penalized for being in an offside position if they receive the ball directly from a Throw-In?',
        options: ['Yes, if behind the defenders', 'No, offside does not apply directly from Throw-Ins', 'Only if inside the penalty box', 'Depends on referee discretion'],
        correctIndex: 1,
        explanation: 'There is NO offside offense if a player receives the ball directly from a Goal Kick, Corner Kick, or Throw-In.'
      },
      {
        id: 2,
        question: 'What body parts are NOT considered when determining if an attacker is in an offside position?',
        options: ['Head & Shoulders', 'Feet & Knees', 'Hands & Arms', 'Torso & Hips'],
        correctIndex: 2,
        explanation: 'Hands and arms of all players (including goalkeepers) are not considered for offside evaluation.'
      },
      {
        id: 3,
        question: 'How long is the standard regulation halftime break in a professional soccer match?',
        options: ['10 minutes', '15 minutes', '20 minutes', '12 minutes'],
        correctIndex: 1,
        explanation: 'FIFA Law 7 states players are entitled to an interval of halftime not exceeding 15 minutes.'
      },
      {
        id: 4,
        question: 'What is the distance from the penalty spot to the goal line in meters/yards?',
        options: ['10 yards (9.15m)', '12 yards (11m)', '15 yards (13.7m)', '8 yards (7.32m)'],
        correctIndex: 1,
        explanation: 'The penalty mark is located 12 yards (11 meters) from the center of the goal line.'
      },
      {
        id: 5,
        question: 'If a direct free kick is kicked straight into the team\'s OWN goal without touching another player, what is awarded?',
        options: ['Goal to opponent', 'Corner kick to opponent', 'Retake free kick', 'Goal kick'],
        correctIndex: 1,
        explanation: 'You cannot score an own goal directly from a free kick; a corner kick is awarded to the opposing team.'
      }
    ]
  },
  {
    id: 'quiz-basketball',
    sport: 'basketball',
    title: 'Basketball Rules & Hoops Strategy Quiz',
    badgeTitle: 'Certified Hoops IQ Master 🏀',
    icon: '🏀',
    description: 'Master shot clock rules, lane violations, technical fouls, and defensive principles.',
    questions: [
      {
        id: 1,
        question: 'What is the standard shot clock duration in FIBA international basketball matches?',
        options: ['30 seconds', '24 seconds', '20 seconds', '35 seconds'],
        correctIndex: 1,
        explanation: 'FIBA regulation shot clock grants 24 seconds for an offense to attempt a field goal.'
      },
      {
        id: 2,
        question: 'How many team fouls in a single quarter lead to the penalty state (free throws on non-shooting fouls) in FIBA play?',
        options: ['3 fouls', '4 fouls', '5 fouls', '6 fouls'],
        correctIndex: 2,
        explanation: 'On the 5th team foul in a quarter, opponents enter the bonus penalty shooting two free throws.'
      },
      {
        id: 3,
        question: 'What does the B.E.E.F shooting acronym stand for?',
        options: [
          'Balance, Eyes, Elbow, Follow-through',
          'Bounce, Elevation, Extension, Flex',
          'Bend, Energy, Execution, Finish',
          'Body, Eyes, Elbow, Force'
        ],
        correctIndex: 0,
        explanation: 'B.E.E.F stands for Balance, Eyes, Elbows, and Follow-through.'
      },
      {
        id: 4,
        question: 'How long can an offensive player remain inside the key (restricted lane area) continuously without a shot or drive?',
        options: ['5 seconds', '3 seconds', '8 seconds', '10 seconds'],
        correctIndex: 1,
        explanation: 'An offensive player cannot remain inside the opponent\'s restricted lane for more than 3 consecutive seconds.'
      },
      {
        id: 5,
        question: 'In FIBA rules, how many total personal fouls cause a player to foul out of the game?',
        options: ['6 fouls', '5 fouls', '4 fouls', '7 fouls'],
        correctIndex: 1,
        explanation: 'In FIBA rules, a player who commits 5 personal or technical fouls is disqualified for the remainder of the game.'
      }
    ]
  },
  {
    id: 'quiz-tennis',
    sport: 'tennis',
    title: 'Tennis Grand Slam Rules & Court IQ',
    badgeTitle: 'Certified Tennis Tactician 🎾',
    icon: '🎾',
    description: 'Test your understanding of tie-breaks, let calls, foot faults, and spin physics.',
    questions: [
      {
        id: 1,
        question: 'At 40-40 in a tennis game, what term is used to describe the score before Advantage?',
        options: ['Equal', 'Deuce', 'Break Point', 'Tie'],
        correctIndex: 1,
        explanation: 'When both players win 3 points (40-40), the score is declared Deuce.'
      },
      {
        id: 2,
        question: 'In a standard 7-point set tie-break at 6-6, how many points are served by the player who serves the FIRST point?',
        options: ['1 point', '2 points', '4 points', 'Rotates every 3 points'],
        correctIndex: 0,
        explanation: 'The first server serves 1 point (from deuce court), after which serving switches every 2 points.'
      },
      {
        id: 3,
        question: 'What occurs if a serve hits the top tape of the net and lands legally inside the opponent\'s service box?',
        options: ['Fault', 'Let (Re-serve with no penalty)', 'Point to receiver', 'Ace'],
        correctIndex: 1,
        explanation: 'A serve touching the net tape and landing in the correct service box is called a "Let" and is replayed.'
      },
      {
        id: 4,
        question: 'Which racket movement path generates maximum TOPSPIN on a tennis forehand?',
        options: ['High-to-Low slice path', 'Low-to-High brushing path', 'Flat horizontal swipe', 'Straight downward chop'],
        correctIndex: 1,
        explanation: 'Topspin requires brushing the back of the ball from low to high to create forward rotation.'
      },
      {
        id: 5,
        question: 'What is a "Foot Fault" during a service motion?',
        options: [
          'Stepping on or over the baseline before hitting the ball',
          'Jumping too high on serve',
          'Standing too far to the left',
          'Dropping the racket on court'
        ],
        correctIndex: 0,
        explanation: 'A foot fault occurs when the server\'s foot touches the baseline or court before contacting the ball.'
      }
    ]
  }
];

export const ELearningPage: React.FC = () => {
  const [selectedSport, setSelectedSport] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Selected lesson modal state
  const [activeLesson, setActiveLesson] = useState<CourseLesson | null>(null);
  
  // Completed & saved lesson IDs stored in localStorage
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('gamezm_elearning_completed');
    return saved ? JSON.parse(saved) : ['cricket-101'];
  });
  
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('gamezm_elearning_bookmarks');
    return saved ? JSON.parse(saved) : ['soccer-offside-mastery'];
  });

  // Quiz state
  const [activeQuiz, setActiveQuiz] = useState<SportQuiz | null>(null);
  const [quizQuestionIndex, setQuizQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [quizFinished, setQuizFinished] = useState<boolean>(false);
  const [userScore, setUserScore] = useState<number>(0);
  const [earnedCertificates, setEarnedCertificates] = useState<string[]>(() => {
    const saved = localStorage.getItem('gamezm_elearning_certificates');
    return saved ? JSON.parse(saved) : [];
  });
  const [showCertificateModal, setShowCertificateModal] = useState<string | null>(null);
  const [activeViewTab, setActiveViewTab] = useState<'courses' | 'overview'>('courses');
  const [isGeneratingDiploma, setIsGeneratingDiploma] = useState<boolean>(false);

  // Admin Login States (User Name: GmaneZM, Password: GameZm2026)
  const [showAdminModal, setShowAdminModal] = useState<boolean>(false);
  const [adminUsernameInput, setAdminUsernameInput] = useState<string>('GmaneZM');
  const [adminPasswordInput, setAdminPasswordInput] = useState<string>('');
  const [adminAuthStatus, setAdminAuthStatus] = useState<{ loggedIn: boolean; name?: string; error?: string }>(() => {
    try {
      const uData = localStorage.getItem('user_data');
      if (uData) {
        const parsed = JSON.parse(uData);
        if (parsed?.is_admin === 1) return { loggedIn: true, name: parsed.name || 'GmaneZM' };
      }
    } catch (e) {}
    return { loggedIn: false };
  });

  // Certified Completion Options & Diploma Certificate States
  // The Certified Name automatically comes based on the Logins Name
  const [studentName, setStudentName] = useState<string>(() => {
    try {
      const userDataStr = localStorage.getItem('user_data');
      if (userDataStr) {
        const uData = JSON.parse(userDataStr);
        if (uData?.name) return uData.name;
      }
      const savedProf = localStorage.getItem('gamezm_profile');
      if (savedProf) {
        const parsed = JSON.parse(savedProf);
        if (parsed?.name) return parsed.name;
      }
    } catch (e) {}
    return 'GmaneZM';
  });

  // Sync Student Name with Login Name automatically
  useEffect(() => {
    const syncNameWithLogin = () => {
      try {
        const userDataStr = localStorage.getItem('user_data');
        if (userDataStr) {
          const uData = JSON.parse(userDataStr);
          if (uData?.name) {
            setStudentName(uData.name);
            if (uData.is_admin === 1) {
              setAdminAuthStatus({ loggedIn: true, name: uData.name });
            }
          }
        }
      } catch (e) {}
    };

    syncNameWithLogin();
    window.addEventListener('storage', syncNameWithLogin);
    return () => window.removeEventListener('storage', syncNameWithLogin);
  }, []);

  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = adminUsernameInput.trim();
    if ((cleanUser === 'GmaneZM' || cleanUser.toLowerCase() === 'gmanezm' || cleanUser.toLowerCase() === 'gmanezm@gamezm.com') && adminPasswordInput === 'GameZm2026') {
      const adminUser = { id: 88, name: 'GmaneZM', email: 'gmanezm@gamezm.com', plan: 'pro', is_admin: 1 };
      localStorage.setItem('user_data', JSON.stringify(adminUser));
      setAdminAuthStatus({ loggedIn: true, name: 'GmaneZM' });
      setStudentName('GmaneZM');
      setShowAdminModal(false);
      setAdminPasswordInput('');
      setConfettiEvent({ id: 'admin-login', title: 'Welcome Admin GmaneZM! Admin Rights Granted.' });
      setTimeout(() => setConfettiEvent(null), 3500);
    } else {
      setAdminAuthStatus(prev => ({ ...prev, error: 'Invalid Credentials! User Name must be GmaneZM and Password GameZm2026' }));
    }
  };

  const openDiplomaPreview = (trackId: string) => {
    setShowCertificateModal(trackId);
    setIsGeneratingDiploma(true);
    setTimeout(() => {
      setIsGeneratingDiploma(false);
    }, 1200);
  };
  const [selectedCertifiedTrack, setSelectedCertifiedTrack] = useState<CertifiedTrackOption | null>(null);
  const [certificateTheme, setCertificateTheme] = useState<'gold' | 'emerald' | 'dark'>('gold');
  const [certifiedTrackIds, setCertifiedTrackIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('gamezm_elearning_certified_tracks');
      return saved ? JSON.parse(saved) : ['cert-cricket-l1'];
    } catch (e) {
      return ['cert-cricket-l1'];
    }
  });

  // Confetti / Completion Success Animation State
  const [confettiEvent, setConfettiEvent] = useState<{ id: string; title: string } | null>(null);

  // AI Drill Generator State
  const [drillSport, setDrillSport] = useState<'cricket' | 'soccer' | 'basketball' | 'tennis'>('cricket');
  const [drillFocus, setDrillFocus] = useState<string>('Power & Strike');
  const [drillTime, setDrillTime] = useState<number>(30);
  const [generatedDrill, setGeneratedDrill] = useState<any | null>(null);
  const [isGeneratingDrill, setIsGeneratingDrill] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('gamezm_elearning_completed', JSON.stringify(completedLessonIds));
  }, [completedLessonIds]);

  useEffect(() => {
    localStorage.setItem('gamezm_elearning_bookmarks', JSON.stringify(bookmarkedIds));
  }, [bookmarkedIds]);

  useEffect(() => {
    localStorage.setItem('gamezm_elearning_certificates', JSON.stringify(earnedCertificates));
  }, [earnedCertificates]);

  useEffect(() => {
    localStorage.setItem('gamezm_elearning_certified_tracks', JSON.stringify(certifiedTrackIds));
  }, [certifiedTrackIds]);

  const toggleCertifiedTrack = (track: CertifiedTrackOption) => {
    setCertifiedTrackIds(prev => {
      const isCurrentlyCertified = prev.includes(track.id);
      if (isCurrentlyCertified) {
        return prev.filter(id => id !== track.id);
      } else {
        // Also ensure all required lessons for this track are marked as completed for 100% synergy
        setCompletedLessonIds(cPrev => Array.from(new Set([...cPrev, ...track.requiredLessonIds])));
        setConfettiEvent({ id: track.id, title: track.title });
        setTimeout(() => setConfettiEvent(null), 3500);
        return [...prev, track.id];
      }
    });
  };

  const toggleComplete = (id: string) => {
    setCompletedLessonIds(prev => {
      const isNowCompleted = !prev.includes(id);
      if (isNowCompleted) {
        const lesson = COURSES.find(c => c.id === id);
        setConfettiEvent({ id, title: lesson ? lesson.title : 'Module Completed!' });
        setTimeout(() => setConfettiEvent(null), 3000);
      }
      return isNowCompleted ? [...prev, id] : prev.filter(x => x !== id);
    });
  };

  const toggleBookmark = (id: string) => {
    setBookmarkedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Filter lessons with support for requested categories: 'all', 'Basics', 'Advanced', 'Technical', 'Umpiring'
  const filteredCourses = COURSES.filter(course => {
    const matchesSport = selectedSport === 'all' || course.sport === selectedSport;
    
    const matchesCategory = (() => {
      if (selectedCategory === 'all') return true;
      if (selectedCategory === 'Basics') {
        return course.level === 'Beginner' || course.id.includes('101') || course.description.toLowerCase().includes('basic') || course.description.toLowerCase().includes('beginner');
      }
      if (selectedCategory === 'Advanced') {
        return course.level === 'Pro' || course.level === 'Intermediate' || course.category === 'Tactics & Formations';
      }
      if (selectedCategory === 'Technical') {
        return course.category === 'Technique' || course.title.toLowerCase().includes('drive') || course.title.toLowerCase().includes('free-kick') || course.title.toLowerCase().includes('shooting') || course.title.toLowerCase().includes('forehand') || course.title.toLowerCase().includes('mechanics');
      }
      if (selectedCategory === 'Umpiring') {
        return course.category === 'Rules & Umpiring' || course.title.toLowerCase().includes('rule') || course.title.toLowerCase().includes('lbw') || course.title.toLowerCase().includes('offside') || course.title.toLowerCase().includes('drs') || course.title.toLowerCase().includes('scoring');
      }
      return course.category === selectedCategory;
    })();

    const matchesSearch = searchQuery === '' || 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSport && matchesCategory && matchesSearch;
  });

  // Quiz submission handler
  const handleSelectAnswer = (questionIdx: number, optionIdx: number) => {
    setUserAnswers(prev => ({ ...prev, [questionIdx]: optionIdx }));
  };

  const handleNextQuizQuestion = () => {
    if (!activeQuiz) return;
    if (quizQuestionIndex < activeQuiz.questions.length - 1) {
      setQuizQuestionIndex(prev => prev + 1);
    } else {
      // Calculate score
      let score = 0;
      activeQuiz.questions.forEach((q, idx) => {
        if (userAnswers[idx] === q.correctIndex) {
          score += 1;
        }
      });
      setUserScore(score);
      setQuizFinished(true);

      const passPercentage = (score / activeQuiz.questions.length) * 100;
      if (passPercentage >= 80 && !earnedCertificates.includes(activeQuiz.id)) {
        setEarnedCertificates(prev => [...prev, activeQuiz.id]);
      }
    }
  };

  const resetQuiz = () => {
    setQuizQuestionIndex(0);
    setUserAnswers({});
    setQuizFinished(false);
    setUserScore(0);
  };

  // Generate Custom Drill Function
  const generateDrillRoutine = () => {
    setIsGeneratingDrill(true);
    setTimeout(() => {
      const sportTitles: Record<string, string[]> = {
        cricket: ['Boundary Clearing & Range Hitting', 'Seam & Swing Control Routine', 'High-Catching & Reflex Fielding'],
        soccer: ['Precision Curve & Free Kick Drills', '1v1 Dribbling & Acceleration Burst', 'Tactical Passing Triangle Speed'],
        basketball: ['Catch & Shoot 3-Point Blitz', 'Pick & Roll Pocket Pass Drill', 'Defensive Slide & Rim Protection'],
        tennis: ['Heavy Topspin Forehand Crosscourt', 'Serve & Volley Acceleration Routine', 'Footwork Recovery & Split Step']
      };

      const randomTitle = sportTitles[drillSport][Math.floor(Math.random() * sportTitles[drillSport].length)];

      setGeneratedDrill({
        title: `${drillSport.toUpperCase()} - ${randomTitle}`,
        time: `${drillTime} Minutes Total`,
        focus: drillFocus,
        steps: [
          { name: 'Warm-up & Dynamic Stretches', duration: '5 mins', notes: 'High knees, arm circles, side-slips, and light mobility work.' },
          { name: `Core ${drillFocus} Drill Set 1`, duration: `${Math.floor(drillTime * 0.4)} mins`, notes: '10 repetitions x 4 sets with 45s rest intervals.' },
          { name: 'High-Intensity Simulated Game Pressures', duration: `${Math.floor(drillTime * 0.35)} mins`, notes: 'Incorporate timed targets and competitive score challenges.' },
          { name: 'Cool-Down & Tactical Review', duration: '5 mins', notes: 'Static stretching, hydration, and key error logging in GameZM profile.' }
        ]
      });
      setIsGeneratingDrill(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-emerald-500 selection:text-black">
      {/* Top Banner Navigation Header */}
      <div className="border-b border-white/10 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-white group">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:rotate-12 transition-transform">
              <Trophy className="h-5 w-5" />
            </div>
            <span>Game<span className="text-emerald-400">ZM</span> <span className="text-xs bg-emerald-500/10 text-emerald-400 font-mono px-2 py-0.5 rounded-full border border-emerald-500/20 ml-1">E-Learning</span></span>
          </Link>

          <div className="flex items-center gap-3 text-xs font-bold">
            <div className="hidden sm:flex items-center gap-2 bg-zinc-900 border border-white/10 px-3 py-1.5 rounded-xl">
              <Award className="h-4 w-4 text-amber-400" />
              <span>Certificates: <strong className="text-emerald-400 font-mono">{certifiedTrackIds.length}</strong></span>
            </div>

            {/* Admin Login Modal Trigger / Status */}
            {adminAuthStatus.loggedIn ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-black">
                <ShieldCheck className="h-4 w-4 text-amber-400" />
                <span>Admin: {adminAuthStatus.name || 'GmaneZM'}</span>
              </div>
            ) : (
              <button
                onClick={() => setShowAdminModal(true)}
                className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-white/10 hover:border-amber-500/40 text-amber-400 hover:text-amber-300 font-extrabold text-[11px] transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Lock className="h-3.5 w-3.5 text-amber-400" /> Admin Login
              </button>
            )}

            <Link to="/settings" className="px-3 py-1.5 rounded-xl bg-emerald-500 text-black hover:bg-emerald-400 font-extrabold uppercase tracking-widest text-[10px] transition-all">
              My Profile
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 border-b border-white/5 bg-gradient-to-b from-zinc-950 via-black to-black text-left">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-widest mb-4">
              <GraduationCap className="h-4 w-4" /> Official GameZM Sports Academy
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight uppercase">
              Master Tactics, Rules <br />& <span className="text-emerald-400">Pro Techniques</span>
            </h1>
            <p className="text-zinc-400 text-sm sm:text-base mt-4 leading-relaxed">
              Elevate your sports IQ across Cricket, Soccer, Basketball, and Tennis with interactive video breakdowns, FIFA/ICC law masterclasses, skill quizzes, and AI-generated training routines.
            </p>

            {/* Quick Stats Ticker */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/10">
              <div>
                <p className="text-2xl font-black text-white font-mono">{COURSES.length}+</p>
                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mt-0.5">Video Masterclasses</p>
              </div>
              <div>
                <p className="text-2xl font-black text-emerald-400 font-mono">4 Sports</p>
                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mt-0.5">Cricket, Soccer, Hoops, Tennis</p>
              </div>
              <div>
                <p className="text-2xl font-black text-amber-400 font-mono">{earnedCertificates.length} / {QUIZZES.length}</p>
                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mt-0.5">Badges Unlocked</p>
              </div>
              <div>
                <p className="text-2xl font-black text-white font-mono">100% Free</p>
                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mt-0.5">For All GameZM Athletes</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main E-Learning Dashboard Workspace */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 text-left">
        {/* Main Dashboard View Mode Navigation Tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-white/10 pb-6 mb-8">
          <div className="flex items-center gap-2 p-1.5 bg-zinc-900/90 border border-white/10 rounded-2xl w-full sm:w-auto font-sans">
            <button
              onClick={() => setActiveViewTab('courses')}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeViewTab === 'courses'
                  ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <BookOpen className="h-4 w-4" /> Course Catalog & Modules
            </button>

            <button
              onClick={() => setActiveViewTab('overview')}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeViewTab === 'overview'
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Award className="h-4 w-4" /> Certificates Overview Dashboard
            </button>
          </div>

          {/* Synchronized Certified Candidate Indicator */}
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-zinc-900 border border-white/10 text-xs font-sans">
            <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest">Certified Name:</span>
            <span className="font-extrabold text-amber-400 flex items-center gap-1 font-mono">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> {studentName}
            </span>
            {adminAuthStatus.loggedIn && (
              <span className="text-[9px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded font-black uppercase">
                ADMIN
              </span>
            )}
          </div>
        </div>

        {/* OVERVIEW DASHBOARD VIEW */}
        {activeViewTab === 'overview' && (
          <div className="space-y-8 animate-fadeIn text-left">
            {/* Overview Top Metric Banner */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border-2 border-amber-500/30 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-black uppercase tracking-widest mb-3">
                    <Award className="h-4 w-4" /> Official Accreditation Summary
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                    Certificates & Diplomas Overview
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1 max-w-xl leading-relaxed">
                    Comprehensive accredited record of all earned sport diplomas, date of issue logs, and completed module summaries for certified athlete <strong className="text-amber-400 font-mono">{studentName}</strong>.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="p-3.5 px-5 rounded-2xl bg-black/60 border border-white/10 text-center shrink-0">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Candidate Name</span>
                    <span className="text-sm font-black text-amber-400 font-mono">{studentName}</span>
                  </div>

                  <div className="p-3.5 px-5 rounded-2xl bg-black/60 border border-white/10 text-center shrink-0">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Issue Date</span>
                    <span className="text-sm font-black text-white font-mono">July 28, 2026</span>
                  </div>

                  <div className="p-3.5 px-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center shrink-0">
                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">Earned Track Diplomas</span>
                    <span className="text-xl font-black text-emerald-400 font-mono">{certifiedTrackIds.length} / {CERTIFIED_TRACKS.length}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary List of All Earned Certificates & Course Breakdowns */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-400" /> Earned Certificates & Summary of Completed Courses
                </h3>
                <span className="text-xs text-zinc-400 font-mono">Showing {CERTIFIED_TRACKS.length} Accredited Tracks</span>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {CERTIFIED_TRACKS.map((track) => {
                  const isCertified = certifiedTrackIds.includes(track.id);
                  const completedLessons = COURSES.filter(c => track.requiredLessonIds.includes(c.id));

                  return (
                    <div 
                      key={track.id}
                      className={`p-6 rounded-3xl bg-zinc-950 border transition-all ${
                        isCertified ? 'border-emerald-500/40 shadow-xl shadow-emerald-500/5' : 'border-white/10'
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
                        <div className="flex items-start gap-4">
                          <div className="text-4xl p-3 rounded-2xl bg-black border border-white/10 shrink-0">
                            {track.icon}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                                isCertified 
                                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              }`}>
                                {isCertified ? '✓ CERTIFIED DIPLOMA EARNED' : 'IN PROGRESS'}
                              </span>
                              <span className="text-[10px] text-zinc-500 font-mono font-bold">
                                Code: {track.certificationCode}
                              </span>
                            </div>

                            <h4 className="text-xl font-black text-white">{track.title}</h4>
                            <p className="text-xs text-emerald-400 font-bold mt-0.5">Issuer: {track.issuer}</p>
                          </div>
                        </div>

                        {/* Certificate Date & Action Buttons */}
                        <div className="flex flex-wrap items-center gap-3 shrink-0">
                          <div className="text-left lg:text-right font-mono text-xs pr-3 border-r border-white/10">
                            <span className="text-zinc-500 text-[10px] uppercase font-bold block">Date of Issue</span>
                            <span className="text-amber-400 font-bold">July 28, 2026</span>
                          </div>

                          <button
                            onClick={() => openDiplomaPreview(track.id)}
                            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shadow-lg shadow-amber-500/20"
                          >
                            <Award className="h-4 w-4" /> Preview Diploma
                          </button>

                          <button
                            onClick={() => openDiplomaPreview(track.id)}
                            className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 border border-white/10"
                          >
                            <Download className="h-4 w-4 text-emerald-400" /> Download
                          </button>
                        </div>
                      </div>

                      {/* Course Summary Section for this Certificate */}
                      <div className="pt-4">
                        <span className="text-[11px] font-black text-zinc-400 uppercase tracking-widest block mb-3">
                          Summary of Completed Course Modules ({completedLessons.length} Masterclasses)
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {completedLessons.map((lesson) => (
                            <div 
                              key={lesson.id}
                              className="p-3 rounded-2xl bg-black/60 border border-white/5 flex items-center justify-between gap-3 text-xs"
                            >
                              <div className="flex items-center gap-2.5 overflow-hidden">
                                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                                <div className="truncate">
                                  <p className="font-bold text-white truncate">{lesson.title}</p>
                                  <p className="text-[10px] text-zinc-500">{lesson.instructor} • {lesson.duration}</p>
                                </div>
                              </div>
                              <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-mono font-bold shrink-0">
                                PASSED
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* COURSE CATALOG VIEW */}
        {activeViewTab === 'courses' && (
          <div>
            {/* Search & Filters Bar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8">
              {/* Sport Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
                {[
                  { id: 'all', label: 'All Sports 🏆' },
                  { id: 'cricket', label: 'Cricket 🏏' },
                  { id: 'soccer', label: 'Soccer ⚽' },
                  { id: 'basketball', label: 'Basketball 🏀' },
                  { id: 'tennis', label: 'Tennis 🎾' },
                ].map(sport => (
                  <button
                    key={sport.id}
                    onClick={() => setSelectedSport(sport.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                      selectedSport === sport.id 
                        ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' 
                        : 'bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white hover:border-white/10'
                    }`}
                  >
                    {sport.label}
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div className="relative min-w-[260px]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input 
                  type="text"
              placeholder="Search techniques, rules, or tactics..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Category Filter Navigation Tabs & Dropdown */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4 mb-8">
          {/* Tab-based category navigation */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none w-full sm:w-auto">
            {[
              { id: 'all', label: 'All Modules 📚' },
              { id: 'Basics', label: '🐣 Basics' },
              { id: 'Advanced', label: '⚡ Advanced' },
              { id: 'Technical', label: '🎯 Technical' },
              { id: 'Umpiring', label: '📜 Umpiring' },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 font-sans ${
                  selectedCategory === cat.id 
                    ? 'bg-emerald-500 text-black font-extrabold shadow-md shadow-emerald-500/20' 
                    : 'bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Category Dropdown Selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 font-sans">
            <span className="text-xs text-zinc-400 font-bold hidden sm:inline">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-zinc-900 border border-white/10 text-white rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 w-full sm:w-auto cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="Basics">🐣 Basics & Fundamentals</option>
              <option value="Advanced">⚡ Advanced & Pro</option>
              <option value="Technical">🎯 Technical & Drills</option>
              <option value="Umpiring">📜 Rules & Umpiring</option>
            </select>
          </div>
        </div>

        {/* Visual Progress Bar Banner (Inter Font Design) */}
        <div className="mb-10 p-6 rounded-2xl bg-zinc-900/90 border border-emerald-500/30 shadow-2xl relative overflow-hidden font-sans">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider">
                  Inter Design System • Live Tracker
                </span>
                <span className="text-[11px] text-zinc-400 font-semibold">
                  {completedLessonIds.length} of {COURSES.length} Modules Mastered
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-emerald-400" />
                Active Learning Progress
              </h2>

              {/* Progress Bar Component */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-zinc-300 font-sans">Overall Completion Ratio</span>
                  <span className="text-emerald-400 font-mono font-bold">
                    {Math.round((completedLessonIds.length / COURSES.length) * 100)}%
                  </span>
                </div>
                <div className="w-full h-3 bg-black/80 rounded-full overflow-hidden border border-white/10 p-0.5">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 rounded-full transition-all duration-700 shadow-sm"
                    style={{ width: `${Math.round((completedLessonIds.length / COURSES.length) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Stats Badges */}
            <div className="flex items-center gap-3 shrink-0 font-sans">
              <div className="p-3.5 rounded-xl bg-black/60 border border-white/10 text-center min-w-[100px]">
                <p className="text-xl font-black text-amber-400 font-mono">{completedLessonIds.length}</p>
                <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider mt-0.5">Completed</p>
              </div>
              <div className="p-3.5 rounded-xl bg-black/60 border border-white/10 text-center min-w-[100px]">
                <p className="text-xl font-black text-emerald-400 font-mono">{earnedCertificates.length}</p>
                <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider mt-0.5">Certificates</p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 0: Certified Completion Options & Pathways */}
        <div className="mb-16 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-zinc-950 via-zinc-900 to-black border border-amber-500/30 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 border-b border-white/10 pb-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-black uppercase tracking-widest border border-amber-500/20 mb-2">
                  <Award className="h-4 w-4 text-amber-400" /> Official Accreditation Pathways
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                  Certified Completion Options
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl leading-relaxed">
                  Earn accredited digital diplomas and shareable credentials recognized by ICC, UEFA, FIBA, and ITF sports boards. Complete required masterclass modules and pass accreditation tests.
                </p>
              </div>

              {/* Student Name Input for Live Preview */}
              <div className="bg-black/60 p-3.5 rounded-2xl border border-white/10 min-w-[280px]">
                <label className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block mb-1">
                  🎓 Student Name for Diplomas
                </label>
                <input 
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Enter full name for diploma"
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-400 font-medium"
                />
              </div>
            </div>

            {/* Grid of Certified Completion Track Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {CERTIFIED_TRACKS.filter(t => selectedSport === 'all' || t.sport === selectedSport || t.sport === 'all').map(track => {
                const finishedCount = track.requiredLessonIds.filter(id => completedLessonIds.includes(id)).length;
                const totalReq = track.requiredLessonIds.length;
                const isFullyComplete = finishedCount >= totalReq;
                const isTrackCertified = certifiedTrackIds.includes(track.id) || isFullyComplete;
                const progressPct = isTrackCertified ? 100 : Math.round((finishedCount / totalReq) * 100);

                return (
                  <div 
                    key={track.id}
                    className={`p-5 rounded-2xl bg-zinc-900/90 border transition-all flex flex-col justify-between group shadow-xl relative overflow-hidden ${
                      isTrackCertified ? 'border-emerald-500/40 shadow-emerald-500/10' : 'border-white/10 hover:border-amber-500/40'
                    }`}
                  >
                    <div>
                      {/* Top Header Row */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-2xl">{track.icon}</span>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[9px] font-black uppercase tracking-wider">
                            {track.level}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono font-bold">
                            {track.certificationCode}
                          </span>
                        </div>
                      </div>

                      <h3 className="text-base font-extrabold text-white leading-snug group-hover:text-amber-400 transition-colors">
                        {track.title}
                      </h3>
                      <p className="text-[10px] text-emerald-400 font-bold mt-1 uppercase tracking-widest">
                        Issuer: {track.issuer}
                      </p>

                      <p className="text-xs text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
                        {track.description}
                      </p>

                      {/* Certified Skills Badges */}
                      <div className="flex flex-wrap gap-1.5 mt-4">
                        {track.skillsCertified.map((skill, sIdx) => (
                          <span key={sIdx} className="px-2 py-0.5 rounded-md bg-black/50 border border-white/5 text-zinc-300 text-[9px] font-semibold">
                            ✓ {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Progress Bar & Actions */}
                    <div className="mt-6 pt-4 border-t border-white/10">
                      <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono mb-1.5">
                        <span>Modules Completed: <strong>{isTrackCertified ? totalReq : finishedCount}/{totalReq}</strong></span>
                        <span className={isTrackCertified ? 'text-emerald-400 font-bold' : 'text-amber-400'}>{progressPct}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-black rounded-full overflow-hidden mb-3">
                        <div 
                          className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-500" 
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>

                      {/* Clickable Checkbox for "Completion the Certified" Status */}
                      <div 
                        onClick={() => toggleCertifiedTrack(track)}
                        className={`mb-3 p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer select-none transition-all font-sans ${
                          isTrackCertified 
                            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' 
                            : 'bg-black/70 border-white/10 text-zinc-400 hover:border-amber-500/40 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0 ${
                            isTrackCertified 
                              ? 'bg-emerald-500 border-emerald-400 text-black shadow-md shadow-emerald-500/30 scale-105' 
                              : 'bg-zinc-900 border-zinc-600'
                          }`}>
                            {isTrackCertified && <Check className="h-3.5 w-3.5 stroke-[3] text-black" />}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[11px] font-black uppercase tracking-wider leading-tight">
                              Completion the Certified
                            </span>
                            <span className="text-[9px] text-zinc-400 font-mono">
                              {isTrackCertified ? '✓ Checkbox Marked & Verified' : 'Click checkbox to mark completed'}
                            </span>
                          </div>
                        </div>

                        <span className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded border shrink-0 ${
                          isTrackCertified
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {isTrackCertified ? 'CERTIFIED ✓' : 'UNCHECKED'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (!isTrackCertified) {
                              toggleCertifiedTrack(track);
                            } else {
                              setSelectedCertifiedTrack(track);
                              setShowCertificateModal(track.id);
                            }
                          }}
                          className={`w-full py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg font-sans ${
                            isTrackCertified
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black shadow-emerald-500/20'
                              : 'bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 border border-white/10 hover:border-amber-400/40'
                          }`}
                        >
                          <Award className={`h-4 w-4 ${isTrackCertified ? 'text-black' : 'text-amber-400'}`} />
                          {isTrackCertified ? 'Claim Certified Diploma ✓' : 'Check "Completion the Certified" to Claim'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section 1: Interactive Video & Tactical Tutorials */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-emerald-400" /> Training Masterclasses & Law Guides
              </h2>
              <p className="text-xs text-zinc-500 mt-1">Select a tutorial to open the interactive video breakdown and tactical notes.</p>
            </div>
            <span className="text-xs font-mono text-zinc-500">{filteredCourses.length} Lessons Available</span>
          </div>

          {filteredCourses.length === 0 ? (
            <div className="p-12 rounded-2xl bg-zinc-900/50 border border-white/5 text-center">
              <p className="text-zinc-400 font-bold">No training modules matched your filters.</p>
              <button 
                onClick={() => { setSelectedSport('all'); setSelectedCategory('all'); setSearchQuery(''); }}
                className="mt-4 text-xs font-bold text-emerald-400 underline cursor-pointer"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map(course => {
                const isCompleted = completedLessonIds.includes(course.id);
                const isBookmarked = bookmarkedIds.includes(course.id);

                return (
                  <motion.div
                    key={course.id}
                    whileHover={{ y: -4 }}
                    className="rounded-2xl bg-zinc-900/80 border border-white/10 overflow-hidden flex flex-col group hover:border-emerald-500/30 transition-all shadow-xl"
                  >
                    {/* Course Thumbnail Container */}
                    <div className="relative h-44 w-full overflow-hidden bg-zinc-950">
                      <img 
                        src={course.thumbnailUrl} 
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-black/40" />

                      {/* Sport Badge Pill */}
                      <span className="absolute top-3 left-3 bg-black/80 backdrop-blur-md text-emerald-400 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border border-emerald-500/20 font-sans">
                        {course.sport === 'cricket' ? '🏏 Cricket' : course.sport === 'soccer' ? '⚽ Soccer' : course.sport === 'basketball' ? '🏀 Basketball' : '🎾 Tennis'}
                      </span>

                      {/* Completed Certification Badge Pill */}
                      {isCompleted && (
                        <span className="absolute top-3 right-12 bg-emerald-500 text-black text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-lg flex items-center gap-1 shadow-lg font-sans">
                          <ShieldCheck className="h-3 w-3" /> Certified
                        </span>
                      )}

                      {/* Bookmark toggle button */}
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleBookmark(course.id); }}
                        className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md transition-all cursor-pointer ${
                          isBookmarked ? 'bg-amber-500 text-black' : 'bg-black/60 text-zinc-400 hover:text-white'
                        }`}
                      >
                        <Bookmark className="h-3.5 w-3.5 fill-current" />
                      </button>

                      {/* Play Button Overlay */}
                      <button
                        onClick={() => setActiveLesson(course)}
                        className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-colors cursor-pointer"
                      >
                        <div className="h-12 w-12 rounded-full bg-emerald-500 text-black flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <PlayCircle className="h-7 w-7 fill-black text-emerald-500" />
                        </div>
                      </button>

                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[10px] text-zinc-300 font-mono">
                        <span className="flex items-center gap-1 bg-black/80 px-2 py-0.5 rounded"><Clock className="h-3 w-3 text-emerald-400" /> {course.duration}</span>
                        <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold uppercase font-sans">{course.level}</span>
                      </div>
                    </div>

                    {/* Card Content Body */}
                    <div className="p-5 flex-1 flex flex-col justify-between font-sans">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{course.category}</span>
                          
                          {/* Visual Certification Badge / Status Indicator */}
                          {isCompleted && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-extrabold uppercase tracking-wider">
                              <Award className="h-3 w-3 text-emerald-400 shrink-0" /> Certified
                            </span>
                          )}
                        </div>

                        <h3 className="text-base font-bold text-white mt-1 leading-snug group-hover:text-emerald-400 transition-colors">
                          {course.title}
                        </h3>
                        <p className="text-xs text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
                          {course.description}
                        </p>

                        {/* Visual Progress Bar for Active Course (Inter Font Design) */}
                        <div className="mt-4 pt-3 border-t border-white/5 space-y-1 font-sans">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-zinc-400 font-medium">Lesson Progress</span>
                            <span className={`font-bold font-mono ${isCompleted ? 'text-emerald-400' : 'text-zinc-500'}`}>
                              {isCompleted ? '100% Completed' : '0% In Progress'}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-black rounded-full overflow-hidden border border-white/5">
                            <div 
                              className={`h-full transition-all duration-500 rounded-full ${
                                isCompleted ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-zinc-800'
                              }`}
                              style={{ width: `${isCompleted ? 100 : 0}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 pt-3 border-t border-white/5 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="text-[11px]">
                            <p className="font-bold text-zinc-300">{course.instructor}</p>
                            <p className="text-[9px] text-zinc-500">{course.instructorRole}</p>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleComplete(course.id)}
                              className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                isCompleted 
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                                  : 'bg-zinc-800 text-zinc-500 hover:text-zinc-300'
                              }`}
                              title={isCompleted ? 'Marked as Completed' : 'Mark as Done'}
                            >
                              <Check className={`h-4 w-4 ${isCompleted ? 'text-emerald-400' : 'text-zinc-600'}`} />
                            </button>

                            <button
                              onClick={() => setActiveLesson(course)}
                              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition-all cursor-pointer"
                            >
                              Study Module
                            </button>
                          </div>
                        </div>

                        {/* Download Certificate Button for Finished Modules */}
                        {isCompleted && (
                          <button
                            onClick={() => setShowCertificateModal(course.id)}
                            className="w-full py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:text-amber-200 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 font-sans shadow-sm"
                          >
                            <Download className="h-3.5 w-3.5 text-amber-400" />
                            <span>Download Certificate</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Section 2: Interactive Skill Quizzes & Official Certifications */}
        <div className="mb-16 pt-8 border-t border-white/10">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-black uppercase tracking-widest border border-amber-500/20 mb-2">
              <Award className="h-3.5 w-3.5" /> Official GameZM Skill Accreditation
            </div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">
              Interactive Sports IQ Quizzes & Badges
            </h2>
            <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
              Score 80%+ on any 5-question sport quiz to instantly unlock your shareable "Certified GameZM Athlete" digital badge certificate.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {QUIZZES.map(quiz => {
              const isCertified = earnedCertificates.includes(quiz.id);

              return (
                <div 
                  key={quiz.id}
                  className={`p-6 rounded-2xl border transition-all flex flex-col justify-between ${
                    isCertified 
                      ? 'bg-emerald-950/20 border-emerald-500/40 shadow-lg shadow-emerald-500/10' 
                      : 'bg-zinc-900/60 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-3xl">{quiz.icon}</span>
                      {isCertified ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-black text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Certified
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-400 text-[9px] font-bold uppercase tracking-widest">
                          5 Questions
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-white leading-snug">{quiz.title}</h3>
                    <p className="text-xs text-zinc-400 mt-2 leading-relaxed">{quiz.description}</p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/5 space-y-2">
                    {isCertified ? (
                      <button
                        onClick={() => setShowCertificateModal(quiz.id)}
                        className="w-full py-2.5 rounded-xl bg-emerald-500 text-black font-extrabold text-xs uppercase tracking-widest hover:bg-emerald-400 transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Award className="h-4 w-4" /> View Digital Certificate
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setActiveQuiz(quiz);
                          resetQuiz();
                        }}
                        className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-extrabold text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Flame className="h-4 w-4 text-amber-400" /> Take Accreditation Quiz
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 3: AI Training Drill Generator */}
        <div className="pt-8 border-t border-white/10">
          <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-black border border-emerald-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />

            <div className="max-w-3xl relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 mb-3">
                <Sparkles className="h-3.5 w-3.5 text-emerald-400" /> GameZM AI Drill Assistant
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                Generate Custom Practice Drill Routines
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-2 leading-relaxed">
                Configure your target sport, focus area, and workout duration to create a structured practice drill plan.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
                {/* Sport Select */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5 block">Sport Type</label>
                  <select
                    value={drillSport}
                    onChange={(e: any) => setDrillSport(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="cricket">Cricket 🏏</option>
                    <option value="soccer">Soccer ⚽</option>
                    <option value="basketball">Basketball 🏀</option>
                    <option value="tennis">Tennis 🎾</option>
                  </select>
                </div>

                {/* Focus Area */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5 block">Focus & Tactical Goal</label>
                  <select
                    value={drillFocus}
                    onChange={(e) => setDrillFocus(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="Power & Strike">Power & Strike Acceleration</option>
                    <option value="Precision & Accuracy">Precision & Target Accuracy</option>
                    <option value="Stamina & Speed Agility">Stamina & Speed Agility</option>
                    <option value="Defensive Reactions">Defensive Reactions & Footwork</option>
                  </select>
                </div>

                {/* Duration */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5 block">Duration (Minutes)</label>
                  <select
                    value={drillTime}
                    onChange={(e) => setDrillTime(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value={15}>15 Minutes Quick Express</option>
                    <option value={30}>30 Minutes Standard Workout</option>
                    <option value={45}>45 Minutes Pro Intensity</option>
                    <option value={60}>60 Minutes Full Match Prep</option>
                  </select>
                </div>
              </div>

              <button
                onClick={generateDrillRoutine}
                disabled={isGeneratingDrill}
                className="mt-6 px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-xs tracking-widest rounded-xl transition-all shadow-lg shadow-emerald-500/20 cursor-pointer flex items-center gap-2"
              >
                {isGeneratingDrill ? (
                  <>
                    <Sparkles className="h-4 w-4 animate-spin" /> Synthesizing Practice Plan...
                  </>
                ) : (
                  <>
                    <Dumbbell className="h-4 w-4" /> Generate Practice Plan
                  </>
                )}
              </button>

              {/* Generated Drill Output Box */}
              {generatedDrill && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 p-6 rounded-2xl bg-zinc-900/90 border border-emerald-500/30 text-left"
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                    <div>
                      <span className="text-[10px] text-emerald-400 font-mono uppercase tracking-widest">{generatedDrill.time} • {generatedDrill.focus}</span>
                      <h3 className="text-base font-extrabold text-white mt-0.5">{generatedDrill.title}</h3>
                    </div>
                    <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 text-xs font-bold">
                      Ready to Execute
                    </span>
                  </div>

                  <div className="space-y-3">
                    {generatedDrill.steps.map((step: any, idx: number) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-black/50 border border-white/5 flex items-start gap-3">
                        <div className="h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{step.name}</span>
                            <span className="text-[10px] text-zinc-500 font-mono">({step.duration})</span>
                          </div>
                          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{step.notes}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
      )}
    </section>

      {/* Lesson View Modal Overlay */}
      <AnimatePresence>
        {activeLesson && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl rounded-3xl bg-zinc-950 border border-white/10 overflow-hidden shadow-2xl text-left my-8 max-h-[90vh] flex flex-col"
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveLesson(null)}
                className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/80 text-zinc-400 hover:text-white border border-white/10 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Video Player Mockup Header */}
              <div className="relative h-64 sm:h-80 w-full bg-zinc-900 overflow-hidden shrink-0">
                <img 
                  src={activeLesson.thumbnailUrl} 
                  alt={activeLesson.title}
                  className="w-full h-full object-cover opacity-60"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-black/40 to-black/60 flex flex-col justify-between p-6">
                  <span className="px-3 py-1 rounded-lg bg-emerald-500 text-black text-[10px] font-black uppercase tracking-widest w-fit">
                    {activeLesson.sport.toUpperCase()} • {activeLesson.category}
                  </span>

                  <div className="flex items-center justify-center my-auto">
                    <div className="p-4 rounded-full bg-emerald-500 text-black shadow-2xl shadow-emerald-500/50 animate-pulse">
                      <PlayCircle className="h-10 w-10 fill-black text-emerald-500" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-zinc-300 font-mono">
                    <span>Instructor: <strong className="text-white">{activeLesson.instructor}</strong></span>
                    <span>Duration: <strong className="text-emerald-400">{activeLesson.duration}</strong></span>
                  </div>
                </div>
              </div>

              {/* Lesson Body Content */}
              <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1">
                <div>
                  <h2 className="text-2xl font-black text-white">{activeLesson.title}</h2>
                  <p className="text-xs text-zinc-400 mt-2 leading-relaxed">{activeLesson.description}</p>
                </div>

                {/* Key Takeaways Box */}
                <div className="p-5 rounded-2xl bg-zinc-900 border border-white/5 space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Key Tactical Takeaways
                  </h3>
                  <ul className="space-y-2">
                    {activeLesson.takeaways.map((point, idx) => (
                      <li key={idx} className="text-xs text-zinc-300 flex items-start gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Comprehensive Lesson Article */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">Detailed Lesson Breakdown</h3>
                  <div className="text-xs text-zinc-300 whitespace-pre-line leading-relaxed font-normal bg-black/40 p-4 rounded-xl border border-white/5">
                    {activeLesson.contentBody}
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 font-sans">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => toggleComplete(activeLesson.id)}
                      className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-2 ${
                        completedLessonIds.includes(activeLesson.id)
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-emerald-500 text-black hover:bg-emerald-400 font-extrabold'
                      }`}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {completedLessonIds.includes(activeLesson.id) ? 'Completed Module' : 'Mark as Completed'}
                    </button>

                    {completedLessonIds.includes(activeLesson.id) && (
                      <button
                        onClick={() => setShowCertificateModal(activeLesson.id)}
                        className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 shadow-md font-sans"
                      >
                        <Download className="h-4 w-4" /> Download Certificate
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => setActiveLesson(null)}
                    className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold cursor-pointer"
                  >
                    Close Lesson
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confetti & Success Animation Overlay */}
      <AnimatePresence>
        {confettiEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center p-4 font-sans"
          >
            {/* Ambient Background Glow */}
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1.3, opacity: 0.8 }}
              exit={{ opacity: 0 }}
              className="absolute w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl"
            />

            {/* Floating Multi-Color Particle Stream */}
            {Array.from({ length: 28 }).map((_, i) => {
              const particleColors = ['#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#a855f7', '#34d399', '#fbbf24', '#06b6d4'];
              const pColor = particleColors[i % particleColors.length];
              const pAngle = (i / 28) * 360;
              const pDist = 140 + Math.random() * 160;
              const pX = Math.cos((pAngle * Math.PI) / 180) * pDist;
              const pY = Math.sin((pAngle * Math.PI) / 180) * pDist;

              return (
                <motion.div
                  key={i}
                  initial={{ x: 0, y: 0, scale: 0, rotate: 0, opacity: 1 }}
                  animate={{ 
                    x: pX, 
                    y: pY, 
                    scale: [0, 1.4, 0.8], 
                    rotate: Math.random() * 720 - 360,
                    opacity: [1, 1, 0]
                  }}
                  transition={{ duration: 1.8 + (i % 5) * 0.2, ease: "easeOut" }}
                  style={{ backgroundColor: pColor }}
                  className={`absolute ${i % 2 === 0 ? 'w-3 h-3 rounded-full' : 'w-2.5 h-4 rounded-sm'} shadow-lg`}
                />
              );
            })}

            {/* Success Notification Banner */}
            <motion.div
              initial={{ scale: 0.7, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: -20, opacity: 0 }}
              transition={{ type: 'spring', damping: 15, stiffness: 300 }}
              className="relative bg-zinc-950/95 border-2 border-emerald-500/60 p-6 rounded-3xl shadow-2xl text-center max-w-sm backdrop-blur-xl pointer-events-auto"
            >
              <div className="h-14 w-14 rounded-2xl bg-emerald-500 text-black flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/30 font-sans">
                <Award className="h-8 w-8 text-black" />
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-500/30 mb-2">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" /> Lesson Completed!
              </div>
              <h3 className="text-lg font-black text-white leading-tight">
                {confettiEvent.title}
              </h3>
              <p className="text-xs text-zinc-400 mt-1 font-medium font-sans">
                Progress updated & verified certificate is ready!
              </p>
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-center gap-2">
                <span className="text-[10px] text-emerald-400 font-extrabold font-mono uppercase tracking-widest flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> 100% Certified Status
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quiz Modal Overlay */}
      <AnimatePresence>
        {activeQuiz && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl rounded-3xl bg-zinc-950 border border-white/10 overflow-hidden shadow-2xl text-left p-6 sm:p-8"
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveQuiz(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-zinc-900 text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              {!quizFinished ? (
                <div>
                  <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{activeQuiz.icon}</span>
                      <div>
                        <h3 className="text-base font-extrabold text-white">{activeQuiz.title}</h3>
                        <p className="text-[10px] text-zinc-500 uppercase font-mono">Question {quizQuestionIndex + 1} of {activeQuiz.questions.length}</p>
                      </div>
                    </div>
                  </div>

                  {/* Question Box */}
                  <div className="mb-6">
                    <p className="text-sm font-bold text-white leading-relaxed">
                      {activeQuiz.questions[quizQuestionIndex].question}
                    </p>
                  </div>

                  {/* Options List */}
                  <div className="space-y-3 mb-8">
                    {activeQuiz.questions[quizQuestionIndex].options.map((opt, oIdx) => {
                      const isSelected = userAnswers[quizQuestionIndex] === oIdx;

                      return (
                        <button
                          key={oIdx}
                          onClick={() => handleSelectAnswer(quizQuestionIndex, oIdx)}
                          className={`w-full p-3.5 rounded-xl text-left text-xs font-medium transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 font-bold'
                              : 'bg-zinc-900 border border-white/5 text-zinc-300 hover:bg-zinc-800'
                          }`}
                        >
                          <span>{opt}</span>
                          {isSelected && <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Next / Submit Button */}
                  <button
                    onClick={handleNextQuizQuestion}
                    disabled={userAnswers[quizQuestionIndex] === undefined}
                    className="w-full py-3.5 rounded-xl bg-emerald-500 disabled:bg-zinc-800 text-black disabled:text-zinc-600 font-black uppercase text-xs tracking-widest hover:bg-emerald-400 transition-all cursor-pointer"
                  >
                    {quizQuestionIndex < activeQuiz.questions.length - 1 ? 'Next Question' : 'Submit Quiz & View Results'}
                  </button>
                </div>
              ) : (
                /* Quiz Results Screen */
                <div className="text-center py-4">
                  <div className="h-16 w-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
                    <Trophy className="h-8 w-8" />
                  </div>

                  <h3 className="text-2xl font-black text-white">Quiz Completed!</h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    You scored <strong className="text-emerald-400 text-base font-mono">{userScore}</strong> out of <strong className="text-white font-mono">{activeQuiz.questions.length}</strong> ({(userScore / activeQuiz.questions.length) * 100}%)
                  </p>

                  {(userScore / activeQuiz.questions.length) >= 0.8 ? (
                    <div className="my-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold space-y-1">
                      <p>🎉 Congratulations! You passed with distinction.</p>
                      <p className="text-[10px] text-zinc-300 font-normal">Your digital certificate badge "{activeQuiz.badgeTitle}" has been unlocked!</p>
                    </div>
                  ) : (
                    <div className="my-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
                      <p>Score 80%+ (4/5) to earn your verified certificate badge. Give it another shot!</p>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <button
                      onClick={resetQuiz}
                      className="flex-1 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase tracking-widest cursor-pointer flex items-center justify-center gap-2"
                    >
                      <RotateCcw className="h-4 w-4" /> Retry Quiz
                    </button>

                    {(userScore / activeQuiz.questions.length) >= 0.8 && (
                      <button
                        onClick={() => {
                          const qId = activeQuiz.id;
                          setActiveQuiz(null);
                          setShowCertificateModal(qId);
                        }}
                        className="flex-1 py-3 rounded-xl bg-emerald-500 text-black font-extrabold text-xs uppercase tracking-widest hover:bg-emerald-400 transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Award className="h-4 w-4" /> View Badge
                      </button>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Digital Certified Completion Diploma Modal */}
      <AnimatePresence>
        {showCertificateModal && (() => {
          const currentTrack = CERTIFIED_TRACKS.find(t => t.id === showCertificateModal);
          const currentQuiz = QUIZZES.find(q => q.id === showCertificateModal);
          const certTitle = currentTrack ? currentTrack.title : (currentQuiz ? currentQuiz.badgeTitle : 'GameZM Certified Sports Specialist');
          const certIssuer = currentTrack ? currentTrack.issuer : 'GameZM Sports E-Learning Accreditation Board';
          const certCode = currentTrack ? currentTrack.certificationCode : `GZM-VAL-${Math.floor(100000 + Math.random() * 900000)}`;

          return (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="relative w-full max-w-2xl rounded-3xl bg-zinc-950 border-2 border-amber-500/40 p-6 sm:p-8 text-center overflow-hidden shadow-2xl my-8 max-h-[90vh] overflow-y-auto"
              >
                <button
                  onClick={() => setShowCertificateModal(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-zinc-900 text-zinc-400 hover:text-white cursor-pointer z-20"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-black uppercase tracking-widest border border-amber-500/30 mb-3">
                  <Award className="h-4 w-4 text-amber-400" /> Official Accredited Diploma
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                  Certified Completion Diploma
                </h2>
                <p className="text-xs text-zinc-400 mt-1">Verified Credential issued by {certIssuer}</p>

                {/* Customization Controls Inside Modal */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4 bg-zinc-900/60 p-3 rounded-2xl border border-white/10 text-left">
                  <div>
                    <label className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block mb-1">
                      Student Name on Certificate
                    </label>
                    <input 
                      type="text"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="w-full bg-zinc-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-bold focus:outline-none focus:ring-1 focus:ring-amber-400"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block mb-1">
                      Diploma Theme Style
                    </label>
                    <div className="flex items-center gap-2">
                      {[
                        { id: 'gold', label: '👑 Gold' },
                        { id: 'emerald', label: '💎 Emerald' },
                        { id: 'dark', label: '⚡ Dark Luxe' }
                      ].map(t => (
                        <button
                          key={t.id}
                          onClick={() => setCertificateTheme(t.id as any)}
                          className={`flex-1 py-1.5 rounded-lg text-[10px] font-extrabold cursor-pointer transition-all ${
                            certificateTheme === t.id 
                              ? 'bg-amber-500 text-black shadow-md' 
                              : 'bg-zinc-800 text-zinc-400 hover:text-white'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Print-Ready Official Diploma Layout or Skeleton Loader */}
                {isGeneratingDiploma ? (
                  <div className="p-8 sm:p-12 rounded-2xl bg-zinc-950 border-2 border-amber-500/30 text-center my-4 relative overflow-hidden">
                    <div className="flex flex-col items-center justify-center space-y-4 py-8 relative z-10">
                      <div className="h-16 w-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 animate-spin">
                        <Sparkles className="h-8 w-8" />
                      </div>
                      <div className="space-y-2 max-w-md mx-auto w-full">
                        <div className="h-7 bg-zinc-800 rounded-lg w-3/4 mx-auto animate-pulse" />
                        <div className="h-4 bg-zinc-800/60 rounded-md w-1/2 mx-auto animate-pulse" />
                      </div>
                      <div className="p-4 rounded-2xl bg-black/80 border border-white/10 w-full max-w-md space-y-3">
                        <div className="flex items-center justify-between text-xs text-amber-400 font-mono font-bold">
                          <span>Verifying Accreditation Hash & Status...</span>
                          <span>100% Verified</span>
                        </div>
                        <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-amber-500 via-emerald-400 to-amber-500 w-full animate-pulse" />
                        </div>
                        <p className="text-[10px] text-zinc-400 font-mono">
                          Generating High-Resolution Diploma layout for Certified Candidate: <strong className="text-white">{studentName}</strong>
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={`p-6 sm:p-8 rounded-2xl text-left my-4 relative overflow-hidden border-4 transition-all ${
                    certificateTheme === 'gold' 
                      ? 'bg-gradient-to-br from-amber-950/40 via-zinc-950 to-amber-950/30 border-amber-500/60 text-amber-100 shadow-amber-500/10'
                      : certificateTheme === 'emerald'
                      ? 'bg-gradient-to-br from-emerald-950/40 via-zinc-950 to-emerald-950/30 border-emerald-500/60 text-emerald-100 shadow-emerald-500/10'
                      : 'bg-gradient-to-br from-zinc-900 via-black to-zinc-950 border-zinc-700 text-zinc-100'
                  }`}>
                    {/* Outer Frame Decoration Lines */}
                    <div className="absolute inset-2 border border-white/10 pointer-events-none rounded-xl" />

                    <div className="relative z-10 space-y-4">
                      {/* Diploma Top Header */}
                      <div className="flex items-center justify-between border-b border-white/10 pb-4">
                        <div>
                          <span className="text-2xl font-black text-white tracking-tight">Game<span className="text-amber-400">ZM</span></span>
                          <p className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest">Academy Board of Accreditation</p>
                        </div>
                        <div className="text-right font-mono text-[10px]">
                          <span className="text-amber-400 font-bold block">{certCode}</span>
                          <span className="text-zinc-500 uppercase">Verification Hash: OK</span>
                        </div>
                      </div>

                      {/* Cert Title & Recipient */}
                      <div className="text-center py-4 space-y-2">
                        <p className="text-[10px] uppercase tracking-widest font-bold text-amber-400">Official Diploma of Certified Completion</p>
                        <p className="text-xs text-zinc-400">This certifies that</p>
                        
                        <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white underline decoration-amber-400/60 underline-offset-8 font-mono">
                          {studentName || 'GmaneZM'}
                        </h3>

                        <p className="text-xs text-zinc-400 pt-2">
                          has completed all accredited modules and passed the official examination for:
                        </p>

                        <div className="p-3 rounded-xl bg-black/60 border border-white/10 inline-block mt-1 max-w-lg">
                          <p className="text-base font-black text-amber-300">
                            {certTitle}
                          </p>
                          <p className="text-[10px] text-zinc-400 mt-0.5">Accredited by {certIssuer}</p>
                        </div>
                      </div>

                      {/* Bottom Details Footer */}
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10 text-[10px] font-mono">
                        <div>
                          <p className="text-zinc-500 uppercase">Issue Date:</p>
                          <p className="text-white font-bold">July 28, 2026</p>
                        </div>

                        {/* Official Stamp Box */}
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold text-[9px] uppercase tracking-widest">
                          <ShieldCheck className="h-4 w-4 text-amber-400" />
                          <span>VERIFIED OFFICIAL CREDENTIAL</span>
                        </div>

                        <div className="text-right">
                          <p className="text-zinc-500 uppercase">Authorized Signature:</p>
                          <p className="text-amber-400 font-serif italic text-xs font-bold">Director of GameZM Athletics</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions Row */}
                <div className="flex flex-wrap items-center gap-3 mt-4">
                  <button
                    onClick={() => window.print()}
                    className="flex-1 py-3 rounded-xl bg-amber-500 text-black font-extrabold text-xs uppercase tracking-widest hover:bg-amber-400 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
                  >
                    <Printer className="h-4 w-4" /> Print / Save PDF
                  </button>
                  <button
                    onClick={() => alert('Diploma verification link copied to clipboard!')}
                    className="flex-1 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Share2 className="h-4 w-4" /> Share Credentials
                  </button>
                  <button
                    onClick={() => setShowCertificateModal(null)}
                    className="px-5 py-3 rounded-xl bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white font-bold text-xs cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Admin Login Modal */}
      <AnimatePresence>
        {showAdminModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="relative w-full max-w-md rounded-3xl bg-zinc-950 border-2 border-amber-500/40 p-6 sm:p-8 text-left shadow-2xl overflow-hidden"
            >
              <button
                onClick={() => setShowAdminModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-zinc-900 text-zinc-400 hover:text-white cursor-pointer z-20"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-black uppercase tracking-widest border border-amber-500/30 mb-3">
                <Lock className="h-3.5 w-3.5 text-amber-400" /> Admin Portal Authorization
              </div>

              <h2 className="text-xl font-black text-white uppercase tracking-tight">
                GameZM Admin Sign In
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Enter your administrative credentials to manage E-Learning certifications and users.
              </p>

              <form onSubmit={handleAdminLoginSubmit} className="space-y-4 mt-6">
                <div>
                  <label className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block mb-1.5">
                    User Name
                  </label>
                  <input
                    type="text"
                    value={adminUsernameInput}
                    onChange={(e) => setAdminUsernameInput(e.target.value)}
                    placeholder="GmaneZM"
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-bold focus:outline-none focus:ring-1 focus:ring-amber-400 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    value={adminPasswordInput}
                    onChange={(e) => setAdminPasswordInput(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-bold focus:outline-none focus:ring-1 focus:ring-amber-400 font-mono"
                    required
                  />
                </div>

                {adminAuthStatus.error && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold">
                    ⚠️ {adminAuthStatus.error}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-amber-500 text-black font-extrabold text-xs uppercase tracking-widest hover:bg-amber-400 transition-all cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  Sign In as Admin (GmaneZM)
                </button>
              </form>

              <div className="mt-4 p-3 rounded-xl bg-black/60 border border-white/5 text-[10px] text-zinc-400 font-mono text-center">
                User Name: <strong className="text-amber-400">GmaneZM</strong> • Password: <strong className="text-amber-400">GameZm2026</strong>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};
