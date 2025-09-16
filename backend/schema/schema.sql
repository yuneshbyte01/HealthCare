-- ======================
-- HEALTHCARE APPOINTMENT SYSTEM SCHEMA
-- Proposal-Aligned Database Design for Rural Nepal
-- ======================

-- ======================
-- USERS (Base Table)
-- ======================
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role VARCHAR(20) CHECK (role IN ('patient','clinic_staff','admin')) NOT NULL,
  phone VARCHAR(20),
  preferred_language VARCHAR(20) DEFAULT 'nepali',
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);

-- ======================
-- PATIENTS (Extension of User)
-- ======================
CREATE TABLE patients (
  patient_id INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  date_of_birth DATE,
  gender VARCHAR(10),
  address TEXT,
  blood_group VARCHAR(5),
  allergies TEXT,
  chronic_conditions TEXT,
  emergency_contact VARCHAR(50)
);

-- ======================
-- CLINICS (Pilot & Scalability)
-- ======================
CREATE TABLE clinics (
  clinic_id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  location TEXT NOT NULL,
  contact_number VARCHAR(20),
  capacity INT
);

-- ======================
-- CLINIC STAFF (Extension of User)
-- ======================
CREATE TABLE clinic_staff (
  staff_id INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  position VARCHAR(20) NOT NULL, -- doctor, nurse, assistant
  specialization VARCHAR(100),
  license_number VARCHAR(50),
  experience_years INT,
  clinic_id INT REFERENCES clinics(clinic_id)
);

-- ======================
-- ADMINS (Governance & Compliance)
-- ======================
CREATE TABLE admins (
  admin_id INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  department VARCHAR(100),
  access_level VARCHAR(50),
  last_login TIMESTAMP,
  permissions JSONB, -- e.g., {"manage_users": true, "delete_logs": false}
  notes TEXT
);

-- ======================
-- APPOINTMENTS (Scheduling & AI)
-- ======================
CREATE TABLE appointments (
  id SERIAL PRIMARY KEY,
  patient_id INT REFERENCES patients(patient_id) ON DELETE CASCADE,
  staff_id INT REFERENCES clinic_staff(staff_id),
  clinic_id INT REFERENCES clinics(clinic_id),
  date TIMESTAMP NOT NULL,
  status VARCHAR(20) DEFAULT 'scheduled', -- scheduled, completed, cancelled
  urgency VARCHAR(20), -- AI triage: urgent, moderate, routine
  no_show_risk NUMERIC(3,2), -- probability from AI model (0.00–1.00)
  symptoms TEXT, -- Added symptoms field for AI triage
  synced BOOLEAN DEFAULT false, -- for offline sync
  last_updated TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ======================
-- INDEXES (Performance)
-- ======================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_patients_address ON patients(address);
CREATE INDEX idx_staff_clinic ON clinic_staff(clinic_id);
CREATE INDEX idx_appointments_date ON appointments(date);
CREATE INDEX idx_appointments_urgency ON appointments(urgency);

-- ======================
-- SAMPLE DATA (For Testing)
-- ======================

-- Insert sample clinic
INSERT INTO clinics (name, location, contact_number, capacity) VALUES 
('Rural Health Center', 'Pokhara, Nepal', '+977-61-123456', 50);

-- Insert sample admin user
INSERT INTO users (name, email, password, role, phone, preferred_language) VALUES 
('Admin User', 'admin@healthcare.np', '$2b$10$example_hash', 'admin', '+977-98-1234567', 'nepali');

-- Insert sample clinic staff
INSERT INTO users (name, email, password, role, phone, preferred_language) VALUES 
('Dr. Ram Shrestha', 'dr.ram@healthcare.np', '$2b$10$example_hash', 'clinic_staff', '+977-98-2345678', 'nepali');

-- Insert sample patient
INSERT INTO users (name, email, password, role, phone, preferred_language) VALUES 
('Patient Test', 'patient@test.np', '$2b$10$example_hash', 'patient', '+977-98-3456789', 'nepali');

-- ======================
-- COMMENTS & DOCUMENTATION
-- ======================

-- This schema supports:
-- 1. Multi-role user system (patients, clinic staff, admins)
-- 2. AI-powered appointment scheduling with urgency classification
-- 3. No-show prediction with probability scores
-- 4. Offline synchronization capabilities
-- 5. Scalable clinic management for rural deployment
-- 6. Performance optimization with strategic indexes
-- 7. GDPR/HIPAA compliance with proper data relationships
