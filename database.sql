-- ==========================================================
-- APARTMENT MANAGEMENT DATABASE SCRIPT FOR MYSQL WORKBENCH
-- Developer: S. Sai Chandrika (Roll No: 25ATA05L40)
-- Institution: GPCET Web Technology Lab
-- Topic: Apartment Management & Housing Portal
-- ==========================================================

-- 1. Create the Database
CREATE DATABASE IF NOT EXISTS apartment_db;
USE apartment_db;

-- 2. Create the Apartments Table
CREATE TABLE IF NOT EXISTS apartments (
    apartment_id INT PRIMARY KEY AUTO_INCREMENT,
    flat_no VARCHAR(50) NOT NULL,
    apartment_name VARCHAR(255) NOT NULL,
    bhk_type VARCHAR(50) NOT NULL,
    rent_price DECIMAL(10, 2) NOT NULL,
    location VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'Available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Insert Realistic Initial Sample Records
INSERT INTO apartments (flat_no, apartment_name, bhk_type, rent_price, location, status) VALUES
('Flat 302 - Block A', 'Green Valley Heights', '3 BHK', 32000.00, 'Kurnool (Near GPCET)', 'Available'),
('Flat 104 - Block B', 'Royal Palms Luxury Enclave', '2 BHK', 24000.00, 'Hyderabad (Hitec City)', 'Occupied'),
('Flat 501 - Penthouse', 'Skyline Horizon Towers', '4 BHK', 65000.00, 'Bangalore (Whitefield)', 'Available'),
('Flat 203 - Block C', 'Sai Balaji Residency', '2 BHK', 18500.00, 'Kurnool (Nandyal Road)', 'Available'),
('Flat 405 - Block A', 'Godrej Woods County', '3 BHK', 38000.00, 'Hyderabad (Gachibowli)', 'Occupied'),
('Studio 12 - Ground', 'Urban Prime Living', '1 BHK', 12500.00, 'Bangalore (Electronic City)', 'Available'),
('Flat 208 - Block D', 'Prestige Silver Crest', '3 BHK', 42000.00, 'Hyderabad (Kondapur)', 'Available'),
('Flat 101 - Block B', 'Sri Sai Nilayam Apartments', '2 BHK', 16000.00, 'Kurnool (Joharapuram)', 'Maintenance');

-- 4. Verify table and sample data
SELECT * FROM apartments;
