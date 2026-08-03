-- Create ENUMs for strict state management
CREATE TYPE item_category AS ENUM ('COLLECTION', 'FOR_SALE');
CREATE TYPE item_status AS ENUM ('AVAILABLE', 'RESERVED', 'SOLD');

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
    condition_card SMALLINT CHECK (condition_card BETWEEN 1 AND 10),
    condition_bubble SMALLINT CHECK (condition_bubble BETWEEN 1 AND 10),
    purchase_price NUMERIC(12, 2) NOT NULL CHECK (purchase_price >= 0),
    selling_price NUMERIC(12, 2) DEFAULT NULL CHECK (selling_price >= 0),
    category item_category NOT NULL DEFAULT 'FOR_SALE',
    status item_status NOT NULL DEFAULT 'AVAILABLE',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_items_catalog FOREIGN KEY (catalog_id) 
        REFERENCES catalogs(id) ON DELETE RESTRICT
);

-- Indexes for query optimization
CREATE INDEX idx_items_catalog_id ON items(catalog_id);
CREATE INDEX idx_items_status_category ON items(status, category);