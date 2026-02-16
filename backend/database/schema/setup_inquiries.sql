-- Setup script for inquiry system
-- Run this in your MySQL database

USE realestate_db;

-- Create inquiries table
CREATE TABLE IF NOT EXISTS inquiries (
  id INT PRIMARY KEY AUTO_INCREMENT,
  property_id INT NOT NULL,
  user_id INT NOT NULL,
  builder_id INT NOT NULL,
  status ENUM('pending', 'accepted', 'rejected', 'deal_closed') DEFAULT 'pending',
  initial_message TEXT,
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (builder_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_builder_status (builder_id, status),
  INDEX idx_user (user_id),
  INDEX idx_property (property_id)
);

-- Check if columns already exist before adding them
SET @dbname = DATABASE();
SET @tablename = 'chats';
SET @columnname1 = 'inquiry_id';
SET @columnname2 = 'property_id';

SET @preparedStatement1 = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname1)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname1, ' INT')
));
PREPARE alterIfNotExists1 FROM @preparedStatement1;
EXECUTE alterIfNotExists1;
DEALLOCATE PREPARE alterIfNotExists1;

SET @preparedStatement2 = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname2)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname2, ' INT')
));
PREPARE alterIfNotExists2 FROM @preparedStatement2;
EXECUTE alterIfNotExists2;
DEALLOCATE PREPARE alterIfNotExists2;

-- Add foreign key constraints if they don't exist
-- Note: You may need to run these manually if they fail due to existing constraints
-- ALTER TABLE chats ADD CONSTRAINT fk_chats_inquiry FOREIGN KEY (inquiry_id) REFERENCES inquiries(id) ON DELETE SET NULL;
-- ALTER TABLE chats ADD CONSTRAINT fk_chats_property FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE SET NULL;

SELECT 'Inquiries table setup complete!' AS message;
