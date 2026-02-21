-- Notifications for users (e.g. agent assigned to property).
USE realestate;

CREATE TABLE IF NOT EXISTS notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL COMMENT 'recipient (e.g. agent)',
  type VARCHAR(50) NOT NULL DEFAULT 'info' COMMENT 'e.g. assignment, inquiry',
  title VARCHAR(255) NOT NULL,
  body TEXT,
  related_entity_type VARCHAR(50) NULL COMMENT 'e.g. property, inquiry',
  related_entity_id INT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_user_read (user_id, is_read),
  INDEX idx_created (created_at DESC),

  CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SELECT 'notifications table ready' AS message;
