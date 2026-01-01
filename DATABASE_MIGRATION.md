# Database Migration Guide

## Overview
This guide helps you migrate your existing Placement Tracker database to support the new features.

## Required Changes

### 1. Add New Tables

Run these SQL commands in your MySQL database:

```sql
-- Create admins table
CREATE TABLE admins (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    created_at DATETIME NOT NULL,
    last_login DATETIME,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Create mentors table
CREATE TABLE mentors (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone_number VARCHAR(50),
    linkedin_profile VARCHAR(500),
    placed_company VARCHAR(255) NOT NULL,
    placed_position VARCHAR(255),
    placement_year INT,
    graduation_year INT,
    created_at DATETIME NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Create mentor_departments junction table
CREATE TABLE mentor_departments (
    mentor_id BIGINT NOT NULL,
    department_id BIGINT NOT NULL,
    PRIMARY KEY (mentor_id, department_id),
    FOREIGN KEY (mentor_id) REFERENCES mentors(id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
);
```

### 2. Modify Existing Tables

```sql
-- Add placement_year to placement_experiences table
ALTER TABLE placement_experiences 
ADD COLUMN placement_year INT;

-- Update existing records with a default year (optional)
-- You can update this based on your existing data
UPDATE placement_experiences 
SET placement_year = YEAR(submitted_at) 
WHERE placement_year IS NULL;
```

### 3. Create Default Admin

The application will automatically create a default admin on first run with:
- **Username:** admin
- **Password:** admin123

**⚠️ IMPORTANT:** Change this password immediately after first login!

Alternatively, you can manually create the admin:

```sql
-- Manual admin creation (password is BCrypt encoded 'admin123')
INSERT INTO admins (username, password, full_name, email, created_at, is_active)
VALUES (
    'admin',
    '$2a$10$XPTCeqV5JqVxT5TQZGKoP.sO8EJN7gGmKN8w1JGq3zHZGl5LqQp7K',
    'System Administrator',
    'admin@gct.ac.in',
    NOW(),
    TRUE
);
```

## Migration Steps

### Step 1: Backup Your Database
```bash
mysqldump -u your_username -p placement_tracker > backup_before_migration.sql
```

### Step 2: Run the Migration Scripts
```bash
mysql -u your_username -p placement_tracker < migration_scripts.sql
```

### Step 3: Start the Application
The application will initialize the default admin if it doesn't exist.

### Step 4: Verify the Migration

1. Check if new tables exist:
```sql
SHOW TABLES;
-- Should show: admins, mentors, mentor_departments
```

2. Check if placement_year column was added:
```sql
DESCRIBE placement_experiences;
-- Should show placement_year column
```

3. Check if default admin was created:
```sql
SELECT * FROM admins;
-- Should show at least one admin
```

### Step 5: Test Admin Login
1. Navigate to `/admin-login`
2. Login with username: `admin` and password: `admin123`
3. Immediately change the password

## Data Migration (Optional)

### Migrate Existing Mentors from Users Table

If you have mentors in the existing `users` table, you can migrate them:

```sql
-- Migrate mentors from users to new mentors table
INSERT INTO mentors (full_name, email, phone_number, linkedin_profile, 
                     placed_company, placed_position, placement_year, 
                     graduation_year, created_at, is_active)
SELECT 
    full_name,
    email,
    phone_number,
    linkedin_profile,
    placed_company,
    placed_position,
    placement_year,
    graduation_year,
    created_at,
    is_active
FROM users 
WHERE role = 'MENTOR';

-- Link mentors to their departments
INSERT INTO mentor_departments (mentor_id, department_id)
SELECT 
    m.id as mentor_id,
    u.department_id
FROM mentors m
JOIN users u ON m.email = u.email
WHERE u.department_id IS NOT NULL;
```

## Rollback Plan

If you need to rollback:

```sql
-- Restore from backup
mysql -u your_username -p placement_tracker < backup_before_migration.sql

-- Or manually drop new tables
DROP TABLE IF EXISTS mentor_departments;
DROP TABLE IF EXISTS mentors;
DROP TABLE IF EXISTS admins;

-- Remove new column
ALTER TABLE placement_experiences DROP COLUMN placement_year;
```

## Troubleshooting

### Issue: Default admin not created
**Solution:** Check application logs. If needed, manually run the INSERT command above.

### Issue: Foreign key constraint fails
**Solution:** Ensure departments table exists and has data before creating mentor_departments.

### Issue: Application can't connect to database
**Solution:** 
1. Check `application.properties` for correct database credentials
2. Ensure MySQL is running
3. Grant proper permissions to database user:
```sql
GRANT ALL PRIVILEGES ON placement_tracker.* TO 'your_username'@'localhost';
FLUSH PRIVILEGES;
```

## Post-Migration Tasks

1. **Change Default Admin Password**
   - Login to admin dashboard
   - Create a new admin with secure credentials
   - Optionally delete the default admin

2. **Add Mentors**
   - Navigate to Admin Dashboard
   - Click "Add Mentor"
   - Fill in mentor details and assign departments

3. **Update Placement Year Data**
   - If needed, update `placement_year` for existing experiences
   - Can be done through SQL or by editing experiences in the application

4. **Test All Features**
   - [ ] Admin login works
   - [ ] Mentor CRUD operations work
   - [ ] Company experiences display correctly
   - [ ] Department pages show mentors
   - [ ] Student registration still works

## Database Schema Diagram

```
┌──────────────┐
│    admins    │
├──────────────┤
│ id (PK)      │
│ username     │
│ password     │
│ full_name    │
│ email        │
│ created_at   │
│ last_login   │
│ is_active    │
└──────────────┘

┌──────────────────────┐         ┌──────────────────────┐
│      mentors         │◄────────│  mentor_departments  │
├──────────────────────┤         ├──────────────────────┤
│ id (PK)              │         │ mentor_id (FK)       │
│ full_name            │         │ department_id (FK)   │
│ email                │         └──────────────────────┘
│ phone_number         │                    │
│ linkedin_profile     │                    │
│ placed_company       │                    ▼
│ placed_position      │         ┌──────────────────────┐
│ placement_year       │         │    departments       │
│ graduation_year      │         ├──────────────────────┤
│ created_at           │         │ id (PK)              │
│ is_active            │         │ department_name      │
└──────────────────────┘         │ department_code      │
                                 │ ...                  │
                                 └──────────────────────┘

┌────────────────────────────┐
│  placement_experiences     │
├────────────────────────────┤
│ id (PK)                    │
│ student_name               │
│ company_name               │
│ placement_year  ← NEW      │
│ ...                        │
└────────────────────────────┘
```

## Support

If you encounter issues during migration:
1. Check the application logs in `logs/` directory
2. Verify MySQL version compatibility (5.7+)
3. Ensure proper database permissions
4. Review error messages in browser console

For persistent issues, restore from backup and contact support.
