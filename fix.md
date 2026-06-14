# 🔐 Security Fixes Report

A detailed guide to addressing all identified vulnerabilities in the `Project_ready-main` codebase. Each finding includes a **Severity**, **Root Cause**, **Impact**, and a **Copy-paste Fix**.

---

## Table of Contents
1. [Critical Fixes](#critical-fixes)
2. [High Priority Fixes](#high-priority-fixes)
3. [Medium Priority Fixes](#medium-priority-fixes)
4. [Low Priority / Hardening](#low-priority-hardening)
5. [Complete Patched `server.js`](#complete-patched-serverjs)

---

## Critical Fixes

### 🔴 Fix 1: Input Validation (Prevents Mass Assignment)

**Severity:** Critical ⭐⭐⭐⭐⭐

**Root Cause:** `server.js` accepts raw `req.body` input and passes it directly into the MongoDB model without any validation or sanitization.

**Impact:**
- Mass Assignment: Attackers can inject extra fields not defined in the `Task` schema.
- NoSQL Injection: Malformed payloads can manipulate database queries.

**Fix:** Install joi and add validation middleware.

**Step 1: Install dependency**
```bash
npm install joi
```

**Step 2: Add validation to `server.js`**
Replace the `POST` and `PATCH` handlers in `server.js` with validated versions:

```javascript
const Joi = require('joi');

// Validation schema for a new task
const taskSchema = Joi.object({
    title: Joi.string().trim().min(3).max(100).required(),
    description: Joi.string().trim().max(500).optional(),
    status: Joi.string().valid('To-Do', 'In-Progress', 'Done').default('To-Do'),
});

// Validation schema for updating a task
const statusUpdateSchema = Joi.object({
    status: Joi.string().valid('To-Do', 'In-Progress', 'Done').required(),
});

// POST a new task (SECURE)
app.post('/api/tasks', async (req, res) => {
    try {
        const { error, value } = taskSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: 'Validation failed.', details: error.details });
        }
        const newTask = new Task(value);
        const savedTask = await newTask.save();
        res.status(201).json(savedTask);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'An internal server error occurred.' });
    }
});

// PATCH to update task status (SECURE)
app.patch('/api/tasks/:id', async (req, res) => {
    try {
        const { error } = statusUpdateSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: 'Invalid status value.', details: error.details });
        }

        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { returnDocument: 'after' }
        );
        
        if (!updatedTask) {
            return res.status(404).json({ message: 'Task not found.' });
        }

        res.json(updatedTask);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'An internal server error occurred.' });
    }
});
```

---

### 🔴 Fix 2: Implement Rate Limiting

**Severity:** Critical ⭐⭐⭐⭐

**Root Cause:** API endpoints have no throttling, making them vulnerable to brute-force and Denial-of-Service (DoS) attacks.

**Impact:** An attacker could rapidly create hundreds of tasks to shut down the database.

**Fix:**

**Step 1: Install dependency**
```bash
npm install express-rate-limit
```

**Step 2: Add to `server.js`**
```javascript
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply to all API routes
app.use('/api/', apiLimiter);
```

---

## High Priority Fixes

### 🟠 Fix 3: Add Missing Security Headers (Helmet)

**Severity:** High ⭐⭐⭐⭐

**Root Cause:** The server does not set standard security headers (like `X-Frame-Options`, `Content-Security-Policy`, etc.), leaving the app vulnerable to clickjacking and XSS on older browsers.

**Fix:**

**Step 1: Install dependency**
```bash
npm install helmet
```

**Step 2: Apply in `server.js`**
```javascript
const helmet = require('helmet');

// Add Helmet after express initialization but before routes
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdn.tailwindcss.com"],
停了，忘了。我再发一次。 class="hljs-string">"https://fonts.googleapis.com", "https://fonts.gstatic.com"</span>],<br>    },<br>  },<br>}));<br>```<br><br>---<br><br>### 🟠 Fix 4: Configure CORS Correctly<br><br>**Severity:** High ⭐⭐⭐⭐<br><br>**Root Cause:** No CORS configuration means any website can make requests to your API.<br><br>**Fix:**<br><br>**Step 1: Install dependency**<br><div class="highlight"><pre class="codehilite"><code>npm install cors<br>```<br></code></pre></div><br><br>**Step 2: Apply in `server.js`**<br>```javascript<br>const cors = require('cors');<br><br>const corsOptions = {<br>  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',<br>  methods: 'GET,POST,PATCH,DELETE',<br>  allowedHeaders: 'Content-Type,Authorization',<br>  credentials: true,<br>};<br><br>app.use(cors(corsOptions));<br>```<br><br>---<br><br>### 🟠 Fix 5: Prevent XSS in `script.js`<br><br>**Severity:** High ⭐⭐⭐⭐<br><br>**Root Cause:** The `showWorkspaceNotice` function in `script.js` uses `innerHTML` with dynamic text, which is a major XSS risk if the `title` or `message` parameters are ever derived from user input.<br><br>**Fix:** Replace `innerHTML` with safe element creation.<br><br>Replace the entire `showWorkspaceNotice` function in `public/script.js` with the following:<br><br>```javascript<br>function showWorkspaceNotice(title, message) {<n>    // Check if notice banner already exists, remove it<br>    const existingNotice = document.getElementById('workspace-notice');<br>    if (existingNotice) existingNotice.remove();<n><n>    // Create notice element<br>    const notice = document.createElement('div');<br>    notice.id = 'workspace-notice';
    notice.className = 'fixed bottom-4 left-4 z-50 bg-surface-container-high border border-primary-fixed text-primary-fixed px-md py-sm font-label-sm flex flex-col gap-xs transition-transform duration-300 transform translate-y-20';
    
    Object.assign(notice.style, {
        boxShadow: '0 0 10px rgba(195, 244, 0, 0.2)',
        fontFamily: "'Space Mono', monospace",
        fontSize: '12px',
        maxWidth: '350px',
    });

    const header = document.createElement('div');<n>    header.className = 'flex justify-between items-center border-b border-primary-fixed/20 pb-xs';
    
    const titleSpan = document.createElement('span');<n>    titleSpan.className = 'font-bold uppercase';
    titleSpan.textContent = `> ${String(title)}`; // > is '>'

    const closeBtn = document.createElement('span');<n>    closeBtn.className = 'cursor-pointer hover:text-white';
    closeBtn.textContent = '[X]';
    closeBtn.onclick = () => notice.remove();

    header.appendChild(titleSpan);<n>    header.appendChild(closeBtn);

    const messageP = document.createElement('p');<n>    messageP.className = 'text-on-surface opacity-90';
    messageP.textContent = String(message);

    notice.appendChild(header);<n>    notice.appendChild(messageP);
    document.body.appendChild(notice);

    setTimeout(() => { notice.classList.remove('translate-y-20'); }, 50);
    setTimeout(() => { if (document.body.contains(notice)) { notice.classList.add('translate-y-20'); setTimeout(() => notice.remove(), 300); } }, 4000);
}<br>```<br><br>---<br><br>## Medium Priority Fixes<br><br>### 🟡 Fix 6: Subresource Integrity (SRI)<br><br>**Severity:** Medium ⭐⭐⭐<br><br>**Root Cause:** External scripts and styles (Tailwind, Google Fonts) are loaded without integrity checks.<br><br>**Fix:** Add `integrity` and `crossorigin` attributes, or **preferably**, vendor these files.<br><br>In `public/index.html`, change the external script and link tags from:<br>```html<br><script src=\"https://cdn.tailwindcss.com?plugins=forms,container-queries\"></script><br>```<br><br>To (note: you'll need to calculate the correct hash for your specific script version):<br>```html<br><!-- It is strongly recommended to serve these dependencies locally for production --><br><!-- If you must use a CDN, add integrity and crossorigin attributes --><br><script src=\"https://cdn.tailwindcss.com?plugins=forms,container-queries\" integrity=\"sha384-YOUR_HASH_HERE\" crossorigin=\"anonymous\"></script><br>```<br><br>**Best Practice:** For production, download and self-host `tailwindcss` and fonts to completely eliminate the risk of a compromised CDN.<br><br>---<br><br>### 🟡 Fix 7: Secure Error Handling<br><br>**Severity:** Medium ⭐⭐⭐<br><br>**Root Cause:** The `catch` block in the `PATCH` handler sends the raw `err.message` string to the client.<br><br>**Fix:** Log the detailed error server-side, but send a generic message to the client. (Already included in the `server.js` patches above for `POST` and `PATCH`).<br><br>---<br><br>## Low Priority / Hardening Fixes<br><br>### 🟢 Fix 8: Disable Server Information Leakage<br><br>**Impact:** Low<br><br>**Fix:** Disable the `x-powered-by` header in Express to obscure the underlying technology from potential attackers.<br><br>In `server.js`:
```javascript
app.disable('x-powered-by');
```

---

### 🟢 Fix 9: Run in Strict Mode & Handle Errors Gracefully

**Impact:** Low

**Fix:** Add `'use strict';` and a global, unhandled Promise rejection handler at the top of `server.js`.

```javascript
'use strict';
require('dotenv').config();
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const Joi = require('joi');

// Global unhandled rejection handler
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    process.exit(1);
});

const app = express();
app.disable('x-powered-by');
```

---

### 🟢 Fix 10: MongoDB Connection Security

**Impact:** Low (if using Atlas with strong credentials)

**Fix:** Ensure your `MONGO_URI` in `.env` is never committed. Use strong, unique credentials for your MongoDB user with limited privileges (readWrite on a specific database only).

Example `.env`:
```ini
PORT=3000
MONGO_URI=mongodb+srv://<user>:<strongPassword>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
CORS_ORIGIN=http://localhost:3000
```

---

## Complete Patched `server.js`

Here is the fully patched `server.js` file with all critical and high priority fixes applied. You can replace your current file with this one.

```javascript
'use strict';
require('dotenv').config();
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const Joi = require('joi');

const app = express();
const PORT = process.env.PORT || 3000;

// Security: Disable x-powered-by
app.disable('x-powered-by');

// Security: Helmet for security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdn.tailwindcss.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdn.tailwindcss.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
    },
  },
}));

// Security: CORS
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: 'GET,POST,PATCH,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
  credentials: true,
};
app.use(cors(corsOptions));

// Security: Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', apiLimiter);

// MongoDB Connection
const MONGODB_URI = process.env.MONGO_URI;
if (!MONGODB_URI) {
    console.error('FATAL: MONGO_URI is not defined in .env file');
    process.exit(1);
}

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mongoose Model
const Task = require('./models/Task');

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB successfully');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

// Validation Schemas
const taskSchema = Joi.object({
    title: Joi.string().trim().min(3).max(100).required(),
    description: Joi.string().trim().max(500).optional(),
    status: Joi.string().valid('To-Do', 'In-Progress', 'Done').default('To-Do'),
});

const statusUpdateSchema = Joi.object({
    status: Joi.string().valid('To-Do', 'In-Progress', 'Done').required(),
});

// GET all tasks
app.get('/api/tasks', async (req, res) => {
    try {
        const tasks = await Task.find();
        res.json(tasks);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'An internal server error occurred.' });
    }
});

// POST a new task
app.post('/api/tasks', async (req, res) => {
    try {
        const { error, value } = taskSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: 'Validation failed.', details: error.details });
        }
        const newTask = new Task(value);
        const savedTask = await newTask.save();
        res.status(201).json(savedTask);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'An internal server error occurred.' });
    }
});

// PATCH to update task status
app.patch('/api/tasks/:id', async (req, res) => {
    try {
        const { error } = statusUpdateSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: 'Invalid status value.', details: error.details });
        }

        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id, 
            { status: req.body.status }, 
            { returnDocument: 'after' }
        );
        
        if (!updatedTask) {
            return res.status(404).json({ message: 'Task not found.' });
        }

        res.json(updatedTask);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'An internal server error occurred.' });
    }
});

// Global unhandled rejection handler
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    process.exit(1);
});

app.listen(PORT, () => {
  console.log(`Server is running securely on port ${PORT}`);
});
```

---

## 🧪 How to Apply These Fixes

1. **Backup your current project:**
   ```bash
   cd Project_ready-main
   cp server.js server.js.backup
   cp public/script.js public/script.js.backup
   ```

2. **Install new dependencies:**
   ```bash
   npm install joi helmet cors express-rate-limit
   ```

3. **Replace `server.js`:**
   Copy the "Complete Patched `server.js`" code from above into your `server.js` file.

4. **Update `script.js`:**
   Replace the `showWorkspaceNotice` function with the safe version provided in **Fix 5**.

5. **Update `.env`:**
   Add an extra line for CORS:
   ```ini
   PORT=3000
   MONGO_URI=your_mongodb_connection_string
   CORS_ORIGIN=http://localhost:3000
   ```

6. **Restart your server:**
   ```bash
   npm start
   ```

Your application is now protected against the critical and high-severity vulnerabilities identified in the initial audit.
