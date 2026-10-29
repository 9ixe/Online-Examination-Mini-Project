# ShopOS — E-Commerce OS Kernel & Algorithm Visualizer

> **Operating Systems Mini-Project & Case Study (Assignment No. 3 & Practical No. 09)**  
> **Course:** Operating Systems (5th Sem Section B)  
> **Subject Teacher:** Dr. Pallavi Wankhede  
> **Problem Statement Selected:** Problem 2 — Online Shopping and Order Processing System  

---

## 📌 Project Overview

During massive promotional events (e.g., Black Friday, Big Billion Days, Prime Day), hundreds of thousands of customer checkouts arrive simultaneously at an e-commerce platform. Order processing tasks consume memory and compete for shared resources including inventory locks, payment processing channels, and database connection pools.

**ShopOS** is an interactive, problem-oriented Operating Systems Algorithm Visualizer designed to demonstrate how four foundational OS mechanisms collaborate to build a resilient, deadlock-free, high-throughput transaction engine:

1. **Process Synchronization (Producer–Consumer with Semaphores & Mutex):** Thread-safe bounded buffer queue for high-concurrency order checkouts.
2. **CPU Scheduling:** Priority Scheduling (Preemptive & Non-Preemptive), Round Robin, FCFS, and SJF with animated Gantt charts and TAT/WT metrics.
3. **Deadlock Avoidance (Banker's Algorithm):** Real-time evaluation of Allocation, Maximum, and Available matrices for Payment Gateways, Inventory Locks, and DB Pools.
4. **Memory Management:** First Fit, Best Fit, and Worst Fit dynamic partition allocation, coalescing, memory compaction, and internal/external fragmentation analytics.
5. **Integrated Live Pipeline Demo:** End-to-end visualization of orders traveling through all 4 OS stages.

---

## 🚀 Live Visualizer Features

### 1. Ingestion Buffer (Producer–Consumer)
- **Bounded Buffer:** Configurable buffer capacity $N$ (default: 8 slots).
- **Semaphores & Mutex:** Real-time tracking of `mutex` (1=free, 0=locked), `empty` (available slots), and `full` (queued orders).
- **Burst Simulation:** "⚡ Flash Sale Burst (5 Orders)" simulates sudden spikes to demonstrate buffer saturation and queueing.
- **Thread Monitor:** Live status tracking for active checkout producers and order consumer workers.

### 2. CPU Order Scheduling
- **Algorithms Implemented:**
  - Priority Scheduling (Non-Preemptive)
  - Priority Scheduling (Preemptive)
  - Round Robin (RR) with adjustable Time Quantum $q$
  - First-Come, First-Served (FCFS)
  - Shortest Job First (SJF)
- **Visuals:**
  - Interactive Gantt chart with playback controls (Play, Pause, Replay).
  - Accurate metrics: Completion Time (CT), Turnaround Time (TAT), Waiting Time (WT), CPU Utilization (%), and Throughput.
  - Color-coded customer tiers (Prime VIP vs Regular Guests).

### 3. Deadlock Avoidance (Banker's Algorithm)
- **Shared Resources Modeled:**
  - $R_1$: Payment Gateway Channels (Stripe / PayPal pool)
  - $R_2$: Inventory Stock Reservation Locks
  - $R_3$: Database Connection Pool (PostgreSQL pool)
- **Matrices:** Live dynamic rendering of Allocation, Max Demand, Need ($\text{Max} - \text{Allocation}$), and Available vectors.
- **Safety Algorithm:** Step-by-step resolution logging Work vector updates and finding the **Safe Sequence** (e.g., $\langle P_1, P_3, P_4, P_0, P_2 \rangle$).
- **Resource Request Tester:** Interactive form to simulate process resource requests and observe immediate granting or prevention of unsafe states.
- **Presets:** Quick toggling between Safe State and Unsafe State (Deadlock Hazard).

### 4. Memory Management (RAM Heap Partitioning)
- **Total RAM:** 1024 KB physical RAM payload buffer.
- **Allocation Policies:** First Fit, Best Fit, and Worst Fit.
- **Visuals:** Proportional RAM partition bar showing allocated blocks, base addresses, and free memory holes.
- **Compaction & Coalescing:** One-click memory compaction to eliminate external fragmentation and merge non-contiguous holes.
- **Fragmentation Analytics:** Real-time tracking of Total Free RAM, External Fragmentation, Internal Fragmentation, and RAM Utilization.

### 5. Flash Sale Live Pipeline
- Real-time simulation where customer carts move through all 5 sequential stages:
  1. Bounded Ingestion Buffer
  2. CPU Task Dispatcher
  3. Banker's Deadlock Safety Gate
  4. RAM Partition Allocation
  5. Order Fulfilled & Dispatched

---

## 📂 Project Structure

```
p:/OS mini project/
├── index.html                   # Main Visualizer Web Application
├── style.css                    # Glassmorphism cyber-dashboard theme & animations
├── app.js                       # Navigation router, Web Audio synthesizer & live clock
├── js/
│   ├── producer-consumer.js     # Bounded buffer mutex & semaphore simulation
│   ├── cpu-scheduler.js         # Priority, Round Robin, Gantt chart & metrics
│   ├── bankers-algorithm.js     # Matrices, safety check & resource request evaluator
│   ├── memory-manager.js        # First/Best/Worst fit, fragmentation & compaction
│   └── integrated-pipeline.js   # Live multi-stage flash sale pipeline
├── report.html                  # Print-ready 5-Page Case Study Report (Assignment 3)
├── CASE_STUDY_REPORT.md         # Markdown version of Assignment 3 report
└── README.md                    # Project documentation & GitHub submission guide
```

---

## 💻 How to Run Locally

No external dependencies, build tools, or packages are required. The visualizer runs in any modern web browser.

### Option 1: Direct File Open
Double click or open `index.html` in Chrome, Edge, Firefox, or Safari:
```bash
start index.html
```

### Option 2: Local HTTP Server (Recommended)
Using Python:
```bash
python -m http.server 8000
```
Then navigate to: `http://localhost:8000`

---

## 📄 Case Study Report Submission

The complete 5-page Case Study Report required for **Assignment No. 3** is included in two formats:
1. `report.html`: Open in any browser and click the floating **"Print to PDF (Report)"** button (or press `Ctrl + P`) to export a formatted academic PDF.
2. `CASE_STUDY_REPORT.md`: Comprehensive markdown file containing all 7 required sections, diagrams, pseudocode, and worked mathematical derivations.
