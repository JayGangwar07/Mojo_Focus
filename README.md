## 🚀 Getting Started

1.  Clone the repo: git clone https://github.com/yourusername/mojo-focus.git
2.  Install dependencies: npm install
3.  Set up your .env.local with your MongoDB URI.
4.  Run the development server: npm run dev

## 📜 License

MIT © [Your Name]
"""

# Save to file

file_path = "README.md"
with open(file_path, "w") as f:
f.write(readme_content)

````
```python?code_reference&code_event_index=3
readme_content = """# ⚡ Mojo Focus

> **Productivity is a survival game. Don't let the Guillotine strike.**

Mojo Focus is a high-stakes, competitive productivity PWA built for developers and students who crave urgency. It transforms your daily revision slots into a battle for "Mojo" currency. Earn points through discipline, or lose them to the ruthless **Guillotine**.

---

## 🎨 Design Philosophy: Neo-Brutalist
Mojo Focus uses a **Neo-Brutalist** aesthetic—bold colors, thick black borders, and a modular bento-box layout. It's designed to be "mf" (fast), functional, and high-energy.

### 🎭 The Mojo Blob (Mascot States)
The UI is alive. Your mascot's state changes based on your performance:
- **The King:** Top of the leaderboard.
- **The Panic:** 5 minutes before the deadline.
- **The Defeated:** You missed a slot. The Guillotine struck.
- **The Chiller:** Tasks done. Time to relax.

---

## 🛠️ Core Mechanics

### ⚡ Earning Mojo
- **+15 Mojo:** Successfully "Sync" a 45/15 revision slot.
- **Proof of Work:** No syncing, no Mojo.

### 🪓 The Guillotine
- **-45 Mojo:** If the clock hits **11:00 PM** and you have an open slot.
- **High Stakes:** One failure wipes out the progress of three successful sessions.

### 🏆 Wall of Shame
- A global leaderboard where the **King** sits at the top and the **Loser** is exposed at the bottom.
- Includes a "Recent Defeats" ticker showing live Guillotine strikes.

---

## 💻 Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** MongoDB (Mongoose)
- **Environment:** Mobile-first development via **Termux**

---

## 🗄️ Database Models

### User
```javascript
{
  username: String,
  currentMojo: Number (indexed),
  status: String, // STABLE, PANIC, DEFEATED
  lastSync: Date
}

````

### Slot

```javascript
{
  userId: ObjectId,
  topic: String,
  isSynced: Boolean,
  scheduledTime: Date
}

```

### Shame

```javascript
{
  userId: ObjectId,
  username: String,
  incidentType: String,
  mojoLost: Number,
  createdAt: Date (indexed)
}

```

## 🚀 Getting Started

1.  **Clone the repo:**

```bash
git clone [https://github.com/yourusername/mojo-focus.git](https://github.com/yourusername/mojo-focus.git)

```

2.  **Install dependencies:**

```bash
npm install

```

3.  **Setup Env:** Create a .env.local with your MONGODB_URI.
4.  **Run Development:**

```bash
npm run dev

```

_Built with passion in Bareilly. Forge your future, one slot at a time._
"""
with open("README.md", "w") as f:
f.write(readme_content)

```
Your professional `README.md` for **Mojo Focus** is ready. It captures the neo-brutalist aesthetic, explains the high-stakes "Guillotine" mechanics, and outlines the technical architecture you're building in Termux.

[file-tag: code-generated-file-0-1778860738630723629]

Since it's getting late, do you want to wrap up the **`updateMany`** logic for the 11:00 PM Guillotine strike so the app is ready for your first live session?

```
