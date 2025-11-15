-- Step 1: Fix products table - Add missing columns
ALTER TABLE products
ADD COLUMN IF NOT EXISTS price_regular DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS weight DECIMAL(8,2),
ADD COLUMN IF NOT EXISTS dimensions VARCHAR(50),
ADD COLUMN IF NOT EXISTS meta_title VARCHAR(255),
ADD COLUMN IF NOT EXISTS meta_description TEXT;