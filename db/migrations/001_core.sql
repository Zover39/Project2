CREATE TABLE users (
  id uuid PRIMARY KEY,
  name varchar(100) NOT NULL,
  phone_e164 varchar(16) NOT NULL UNIQUE,
  email varchar(254),
  role varchar(16) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  is_banned boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (length(trim(name)) >= 2),
  CHECK (email IS NULL OR length(email) <= 254)
);

CREATE TABLE sessions (
  token_hash char(64) PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX sessions_user_id_idx ON sessions(user_id);
CREATE INDEX sessions_expires_at_idx ON sessions(expires_at);

CREATE TABLE phone_verification_challenges (
  phone_e164 varchar(16) PRIMARY KEY,
  code_salt char(32) NOT NULL,
  code_hash char(128) NOT NULL,
  expires_at timestamptz NOT NULL,
  attempts smallint NOT NULL DEFAULT 0 CHECK (attempts BETWEEN 0 AND 5),
  last_sent_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE auth_rate_limits (
  key_hash char(64) PRIMARY KEY,
  window_started_at timestamptz NOT NULL,
  hits integer NOT NULL CHECK (hits >= 0)
);

CREATE TABLE bookings (
  id uuid PRIMARY KEY,
  owner_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  hotel_snapshot jsonb NOT NULL,
  trip jsonb NOT NULL,
  price numeric(14, 2) NOT NULL CHECK (price >= 0),
  status varchar(24) NOT NULL CHECK (
    status IN ('pending_demo', 'confirmed_demo', 'completed_demo', 'cancelled_demo', 'rejected_demo')
  ),
  payment_mode varchar(16) NOT NULL DEFAULT 'demo' CHECK (payment_mode = 'demo'),
  cancellation jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX bookings_owner_created_idx ON bookings(owner_user_id, created_at DESC);
CREATE INDEX bookings_status_idx ON bookings(status);

CREATE TABLE booking_travelers (
  id uuid PRIMARY KEY,
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  name varchar(100) NOT NULL,
  traveler_type varchar(8) NOT NULL CHECK (traveler_type IN ('adult', 'child')),
  phone_e164 varchar(16),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (length(trim(name)) >= 2)
);
CREATE INDEX booking_travelers_booking_idx ON booking_travelers(booking_id);

CREATE TABLE booking_invites (
  id uuid PRIMARY KEY,
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  invited_phone_e164 varchar(16) NOT NULL,
  traveler_ids uuid[] NOT NULL,
  status varchar(16) NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'accepted', 'declined', 'revoked')
  ),
  invited_by_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  accepted_by_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  accepted_at timestamptz,
  UNIQUE (booking_id, invited_phone_e164)
);
CREATE INDEX booking_invites_phone_status_idx ON booking_invites(invited_phone_e164, status);
CREATE INDEX booking_invites_accepted_by_idx ON booking_invites(accepted_by_user_id, status);

CREATE TABLE booking_status_history (
  id uuid PRIMARY KEY,
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  status varchar(24) NOT NULL,
  changed_by_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  note varchar(500) NOT NULL DEFAULT '',
  changed_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX booking_status_history_booking_idx ON booking_status_history(booking_id, changed_at);

CREATE TABLE booking_invite_history (
  id uuid PRIMARY KEY,
  invite_id uuid NOT NULL REFERENCES booking_invites(id) ON DELETE CASCADE,
  action varchar(24) NOT NULL CHECK (action IN ('created', 'accepted', 'declined', 'resent', 'revoked', 'profile_deleted')),
  changed_by_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  changed_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX booking_invite_history_invite_idx ON booking_invite_history(invite_id, changed_at);

CREATE TABLE audit_events (
  id uuid PRIMARY KEY,
  actor_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  action varchar(80) NOT NULL,
  subject_type varchar(40) NOT NULL,
  subject_id varchar(80) NOT NULL,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX audit_events_created_idx ON audit_events(created_at DESC);
