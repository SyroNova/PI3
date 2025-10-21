-- Fix admin user password
-- Password: admin123
USE electromed;

UPDATE users 
SET password_hash = '$2b$10$fBnyBq6fLJGwmiDJ1tta6ehjR.L4yTZQsBjwh.7OLMWwpcmfohCwG'
WHERE username = 'admin';

SELECT id, username, email, role FROM users WHERE username = 'admin';
