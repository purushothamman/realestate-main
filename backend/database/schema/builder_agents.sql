-- Builder-Agent relationship: builders "hire" existing registered agents.
-- No duplicate user records; agent_id references users.id (role=agent).
USE realestate;

CREATE TABLE IF NOT EXISTS builder_agents (
  id INT PRIMARY KEY AUTO_INCREMENT,
  builder_id INT NOT NULL COMMENT 'users.id of the builder',
  agent_id INT NOT NULL COMMENT 'users.id of the agent',
  hired_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE KEY uq_builder_agent (builder_id, agent_id),
  INDEX idx_builder (builder_id),
  INDEX idx_agent (agent_id),

  CONSTRAINT fk_ba_builder FOREIGN KEY (builder_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_ba_agent FOREIGN KEY (agent_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SELECT 'builder_agents table ready' AS message;
