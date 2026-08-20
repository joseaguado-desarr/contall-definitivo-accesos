-- Database creation
CREATE DATABASE IF NOT EXISTS access_control_db;
USE access_control_db;

-- Table for local SQL authentication
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for user roles
CREATE TABLE IF NOT EXISTS user_roles (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    role ENUM('admin', 'operator', 'supervisor') NOT NULL DEFAULT 'operator',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, role),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table for user profiles
CREATE TABLE IF NOT EXISTS profiles (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table for persons (residents, employees, contractors)
CREATE TABLE IF NOT EXISTS persons (
    id VARCHAR(36) PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    document VARCHAR(50) NOT NULL UNIQUE,
    type ENUM('resident', 'employee', 'contractor') NOT NULL DEFAULT 'resident',
    photo_url TEXT,
    status ENUM('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active',
    phone VARCHAR(20),
    email VARCHAR(255),
    unit VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table for visits
CREATE TABLE IF NOT EXISTS visits (
    id VARCHAR(36) PRIMARY KEY,
    visitor_name VARCHAR(255) NOT NULL,
    visitor_document VARCHAR(50) NOT NULL,
    visitor_phone VARCHAR(20),
    vehicle_plate VARCHAR(20),
    host_id VARCHAR(36),
    host_name VARCHAR(255),
    reason TEXT,
    entry_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    exit_time TIMESTAMP NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'inside',
    created_by VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (host_id) REFERENCES persons(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Table for access logs
CREATE TABLE IF NOT EXISTS access_logs (
    id VARCHAR(36) PRIMARY KEY,
    person_id VARCHAR(36),
    visit_id VARCHAR(36),
    method ENUM('facial', 'qr', 'manual', 'card') NOT NULL DEFAULT 'manual',
    result ENUM('authorized', 'denied', 'pending') NOT NULL DEFAULT 'authorized',
    direction ENUM('entry', 'exit') NOT NULL DEFAULT 'entry',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (person_id) REFERENCES persons(id) ON DELETE SET NULL,
    FOREIGN KEY (visit_id) REFERENCES visits(id) ON DELETE SET NULL
);

-- Table for schedules
CREATE TABLE IF NOT EXISTS schedules (
    id VARCHAR(36) PRIMARY KEY,
    person_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    days JSON, -- MySQL 5.7+ supports JSON
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (person_id) REFERENCES persons(id) ON DELETE CASCADE
);

-- Table for blacklist
CREATE TABLE IF NOT EXISTS blacklist (
    id VARCHAR(36) PRIMARY KEY,
    document VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    reason TEXT NOT NULL,
    created_by VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);
