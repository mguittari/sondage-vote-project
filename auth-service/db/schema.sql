CREATE TABLE IF NOT EXISTS utilisateurs (
  id                UUID PRIMARY KEY,
  email             VARCHAR(254) NOT NULL UNIQUE,
  hash_mot_de_passe VARCHAR(200) NOT NULL,
  role              VARCHAR(20) NOT NULL
);
