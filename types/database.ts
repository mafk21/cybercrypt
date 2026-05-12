export type Profile = {
  id: string;
  username: string;
  avatar: string | null;
  points: number;
  banned?: boolean;
  created_at: string;
};

export type UserRole = {
  id: string;
  user_id: string;
  role: 'user' | 'admin';
};

export type Challenge = {
  id: string;
  title: string;
  description: string;
  cipher_type: string;
  ciphertext: string;
  solution: string;
  points: number;
  difficulty: string;
  hints: string[];
  tags?: string[];
  active: boolean;
  created_at: string;
};

export type Submission = {
  id: string;
  user_id: string;
  challenge_id: string;
  answer: string;
  correct: boolean;
  points_awarded: number;
  submitted_at: string;
};

export type ChallengeAttempt = {
  id: string;
  user_id: string;
  challenge_id: string;
  attempt_count: number;
  last_attempt_at: string;
  cooldown_until: string | null;
};

export type SecurityLog = {
  id: string;
  user_id: string | null;
  action: string;
  details: string;
  ip_address: string;
  created_at: string;
};