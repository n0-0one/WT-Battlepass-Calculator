# 🎖️ War Thunder Battle Pass Calculator & Level 150 Grind Planner

> A production-grade, mathematically exact, and responsive web application designed for War Thunder players to track Battle Pass progress, simulate future point gains, and reverse-calculate optimal paths to major milestones—specifically **Level 51 (Free Vehicle)**, **Level 75 (Top Main Vehicle)**, **Level 105 & 125 (Tradable Coupon Upgrades / Free Next Pass)**, and the ultimate **Level 150 (Exclusive Season Title)**.
>
> *Inspired by `Gardnem6/wt-passhelper`, completely modernized, redesigned with a high-contrast dark tactical military UI, and updated to official late-2026 War Thunder specifications (featuring active default Season XXV: "Steel Fury").*

---

## 🚀 Key Features & Dual-Engine Architecture

Unlike legacy Battle Pass calculators that only compute forward projections, this application features a synchronized **dual-engine architecture**:

### 1. 🔮 Forward Projection Engine
- **Mode A: From Current In-Game Progress (Recommended)**: Input your exact in-game Level (0–150+), remaining points in current level (0–9 PP), and cumulative season logins to project final outcomes from today onwards without double-counting past earnings.
- **Mode B: Full Season Simulator (From Day 1)**: Simulate an entire 91-day season from scratch to evaluate different playstyles and habits.
- **Dynamic Pass Ownership**: Seamlessly switch between **Free Pass (0 GE)**, **Standard Pass (2,000 GE)**, and **Improved Pass (2,500 GE / +15 Levels)** with built-in protection against double-counting the +15-level boost.

### 2. 🎯 Reverse "Road to Level 150" Strategic Planner
- **Automated Deficit & Surplus Solver**: Instantly calculates the exact PP and Level difference between your projected pace and target milestone.
- **Zero-GE Gameplay Action Plan**:
  - Calculates maximum theoretical free points remaining in the season (100% remaining logins + 100% daily tasks + all uncompleted challenges).
  - Determines the exact minimum **Special Tasks** needed (`ceil(deficit / 5)`).
  - Breaks down the grind into manageable **Daily** and **Weekly** Special Task pacing.
  - Computes required **Warbonds** (`Special Tasks * 30 WB`) and **Medium Daily Tasks** required to unlock permits.
- **Feasibility Intelligence**:
  - 🟢 **On Track**: Current planned pace guarantees target milestone.
  - 🟡 **Achievable via Grind**: Target is reachable purely through gameplay without spending Golden Eagles.
  - 🔴 **Mathematically Impossible Without GE**: When remaining season days and daily limits prevent reaching the target for free, the calculator unlocks the GE buyout solver.
- **Tiered Golden Eagles (GE) Buyout Engine**:
  - Automatically calculates GE cost using Gaijin's tiered pricing (75 / 125 / 175 / 250 GE brackets).
  - Tracks the official **Day 28 GE buyout lock** with live days countdown.
  - **Cost-Saving Optimization Advisor**: Recommends when upgrading to the Improved Battle Pass (+15 levels for 500 GE) saves Golden Eagles over purchasing levels individually (saving up to 625 GE!).

### 3. ⚔️ Interactive Season 25 Challenges Checklist
- Full interactive checklist for all 14 Season XXV challenges.
- Real-time status badges: `Active Now (Ends in X days)`, `Upcoming`, `Expired`, or `Level Locked` (automatically compared against your current in-game level).
- Automatic **+45 PP Master Challenge Bonus** ("A well-earned trophy") activation when all 14 challenges are checked.

### 4. 🗺️ Milestone & Reward Roadmap (Levels 1 to 150+)
- Visual reward timeline with status indicators: `Already Unlocked`, `Projected to Unlock`, and `Locked / Missed`.
- Category filtering: *All Rewards*, *Free Rewards Only*, *Vehicles*, and *Market Coupon Upgrades*.

### 5. 📊 Points Composition & Login Tier Visualizer
- Visual stacked breakdown of all point sources (Starting Level, Improved Pass, Logins, Dailies, Special Tasks, Challenges).
- Comprehensive reference table of the **5 Login Tiers** highlighting your current active tier and projected ceiling.

### 6. 💾 Session Sync & Persistence
- Automatically synchronizes all inputs, checked challenges, and preferences to `localStorage`.
- **Export to JSON**: Download a backup file of your entire configuration.
- **Import from JSON**: Restore your state from a file or pasted JSON text.
- **Custom / Future Season Mode**: Configure custom start dates, durations, and themes for future seasons.

---

## 📐 Exact War Thunder Battle Pass Mathematical Specification

The calculation engine (`src/utils/bpMath.ts`) strictly implements official Gaijin Battle Pass mechanics:

### 1. Progress Points (PP) & Level Conversion
$$\text{Level} = \left\lfloor \frac{\text{Total PP}}{10} \right\rfloor$$
- **1 Battle Pass Level** = `10 Progress Points (PP)`.
- **Standard Battle Pass Cost:** `2,000 Golden Eagles (GE)` (access to paid rewards, 0 bonus PP).
- **Improved Battle Pass Cost:** `2,500 Golden Eagles (GE)` (access to paid rewards + immediate `+150 PP` / `+15 Levels`).

### 2. Cumulative Season Login Tiers (Non-Resetting)
Missing a day does **not** reset your tier; it simply forfeits one day from the maximum logins remaining in the season:

| Login Day Range | Duration | PP Per Day | Cumulative Tier Max |
| :--- | :---: | :---: | :---: |
| **Logins 1 to 21** | 21 days | **1 PP** | 21 PP |
| **Logins 22 to 42** | 21 days | **2 PP** | 42 PP |
| **Logins 43 to 63** | 21 days | **3 PP** | 63 PP |
| **Logins 64 to 77** | 14 days | **4 PP** | 56 PP |
| **Logins 78 to 91+** | 14 days | **5 PP** | 70 PP |
| **Full Season Total** | **91 days** | — | **252 PP (25.2 Levels)** |

### 3. Daily Tasks (Easy & Medium)
- **Easy Daily Task:** `2 PP` per day (Max over 91 days: `182 PP`).
- **Medium Daily Task:** `3 PP` per day (Max over 91 days: `273 PP`).
- **Combined Daily Tasks:** `5 PP` per day (Max over 91 days: `455 PP` = 45.5 Levels).
- *Constraint:* Completing a Medium Task requires completing an Easy Task on that day (`Planned Medium Tasks` $\le$ `Planned Easy Tasks`).

### 4. Special Tasks
- **Reward:** `5 PP` per task (+1 Special Task Medal for Warbond Shop).
- **Cost:** `30 Warbonds (WB)` per task permit.
- **Unlock Mechanism:** Unlocked in the Warbond Shop by completing a Medium Daily Task.

### 5. Season Challenges
- **14 Standard Challenges:** `30 PP` each ($14 \times 30 = 420\text{ PP}$).
- **15th Master Challenge ("A well-earned trophy"):** Completing all 14 challenges automatically grants **`+45 PP`**.
- **Total Possible from Challenges:** $420 + 45 = 465\text{ PP}$ (46.5 Levels).

### 6. Golden Eagles (GE) Level Buyout Formula (Unlocks after Day 28)
Levels purchased individually with Golden Eagles follow tiered pricing:
$$\text{Cost per Level} = \begin{cases} 75\text{ GE} & 1 \le \text{Purchase Index} \le 15 \\ 125\text{ GE} & 16 \le \text{Purchase Index} \le 25 \\ 175\text{ GE} & 26 \le \text{Purchase Index} \le 35 \\ 250\text{ GE} & \text{Purchase Index} \ge 36 \end{cases}$$

---

## 🛠️ Tech Stack & Architecture

- **Framework:** React 18+ with TypeScript
- **Bundler:** Vite
- **Styling:** Tailwind CSS (configured for a dark tactical UI with amber/gold accents)
- **Icons:** Lucide React
- **Unit Testing:** Vitest (comprehensive suite covering all mathematical edge cases)
- **CI/CD:** GitHub Actions (`.github/workflows/deploy.yml`) deploying automatically to GitHub Pages

```
src/
├── types/
│   └── battlepass.ts       # Strictly typed models & interfaces
├── utils/
│   ├── bpMath.ts           # Exact Gaijin mathematical engine & reverse solver
│   ├── bpMath.test.ts      # 17 automated mathematical unit tests
│   ├── storage.ts          # LocalStorage sync, JSON export/import & reset
│   └── formatters.ts       # UTC time, countdowns, and currency formatters
├── data/
│   └── seasons.ts          # 2026 Season XXV ("Steel Fury") data payload
├── components/
│   ├── Header.tsx           # Season header, UTC countdown & telemetry bar
│   ├── CurrentStatusCard.tsx# In-game level, pass tier & baseline status
│   ├── FuturePaceCard.tsx   # Pace planner: logins, dailies, special tasks
│   ├── RoadTo150Card.tsx    # Reverse planner, feasibility badge & GE buyout
│   ├── ChallengesTab.tsx    # Interactive Season 25 challenges checklist
│   ├── RoadmapTab.tsx       # Levels 1 to 150 reward roadmap
│   ├── BreakdownTab.tsx     # Visual points breakdown & 5 login tiers table
│   ├── CustomSeasonModal.tsx# Custom season editor modal
│   └── BackupModal.tsx      # Export / Import JSON & Reset modal
├── App.tsx                  # Root dashboard layout
└── main.tsx                 # React entry point
```

---

## 💻 Local Development Setup

### Prerequisites
- Node.js `v18+` or `v20+`
- npm `v9+` or `v10+`

### Installation & Execution
```bash
# Clone repository
git clone https://github.com/<your-username>/<your-repo-name>.git
cd <your-repo-name>

# Install dependencies
npm install

# Run Vitest mathematical verification suite
npm test

# Launch local development server
npm run dev
```

### Production Build
```bash
npm run build
```
The optimized static bundle will be built in the `dist/` directory.

---

## 🌐 GitHub Pages Automated Deployment

This repository is pre-configured for automated deployment to GitHub Pages:
1. `vite.config.ts` uses `base: './'` so assets resolve smoothly under any repository subpath.
2. Push your code to the `main` branch.
3. In your GitHub repository:
   - Navigate to **Settings** > **Pages**.
   - Under **Build and deployment** > **Source**, select **GitHub Actions**.
4. The workflow in `.github/workflows/deploy.yml` will automatically run tests, build the application, and deploy it to `https://<your-username>.github.io/<your-repo-name>/`.

---

## 📜 Disclaimer
War Thunder is a registered trademark of Gaijin Entertainment. This project is an independent, non-commercial open-source tool created for the War Thunder player community.
