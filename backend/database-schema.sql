-- -- Create users table
-- CREATE TABLE IF NOT EXISTS users (
--     id INT PRIMARY KEY AUTO_INCREMENT,
--     name VARCHAR(255) NOT NULL,
--     email VARCHAR(255) UNIQUE NOT NULL,
--     phone VARCHAR(20) UNIQUE,
--     password VARCHAR(255),
--     role ENUM('buyer', 'builder', 'agent', 'admin') DEFAULT 'buyer',
--     profile_image LONGTEXT,
--     google_id VARCHAR(255) UNIQUE,
--     microsoft_id VARCHAR(255) UNIQUE,
--     is_verified BOOLEAN DEFAULT FALSE,
--     email_verified_at TIMESTAMP NULL,
--     is_blocked BOOLEAN DEFAULT FALSE,
--     account_locked_until TIMESTAMP NULL,
--     last_login TIMESTAMP NULL,
--     last_login_ip VARCHAR(45),
--     password_changed_at TIMESTAMP NULL,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
--     INDEX idx_email (email),
--     INDEX idx_phone (phone),
--     INDEX idx_role (role)
-- );

-- -- Create builders table
-- CREATE TABLE IF NOT EXISTS builders (
--     id INT PRIMARY KEY AUTO_INCREMENT,
--     user_id VARCHAR(255) UNIQUE NOT NULL,
--     name VARCHAR(255) NOT NULL,
--     email VARCHAR(255) UNIQUE NOT NULL,
--     phone VARCHAR(20) UNIQUE NOT NULL,
--     password VARCHAR(255) NOT NULL,
--     profile_image LONGTEXT,
--     company_name VARCHAR(255),
--     gst_or_pan VARCHAR(255),
--     website VARCHAR(255),
--     description LONGTEXT,
--     experience_years INT,
--     address LONGTEXT,
--     city VARCHAR(100),
--     state VARCHAR(100),
--     pincode VARCHAR(10),
--     role VARCHAR(50) DEFAULT 'builder',
--     is_active BOOLEAN DEFAULT TRUE,
--     verification_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
--     INDEX idx_email (email),
--     INDEX idx_phone (phone),
--     INDEX idx_user_id (user_id)
-- );

-- -- Create otp_verifications table
-- CREATE TABLE IF NOT EXISTS otp_verifications (
--     id INT PRIMARY KEY AUTO_INCREMENT,
--     user_id INT,
--     email VARCHAR(255) NOT NULL,
--     phone VARCHAR(20),
--     otp VARCHAR(6) NOT NULL,
--     purpose VARCHAR(50) DEFAULT 'email_verification',
--     is_used BOOLEAN DEFAULT FALSE,
--     attempts INT DEFAULT 0,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     expires_at TIMESTAMP,
--     verified_at TIMESTAMP NULL,
--     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
--     INDEX idx_email (email),
--     INDEX idx_purpose (purpose)
-- );

-- -- Create user_login_logs table
-- CREATE TABLE IF NOT EXISTS user_login_logs (
--     id INT PRIMARY KEY AUTO_INCREMENT,
--     user_id INT,
--     login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     logout_time TIMESTAMP NULL,
--     login_method VARCHAR(50) DEFAULT 'email',
--     ip_address VARCHAR(45),
--     user_agent LONGTEXT,
--     device_type VARCHAR(50),
--     browser VARCHAR(100),
--     os VARCHAR(100),
--     activity_type VARCHAR(100),
--     description LONGTEXT,
--     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
--     INDEX idx_user_id (user_id),
--     INDEX idx_login_time (login_time),
--     INDEX idx_activity_type (activity_type)
-- );

-- -- Create security_alerts table
-- CREATE TABLE IF NOT EXISTS security_alerts (
--     id INT PRIMARY KEY AUTO_INCREMENT,
--     user_id INT NOT NULL,
--     alert_type VARCHAR(100),
--     severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
--     ip_address VARCHAR(45),
--     details LONGTEXT,
--     is_resolved BOOLEAN DEFAULT FALSE,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     resolved_at TIMESTAMP NULL,
--     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
--     INDEX idx_user_id (user_id),
--     INDEX idx_alert_type (alert_type),
--     INDEX idx_severity (severity)
-- );

-- -- Create blocked_ips table
-- CREATE TABLE IF NOT EXISTS blocked_ips (
--     id INT PRIMARY KEY AUTO_INCREMENT,
--     ip_address VARCHAR(45) UNIQUE NOT NULL,
--     reason VARCHAR(255),
--     blocked_until TIMESTAMP,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     INDEX idx_ip_address (ip_address),
--     INDEX idx_blocked_until (blocked_until)
-- );


use RealEstate;


CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,

  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) DEFAULT NULL,

  password VARCHAR(255) NOT NULL,

  role ENUM('buyer','builder','agent','admin') NOT NULL,

  is_blocked BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY uq_email (email),
  UNIQUE KEY uq_phone (phone),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS builders (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,

  user_id INT NOT NULL,   -- FK to users.id

  company_name VARCHAR(255) NOT NULL,
  gst_or_pan VARCHAR(50) NOT NULL,

  website VARCHAR(255),
  description TEXT,
  experience_years INT,

  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(10),

  profile_image VARCHAR(500),

  gst_document VARCHAR(500),
  pan_document VARCHAR(500),
  registration_certificate VARCHAR(500),

  verification_status ENUM('pending','verified','rejected') DEFAULT 'pending',
  verified_at TIMESTAMP NULL,
  rejected_reason TEXT,

  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY uq_user (user_id),
  INDEX idx_verification_status (verification_status),
  INDEX idx_city_state (city, state),

  CONSTRAINT fk_builder_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE builders
ADD COLUMN address_line1 VARCHAR(255) AFTER experience_years,
ADD COLUMN address_line2 VARCHAR(255) AFTER address_line1,
ADD COLUMN landmark VARCHAR(255) AFTER address_line2,
ADD COLUMN area VARCHAR(150) AFTER landmark,
ADD COLUMN district VARCHAR(100) AFTER city,
ADD COLUMN country VARCHAR(100) DEFAULT 'India' AFTER state;

desc builders;
alter table builders add column pan_no varchar(10);
alter table builders 
drop column address_line1,
drop column address_line2;
select * from builders;
select * from users;

UPDATE builders
SET verification_status = 'verified'
WHERE id = 4;


CREATE TABLE property_types (
  id INT AUTO_INCREMENT PRIMARY KEY,

  name VARCHAR(50) NOT NULL UNIQUE,
  category ENUM('residential','commercial','land') NOT NULL,

  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE properties (
  id INT AUTO_INCREMENT PRIMARY KEY,

  title VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,

  price DECIMAL(12,2) NOT NULL,
  listing_type ENUM('sale','rent') NOT NULL,

  property_type_id INT NOT NULL,

  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  pincode VARCHAR(10),

  area_sqft DECIMAL(10,2),
  bedrooms INT,
  bathrooms INT,

  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),

  uploaded_by INT NOT NULL,
  uploaded_by_role ENUM('builder','agent') NOT NULL,

  is_verified BOOLEAN DEFAULT FALSE,
  status ENUM('active','blocked','sold') DEFAULT 'active',

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_property_type
    FOREIGN KEY (property_type_id)
    REFERENCES property_types(id),

  CONSTRAINT fk_property_user
    FOREIGN KEY (uploaded_by)
    REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE property_images (
  id INT AUTO_INCREMENT PRIMARY KEY,

  property_id INT NOT NULL,
  image_url TEXT NOT NULL,

  is_primary BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0,

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_property_image
    FOREIGN KEY (property_id)
    REFERENCES properties(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE property_features (
  id INT AUTO_INCREMENT PRIMARY KEY,

  property_id INT NOT NULL,
  feature_name VARCHAR(100) NOT NULL,
  feature_value VARCHAR(255),

  CONSTRAINT fk_property_feature
    FOREIGN KEY (property_id)
    REFERENCES properties(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;


CREATE TABLE property_documents (
  id INT AUTO_INCREMENT PRIMARY KEY,

  property_id INT NOT NULL,
  government_approval VARCHAR(255),
  property_code VARCHAR(100),
  supporting_document_url TEXT,

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_property_document
    FOREIGN KEY (property_id)
    REFERENCES properties(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS otp_verifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    otp VARCHAR(6) NOT NULL,
    purpose VARCHAR(50) DEFAULT 'email_verification',
    is_used BOOLEAN DEFAULT FALSE,
    attempts INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    verified_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_email (email),
    INDEX idx_purpose (purpose)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS user_login_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    logout_time TIMESTAMP NULL,
    login_method VARCHAR(50) DEFAULT 'email',
    ip_address VARCHAR(45),
    user_agent LONGTEXT,
    device_type VARCHAR(50),
    browser VARCHAR(100),
    os VARCHAR(100),
    activity_type VARCHAR(100),
    description LONGTEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_login_time (login_time),
    INDEX idx_activity_type (activity_type)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS security_alerts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    alert_type VARCHAR(100),
    severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    ip_address VARCHAR(45),
    details LONGTEXT,
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_alert_type (alert_type),
    INDEX idx_severity (severity)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS blocked_ips (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ip_address VARCHAR(45) UNIQUE NOT NULL,
    reason VARCHAR(255),
    blocked_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_ip_address (ip_address),
    INDEX idx_blocked_until (blocked_until)
) ENGINE=InnoDB;
