# Assignment No. 3 — Complex Problem-Solving Case Study Report

**Department of Computer Science and Engineering**  
**Course:** Operating Systems  
**Class:** 5th SEM Section B  
**Subject Teacher:** Dr. Pallavi Wankhede  
**Selected Problem:** Problem 4 — Online Examination and Result Processing System  
**Student Name:** Joel Biju  
**Roll No. / UID:** 24003129  
**Date of Submission:** 29/10/2026  

---

# A Resource Management Solution for Concurrent Examination Evaluation and Result Processing Systems

---

## 1. Selected Problem Statement and Real-World Context

### 1.1 Problem Statement
> **Problem 4: Online Examination and Result Processing System**  
> An online examination platform manages student logins, question-paper delivery, answer submissions, automatic evaluation, and result generation. During examinations, many students submit answers simultaneously, creating a large number of processing tasks and memory requests.  
> **Challenge:** Develop a resource-management solution that schedules examination-related tasks, processes submitted answers through synchronized queues, allocates memory efficiently, and avoids unsafe resource allocation during peak workloads.

### 1.2 Real-World Context
During peak examination windows (such as university semester exams, national entrance tests, or certification assessments), thousands of students submit their completed answer scripts in the exact final countdown seconds. If requests are handled without rigorous Operating System-level coordination:
1. Student answer packets write to shared memory simultaneously, triggering race conditions and dropped submissions.
2. Long auto-grading and plagiarism verification tasks monopolize the CPU, starving shorter MCQ scoring tasks.
3. Competing worker threads simultaneously claim Auto-Grading Execution Threads, Database Ledger Write Locks, and PDF Generator Slots, causing circular wait deadlocks that freeze the grading pipeline.
4. Large student response payloads and rank computation heaps exhaust available RAM, leading to severe external fragmentation or out-of-memory crashes.

Applying fundamental OS concepts ensures reliable, dead-lock free, and fair high-concurrency exam processing.

---

## 2. Problem Analysis, Objectives, Constraints, and Assumptions

### 2.1 Problem Analysis
During final submission rushes, the system faces four critical concurrency bottlenecks:
- **Submission Ingestion Bottleneck:** Thousands of web client submissions attempt to enqueue answer payloads simultaneously.
- **CPU Scheduling Bottleneck:** Short objective MCQ grading requires quick turnaround, while complex descriptive evaluation and ranking tasks require substantial CPU bursts.
- **Deadlock Bottleneck:** Evaluation worker threads hold grading engine slots while waiting for database ledger write locks and PDF rendering slots.
- **Memory Allocation Bottleneck:** Variable student answer payloads create memory holes (fragmentation) across system partitions.

### 2.2 Objectives
- Build a thread-safe bounded buffer queue for the Producer-Consumer problem to ingest answer scripts without loss or race conditions.
- Schedule evaluation tasks using Round Robin and priority mechanisms to ensure fair latency without thread starvation.
- Employ Banker’s Algorithm to test safety before granting shared grading threads, database locks, or PDF slots to prevent deadlocks.
- Dynamically allocate memory blocks using Best Fit and First Fit while tracking internal and external fragmentation.

### 2.3 Constraints & Assumptions
- Fixed submission buffer capacity ($N = 8$ slots).
- Shared system resources:
  - $R_1$: Auto-Grading Engine Threads ($10$ total instances)
  - $R_2$: Database Write Locks on Result Ledger ($5$ total instances)
  - $R_3$: PDF Generator & Rank Slots ($7$ total instances)
- Total physical memory pool of $1700\text{ MB}$ (divided into partitions of 100, 500, 200, 300, and 600 MB) or $1024\text{ KB}$ in real-time simulation.
- Each evaluation task declares its maximum resource needs upon arrival; resources are non-preemptible and released upon task completion.

---

## 3. Four Core Operating System Concepts: Explanation and Justification

### 3.1 Producer–Consumer Problem (Bounded Buffer Queue)
- **Concept:** Student submission portals act as Producers enqueuing answer scripts. Auto-evaluation background threads act as Consumers dequeuing tasks over a synchronized bounded buffer.
- **Justification:** Without controlled queue access, concurrent submissions overwrite buffer slots. Regulating empty and full queue bounds ensures that submissions wait when the buffer is full and consumers sleep when the queue is empty, eliminating dropped answers and race conditions.

### 3.2 CPU Scheduling (Fair-Share Round Robin & Multi-Algorithm Analysis)
- **Concept:** Evaluates Round Robin ($q = 2$), Shortest Job First (SJF), and First-Come First-Served (FCFS).
- **Justification:** Under peak exam load, Round Robin prevents long plagiarism checks from delaying quick MCQ score publications. While SJF achieves lowest average waiting time ($5.6\text{ ms}$), Round Robin ensures bounded latency and zero starvation ($TAT = 15.0\text{ ms}, WT = 10.2\text{ ms}$).

### 3.3 Deadlock Avoidance (Banker's Algorithm)
- **Concept:** Uses the Safety Algorithm with Available, Max, Allocation, and Need matrices before granting shared resources.
- **Justification:** If thread P1 holds grading engines while waiting for database locks, and P2 holds database locks waiting for grading engines, the system deadlocks. Proactive safety validation prevents the system from ever entering an unsafe state.

### 3.4 Memory Management (Dynamic Partitioning: First Fit vs Best Fit)
- **Concept:** Allocates contiguous RAM blocks for student token caches, answer payloads, and score sheets.
- **Justification:** Best Fit minimizes wasted partition space. On our benchmark workload, Best Fit allocates all 5 tasks leaving $443\text{ MB}$ free, whereas First Fit suffers from external fragmentation and leaves task P3 ($426\text{ MB}$) blocked despite $869\text{ MB}$ total free memory.

---

## 4. Benchmark Workload & Calculations

### 4.1 System Tasks Matrix
| Task ID | Exam Operation | Arrival | Burst | Memory | Allocation (A B C) | Max (A B C) | Need (A B C) |
|---|---|---|---|---|---|---|---|
| **P0** | MCQ Objective Scoring | 0 | 5 | 212 MB | (0, 1, 0) | (7, 5, 3) | (7, 4, 3) |
| **P1** | Plagiarism & Similarity Scan | 1 | 3 | 417 MB | (2, 0, 0) | (3, 2, 2) | (1, 2, 2) |
| **P2** | Descriptive Code Evaluation | 2 | 8 | 112 MB | (3, 0, 2) | (9, 0, 2) | (6, 0, 0) |
| **P3** | Percentile & Rank Computation | 3 | 2 | 426 MB | (2, 1, 1) | (2, 2, 2) | (0, 1, 1) |
| **P4** | PDF Result Card Generation | 4 | 6 | 90 MB | (0, 0, 2) | (4, 3, 3) | (4, 3, 1) |

- **Total Resources:** $A=10, B=5, C=7$
- **Available Vector:** $(3, 3, 2)$
- **Safe Sequence:** $\langle P1 \to P3 \to P4 \to P0 \to P2 \rangle$

---

## 5. Verification Test Cases

1. **Normal Submissions Load:** 5 submissions arrive into buffer size 5 &rarr; All enqueued and evaluated successfully (`Pass`).
2. **Peak Burst Submissions:** 10 submissions arrive into buffer size 3 &rarr; Producers block safely on full buffer until consumer dequeues (`Pass`).
3. **Safe Resource Request:** P1 requests $(1, 0, 2)$ &rarr; Granted; safe sequence maintained (`Pass`).
4. **Unsafe Resource Request:** P4 requests $(3, 3, 0)$ &rarr; Denied by Banker's safety test; rollback to previous safe state (`Pass`).
5. **Memory Shortage / Fragmentation:** P3 ($426\text{ MB}$) under First Fit &rarr; Fails due to external fragmentation; under Best Fit &rarr; Allocated successfully in 600 MB partition (`Pass`).

---

## 6. Visualizer Implementation Screenshots

- **Figure 4:** Process Synchronization — Producer-Consumer Bounded Queue simulation (`screenshots/producer-consumer.png`)
- **Figure 5:** CPU Scheduling — Interactive Gantt Chart and metrics table (`screenshots/cpu-scheduling.png`)
- **Figure 6:** Deadlock Avoidance — Banker's Algorithm safety evaluation and request simulation (`screenshots/bankers-algorithm.png`)
- **Figure 7:** Memory Management — Physical RAM Partition Map and fragmentation analysis (`screenshots/memory-management.png`)

---

## 7. Conclusion

By coordinating student answer ingestion through the Producer-Consumer bounded queue, scheduling CPU execution with Round Robin, validating resource requests with Banker's Algorithm, and managing memory through Best Fit dynamic partitioning, the Online Examination and Result Processing System guarantees zero lost submissions, zero deadlocks, fair evaluation throughput, and optimal memory utilization under peak examination traffic.
