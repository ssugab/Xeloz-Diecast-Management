-- Reset tables if re-running
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS items CASCADE;
DROP TABLE IF EXISTS catalogs CASCADE;
DROP TYPE IF EXISTS item_category CASCADE;
DROP TYPE IF EXISTS item_status CASCADE;
DROP TYPE IF EXISTS transaction_platform CASCADE;

-- Create ENUMs for strict state management
CREATE TYPE item_status AS ENUM ('FOR_SALE', 'ON_BOOK', 'SOLD', 'IN_COLLECTION');
CREATE TYPE transaction_platform AS ENUM ('SHOPEE', 'FB_COD', 'IG', 'OTHER');

-- Table: Catalogs
CREATE TABLE IF NOT EXISTS catalogs (
    id SERIAL PRIMARY KEY,
    brand VARCHAR(100) NOT NULL,
    casting_name VARCHAR(150) NOT NULL,
    scale VARCHAR(10) DEFAULT '1:64',
    series VARCHAR(100),
    release_year SMALLINT CHECK (release_year >= 1968 AND release_year <= EXTRACT(YEAR FROM CURRENT_DATE) + 1),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Table: Items
CREATE TABLE IF NOT EXISTS items (
    id SERIAL PRIMARY KEY,
    catalog_id INT NOT NULL,
    condition_card VARCHAR(30) DEFAULT 'MINT', -- contoh: 'MINT', 'NOT_MINT', 'LOOSE', 'CREASE'
    condition_bubble VARCHAR(30) DEFAULT 'MINT', -- contoh: 'MINT', 'DENTED', 'CRACKED', 'LOOSE'
    purchase_price NUMERIC(12, 2) NOT NULL CHECK (purchase_price >= 0),
    selling_price NUMERIC(12, 2) DEFAULT NULL CHECK (selling_price >= 0),
    stock INT NOT NULL DEFAULT 1 CHECK (stock >= 0),
    status item_status NOT NULL DEFAULT 'FOR_SALE',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_items_catalog FOREIGN KEY (catalog_id) 
        REFERENCES catalogs(id) ON DELETE RESTRICT
);

-- Indexes for query optimization
CREATE INDEX idx_items_catalog_id ON items(catalog_id);
CREATE INDEX idx_items_status ON items(status);

-- Table: Transactions
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    item_id INT NOT NULL UNIQUE,
    platform transaction_platform NOT NULL DEFAULT 'OTHER',
    actual_selling_price NUMERIC(12, 2) NOT NULL CHECK (actual_selling_price >= 0),
    profit NUMERIC(12, 2) NOT NULL,
    transaction_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_transactions_item FOREIGN KEY (item_id) 
        REFERENCES items(id) ON DELETE RESTRICT
);