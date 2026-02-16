-- Create chats and messages tables for messaging system
USE realestate_db;

-- Create chats table
CREATE TABLE IF NOT EXISTS chats (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user1_id INT NOT NULL,
  user2_id INT NOT NULL,
  inquiry_id INT,
  property_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (inquiry_id) REFERENCES inquiries(id) ON DELETE SET NULL,
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE SET NULL,
  INDEX idx_users (user1_id, user2_id),
  INDEX idx_inquiry (inquiry_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  chat_id INT NOT NULL,
  sender_id INT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_chat (chat_id),
  INDEX idx_sender (sender_id),
  INDEX idx_read (is_read)
);

SELECT 'Chats and messages tables created successfully!' AS message;
