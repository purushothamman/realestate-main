-- Builder-Agent hire requests: pending until agent accepts/rejects.
USE realestate;

CREATE TABLE IF NOT EXISTS builder_agent_requests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  builder_id INT NOT NULL COMMENT 'users.id of the builder',
  agent_id INT NOT NULL COMMENT 'users.id of the agent',
  status ENUM('pending','accepted','rejected') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  decided_at TIMESTAMP NULL,

  INDEX idx_agent_status (agent_id, status, created_at),
  INDEX idx_builder (builder_id),

  CONSTRAINT fk_bar_builder FOREIGN KEY (builder_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_bar_agent FOREIGN KEY (agent_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SELECT 'builder_agent_requests table ready' AS message;

