-- Which agent is assigned to which property (builder's properties only).
-- One agent per property; builder_id = who owns the property (uploaded_by).
USE realestate;

CREATE TABLE IF NOT EXISTS property_agent_assignments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  property_id INT NOT NULL,
  agent_id INT NOT NULL,
  builder_id INT NOT NULL COMMENT 'owner of the property (uploaded_by)',
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE KEY uq_property (property_id),
  INDEX idx_builder (builder_id),
  INDEX idx_agent (agent_id),

  CONSTRAINT fk_paa_property FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
  CONSTRAINT fk_paa_agent FOREIGN KEY (agent_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_paa_builder FOREIGN KEY (builder_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SELECT 'property_agent_assignments table ready' AS message;
