-- TABLE USERS
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  username VARCHAR(50) UNIQUE,
  wallet_address VARCHAR(42),
  faucetpay_email VARCHAR(255),
  referral_code VARCHAR(10) UNIQUE NOT NULL,
  referred_by UUID REFERENCES users(id),
  tier VARCHAR(10) DEFAULT 'bronze',
  is_verified BOOLEAN DEFAULT false,
  withdrawal_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP DEFAULT NOW(),
  last_ip VARCHAR(45),
  device_id VARCHAR(255)
);

-- TABLE BALANCES
CREATE TABLE IF NOT EXISTS balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  frz_balance DECIMAL(20,8) DEFAULT 0,
  reserved_balance DECIMAL(20,8) DEFAULT 0,
  total_mined DECIMAL(20,8) DEFAULT 0,
  total_withdrawn DECIMAL(20,8) DEFAULT 0,
  today_earned DECIMAL(20,8) DEFAULT 0,
  total_mining_count INTEGER DEFAULT 0,
  last_reset_date DATE DEFAULT CURRENT_DATE,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- TABLE MINING SESSIONS
CREATE TABLE IF NOT EXISTS mining_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  amount_earned DECIMAL(20,8) DEFAULT 1.0,
  ad_type VARCHAR(20),
  ad_verified BOOLEAN DEFAULT false,
  ad_token VARCHAR(255),
  cooldown_until TIMESTAMP,
  status VARCHAR(20) DEFAULT 'pending'
);

-- TABLE TRANSACTIONS
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(30) NOT NULL,
  amount DECIMAL(20,8) NOT NULL,
  status VARCHAR(20) DEFAULT 'completed',
  reference_id UUID,
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- TABLE WITHDRAWALS
CREATE TABLE IF NOT EXISTS withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount_requested DECIMAL(20,8) NOT NULL,
  reserve_amount DECIMAL(20,8) NOT NULL,
  fee_amount DECIMAL(20,8) NOT NULL,
  amount_sent DECIMAL(20,8) NOT NULL,
  payment_method VARCHAR(20) NOT NULL,
  payment_address VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  withdrawal_number INTEGER NOT NULL,
  admin_note VARCHAR(255),
  requested_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP
);

-- TABLE REFERRALS
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  referred_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  level INTEGER NOT NULL,
  total_earned DECIMAL(20,8) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- TABLE APP CONFIG (pour le dashboard admin)
CREATE TABLE IF NOT EXISTS app_config (
  key VARCHAR(100) PRIMARY KEY,
  value VARCHAR(255) NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- VALEURS PAR DÉFAUT DE LA CONFIG
INSERT INTO app_config (key, value) VALUES
  ('rebel_price_usd', '0.002'),
  ('mining_reward', '1.0'),
  ('signup_bonus', '0.5'),
  ('mining_cooldown_minutes', '20'),
  ('mining_animation_seconds', '300'),
  ('withdrawal_minimum', '10.0'),
  ('withdrawal_cooldown_hours', '48'),
  ('reserve_percent', '10'),
  ('fee_percent', '3'),
  ('faucetpay_threshold_usd', '2.0'),
  ('referral_minimum_usd', '1.0'),
  ('banner_enabled', 'true'),
  ('token_launch_message', 'Le token REBEL n''est pas encore lancé sur la blockchain. Prix actuel : 0.002$ par REBEL.')
ON CONFLICT (key) DO NOTHING;

-- INDEX POUR LES PERFORMANCES
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);
CREATE INDEX IF NOT EXISTS idx_mining_sessions_user_id ON mining_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_user_id ON withdrawals(user_id);