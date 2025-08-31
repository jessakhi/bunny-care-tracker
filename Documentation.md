
# 🐇 Bunny Care Tracker – Backend Setup 

This note explains everything we did to **create and test the backend** for the Bunny Care Tracker project.
It’s written in a way that even a beginner can follow and understand.

---

## 📦 1. Setting Up the Backend

We started by creating a **backend project** with Node.js.
Inside the `backend/` folder we initialized the project:

```bash
npm init -y
```

Then we installed the packages we need:

```bash
npm install express mongoose cors dotenv
npm install --save-dev nodemon
```

* **express** → framework to build the web server (handles routes like `/api/logs`).
* **mongoose** → makes it easy to work with **MongoDB** (our database).
* **cors** → allows the frontend (React app) to communicate with the backend.
* **dotenv** → lets us store secrets (like database URI) in a `.env` file.
* **nodemon** → auto-restarts the server when files change (for development).

---

## ⚙️ 2. Project Structure

Our backend now looks like this:

```
backend/
 ├── src/
 │    ├── models/        # Database schemas (Log, Event, etc.)
 │    ├── routes/        # API endpoints
 │    └── server.js      # Main entry point
 ├── .env                # Environment variables (MONGO_URI, PORT)
 └── package.json        # Project configuration
```

---

## 🗄️ 3. What Are Models? (Beginner-Friendly)

Think of a **Model** like a **blueprint** for your data.
It defines what a “thing” looks like in your database.

For example, we created a `Log` model:

```js
const LogSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    treats: { type: Number, default: 0, min: 0, max: 8 },
    veggies: { type: Number, default: 0, min: 0, max: 10 },
    pellets: { type: Number, default: 0, min: 0, max: 10 },
    hay: { type: Boolean, default: false },
    water: { type: Boolean, default: false },
    litter: { type: Boolean, default: false },
    grooming: { type: Boolean, default: false },
    mood: { type: String, enum: ['playful','sleepy','neutral','sad','zoomies'], default: 'neutral' },
    freeRoamingMins: { type: Number, default: 0, min: 0, max: 1440 },
    poopQuality: { type: String, enum: ['normal','small','soft','none'], default: 'normal' },
    notes: { type: String, default: '' }
  },
  { timestamps: true }
);
```

👉 This means **each log entry** will store:

* How many **treats, veggies, pellets** were given.
* Whether **hay/water/litter/grooming** were done.
* Bunny’s **mood**, **poop quality**, and optional **notes**.
* Automatically includes `createdAt` and `updatedAt` timestamps.

---

## 🌍 4. Routes (APIs)

Routes are like **doors** into your backend.
We created routes for **logs**:

* **GET `/api/logs`** → list all logs (optionally filter by date range).
* **POST `/api/logs`** → create a new log entry.
* **PUT `/api/logs/:id`** → update a log entry by ID.
* **DELETE `/api/logs/:id`** → remove a log entry.

Each route uses the `Log` model to talk to the MongoDB database.

---

## 🚀 5. Running the Server

We added a `dev` script to `package.json`:

```json
"scripts": {
  "dev": "nodemon src/server.js",
  "start": "node src/server.js"
}
```

To start the backend in development mode:

```bash
npm run dev
```

If everything is correct, you see:

```
✅ Connected to MongoDB
🚀 Server running on port 5000
```

---

## 🧪 6. Testing the Backend

### Health Check

We tested that the server is alive:

```bash
curl http://localhost:5000/health
```

Result:

```json
{"ok":true,"service":"bunny-care-tracker-backend","ts":"2025-08-26T18:17:21.186Z"}
```

---

### Creating a Log (POST)

Using PowerShell:

```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/logs" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"treats":2,"veggies":3,"pellets":1,"hay":true,"water":true,"litter":false,"grooming":false,"mood":"playful","freeRoamingMins":25,"poopQuality":"normal","notes":"first test log"}'
```

Result (example):

```json
{
  "_id": "68adfb086c981c72cf7a204b",
  "date": "2025-08-25T22:00:00.000Z",
  "treats": 2,
  "veggies": 3,
  "pellets": 1,
  "hay": true,
  "water": true,
  "litter": false,
  "grooming": false,
  "mood": "playful",
  "freeRoamingMins": 25,
  "poopQuality": "normal",
  "notes": "first test log",
  "createdAt": "2025-08-26T18:20:56.104Z",
  "updatedAt": "2025-08-26T18:20:56.104Z"
}
```

---

### Fetching Logs (GET)

```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/logs" -Method Get
```

This lists all logs in the database.

# 📅 Events / Calendar Scheduling (Baby Steps)

This part adds a **calendar** to plan things like **vet visits**, **grooming sessions**, and **litter changes**.
Events are different from daily logs: an event is something you **plan for a date**, not a daily care record.

---

## 🧱 Model: `Event.js`

**What is it?** A schema (blueprint) that tells MongoDB what an “event” looks like.

```js
// backend/src/models/Event.js
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    // Optional: you can create a note-only event with no type
    type: { type: String, enum: ['vet', 'grooming', 'litter'] },

    // Required: the calendar day you clicked
    start: { type: Date, required: true },

    // Optional: for future time ranges
    end: Date,

    // Default: day cell (can be false if you add time slots later)
    allDay: { type: Boolean, default: true },

    // Optional title (front or back can set it)
    title: String,

    // Optional note just for the schedule (not the daily log note)
    notes: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema);
```

**Why like this?**

* `type` is optional → you can add **just a note** for a day.
* `allDay: true` fits the “click on a day cell” UX.
* `timestamps` gives you `createdAt` / `updatedAt` automatically.

---

## 🌐 Routes: `events.js`

Mounted at `/api/events`.

### GET `/api/events?from=YYYY-MM-DD&to=YYYY-MM-DD`

* List events.
* Optional range filter (useful to load a month/week in the calendar).

### POST `/api/events`

* Create a new event (vet/grooming/litter) **or** a note-only event.
* Minimal required field: `start`.

### PUT `/api/events/:id`

* Update an event (change notes, move date, toggle allDay, etc.).

### DELETE `/api/events/:id`

* Remove an event.

**Snippet used:**

```js
// Normalize start to the start of the day (nice for calendar cells)
const startDate = new Date(start);
startDate.setHours(0, 0, 0, 0);

// Keep type safe
const allowedTypes = ['vet', 'grooming', 'litter'];
const cleanType = type && allowedTypes.includes(type) ? type : undefined;

// Create
const event = await Event.create({
  type: cleanType,
  start: startDate,
  end,
  allDay: !!allDay,
  title,
  notes: typeof notes === 'string' ? notes : ''
});
```

---

## 🧪 Testing (PowerShell)

> You already verified POST works 🎉 Keep these as references.

### Create (type + note)

```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/events" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"type":"vet","start":"2025-09-01","notes":"Annual checkup"}'
```

### Create (note-only, no type)

```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/events" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"start":"2025-09-03","notes":"Buy hay"}'
```

### List all (or add `?from=2025-09-01&to=2025-09-30`)

```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/events" -Method Get
```

### Update (replace `<ID>` with your event’s \_id)

```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/events/<ID>" `
  -Method Put `
  -ContentType "application/json" `
  -Body '{"notes":"Rescheduled to morning","allDay":true}'
```

### Delete

```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/events/<ID>" -Method Delete
```

---

## 🧩 Events vs Logs (quick reminder)

* **Logs** → daily care tracking (treats, veggies, water, mood, poop quality, notes).
* **Events** → planned things on a date (vet, grooming, litter change, or just a note).
* Separate models keeps data clean and each page simple.

---

## 🛠 Common Pitfalls (and fixes)

* **Case mismatch on Windows vs other OS**
  File: `models/Event.js`
  Import: `require('../models/Event')`
  → Make sure the **case matches exactly**.

* **Model export/import mismatch**
  Export must be CommonJS:
  `module.exports = mongoose.model('Event', eventSchema);`
  Import with CommonJS:
  `const Event = require('../models/Event');`

* **Server not restarted** after file renames
  Stop with `Ctrl+C`, then `npm run dev`.

* **Router not mounted**
  In `server.js`:

  ```js
  const eventsRouter = require('./routes/events');
  app.use('/api/events', eventsRouter);
  ```

---

