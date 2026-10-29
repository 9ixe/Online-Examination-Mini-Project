import os
import sys
from fpdf import FPDF
from fpdf.enums import XPos, YPos

class CaseStudyPDF(FPDF):
    def footer(self):
        self.set_y(-12)
        self.set_font('Helvetica', '', 8)
        self.set_text_color(60, 60, 60)
        self.cell(0, 10, f'Page {self.page_no()} of {{nb}}',
                  new_x=XPos.RIGHT, new_y=YPos.TOP, align='C')

    def sec_title(self, title):
        self.set_font('Helvetica', 'B', 9.5)
        self.set_text_color(0, 0, 0)
        self.ln(1.5)
        self.cell(0, 4.5, title, new_x=XPos.LMARGIN, new_y=YPos.NEXT, align='L')
        self.ln(0.5)

    def subsec_title(self, title):
        self.set_font('Helvetica', 'B', 8.5)
        self.set_text_color(0, 0, 0)
        self.ln(1)
        self.cell(0, 4, title, new_x=XPos.LMARGIN, new_y=YPos.NEXT, align='L')
        self.ln(0.5)

    def body_p(self, text):
        self.set_font('Times', '', 8.8)
        self.set_text_color(15, 15, 15)
        self.multi_cell(0, 3.8, text, align='J')
        self.ln(1)

    def code_box(self, code_text):
        self.set_font('Courier', '', 7.5)
        self.set_fill_color(248, 248, 248)
        self.set_draw_color(210, 210, 210)
        self.set_text_color(20, 20, 20)
        self.multi_cell(0, 3.4, code_text, border=1, fill=True, align='L')
        self.ln(1)

    def caption(self, text):
        self.set_font('Times', 'I', 7.8)
        self.set_text_color(40, 40, 40)
        self.cell(0, 4, text, new_x=XPos.LMARGIN, new_y=YPos.NEXT, align='C')
        self.ln(1)

def generate():
    pdf = CaseStudyPDF('P', 'mm', 'A4')
    pdf.set_auto_page_break(auto=False)
    pdf.alias_nb_pages()

    # Base margins: left=16, top=12, right=16 (usable width = 178mm)
    l_m = 16
    t_m = 12
    r_m = 16
    page_w = 210 - l_m - r_m  # 178mm

    script_dir = os.path.dirname(os.path.abspath(__file__))
    screenshots_dir = os.path.join(script_dir, "screenshots")

    # ============================================================
    # PAGE 1 OF 4
    # ============================================================
    pdf.add_page()
    pdf.set_margins(l_m, t_m, r_m)

    # Document Header
    pdf.set_font('Helvetica', 'B', 9.5)
    pdf.cell(0, 4, 'CASE STUDY REPORT - ASSIGNMENT NO. 3', new_x=XPos.LMARGIN, new_y=YPos.NEXT, align='L')
    pdf.set_font('Helvetica', 'B', 12)
    pdf.cell(0, 5.5, 'OS-Based Online Examination and Result Processing System', new_x=XPos.LMARGIN, new_y=YPos.NEXT, align='L')
    pdf.ln(1.5)

    # Student Table - ONLY JOEL BIJU, UID 24003129
    pdf.set_font('Helvetica', 'B', 8)
    pdf.set_fill_color(244, 244, 244)
    pdf.set_draw_color(50, 50, 50)
    pdf.cell(14, 4.5, 'Sr.', border=1, fill=True, align='C')
    pdf.cell(86, 4.5, 'Group Member Name', border=1, fill=True, align='L')
    pdf.cell(48, 4.5, 'Roll No. / UID', border=1, fill=True, align='L')
    pdf.cell(30, 4.5, 'Signature', border=1, fill=True, new_x=XPos.LMARGIN, new_y=YPos.NEXT, align='L')

    pdf.set_font('Helvetica', '', 8)
    pdf.cell(14, 4.5, '1', border=1, align='C')
    pdf.cell(86, 4.5, 'Joel Biju', border=1, align='L')
    pdf.cell(48, 4.5, '24003129', border=1, align='L')
    pdf.cell(30, 4.5, '', border=1, new_x=XPos.LMARGIN, new_y=YPos.NEXT, align='L')
    pdf.ln(1.5)

    # Section 1
    pdf.sec_title('1. Problem Statement and Real-World Context')
    pdf.body_p(
        "During peak examination sessions, an online examination platform receives thousands of student answer submissions "
        "simultaneously as the final countdown timer expires. Every submitted examination packet undergoes student authentication, "
        "objective MCQ auto-grading, database ledger score persistence, percentile rank computation, and PDF result transcript generation. "
        "These tasks consume significant CPU processing time and memory, and they compete for shared system resources including "
        "auto-grading execution engine threads, database write locks on the result ledger, and PDF generator worker slots. "
        "Without proper operating system controls, the platform may lose or duplicate answer packets, corrupt student marks through race "
        "conditions, crash due to memory exhaustion, or enter a catastrophic deadlock where grading threads wait indefinitely for database "
        "locks held by blocked reporting processes. The goal is to design an OS-level resource-management solution that manages incoming "
        "submissions through a synchronized bounded queue, schedules evaluation tasks fairly, allocates memory efficiently, and avoids unsafe "
        "allocation of shared resources during peak workloads."
    )

    # Section 2
    pdf.sec_title('2. Problem Analysis, Objectives, Constraints and Assumptions')
    pdf.body_p(
        "Objectives: Ingest every student answer submission without packet loss or duplicate grading; schedule evaluation tasks fairly "
        "and efficiently without thread starvation; avoid deadlocks under concurrent bursts; manage RAM efficiently and eliminate fragmentation.\n"
        "Constraints: One simulated CPU core; a fixed-size submission buffer (N = 8 slots); 10 Auto-Grading Engine Threads (Resource A), "
        "5 Database Write Locks (Resource B), and 7 PDF Generator Slots (Resource C); 1700 MB total physical memory divided into five "
        "partitions (100, 500, 200, 300, and 600 MB).\n"
        "Assumptions: Each exam task has a known arrival time, burst time, memory payload size, and maximum resource requirement. "
        "Time is measured in milliseconds. Resources are reusable and released immediately when a task finishes. Memory remains allocated "
        "until task processing completes."
    )

    # Section 3
    pdf.sec_title('3. The Four OS Concepts: Explanation and Justification')
    pdf.body_p(
        "Producer-Consumer: Student submission portals act as producers and insert submitted answer packets into a fixed-size buffer queue. "
        "Background evaluation workers act as consumers and dequeue packets for grading. A binary semaphore (mutex) protects the shared "
        "queue, while empty and full counting semaphores prevent buffer overflow and underflow. Justification: at exam close, thousands of "
        "students click 'Submit' simultaneously; without synchronization, concurrent threads could overwrite memory slots, corrupt pointers, "
        "or drop answers.\n"
        "CPU Scheduling: Round Robin with a time quantum of 2 gives each pending evaluation task an equitable slice of CPU time and prevents "
        "long descriptive auto-grading or plagiarism scans from blocking short objective MCQ scoring. FCFS and non-preemptive SJF are also "
        "compared. Justification: fairness and bounded latency matter most under peak load, so Round Robin is chosen even though SJF yields "
        "a lower theoretical average waiting time.\n"
        "Banker's Algorithm: Before granting Auto-Grading Threads, Database Write Locks, or PDF Generator Slots, the system evaluates the "
        "Banker's Safety Algorithm to verify that a safe sequence exists. Unsafe requests are denied or deferred, preventing deadlock. "
        "Justification: these resources are shared and held by tasks while waiting for others; a deadlock during exam processing would freeze "
        "the portal. Proactive avoidance is far safer than recovering from frozen databases.\n"
        "Memory Management: Each answer packet and report generation payload receives a suitable memory block, released upon completion. "
        "Best Fit chooses the smallest available partition that can accommodate the request and is compared with First Fit. Justification: "
        "Best Fit leaves smaller unused holes and, on the benchmark workload, avoids the external fragmentation that causes First Fit to leave "
        "large tasks stalled."
    )

    # Section 4 Intro & Order Table
    pdf.sec_title('4. Algorithm Design, Pseudocode, Diagrams and Worked Examples')
    pdf.body_p(
        "The same five representative examination tasks are used across all modules. Resource A is the Auto-Grading Engine Threads, "
        "B is the Database Write Locks (Result Ledger), and C represents PDF Generator & Rank Slots."
    )

    # Task Table
    headers = ['Task', 'Arrival', 'Burst', 'Memory (MB)', 'Allocation (A B C)', 'Max (A B C)', 'Need (A B C)']
    widths  = [18, 18, 16, 26, 34, 33, 33]
    pdf.set_font('Helvetica', 'B', 7.5)
    pdf.set_fill_color(244, 244, 244)
    for i, h in enumerate(headers):
        pdf.cell(widths[i], 4, h, border=1, fill=True, align='C')
    pdf.ln()

    rows = [
        ['P0', '0', '5', '212', '0 1 0', '7 5 3', '7 4 3'],
        ['P1', '1', '3', '417', '2 0 0', '3 2 2', '1 2 2'],
        ['P2', '2', '8', '112', '3 0 2', '9 0 2', '6 0 0'],
        ['P3', '3', '2', '426', '2 1 1', '2 2 2', '0 1 1'],
        ['P4', '4', '6', '90',  '0 0 2', '4 3 3', '4 3 1'],
    ]
    pdf.set_font('Times', '', 8)
    for r in rows:
        for i, val in enumerate(r):
            pdf.cell(widths[i], 3.8, val, border=1, align='C')
        pdf.ln()

    pdf.set_font('Times', 'I', 7.8)
    pdf.multi_cell(0, 3.5, "Total resources are (10, 5, 7), and the initial available vector is (3, 3, 2). Memory partitions are 100, 500, 200, 300 and 600 MB.")


    # ============================================================
    # PAGE 2 OF 4
    # ============================================================
    pdf.add_page()
    pdf.set_margins(l_m, t_m, r_m)

    # Figure 1: Flow diagram
    pdf.set_draw_color(100, 116, 139)
    box_w = 26
    box_h = 12
    y_start = pdf.get_y() + 1
    flow_steps = [
        ("Student Portals\n(Producers)", 224, 231, 255),
        ("Bounded Buffer\n(Submission Queue)", 224, 231, 255),
        ("CPU Scheduler\n(Round Robin)", 220, 252, 231),
        ("Banker's\nSafety Check", 254, 243, 199),
        ("Memory Alloc.\n(Best Fit)", 237, 233, 254),
        ("Process Task\n(Grade, Lock, PDF)", 254, 249, 195)
    ]
    gap = (page_w - (len(flow_steps) * box_w)) / (len(flow_steps) - 1)

    for i, (text, r, g, b) in enumerate(flow_steps):
        bx = l_m + i * (box_w + gap)
        pdf.set_fill_color(r, g, b)
        pdf.rect(bx, y_start, box_w, box_h, 'DF')
        pdf.set_xy(bx, y_start + 1.5)
        pdf.set_font('Helvetica', 'B', 6.5)
        pdf.multi_cell(box_w, 3.2, text, align='C')
        # Arrow
        if i < len(flow_steps) - 1:
            arr_x = bx + box_w + (gap / 2) - 1.5
            pdf.set_xy(arr_x, y_start + 4)
            pdf.set_font('Helvetica', 'B', 8)
            pdf.cell(3, 4, ">", align='C')

    pdf.set_xy(l_m, y_start + box_h + 1)
    pdf.set_font('Helvetica', '', 6.8)
    pdf.set_text_color(220, 38, 38)
    pdf.cell(page_w, 3, "<-- Release resources + memory, signal consumer, pick next submission <--", align='C')
    pdf.ln(3.5)
    pdf.set_text_color(0, 0, 0)
    pdf.caption('Figure 1: Overall exam processing flow showing how the four OS concepts are connected')

    # 4.1 Producer-Consumer
    pdf.subsec_title('4.1 Producer-Consumer (bounded buffer, N = 5)')
    pdf.code_box(
        "Initial values: mutex = 1, empty = N, full = 0, buffer[N]\n"
        "Producer: create submission; wait(empty); wait(mutex); insert(submission); signal(mutex); signal(full);\n"
        "Consumer: wait(full); wait(mutex); submission = remove(); signal(mutex); signal(empty); process(submission);"
    )
    pdf.body_p("Example: seven submissions arrive while no consumer is running.")

    # 4.1 Table
    w_pc = [75, 20, 20, 63]
    pdf.set_font('Helvetica', 'B', 7.5)
    pdf.set_fill_color(244, 244, 244)
    pdf.cell(w_pc[0], 4, 'Event', border=1, fill=True, align='L')
    pdf.cell(w_pc[1], 4, 'empty', border=1, fill=True, align='C')
    pdf.cell(w_pc[2], 4, 'full', border=1, fill=True, align='C')
    pdf.cell(w_pc[3], 4, 'Result', border=1, fill=True, new_x=XPos.LMARGIN, new_y=YPos.NEXT, align='L')

    rows_pc = [
        ['Submissions 1-5 inserted', '0', '5', 'Buffer full'],
        ['Producer of submission 6 tries to insert', '0', '5', 'Blocked on wait(empty)'],
        ['Consumer removes submission 1', '1', '4', 'signal(empty) wakes producer'],
        ['Submission 6 inserted; producer of submission 7 tries', '0', '5', 'Submission 7 blocked until next removal']
    ]
    pdf.set_font('Times', '', 7.8)
    for r in rows_pc:
        pdf.cell(w_pc[0], 3.8, r[0], border=1, align='L')
        pdf.cell(w_pc[1], 3.8, r[1], border=1, align='C')
        pdf.cell(w_pc[2], 3.8, r[2], border=1, align='C')
        pdf.cell(w_pc[3], 3.8, r[3], border=1, new_x=XPos.LMARGIN, new_y=YPos.NEXT, align='L')

    pdf.set_font('Times', 'I', 7.5)
    pdf.cell(0, 3.5, 'No submission is lost or duplicated.', new_x=XPos.LMARGIN, new_y=YPos.NEXT, align='L')

    # 4.2 CPU Scheduling
    pdf.subsec_title('4.2 CPU Scheduling (Round Robin, q = 2)')
    pdf.code_box(
        "queue = [first arrived task]\n"
        "while queue not empty:\n"
        "  P = dequeue(); run P for min(q, remaining[P]); add newly arrived tasks to queue\n"
        "  if remaining[P] > 0: enqueue(P) else: CT[P] = current time\n"
        "TAT = CT - Arrival    WT = TAT - Burst"
    )

    # Gantt Chart (Figure 2)
    g_blocks = [
        ('P0', 2, 199, 210, 254),
        ('P1', 2, 187, 247, 208),
        ('P2', 2, 254, 215, 170),
        ('P0', 2, 199, 210, 254),
        ('P3', 2, 254, 240, 138),
        ('P4', 2, 233, 213, 255),
        ('P1', 1, 187, 247, 208),
        ('P2', 2, 254, 215, 170),
        ('P0', 1, 199, 210, 254),
        ('P4', 2, 233, 213, 255),
        ('P2', 2, 254, 215, 170),
        ('P4', 2, 233, 213, 255),
        ('P2', 2, 254, 215, 170)
    ]
    tot_burst = 24
    gx = l_m
    gy = pdf.get_y() + 1
    gh = 6.5
    pdf.set_draw_color(50, 50, 50)
    pdf.set_font('Helvetica', 'B', 7)

    for p, dur, r, g, b in g_blocks:
        bw = (dur / tot_burst) * page_w
        pdf.set_fill_color(r, g, b)
        pdf.rect(gx, gy, bw, gh, 'DF')
        pdf.set_xy(gx, gy + 1.2)
        pdf.cell(bw, 4, p, align='C')
        gx += bw

    # Gantt timeline ticks
    pdf.set_xy(l_m, gy + gh)
    pdf.set_font('Courier', '', 6)
    ticks = ['0', '2', '4', '6', '8', '10', '12', '13', '15', '16', '18', '20', '22', '24']
    tick_pos = [0, 2, 4, 6, 8, 10, 12, 13, 15, 16, 18, 20, 22, 24]
    for t, pos in zip(ticks, tick_pos):
        tx = l_m + (pos / tot_burst) * page_w - 2
        pdf.set_xy(tx, gy + gh + 0.5)
        pdf.cell(4, 3, t, align='C')

    pdf.set_xy(l_m, gy + gh + 4)
    pdf.caption('Figure 2: Gantt chart for Round Robin (q = 2)')

    # Table: RR Results
    w_rr = [18, 18, 16, 26, 50, 50]
    pdf.set_font('Helvetica', 'B', 7.5)
    pdf.set_fill_color(244, 244, 244)
    for i, h in enumerate(['Task', 'Arrival', 'Burst', 'Completion', 'Turnaround (TAT)', 'Waiting (WT)']):
        pdf.cell(w_rr[i], 4, h, border=1, fill=True, align='C')
    pdf.ln()

    rows_rr = [
        ['P0', '0', '5', '16', '16', '11'],
        ['P1', '1', '3', '13', '12', '9'],
        ['P2', '2', '8', '24', '22', '14'],
        ['P3', '3', '2', '10', '7',  '5'],
        ['P4', '4', '6', '22', '18', '12'],
        ['Average', '', '', '', '15.0', '10.2']
    ]
    pdf.set_font('Times', '', 7.8)
    for r in rows_rr:
        if r[0] == 'Average':
            pdf.set_font('Helvetica', 'B', 7.8)
            pdf.cell(w_rr[0] + w_rr[1] + w_rr[2] + w_rr[3], 3.8, 'Average', border=1, align='L')
            pdf.cell(w_rr[4], 3.8, r[4], border=1, align='C')
            pdf.cell(w_rr[5], 3.8, r[5], border=1, new_x=XPos.LMARGIN, new_y=YPos.NEXT, align='C')
        else:
            for i, val in enumerate(r):
                pdf.cell(w_rr[i], 3.8, val, border=1, align='C')
            pdf.ln()

    pdf.ln(1)
    pdf.set_font('Helvetica', 'B', 8)
    pdf.cell(0, 3.8, 'Scheduling comparison:', new_x=XPos.LMARGIN, new_y=YPos.NEXT, align='L')

    w_cmp = [48, 30, 26, 74]
    pdf.set_font('Helvetica', 'B', 7.5)
    pdf.set_fill_color(244, 244, 244)
    for i, h in enumerate(['Algorithm', 'Avg. turnaround', 'Avg. waiting', 'Remark']):
        pdf.cell(w_cmp[i], 4, h, border=1, fill=True, align='L' if i in (0, 3) else 'C')
    pdf.ln()

    rows_cmp = [
        ['FCFS', '12.2', '7.4', 'Simple, but long evaluations delay short ones'],
        ['SJF (non-preemptive)', '10.4', '5.6', 'Lowest waiting time, but long evaluations may starve'],
        ['Round Robin (q = 2)', '15.0', '10.2', 'Highest averages, but fairest with no starvation']
    ]
    pdf.set_font('Times', '', 7.8)
    for r in rows_cmp:
        pdf.cell(w_cmp[0], 3.8, r[0], border=1, align='L')
        pdf.cell(w_cmp[1], 3.8, r[1], border=1, align='C')
        pdf.cell(w_cmp[2], 3.8, r[2], border=1, align='C')
        pdf.cell(w_cmp[3], 3.8, r[3], border=1, new_x=XPos.LMARGIN, new_y=YPos.NEXT, align='L')


    # ============================================================
    # PAGE 3 OF 4
    # ============================================================
    pdf.add_page()
    pdf.set_margins(l_m, t_m, r_m)

    # 4.3 Banker's Algorithm
    pdf.subsec_title("4.3 Banker's Algorithm")
    pdf.code_box(
        "Need[i][j] = Max[i][j] - Allocation[i][j]; Work = Available; Finish[i] = false\n"
        "repeat: find unfinished i with Need[i] <= Work; Work = Work + Allocation[i]; Finish[i] = true; add i to sequence\n"
        "if all Finish[i] = true: SAFE (print sequence) else UNSAFE\n"
        "Request(i, Req): if Req > Need[i] error; if Req > Available wait;\n"
        "                 else pretend to allocate; run safety check; if UNSAFE roll back and DENY"
    )

    pdf.body_p("Safe sequence calculation (start: Work = Available = (3, 3, 2)):")

    # Banker's Table
    w_b = [20, 24, 64, 70]
    pdf.set_font('Helvetica', 'B', 7.5)
    pdf.set_fill_color(244, 244, 244)
    for i, h in enumerate(['Step', 'Task', 'Need <= Work?', 'Work after adding Allocation']):
        pdf.cell(w_b[i], 4, h, border=1, fill=True, align='L' if i in (1, 2, 3) else 'C')
    pdf.ln()

    rows_b = [
        ['1', 'P1', '(1,2,2) <= (3,3,2) yes', '(5,3,2)'],
        ['2', 'P3', '(0,1,1) <= (5,3,2) yes', '(7,4,3)'],
        ['3', 'P4', '(4,3,1) <= (7,4,3) yes', '(7,4,5)'],
        ['4', 'P0', '(7,4,3) <= (7,4,5) yes', '(7,5,5)'],
        ['5', 'P2', '(6,0,0) <= (7,5,5) yes', '(10,5,7)']
    ]
    pdf.set_font('Times', '', 7.8)
    for r in rows_b:
        pdf.cell(w_b[0], 3.8, r[0], border=1, align='C')
        pdf.cell(w_b[1], 3.8, r[1], border=1, align='L')
        pdf.cell(w_b[2], 3.8, r[2], border=1, align='L')
        pdf.cell(w_b[3], 3.8, r[3], border=1, new_x=XPos.LMARGIN, new_y=YPos.NEXT, align='L')

    pdf.ln(1)
    pdf.body_p(
        "All examination tasks can finish, so the state is safe and the safe sequence is P1, P3, P4, P0, P2.\n"
        "Request granted: P1 requests (1, 0, 2). It is within Need (1, 2, 2) and Available (3, 3, 2). After the temporary "
        "allocation, Available = (2, 3, 0) and the same safe sequence still exists, so the request is granted.\n"
        "Request denied: P4 requests (3, 3, 0). It is within Need (4, 3, 1) and Available, but after the temporary allocation "
        "Available = (0, 0, 2) and P4's remaining Need = (1, 0, 1). No task's Need fits in (0, 0, 2), so the state is unsafe and "
        "the request is rolled back and denied."
    )

    # 4.4 Memory Management
    pdf.subsec_title('4.4 Memory Management (First Fit and Best Fit)')
    pdf.code_box(
        "First Fit: scan blocks from the start; choose the first block with size >= task payload size\n"
        "Best Fit:  scan all blocks; choose the smallest block with size >= task payload size\n"
        "Remaining = block size - task payload size    (if no block fits, the task waits)"
    )

    pdf.body_p("With the sample examination tasks (blocks: 100, 500, 200, 300, 600 MB):")

    w_mem = [22, 24, 66, 66]
    pdf.set_font('Helvetica', 'B', 7.5)
    pdf.set_fill_color(244, 244, 244)
    for i, h in enumerate(['Task', 'Size (MB)', 'First Fit: block (remaining)', 'Best Fit: block (remaining)']):
        pdf.cell(w_mem[i], 4, h, border=1, fill=True, align='L' if i in (2, 3) else 'C')
    pdf.ln()

    rows_mem = [
        ['P0', '212', '500 (288)', '300 (88)'],
        ['P1', '417', '600 (183)', '500 (83)'],
        ['P2', '112', '500 (176)', '200 (88)'],
        ['P3', '426', 'Not allocated (waits)', '600 (174)'],
        ['P4', '90',  '100 (10)',  '100 (10)'],
        ['Free memory', '', '869 MB (holes 10, 176, 200, 300, 183)', '443 MB (holes 10, 83, 88, 88, 174)']
    ]
    pdf.set_font('Times', '', 7.8)
    for r in rows_mem:
        if r[0] == 'Free memory':
            pdf.set_font('Helvetica', 'B', 7.8)
            pdf.cell(w_mem[0] + w_mem[1], 3.8, r[0], border=1, align='L')
            pdf.cell(w_mem[2], 3.8, r[2], border=1, align='L')
            pdf.cell(w_mem[3], 3.8, r[3], border=1, new_x=XPos.LMARGIN, new_y=YPos.NEXT, align='L')
        else:
            pdf.cell(w_mem[0], 3.8, r[0], border=1, align='C')
            pdf.cell(w_mem[1], 3.8, r[1], border=1, align='C')
            pdf.cell(w_mem[2], 3.8, r[2], border=1, align='L')
            pdf.cell(w_mem[3], 3.8, r[3], border=1, new_x=XPos.LMARGIN, new_y=YPos.NEXT, align='L')

    pdf.ln(1.5)

    # Memory Diagram (Figure 3)
    pdf.set_font('Helvetica', 'B', 7.5)
    pdf.cell(page_w / 2, 4, 'First Fit (free: 869 MB, P3 not placed)', align='L')
    pdf.cell(page_w / 2, 4, 'Best Fit (free: 443 MB)', new_x=XPos.LMARGIN, new_y=YPos.NEXT, align='L')
    pdf.ln(1)

    my = pdf.get_y()
    col_w = (page_w - 6) / 2
    pdf.set_font('Helvetica', '', 6.5)

    # First Fit Left
    pdf.rect(l_m, my, col_w, 14, 'D')
    pdf.set_xy(l_m + 2, my + 1)
    pdf.multi_cell(col_w - 4, 3, "100MB [P4: 90MB | Free: 10MB]\n500MB [P0: 212MB | P2: 112MB | Free: 176MB]\n200MB [Free: 200MB]   300MB [Free: 300MB]\n600MB [P1: 417MB | Free: 183MB]  (P3 WAITS)")

    # Best Fit Right
    rx = l_m + col_w + 6
    pdf.rect(rx, my, col_w, 14, 'D')
    pdf.set_xy(rx + 2, my + 1)
    pdf.multi_cell(col_w - 4, 3, "100MB [P4: 90MB | Free: 10MB]\n500MB [P1: 417MB | Free: 83MB]\n200MB [P2: 112MB | Free: 88MB]\n300MB [P0: 212MB | Free: 88MB]\n600MB [P3: 426MB | Free: 174MB]  (ALL PLACED)")

    pdf.set_xy(l_m, my + 15)
    pdf.caption('Figure 3: Memory blocks after allocation (hatched area = free memory)')

    pdf.body_p(
        "Fragmentation analysis: First Fit leaves P3 (426 MB) waiting even though 869 MB is free overall, because the free "
        "memory is split into holes and the largest is only 300 MB (external fragmentation). Best Fit allocates all five tasks, leaving "
        "443 MB in holes of 10, 83, 88, 88 and 174 MB. The largest remaining hole is 174 MB."
    )


    # ============================================================
    # PAGE 4 OF 4
    # ============================================================
    pdf.add_page()
    pdf.set_margins(l_m, t_m, r_m)

    # Section 5: Test Cases
    pdf.sec_title('5. Test Cases, Calculations and Execution Results')

    w_test = [36, 44, 78, 20]
    pdf.set_font('Helvetica', 'B', 7.5)
    pdf.set_fill_color(244, 244, 244)
    for i, h in enumerate(['Test', 'Input', 'Expected result', 'Result']):
        pdf.cell(w_test[i], 4, h, border=1, fill=True, align='L' if i in (0, 1, 2) else 'C')
    pdf.ln()

    rows_test = [
        ['1. Normal load', '5 submissions, buffer size 5', 'All submissions inserted and evaluated', 'Pass'],
        ['2. Peak load', '10 submissions, buffer size 3', 'Producers block when buffer is full and resume after consumer removal', 'Pass'],
        ['3. Safe request', 'P1 requests (1, 0, 2)', 'Granted; safe sequence P1, P3, P4, P0, P2 remains', 'Pass'],
        ['4. Unsafe request', 'P4 requests (3, 3, 0)', 'Denied by Banker\'s Algorithm (no safe sequence)', 'Pass'],
        ['5. Memory shortage', 'P3 (426 MB) with First Fit', 'No block fits, task waits; Best Fit places it in the 600 MB block', 'Pass']
    ]
    pdf.set_font('Times', '', 7.6)
    for r in rows_test:
        pdf.cell(w_test[0], 3.8, r[0], border=1, align='L')
        pdf.cell(w_test[1], 3.8, r[1], border=1, align='L')
        pdf.cell(w_test[2], 3.8, r[2], border=1, align='L')
        pdf.cell(w_test[3], 3.8, r[3], border=1, new_x=XPos.LMARGIN, new_y=YPos.NEXT, align='C')

    pdf.body_p(
        "Key results: Round Robin (q = 2) average TAT = 15.0 and WT = 10.2; SJF gives the lowest average WT (5.6); safe "
        "sequence = P1, P3, P4, P0, P2; Best Fit leaves 443 MB free and places every examination task."
    )

    pdf.set_font('Helvetica', 'B', 8.5)
    pdf.cell(0, 4, 'Execution screenshots from the OS Algorithm Visualizer:', new_x=XPos.LMARGIN, new_y=YPos.NEXT, align='L')
    pdf.ln(1)

    # 2x2 Screenshot Grid using project screenshots folder
    img_files = [
        (os.path.join(screenshots_dir, "producer-consumer.png"), "Figure 4: Producer-Consumer bounded-buffer simulation."),
        (os.path.join(screenshots_dir, "cpu-scheduling.png"), "Figure 5: CPU Scheduling - Round Robin Gantt chart and results."),
        (os.path.join(screenshots_dir, "bankers-algorithm.png"), "Figure 6: Banker's Algorithm - safety check and resource requests."),
        (os.path.join(screenshots_dir, "memory-management.png"), "Figure 7: Memory Management - Best Fit allocation and comparison.")
    ]

    grid_w = (page_w - 6) / 2
    grid_h = 35
    sy = pdf.get_y()

    for idx, (path, cap) in enumerate(img_files):
        row = idx // 2
        col = idx % 2
        ix = l_m + col * (grid_w + 6)
        iy = sy + row * (grid_h + 8)

        if os.path.exists(path):
            pdf.image(path, x=ix, y=iy, w=grid_w, h=grid_h)
            pdf.rect(ix, iy, grid_w, grid_h, 'D')
        else:
            pdf.rect(ix, iy, grid_w, grid_h, 'D')
            pdf.set_xy(ix, iy + grid_h / 2 - 2)
            pdf.set_font('Helvetica', 'I', 7)
            pdf.cell(grid_w, 4, "[Screenshot]", align='C')

        pdf.set_xy(ix, iy + grid_h + 1)
        pdf.set_font('Times', 'I', 7)
        pdf.cell(grid_w, 3.5, cap, align='C')

    pdf.set_y(sy + 2 * (grid_h + 8) + 1)

    # Section 7: Conclusion
    pdf.sec_title('7. Conclusion')
    pdf.body_p(
        "The bounded buffer prevents loss or duplication of incoming examination answer submissions under concurrent peak bursts, "
        "CPU scheduling ensures fair execution across automated evaluation worker threads without starvation, Banker's Algorithm avoids "
        "unsafe allocation of shared evaluation engines and database ledger write locks, and memory management dynamically partitions RAM "
        "to hold student token caches and report payloads. In the benchmark calculations, SJF gives the lowest average waiting time, while "
        "Round Robin provides predictable fairness. Best Fit successfully allocates all five examination tasks and leaves 443 MB in smaller "
        "manageable holes. Future system enhancements may incorporate multi-core priority queues for timed-out submissions and dynamic "
        "non-contiguous paging with virtual memory."
    )

    out_path = os.path.join(script_dir, "Case_Study_Report.pdf")
    pdf.output(out_path)
    print(f"PDF successfully generated at: {out_path}")

if __name__ == '__main__':
    generate()
