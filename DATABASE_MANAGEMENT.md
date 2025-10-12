# Database Management Guide

This guide explains how to manage the PMS database for testing and development.

## Fresh Database Setup

To start with a completely clean database containing only the administrator user:

### Quick Start (Recommended)
```bash
cd backend
npm run fresh:start
```

This command will:
1. Clear all existing data from the database
2. Create a single administrator user

### Step-by-Step Process

#### 1. Clear Database
```bash
cd backend
npm run clean:db
```
This removes all data from all collections:
- Users, Students, Jobs, Job Applications
- All profile data (Admin, Director, Staff, HOD, Other Staff)
- Batches, Departments, Course Categories
- Import History, Password Resets, Job Views

#### 2. Seed Administrator User
```bash
cd backend
npm run seed:users
```
This creates a single administrator user with:
- **Email**: admin@saec.edu.in
- **Password**: Admin@123
- **Role**: admin
- **Status**: Active and Verified

## Available Commands

| Command | Description |
|---------|-------------|
| `npm run clean:db` | Clear all data from database |
| `npm run seed:users` | Create administrator user |
| `npm run fresh:start` | Clean database + create admin user |
| `npm run dev` | Start development server |

## Login Credentials

After running the fresh start, use these credentials to login:

- **Email**: admin@saec.edu.in
- **Password**: Admin@123

## Testing Workflow

1. **Fresh Start**: Run `npm run fresh:start`
2. **Start Server**: Run `npm run dev`
3. **Login**: Use admin credentials above
4. **Create Test Data**: Use the admin interface to create:
   - Placement Directors
   - Placement Staff
   - Department HODs
   - Students
   - Jobs and Applications

## Database Collections

The following collections will be cleared during cleanup:

### User Management
- **users** - All user accounts
- **administrators** - Administrator records
- **administratorprofiles** - Admin profile data

### Staff Profiles
- **placementdirectorprofiles** - Director profiles
- **placementstaffprofiles** - Staff profiles
- **departmenthodprofiles** - HOD profiles
- **otherstaffprofiles** - Other staff profiles

### Student Management
- **students** - Student records
- **batches** - Academic batches

### Job Management
- **jobs** - Job postings
- **jobapplications** - Student applications
- **jobviews** - Job view tracking

### System Data
- **departments** - Department information
- **coursecategories** - Course categories
- **importhistory** - Data import logs
- **passwordresets** - Password reset tokens

## Important Notes

⚠️ **Warning**: The `clean:db` command will permanently delete ALL data from the database. Use with caution in production environments.

✅ **Safe for Development**: These commands are designed for development and testing environments where you need a clean slate.

🔄 **Repeatable Process**: You can run these commands multiple times to reset the database whenever needed for testing.

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running locally
- Check the `.env` file for correct `MONGODB_URI`
- Verify database permissions

### Seeding Errors
- Check console output for specific error messages
- Ensure all required environment variables are set
- Verify MongoDB connection is stable

### Login Issues After Fresh Start
- Confirm you're using the correct credentials: admin@saec.edu.in / Admin@123
- Clear browser cache and cookies
- Check server logs for authentication errors
