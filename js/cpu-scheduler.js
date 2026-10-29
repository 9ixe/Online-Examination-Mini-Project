/**
 * CPU Scheduling Module for E-Commerce Order Dispatcher
 * Implements Priority (Preemptive & Non-Preemptive), Round Robin, FCFS, and SJF
 * Generates dynamic Gantt Charts and calculates Completion, TAT, and WT metrics.
 */

class CPUScheduler {
  constructor() {
    this.tasks = [];
    this.scheduleResult = [];
    this.metrics = { avgTAT: 0, avgWT: 0, cpuUtil: 100, throughput: 0 };
    this.animating = false;
    this.animTimer = null;

    this.initDOM();
    this.loadPreset();
  }

  initDOM() {
    this.tableBody = document.getElementById('cpu-task-body');
    this.algoSelect = document.getElementById('sched-algo');
    this.quantumGroup = document.getElementById('quantum-group');
    this.quantumInput = document.getElementById('time-quantum');
    this.ganttTimeline = document.getElementById('gantt-timeline');
    this.ganttScale = document.getElementById('gantt-scale');
    this.ganttTimer = document.getElementById('gantt-timer');

    this.metricAvgTAT = document.getElementById('metric-avg-tat');
    this.metricAvgWT = document.getElementById('metric-avg-wt');
    this.metricCpuUtil = document.getElementById('metric-cpu-util');
    this.metricThroughput = document.getElementById('metric-throughput');

    if (this.algoSelect) {
      this.algoSelect.addEventListener('change', () => {
        if (this.quantumGroup) {
          this.quantumGroup.style.display = this.algoSelect.value === 'round-robin' ? 'inline-flex' : 'none';
        }
        this.run();
      });
    }

    document.getElementById('btn-load-preset-orders')?.addEventListener('click', () => this.loadPreset());
    document.getElementById('btn-add-order-task')?.addEventListener('click', () => this.promptAddTask());
    document.getElementById('btn-run-scheduler')?.addEventListener('click', () => this.run());
    document.getElementById('btn-animate-gantt')?.addEventListener('click', () => this.animateGantt());
  }

  loadPreset() {
    this.tasks = [
      { id: 'T1', orderId: 'SUB-#101', desc: 'Objective MCQ Auto-Grading Engine', tier: 'prime', at: 0, bt: 4, priority: 1 },
      { id: 'T2', orderId: 'SUB-#102', desc: 'Student Percentile & Rank Calculator', tier: 'flash', at: 1, bt: 5, priority: 2 },
      { id: 'T3', orderId: 'SUB-#103', desc: 'Descriptive Short Answer AI Grader', tier: 'regular', at: 2, bt: 2, priority: 4 },
      { id: 'T4', orderId: 'SUB-#104', desc: 'Result Compilation & PDF Transcript Gen', tier: 'prime', at: 3, bt: 6, priority: 1 },
      { id: 'T5', orderId: 'SUB-#105', desc: 'Proctoring Log & Plagiarism Scan', tier: 'regular', at: 4, bt: 3, priority: 3 }
    ];
    this.run();
  }

  hasTask(orderId) {
    return this.tasks.some(t => t.orderId === orderId);
  }

  addAutoTask({ id, desc, tier, burstTime, priority }) {
    const nextTaskId = `T${this.tasks.length + 1}`;
    const maxAT = this.tasks.length ? Math.max(...this.tasks.map(t => t.at)) + 1 : 0;
    this.tasks.push({
      id: nextTaskId,
      orderId: id,
      desc: desc,
      tier: tier,
      at: maxAT,
      bt: burstTime,
      priority: priority
    });
    this.run();
  }

  promptAddTask() {
    const desc = prompt('Enter Exam Task Description:', 'Coding Question Compiler & Runner');
    if (!desc) return;
    const at = parseInt(prompt('Arrival Time (AT in ms):', '0'), 10) || 0;
    const bt = parseInt(prompt('Burst Time (BT in ms):', '4'), 10) || 1;
    const prio = parseInt(prompt('Priority (1=High Live Exam, 5=Low Batch):', '2'), 10) || 2;
    const tier = prio === 1 ? 'prime' : (prio === 2 ? 'flash' : 'regular');

    const nextId = `T${this.tasks.length + 1}`;
    this.tasks.push({
      id: nextId,
      orderId: `SUB-#${100 + this.tasks.length + 1}`,
      desc,
      tier,
      at,
      bt,
      priority: prio
    });
    this.run();
  }

  deleteTask(index) {
    this.tasks.splice(index, 1);
    this.run();
  }

  run() {
    if (this.tasks.length === 0) {
      this.clearOutputs();
      return;
    }

    const algo = this.algoSelect ? this.algoSelect.value : 'priority-nonpreempt';
    const quantum = parseInt(this.quantumInput?.value || '2', 10);

    let schedule = [];
    if (algo === 'fcfs') {
      schedule = this.calcFCFS();
    } else if (algo === 'sjf') {
      schedule = this.calcSJF();
    } else if (algo === 'priority-nonpreempt') {
      schedule = this.calcPriorityNonPreempt();
    } else if (algo === 'priority-preempt') {
      schedule = this.calcPriorityPreempt();
    } else if (algo === 'round-robin') {
      schedule = this.calcRoundRobin(quantum);
    }

    this.scheduleResult = schedule;
    this.computeTaskMetrics(schedule);
    this.renderTable();
    this.renderGantt(schedule);
    this.renderMetrics();
  }

  calcFCFS() {
    const list = [...this.tasks].sort((a, b) => a.at - b.at);
    const schedule = [];
    let currentTime = 0;

    for (const t of list) {
      if (currentTime < t.at) {
        schedule.push({ id: 'IDLE', start: currentTime, end: t.at, duration: t.at - currentTime, isIdle: true });
        currentTime = t.at;
      }
      schedule.push({
        id: t.id,
        orderId: t.orderId,
        desc: t.desc,
        start: currentTime,
        end: currentTime + t.bt,
        duration: t.bt,
        tier: t.tier
      });
      currentTime += t.bt;
    }
    return schedule;
  }

  calcSJF() {
    // Non-preemptive Shortest Job First
    const remaining = this.tasks.map(t => ({ ...t }));
    const schedule = [];
    let currentTime = 0;
    const completed = [];

    while (completed.length < this.tasks.length) {
      const ready = remaining.filter(t => t.at <= currentTime && !completed.includes(t.id));
      if (ready.length === 0) {
        const nextArrival = Math.min(...remaining.filter(t => !completed.includes(t.id)).map(t => t.at));
        schedule.push({ id: 'IDLE', start: currentTime, end: nextArrival, duration: nextArrival - currentTime, isIdle: true });
        currentTime = nextArrival;
        continue;
      }

      ready.sort((a, b) => a.bt - b.bt);
      const chosen = ready[0];

      schedule.push({
        id: chosen.id,
        orderId: chosen.orderId,
        desc: chosen.desc,
        start: currentTime,
        end: currentTime + chosen.bt,
        duration: chosen.bt,
        tier: chosen.tier
      });

      currentTime += chosen.bt;
      completed.push(chosen.id);
    }

    return schedule;
  }

  calcPriorityNonPreempt() {
    const remaining = this.tasks.map(t => ({ ...t }));
    const schedule = [];
    let currentTime = 0;
    const completed = [];

    while (completed.length < this.tasks.length) {
      const ready = remaining.filter(t => t.at <= currentTime && !completed.includes(t.id));
      if (ready.length === 0) {
        const nextArrival = Math.min(...remaining.filter(t => !completed.includes(t.id)).map(t => t.at));
        schedule.push({ id: 'IDLE', start: currentTime, end: nextArrival, duration: nextArrival - currentTime, isIdle: true });
        currentTime = nextArrival;
        continue;
      }

      // Lower priority number = Higher Urgency
      ready.sort((a, b) => a.priority - b.priority || a.at - b.at);
      const chosen = ready[0];

      schedule.push({
        id: chosen.id,
        orderId: chosen.orderId,
        desc: chosen.desc,
        start: currentTime,
        end: currentTime + chosen.bt,
        duration: chosen.bt,
        tier: chosen.tier
      });

      currentTime += chosen.bt;
      completed.push(chosen.id);
    }

    return schedule;
  }

  calcPriorityPreempt() {
    const taskMap = this.tasks.map(t => ({ ...t, remBt: t.bt }));
    const schedule = [];
    let currentTime = 0;
    let completed = 0;
    const n = this.tasks.length;
    const maxTime = 150; // Guard

    let currentSegment = null;

    while (completed < n && currentTime < maxTime) {
      const ready = taskMap.filter(t => t.at <= currentTime && t.remBt > 0);

      if (ready.length === 0) {
        if (!currentSegment || !currentSegment.isIdle) {
          if (currentSegment) schedule.push(currentSegment);
          currentSegment = { id: 'IDLE', start: currentTime, end: currentTime + 1, duration: 1, isIdle: true };
        } else {
          currentSegment.end++;
          currentSegment.duration++;
        }
        currentTime++;
        continue;
      }

      ready.sort((a, b) => a.priority - b.priority || a.at - b.at);
      const chosen = ready[0];

      if (!currentSegment || currentSegment.id !== chosen.id) {
        if (currentSegment) schedule.push(currentSegment);
        currentSegment = {
          id: chosen.id,
          orderId: chosen.orderId,
          desc: chosen.desc,
          tier: chosen.tier,
          start: currentTime,
          end: currentTime + 1,
          duration: 1
        };
      } else {
        currentSegment.end++;
        currentSegment.duration++;
      }

      chosen.remBt--;
      if (chosen.remBt === 0) {
        completed++;
      }
      currentTime++;
    }

    if (currentSegment) schedule.push(currentSegment);
    return schedule;
  }

  calcRoundRobin(quantum) {
    const taskMap = this.tasks.map(t => ({ ...t, remBt: t.bt, inQueue: false }));
    const schedule = [];
    let currentTime = 0;
    let completed = 0;
    const n = this.tasks.length;
    const queue = [];

    // Push initial arrived
    taskMap.forEach(t => {
      if (t.at <= currentTime && !t.inQueue) {
        queue.push(t);
        t.inQueue = true;
      }
    });

    const maxGuard = 200;
    let steps = 0;

    while (completed < n && steps++ < maxGuard) {
      if (queue.length === 0) {
        const unarrived = taskMap.filter(t => t.remBt > 0);
        if (unarrived.length === 0) break;
        const nextTime = Math.min(...unarrived.map(t => t.at));
        schedule.push({ id: 'IDLE', start: currentTime, end: nextTime, duration: nextTime - currentTime, isIdle: true });
        currentTime = nextTime;

        taskMap.forEach(t => {
          if (t.at <= currentTime && t.remBt > 0 && !t.inQueue) {
            queue.push(t);
            t.inQueue = true;
          }
        });
        continue;
      }

      const current = queue.shift();
      const execTime = Math.min(quantum, current.remBt);

      schedule.push({
        id: current.id,
        orderId: current.orderId,
        desc: current.desc,
        tier: current.tier,
        start: currentTime,
        end: currentTime + execTime,
        duration: execTime
      });

      currentTime += execTime;
      current.remBt -= execTime;

      // Check any newly arrived processes during this quantum
      taskMap.forEach(t => {
        if (t.at <= currentTime && t.remBt > 0 && !t.inQueue && t !== current) {
          queue.push(t);
          t.inQueue = true;
        }
      });

      if (current.remBt > 0) {
        queue.push(current);
      } else {
        completed++;
        current.inQueue = false;
      }
    }

    return schedule;
  }

  computeTaskMetrics(schedule) {
    let totalTAT = 0;
    let totalWT = 0;

    this.tasks.forEach(task => {
      // Last completion time in schedule
      const taskBlocks = schedule.filter(b => b.id === task.id);
      if (taskBlocks.length > 0) {
        const lastBlock = taskBlocks[taskBlocks.length - 1];
        task.ct = lastBlock.end;
        task.tat = task.ct - task.at;
        task.wt = task.tat - task.bt;

        totalTAT += task.tat;
        totalWT += task.wt;
      } else {
        task.ct = 0;
        task.tat = 0;
        task.wt = 0;
      }
    });

    const totalTime = schedule.length > 0 ? schedule[schedule.length - 1].end : 1;
    const idleTime = schedule.filter(b => b.isIdle).reduce((sum, b) => sum + b.duration, 0);
    const busyTime = totalTime - idleTime;

    this.metrics.avgTAT = (totalTAT / this.tasks.length).toFixed(2);
    this.metrics.avgWT = (totalWT / this.tasks.length).toFixed(2);
    this.metrics.cpuUtil = ((busyTime / totalTime) * 100).toFixed(1);
    this.metrics.throughput = (this.tasks.length / totalTime).toFixed(2);
  }

  getTaskColor(id) {
    const palette = {
      'T1': { bg: '#4f46e5', border: '#4338ca', text: '#ffffff' }, // Indigo (Objective MCQ)
      'T2': { bg: '#0284c7', border: '#0369a1', text: '#ffffff' }, // Sky Blue (Rank / Percentile)
      'T3': { bg: '#d97706', border: '#b45309', text: '#ffffff' }, // Amber (Descriptive AI)
      'T4': { bg: '#059669', border: '#047857', text: '#ffffff' }, // Emerald (Result PDF)
      'T5': { bg: '#7c3aed', border: '#6d28d9', text: '#ffffff' }, // Violet (Proctoring Scan)
      'T6': { bg: '#e11d48', border: '#be123c', text: '#ffffff' }, // Rose (Plagiarism Check)
      'T7': { bg: '#0d9488', border: '#0f766e', text: '#ffffff' }, // Teal (Certificate Gen)
      'T8': { bg: '#ea580c', border: '#c2410c', text: '#ffffff' }, // Warm Orange
      'T9': { bg: '#2563eb', border: '#1d4ed8', text: '#ffffff' }, // Royal Blue
      'T10':{ bg: '#db2777', border: '#be185d', text: '#ffffff' }  // Pink
    };
    if (palette[id]) return palette[id];
    const fallbacks = [
      { bg: '#6366f1', border: '#4f46e5', text: '#ffffff' },
      { bg: '#0891b2', border: '#0e7490', text: '#ffffff' },
      { bg: '#f59e0b', border: '#d97706', text: '#ffffff' },
      { bg: '#10b981', border: '#059669', text: '#ffffff' },
      { bg: '#8b5cf6', border: '#7c3aed', text: '#ffffff' },
      { bg: '#f43f5e', border: '#e11d48', text: '#ffffff' }
    ];
    const num = parseInt((id || '').replace(/\D/g, ''), 10) || 1;
    return fallbacks[num % fallbacks.length];
  }

  renderTable() {
    if (!this.tableBody) return;
    this.tableBody.innerHTML = '';

    this.tasks.forEach((t, idx) => {
      const tr = document.createElement('tr');
      const color = this.getTaskColor(t.id);
      const tierBadge = t.tier === 'prime'
        ? `<span class="tier-badge tier-prime">Live Exam</span>`
        : (t.tier === 'flash' ? `<span class="tier-badge tier-flash">Batch Eval</span>` : `<span class="tier-badge tier-regular">Standard</span>`);

      tr.innerHTML = `
        <td>
          <div style="display:inline-flex; align-items:center; gap:8px;">
            <span class="task-color-indicator" style="background:${color.bg};"></span>
            <strong>${t.id}</strong> <small style="color:var(--text-tertiary)">(${t.orderId})</small>
          </div>
        </td>
        <td>${t.desc}</td>
        <td>${tierBadge}</td>
        <td>${t.at} ms</td>
        <td>${t.bt} ms</td>
        <td><strong>${t.priority}</strong></td>
        <td><strong style="color:var(--accent-cyan, #0284c7)">${t.ct ?? '-'} ms</strong></td>
        <td>${t.tat ?? '-'} ms</td>
        <td><strong style="color:var(--accent-amber, #d97706)">${t.wt ?? '-'} ms</strong></td>
        <td>
          <button class="btn btn-sm btn-danger" onclick="window.cpuScheduler.deleteTask(${idx})">&times;</button>
        </td>
      `;
      this.tableBody.appendChild(tr);
    });
  }

  renderGantt(schedule) {
    if (!this.ganttTimeline || !this.ganttScale) return;
    this.ganttTimeline.innerHTML = '';
    this.ganttScale.innerHTML = '';

    if (schedule.length === 0) return;
    const totalDuration = schedule[schedule.length - 1].end;

    schedule.forEach((block, index) => {
      const blockEl = document.createElement('div');
      const widthPct = (block.duration / totalDuration) * 100;
      blockEl.style.width = `${widthPct}%`;

      if (block.isIdle) {
        blockEl.className = 'gantt-block idle';
        blockEl.innerHTML = `<span>IDLE</span><span class="task-time">${block.duration}ms</span>`;
        blockEl.title = `CPU Idle: ${block.start}ms -> ${block.end}ms (${block.duration}ms)`;
      } else {
        const color = this.getTaskColor(block.id);
        blockEl.className = 'gantt-block';
        blockEl.style.backgroundColor = color.bg;
        blockEl.style.borderColor = color.border;
        blockEl.style.color = color.text;
        blockEl.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)';
        blockEl.innerHTML = `<span class="task-id-badge">${block.id}</span><span class="task-time">${block.duration}ms</span>`;
        blockEl.title = `${block.id} (${block.orderId}): ${block.start}ms -> ${block.end}ms (${block.duration}ms) - ${block.desc}`;
      }
      this.ganttTimeline.appendChild(blockEl);

      // Add time marks
      if (index === 0) {
        const startMark = document.createElement('span');
        startMark.className = 'gantt-mark';
        startMark.style.left = `0%`;
        startMark.textContent = block.start;
        this.ganttScale.appendChild(startMark);
      }
      const endMark = document.createElement('span');
      endMark.className = 'gantt-mark';
      endMark.style.left = `${(block.end / totalDuration) * 100}%`;
      endMark.textContent = block.end;
      this.ganttScale.appendChild(endMark);
    });
  }

  renderMetrics() {
    if (this.metricAvgTAT) this.metricAvgTAT.textContent = `${this.metrics.avgTAT} ms`;
    if (this.metricAvgWT) this.metricAvgWT.textContent = `${this.metrics.avgWT} ms`;
    if (this.metricCpuUtil) this.metricCpuUtil.textContent = `${this.metrics.cpuUtil}%`;
    if (this.metricThroughput) this.metricThroughput.textContent = `${this.metrics.throughput} tasks/ms`;
  }

  animateGantt() {
    if (this.animating) {
      clearInterval(this.animTimer);
      this.animating = false;
      document.getElementById('btn-animate-gantt').textContent = 'Play Gantt Animation';
      return;
    }

    if (!this.scheduleResult || this.scheduleResult.length === 0) return;
    this.animating = true;
    document.getElementById('btn-animate-gantt').textContent = 'Pause Animation';

    let currentSec = 0;
    const maxSec = this.scheduleResult[this.scheduleResult.length - 1].end;

    this.animTimer = setInterval(() => {
      currentSec++;
      if (this.ganttTimer) this.ganttTimer.textContent = `Elapsed Time: ${currentSec} ms / ${maxSec} ms`;

      // Highlight active block
      const blocks = this.ganttTimeline.querySelectorAll('.gantt-block');
      let accTime = 0;
      this.scheduleResult.forEach((b, i) => {
        if (currentSec >= b.start && currentSec <= b.end) {
          blocks[i]?.style.setProperty('outline', '3px solid #0a0a0a');
          blocks[i]?.style.setProperty('box-shadow', '0 6px 16px rgba(0, 0, 0, 0.25)');
          blocks[i]?.style.setProperty('z-index', '10');
          blocks[i]?.style.setProperty('transform', 'scaleY(1.06)');
        } else {
          blocks[i]?.style.removeProperty('outline');
          blocks[i]?.style.removeProperty('box-shadow');
          blocks[i]?.style.removeProperty('z-index');
          blocks[i]?.style.removeProperty('transform');
        }
      });

      if (currentSec >= maxSec) {
        clearInterval(this.animTimer);
        this.animating = false;
        document.getElementById('btn-animate-gantt').textContent = 'Replay Animation';
      }
    }, 250);
  }

  clearOutputs() {
    if (this.tableBody) this.tableBody.innerHTML = '';
    if (this.ganttTimeline) this.ganttTimeline.innerHTML = '';
    if (this.ganttScale) this.ganttScale.innerHTML = '';
  }
}

window.cpuScheduler = new CPUScheduler();
