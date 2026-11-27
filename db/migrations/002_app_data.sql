CREATE TABLE hotels (
  id varchar(100) PRIMARY KEY,
  data jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by_user_id uuid REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX hotels_country_city_idx ON hotels ((data->>'country'), (data->>'city'));

CREATE TABLE app_destinations (
  id varchar(32) PRIMARY KEY CHECK (id = 'main'),
  data jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by_user_id uuid REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE app_user_preferences (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  favorites text[] NOT NULL DEFAULT '{}',
  favorite_notes jsonb NOT NULL DEFAULT '{}'::jsonb,
  recently_viewed_ids text[] NOT NULL DEFAULT '{}',
  compare_ids text[] NOT NULL DEFAULT '{}',
  theme varchar(8) NOT NULL DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (cardinality(compare_ids) <= 3)
);

CREATE TABLE hotel_reviews (
  id uuid PRIMARY KEY,
  hotel_id varchar(100) NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text varchar(2000) NOT NULL CHECK (length(trim(review_text)) > 0),
  status varchar(24) NOT NULL DEFAULT 'pending_review'
    CHECK (status IN ('pending_review', 'published', 'rejected')),
  admin_reply varchar(1000),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (hotel_id, user_id)
);
CREATE INDEX hotel_reviews_hotel_status_idx ON hotel_reviews(hotel_id, status, created_at DESC);
CREATE INDEX hotel_reviews_user_idx ON hotel_reviews(user_id, created_at DESC);

CREATE TABLE hotel_review_likes (
  review_id uuid NOT NULL REFERENCES hotel_reviews(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (review_id, user_id)
);

CREATE TABLE catalog_price_batches (
  id uuid PRIMARY KEY,
  admin_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  country varchar(100) NOT NULL,
  percent numeric(7, 2) NOT NULL,
  changes jsonb NOT NULL,
  undone_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX catalog_price_batches_admin_created_idx ON catalog_price_batches(admin_user_id, created_at DESC);
