# ExamOS — Online Examination & Result Processing System
> **Operating Systems Mini-Project & Case Study (Assignment No. 3 & Practical No. 09)**  
> **Department of Computer Science and Engineering**  
> **Course:** Operating Systems (5th Sem Section B)  
> **Subject Teacher:** Dr. Pallavi Wankhede  
> **Selected Problem:** Problem 4 — Online Examination and Result Processing System  
> **Student Name:** Joel Biju | **Roll No. / UID:** 24003129  
> **Date of Submission:** 29/10/2026  

---

## 📌 Project Overview

During peak examination submission countdowns (such as university semester exams, national entrance tests, or certification assessments), thousands of students submit their completed answer scripts in the exact final seconds. 

Without rigorous Operating System-level resource management:
1. Student answer packets write to shared memory concurrently, triggering **race conditions and lost submissions**.
2. Long auto-grading and plagiarism verification tasks monopolize the CPU, **starving shorter MCQ scoring tasks**.
3. Competing evaluation threads claim Auto-Grading Engine Threads, Database Ledger Write Locks, and PDF Generator Slots simultaneously, causing **circular wait deadlocks**.
4. Large student response payloads and rank computation heaps exhaust RAM, resulting in severe **external fragmentation or out-of-memory crashes**.

**ExamOS** is an interactive, problem-oriented Operating Systems Algorithm Visualizer that models and resolves these high-concurrency bottlenecks by implementing four foundational OS mechanisms working in harmony:

1. **Process Synchronization (Producer–Consumer with Bounded Buffer):** Thread-safe submission ingestion queue using binary mutex and counting semaphores (`mutex`, `empty`, `full`).
2. **CPU Task Scheduling:** Multi-algorithm evaluation engine supporting Round Robin ($q = 2\text{ ms}$), Shortest Job First (SJF), First-Come First-Served (FCFS), and Priority Scheduling with interactive Gantt charts, metrics, and starvation analysis.
3. **Deadlock Avoidance (Banker's Algorithm):** Real-time safety analysis using Allocation, Max Demand, Need, and Available matrices for Auto-Grading Threads ($R_1$), Database Write Locks ($R_2$), and PDF Generator Slots ($R_3$), complete with a dynamic resource-request tester.
4. **Memory Management (Dynamic Partitioning):** Contiguous RAM allocation engine implementing First Fit, Best Fit, and Worst Fit, tracking internal and external fragmentation, memory holes, and runtime compaction.
5. **Integrated Exam Pipeline:** End-to-end simulation tracking student answer scripts as they move through ingestion, scheduling, deadlock safety checks, RAM allocation, and scorecard publishing.

---

## 🚀 Core Visualizer Modules

### 1. Ingestion Buffer (Process Synchronization)
- **Bounded Buffer:** Configurable submission buffer capacity $N$ (default: 8 slots).
- **Semaphores & Mutex:** Real-time visual tracking of `mutex` (1 = unlocked, 0 = locked), `empty` (free slots), and `full` (queued answer scripts).
- **Peak Burst Simulation:** "⚡ Peak Submission Burst (5 Submissions)" simulates final-second exam countdown surges to show buffer saturation, blocking, and sleep-wakeup mechanisms.
- **Thread Monitor:** Live status tracking for incoming student submission threads (Producers) and background auto-grading workers (Consumers).

### 2. CPU Examination Task Scheduling
- **Evaluation Tasks Modeled:**
  - `P0`: MCQ Objective Scoring (Burst: 5 ms)
  - `P1`: Plagiarism & Similarity Scan (Burst: 3 ms)
  - `P2`: Descriptive Code Evaluation (Burst: 8 ms)
  - `P3`: Percentile & Rank Computation (Burst: 2 ms)
  - `P4`: PDF Result Card Generation (Burst: 6 ms)
- **Algorithms Implemented:**
  - **Round Robin (RR)** with adjustable Time Quantum $q$ (optimal for fair-share exam turnaround with zero starvation)
  - **Shortest Job First (SJF)** (Preemptive & Non-Preemptive)
  - **Priority Scheduling** (Preemptive & Non-Preemptive)
  - **First-Come, First-Served (FCFS)** (demonstrates Convoy Effect during heavy burst jobs)
- **Visuals & Metrics:** Interactive animated Gantt chart with timeline scrubber, Completion Time (CT), Turnaround Time (TAT), Waiting Time (WT), CPU Utilization (%), and Throughput.

### 3. Deadlock Avoidance (Banker's Algorithm)
- **Shared Resources Modeled:**
  - $R_1$: Auto-Grading Engine Threads (10 total instances)
  - $R_2$: Database Write Locks on Result Ledger (5 total instances)
  - $R_3$: PDF Generator & Rank Slots (7 total instances)
- **System Matrices:** Dynamic rendering of **Allocation Matrix**, **Max Demand Matrix**, **Need Matrix** ($\text{Max} - \text{Allocation}$), and **Available Vector** $(3, 3, 2)$.
- **Safety Algorithm:** Step-by-step resolution logs updating the Work vector and discovering the **Safe Sequence**:
  $$\mathbf{\langle P_1 \to P_3 \to P_4 \to P_0 \to P_2 \rangle}$$
- **Resource Request Evaluator:** Interactive tester to simulate process resource requests and observe immediate granting or prevention of unsafe states (with state rollback).
- **State Presets:** One-click toggling between Normal Safe State and Deadlock Hazard Unsafe State.

### 4. Memory Management (RAM Partition Allocation)
- **Total Physical RAM:** 1024 KB real-time buffer / 1700 MB benchmark physical memory pool.
- **Dynamic Allocation Policies:**
  - **First Fit:** Fast search, leaves early fragments.
  - **Best Fit:** Selects the smallest sufficient free partition, preserving large blocks (optimal for exam payloads).
  - **Worst Fit:** Allocates the largest hole, breaking large contiguous blocks.
- **Fragmentation Diagnostics:** Real-time tracking of Total Free RAM, External Fragmentation, Internal Fragmentation, and RAM Utilization percentage.
- **Memory Compaction:** One-click runtime defragmentation to coalesce non-contiguous memory holes into a single continuous block.

### 5. Integrated Live Pipeline
- End-to-end visualization tracing student answer scripts through all 5 sequential OS stages:
  1. Student Submission Ingestion (Semaphore queue)
  2. CPU Task Scheduling & Dispatcher (Round Robin)
  3. Banker's Deadlock Safety Validation
  4. RAM Partition Allocation & Buffer Storage
  5. Grading Completed & Result Card Published

---

## 📊 Benchmark Workload & Calculations

| Task ID | Exam Operation | Arrival | Burst | Memory | Allocation (A B C) | Max (A B C) | Need (A B C) |
|:---:|:---|:---:|:---:|:---:|:---:|:---:|:---:|
| **P0** | MCQ Objective Scoring | 0 ms | 5 ms | 212 MB | (0, 1, 0) | (7, 5, 3) | (7, 4, 3) |
| **P1** | Plagiarism & Similarity Scan | 1 ms | 3 ms | 417 MB | (2, 0, 0) | (3, 2, 2) | (1, 2, 2) |
| **P2** | Descriptive Code Evaluation | 2 ms | 8 ms | 112 MB | (3, 0, 2) | (9, 0, 2) | (6, 0, 0) |
| **P3** | Percentile & Rank Computation | 3 ms | 2 ms | 426 MB | (2, 1, 1) | (2, 2, 2) | (0, 1, 1) |
| **P4** | PDF Result Card Generation | 4 ms | 6 ms | 90 MB | (0, 0, 2) | (4, 3, 3) | (4, 3, 1) |

- **Shared System Resources:**
  - $R_1$ (Resource A): Auto-Grading Engine Threads ($10$ total instances)
  - $R_2$ (Resource B): Database Write Locks on Result Ledger ($5$ total instances)
  - $R_3$ (Resource C): PDF Generator & Rank Slots ($7$ total instances)
- **Initial Available Vector:** $(3, 3, 2)$
- **Physical Memory Partitions:** `100 MB`, `500 MB`, `200 MB`, `300 MB`, and `600 MB` (Total Physical RAM Pool: `1700 MB`).

### 1. Process Synchronization Trace (Bounded Buffer, $N = 5$)
Demonstrating how counting semaphores handle arrival surges when consumers are busy:

| Event | `empty` | `full` | Synchronization Action & State |
|:---|:---:|:---:|:---|
| **Submissions 1 to 5 arrive** | 0 | 5 | All 5 inserted; buffer reaches full capacity. |
| **Submission 6 arrives** | 0 | 5 | Producer blocks safely on `wait(empty)`. |
| **Consumer dequeues Submission 1** | 1 | 4 | `signal(empty)` increments count and awakens Producer 6. |
| **Submission 6 inserted; Submission 7 arrives** | 0 | 5 | Submission 6 queued; Producer 7 blocks safely until next removal. |

* **Outcome:** Zero lost submissions, zero race conditions, and automatic thread synchronization.

### 2. CPU Scheduling Analysis (Round Robin $q = 2\text{ ms}$)

**Detailed Metrics per Task:**

| Task ID | Exam Operation | Arrival | Burst | Completion (CT) | Turnaround (TAT) | Waiting (WT) |
|:---:|:---|:---:|:---:|:---:|:---:|:---:|
| **P0** | MCQ Objective Scoring | 0 ms | 5 ms | 16 ms | 16 ms | 11 ms |
| **P1** | Plagiarism & Similarity Scan | 1 ms | 3 ms | 13 ms | 12 ms | 9 ms |
| **P2** | Descriptive Code Evaluation | 2 ms | 8 ms | 24 ms | 22 ms | 14 ms |
| **P3** | Percentile & Rank Computation | 3 ms | 2 ms | 10 ms | 7 ms | 5 ms |
| **P4** | PDF Result Card Generation | 4 ms | 6 ms | 22 ms | 18 ms | 12 ms |
| **Average**| — | — | — | — | **15.0 ms** | **10.2 ms** |

**Algorithm Comparison:**

| Algorithm | Avg. Turnaround Time | Avg. Waiting Time | Analysis & Real-World Exam Suitability |
|:---|:---:|:---:|:---|
| **FCFS** | 12.2 ms | 7.4 ms | Long code grading (P2) blocks quick MCQ scoring (**Convoy Effect**). |
| **SJF (Non-Preemptive)** | 10.4 ms | 5.6 ms | Lowest waiting time, but long evaluations suffer **starvation**. |
| **Round Robin ($q = 2$)** | 15.0 ms | 10.2 ms | **Selected Algorithm:** Guarantees zero starvation, fairness, and bounded latency. |

### 3. Deadlock Safety Resolution (Banker's Algorithm)
Starting Work Vector = Available = `(3, 3, 2)`:

| Step | Candidate Task | Need $\le$ Work Check | Work after Task Finish & Release | Status |
|:---:|:---:|:---:|:---:|:---:|
| 1 | **P1** | $(1, 2, 2) \le (3, 3, 2)$ &rarr; **Yes** | $(3, 3, 2) + (2, 0, 0) = \mathbf{(5, 3, 2)}$ | Finishes |
| 2 | **P3** | $(0, 1, 1) \le (5, 3, 2)$ &rarr; **Yes** | $(5, 3, 2) + (2, 1, 1) = \mathbf{(7, 4, 3)}$ | Finishes |
| 3 | **P4** | $(4, 3, 1) \le (7, 4, 3)$ &rarr; **Yes** | $(7, 4, 3) + (0, 0, 2) = \mathbf{(7, 4, 5)}$ | Finishes |
| 4 | **P0** | $(7, 4, 3) \le (7, 4, 5)$ &rarr; **Yes** | $(7, 4, 5) + (0, 1, 0) = \mathbf{(7, 5, 5)}$ | Finishes |
| 5 | **P2** | $(6, 0, 0) \le (7, 5, 5)$ &rarr; **Yes** | $(7, 5, 5) + (3, 0, 2) = \mathbf{(10, 5, 7)}$ | Finishes |

* **Safe Execution Sequence:** $\mathbf{\langle P1 \to P3 \to P4 \to P0 \to P2 \rangle}$
* **Dynamic Request Verification:**
  - **Granted:** $P1$ requests $(1, 0, 2)$. Resulting Available $(2, 3, 0)$ remains safe $\implies$ **Approved**.
  - **Denied:** $P4$ requests $(3, 3, 0)$. Resulting Available $(0, 0, 2)$ causes circular wait hazard $\implies$ **Rejected & Rolled Back**.

### 4. Memory Allocation Comparison: First Fit vs. Best Fit
With the 5 physical partitions (`100`, `500`, `200`, `300`, `600` MB):

| Task ID | Memory Payload | First Fit Placement (Remaining Hole) | Best Fit Placement (Remaining Hole) |
|:---:|:---:|:---|:---|
| **P0** | 212 MB | Placed in 500 MB partition (leaves 288 MB) | Placed in 300 MB partition (leaves 88 MB) |
| **P1** | 417 MB | Placed in 600 MB partition (leaves 183 MB) | Placed in 500 MB partition (leaves 83 MB) |
| **P2** | 112 MB | Placed in remaining 500 MB hole (leaves 176 MB) | Placed in 200 MB partition (leaves 88 MB) |
| **P3** | 426 MB | ❌ **NOT ALLOCATED (Blocked)** | Placed in 600 MB partition (leaves 174 MB) |
| **P4** | 90 MB | Placed in 100 MB partition (leaves 10 MB) | Placed in 100 MB partition (leaves 10 MB) |
| **Outcome** | — | **Failed:** 869 MB total free, but P3 blocked by **External Fragmentation** | **Success:** All 5 tasks allocated; 443 MB free |

---

## 🧪 Comprehensive Verification Test Cases

| Test Case | Scenario / Input | Expected OS Behavior | Actual Result | Status |
|:---|:---|:---|:---|:---:|
| **1. Normal Load** | 5 submissions arrive into buffer size 5 | All submissions safely queued and evaluated without loss | Full ingestion and processing completed | **PASS** |
| **2. Peak Load Surge** | 10 submissions arrive into buffer size 3 | Producers block safely when buffer is full; resume as consumers dequeue | Zero dropped packets; thread sleeping & wakeup verified | **PASS** |
| **3. Safe Resource Request** | $P1$ requests $(1, 0, 2)$ | System checks Need & Available, confirms safe sequence remains, grants resources | Resources allocated; sequence $\langle P1 \to P3 \to P4 \to P0 \to P2 \rangle$ intact | **PASS** |
| **4. Unsafe Resource Request** | $P4$ requests $(3, 3, 0)$ | Banker's safety test detects potential circular wait; rolls back allocation | Request denied; system stays in safe state | **PASS** |
| **5. Memory Fragmentation** | $P3$ (426 MB) arrives | First Fit fails due to external fragmentation; Best Fit allocates in 600 MB block | Verified memory hole preservation and defragmentation | **PASS** |



---

## 📂 Project Structure

```
p:/OS mini project/
├── index.html                   # Main ExamOS Visualizer Web Application
├── style.css                    # Glassmorphism dashboard styling & CSS animations
├── app.js                       # Navigation router, Web Audio synthesizer & live state clock
├── js/
│   ├── producer-consumer.js     # Bounded buffer mutex & semaphore simulation
│   ├── cpu-scheduler.js         # Round Robin, SJF, FCFS, Priority, Gantt chart & metrics
│   ├── bankers-algorithm.js     # Matrices, safety algorithm & resource request evaluator
│   ├── memory-manager.js        # First/Best/Worst fit, fragmentation & compaction
│   └── integrated-pipeline.js   # Live multi-stage exam submission pipeline
├── report.html                  # Print-ready 5-Page Case Study Academic Report (Assignment 3)
├── CASE_STUDY_REPORT.md         # Comprehensive markdown version of Assignment 3 report
├── Case_Study_Report.pdf        # Pre-generated academic PDF report submission
├── generate_pdf.py              # Automated Playwright PDF generation script with Chromium
├── screenshots/                 # High-resolution visualizer UI screenshots for report
└── README.md                    # Project documentation & viva guide
```

---

## 💻 How to Run Locally

No build tools, compilation steps, or third-party web frameworks are required. The visualizer runs in any modern browser.

### Option 1: Direct File Launch
Double click `index.html` or run via Windows PowerShell:
```powershell
start index.html
```

### Option 2: Local HTTP Server (Recommended)
Using Python's built-in HTTP server:
```powershell
python -m http.server 8000
```
Then navigate to: **`http://localhost:8000`** in your browser.

---

## 📄 Academic Case Study Report & PDF Export

The project includes the comprehensive **Assignment No. 3 Complex Problem-Solving Case Study Report**:

1. **Web / Print Version (`report.html`):** Open in any browser and click the floating **"Print to PDF"** button (or press `Ctrl + P`) with margins set to "None" and "Background graphics" checked.
2. **Automated PDF Generator (`generate_pdf.py`):** Uses headless Playwright to programmatically render `report.html` into a pixel-perfect, two-column IEEE/ACM-style academic PDF (`Case_Study_Report.pdf`).
   ```powershell
   python generate_pdf.py
   ```
3. **Markdown Version (`CASE_STUDY_REPORT.md`):** Complete structured documentation containing problem analysis, mathematical derivations, verification test cases, and references.

---

## 🎓 Key Viva Questions Quick Reference

| Topic | Key Question | 1-Line Viva Answer |
|---|---|---|
| **Process Synchronization** | Why use counting semaphores with mutex? | `mutex` guarantees mutual exclusion while `empty` and `full` semaphores prevent buffer overflow and underflow without busy waiting. |
| **CPU Scheduling** | Why choose Round Robin ($q=2$)? | Prevents the Convoy Effect and eliminates thread starvation, giving all exam evaluation tasks fair and bounded turnaround times. |
| **Deadlock Avoidance** | What is an unsafe state? | An unsafe state is not necessarily a deadlock, but one where the OS can no longer guarantee that all processes will finish without deadlock. |
| **Memory Allocation** | Why did Best Fit outperform First Fit? | Best Fit places requests in the smallest suitable partition, preventing large partitions from being fragmented by small tasks. |
| **Fragmentation** | How to fix external fragmentation? | At runtime via **Compaction**, or at architecture level via non-contiguous **Paging / Virtual Memory**. |
