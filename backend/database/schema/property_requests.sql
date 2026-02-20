-- Setup script for Agent -> Builder property approval requests
-- Run this in your MySQL database

-- Use the same DB you use for the app (adjust name if needed)
-- Example:
-- USE realestate_db;

CREATE TABLE IF NOT EXISTS property_requests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  property_id INT NOT NULL,
  agent_id INT NOT NULL,
  builder_id INT NOT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  rejection_reason TEXT,
  responded_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
  FOREIGN KEY (agent_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (builder_id) REFERENCES users(id) ON DELETE CASCADE,

  UNIQUE KEY uq_property_request (property_id),
  INDEX idx_builder_status (builder_id, status),
  INDEX idx_agent_status (agent_id, status)
);

SELECT 'Property requests table setup complete!' AS message;

