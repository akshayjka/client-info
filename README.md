# Client Tracker — MongoDB Version

Simple client details tracker using:

- HTML
- CSS
- Vanilla JavaScript
- Node.js
- Express
- Mongoose
- MongoDB / MongoDB Atlas
- Render

## Project structure

```text
client_tracker_mongodb/
│
├── public/
│   ├── index.html
│   ├── styles.css
│   └── app.js
│
├── server.js
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

## Local testing

### 1. Install Node.js

Use Node.js 18 or newer.

### 2. Install dependencies

Open terminal in the project folder:

```bash
npm install
```

### 3. Create `.env`

Copy `.env.example` to `.env`.

For local MongoDB:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/client_tracker
```

Or use MongoDB Atlas:

```env
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/client_tracker?retryWrites=true&w=majority
```

### 4. Start

```bash
npm start
```

Open:

```text
http://localhost:3000
```

## MongoDB collection

Mongoose automatically creates:

```text
clients
```

Documents look like:

```json
{
  "_id": "...",
  "name": "John",
  "phone": "9876543210",
  "attendance": "Attended",
  "interest": "Interested",
  "remarks": "Follow up next week",
  "createdAt": "...",
  "updatedAt": "..."
}
```

## Render deployment

### Step 1 — Create MongoDB Atlas

Create a MongoDB Atlas cluster.

Create a database user.

For a simple initial deployment, configure Network Access appropriately so your Render service can connect.

Create/get your MongoDB connection string.

Example:

```text
mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/client_tracker?retryWrites=true&w=majority
```

### Step 2 — Push project to GitHub

Upload this project to a GitHub repository.

### Step 3 — Create Render Web Service

In Render:

```text
New → Web Service
```

Connect the GitHub repository.

Use:

```text
Build Command:
npm install
```

and:

```text
Start Command:
npm start
```

### Step 4 — Add environment variable

In Render → Environment Variables:

```text
MONGODB_URI
```

Value:

```text
mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/client_tracker?retryWrites=true&w=majority
```

Do not commit `.env` to GitHub.

### Step 5 — Deploy

After deployment, open the Render URL.

The application will:

1. Connect to MongoDB.
2. Load all clients.
3. Save new clients to MongoDB.
4. Update clients in MongoDB.
5. Delete clients from MongoDB.
6. Keep the records after Render restarts.

## API endpoints

```text
GET    /api/health
GET    /api/clients
POST   /api/clients
PUT    /api/clients/:id
DELETE /api/clients/:id
```

## Important

This version intentionally does NOT use:

- PostgreSQL
- `pg`
- `data.json`
- local file storage

MongoDB is the only database used by the application.
