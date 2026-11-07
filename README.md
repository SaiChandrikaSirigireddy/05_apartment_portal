# 🏢 Apartment Management Web Application
**Web Technology Lab - Apartment Portal Project**  
**Developer Name:** S. Sai Chandrika  
**Roll Number:** 25ATA05L40  
**Institution:** G. Pullaiah College of Engineering & Technology (GPCET)  
**Topic:** Apartment & Housing Management Portal  
**Tech Stack:** Node.js, Express.js, MySQL Workbench, HTML5, CSS3, JavaScript  

---

## 📁 Directory Structure
```text
apartment_portal/
├── database.sql           # MySQL script (apartment_db and apartments table)
├── app.js                 # Express Backend server with MySQL integration (Port 3002)
├── package.json           # Dependencies (express, mysql2, cors, body-parser)
├── start_server.bat       # 1-Click launcher (installs packages & starts server)
├── README.md              # Instructions & Viva guide
└── public/                # Frontend pages
    ├── index.html         # Home (Dashboard + Master Inventory Table & Cards)
    ├── add-apartment.html # Add Apartment Page
    ├── update-apartment.html # Update Apartment Page
    ├── search-apartment.html # Search Apartment Page
    ├── delete-apartment.html # Remove / Delete Apartment Page
    ├── style.css          # Responsive Modern CSS styling (Emerald theme)
    ├── script.js          # Client-side JavaScript (Fetch API, CRUD)
    └── images/
        └── chandrika.svg  # Developer profile avatar with roll no badge
```

---

## 🗄️ Database & Table Specifications
- **Database:** `apartment_db`
- **Table:** `apartments`
- **Columns:**
  1. `apartment_id` (INT PRIMARY KEY AUTO_INCREMENT)
  2. `flat_no` (VARCHAR(50) NOT NULL, e.g. "Flat 302 - Block A")
  3. `apartment_name` (VARCHAR(255) NOT NULL, e.g. "Green Valley Heights")
  4. `bhk_type` (VARCHAR(50) NOT NULL, e.g. "2 BHK", "3 BHK", "Penthouse")
  5. `rent_price` (DECIMAL(10,2) NOT NULL, e.g. 24000.00)
  6. `location` (VARCHAR(255) NOT NULL, e.g. "Kurnool (Near GPCET)")
  7. `status` (VARCHAR(50) DEFAULT 'Available')
  8. `created_at` (TIMESTAMP)

---

## 📑 Required Pages Included
1. **Home (`index.html`)**: Developer Card (**S. Sai Chandrika - 25ATA05L40**), KPI Statistics (Total Units, Available, Occupied, Avg Rent), Master Apartment Table, Search & Filter bar, Table/Card View toggling.
2. **Add Apartment (`add-apartment.html`)**: Form to register new flat units, BHK type, rent, location, and status.
3. **Update Apartment (`update-apartment.html`)**: Search by ID and edit rent, BHK type, occupancy status, and location.
4. **Search Apartment (`search-apartment.html`)**: Real-time instant search by flat number, building name, or city with results table.
5. **Remove / Delete Apartment (`delete-apartment.html`)**: Look up unit by ID, view details warning card, and delete permanently from MySQL.

---

## 🚀 How to Run (Step-by-Step)

### Step 1: Execute SQL in MySQL Workbench
1. Open **MySQL Workbench**.
2. Click **File -> Open SQL Script...** and select:
   `C:\Users\saich\.gemini\antigravity\scratch\apartment_portal\database.sql`
3. Click the ⚡ **Lightning bolt** icon to execute. This creates `apartment_db` and seeds initial apartment units.

### Step 2: Configure Password in `app.js`
In `app.js` (Lines 26-30), verify your MySQL password:
```javascript
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'password', // <-- Change if your MySQL password is root, 1234, or blank ''
    database: 'apartment_db'
};
```
*(Safety feature: If MySQL is not running or password differs, the application automatically runs in Fallback Demo Mode with memory storage, so your faculty demo never fails!)*

### Step 3: Run Server
Double-click `start_server.bat` OR run in terminal:
```bash
npm install
node app.js
```
Open **`http://localhost:3002`** in Chrome / Edge.

---

## 🎯 Viva Q&A (Faculty Questions)

**Q1: How does your frontend communicate with the MySQL database?**  
*Ans:* When the page loads or when a user submits an apartment form, frontend JavaScript (`script.js`) makes asynchronous HTTP requests (`fetch('/api/apartments')`) to our Express.js backend (`app.js`). The backend connects to MySQL using the `mysql2` driver, executes SQL queries (`SELECT`, `INSERT`, `UPDATE`, `DELETE`), and sends back JSON responses.

**Q2: What is the primary key in your table?**  
*Ans:* `apartment_id` is the primary key configured with `AUTO_INCREMENT`.

**Q3: How does the application filter apartments by BHK and Location?**  
*Ans:* In `app.js`, the `/api/apartments` endpoint receives query parameters (`req.query.bhk`, `req.query.status`, and `req.query.q`) and dynamically constructs a SQL query with `WHERE` clauses to return filtered records.
