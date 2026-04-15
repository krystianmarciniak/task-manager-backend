# Task Manager Backend

Backend API for managing projects and tasks.  
Created as part of a team project.

---

## Technologies

- Node.js
- Express
- PostgreSQL
- dotenv

---

## Project Structure
```text

task-manager-backend/
│
├── database/
│ └── init.sql # database schema + sample data
│
├── .env.example # environment variables template
├── .gitignore
├── db.js # database connection
├── server.js # main server file
├── package.json
└── package-lock.json
```
---

Installation

## Clone repository:

```bash
git clone https://github.com/krystianmarciniak/task-manager-backend.git
cd task-manager-backend
```
Install dependencies:
```bash
npm install
```
## Environment variables
Create .env file based on .env.example:
```text
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=taskmanager
DB_USER=postgres
DB_PASSWORD=your_password_here
```
## Database setup

Create database in PostgreSQL:
```text
CREATE DATABASE taskmanager;
```
Import schema and data:
psql -U postgres -d taskmanager -f database/init.sql

## Run project
```text
npm run dev

or
node server.js
```
## API (basic)

Example endpoints:

- GET /projects
- GET /projects/:id
- GET /users
- GET /users/:id

## Notes
.env file is not included in repository for security reasons
node_modules is ignored (run npm install after cloning)
Database dump is included in database/init.sql

## Author
Krystian Marciniak