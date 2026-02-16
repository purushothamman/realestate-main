-- Create inquiries table for lead generation
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

-- Update chats table to link to inquiries and properties
ALTER TABLE chats 
ADD COLUMN IF NOT EXISTS inquiry_id INT,
ADD COLUMN IF NOT EXISTS property_id INT,
ADD FOREIGN KEY IF NOT EXISTS (inquiry_id) REFERENCES inquiries(id) ON DELETE SET NULL,
ADD FOREIGN KEY IF NOT EXISTS (property_id) REFERENCES properties(id) ON DELETE SET NULL;
