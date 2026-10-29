/**
 * Integrated Flash Sale Pipeline: Connects all 4 OS concepts into a unified pipeline
 * 1. Producer-Consumer Ingestion
 * 2. CPU Task Scheduling
 * 3. Banker's Deadlock Safety Verification
 * 4. RAM Payload Memory Allocation
 * 5. Order Fulfilled
 */

class IntegratedPipeline {
  constructor() {
    this.stages = {
      buffer: [],
      cpu: [],
      banker: [],
      memory: [],
      complete: []
    };

    this.orderSeq = 500;
    this.initDOM();
  }

  initDOM() {
    this.bufferView = document.getElementById('pipeline-buffer-view');
    this.cpuView = document.getElementById('pipeline-cpu-view');
    this.bankerView = document.getElementById('pipeline-banker-view');
    this.memView = document.getElementById('pipeline-mem-view');
    this.completeView = document.getElementById('pipeline-complete-view');
    this.pipelineLog = document.getElementById('live-pipeline-log');

    document.getElementById('btn-fire-sale-burst')?.addEventListener('click', () => this.triggerFlashSaleBurst());
    document.getElementById('btn-step-order')?.addEventListener('click', () => this.stepNext());
    document.getElementById('btn-pipeline-reset')?.addEventListener('click', () => this.reset());
    document.getElementById('btn-quick-run-pipeline')?.addEventListener('click', () => {
      // Switch to integrated tab and run
      document.querySelector('[data-tab="integrated"]')?.click();
      this.triggerFlashSaleBurst();
    });

    this.seedInitialOrders();
    this.render();
  }

  seedInitialOrders() {
    this.stages.buffer = [
      { id: 'SUB-#501', tier: 'prime', customer: 'CS101 Algorithms Final (Time-Critical)', items: 'MCQ & Coding Answers', ramNeeded: 120, prio: 1 },
      { id: 'SUB-#502', tier: 'regular', customer: 'MATH201 Calculus Midterm', items: 'Formula & Numeric Answers', ramNeeded: 90, prio: 3 },
      { id: 'SUB-#503', tier: 'flash', customer: 'PHYS102 Mechanics Quiz', items: 'Objective Question Sheet', ramNeeded: 160, prio: 2 }
    ];
  }

  triggerFlashSaleBurst() {
    this.log(`[BURST TRIGGERED] Ingesting 4 concurrent answer submissions into buffer queue.`, 'warn');
    const items = ['Data Structures Coding Script', 'Database Systems Paper', 'Operating Systems Solution', 'Computer Networks Exam File'];
    const courses = ['CS202 Data Structures', 'CS301 Database Systems', 'CS401 Operating Systems', 'CS304 Computer Networks'];

    for (let i = 0; i < 4; i++) {
      const isPrime = i % 2 === 0;
      const order = {
        id: `SUB-#${++this.orderSeq}`,
        tier: isPrime ? 'prime' : 'regular',
        customer: `${courses[i]} (${isPrime ? 'Live Exam' : 'Standard Paper'})`,
        items: items[i],
        ramNeeded: Math.floor(Math.random() * 80) + 70,
        prio: isPrime ? 1 : 3
      };
      this.stages.buffer.push(order);
    }
    this.render();
    window.ShopOSAudio?.play('produce');

    // Automatically run the pipeline step sequence
    let stepCount = 0;
    const interval = setInterval(() => {
      this.stepNext();
      stepCount++;
      if (stepCount >= 10 || (this.stages.buffer.length === 0 && this.stages.cpu.length === 0 && this.stages.banker.length === 0 && this.stages.memory.length === 0)) {
        clearInterval(interval);
      }
    }, 1100);
  }

  stepNext() {
    // 4 -> 5: Memory to Complete
    if (this.stages.memory.length > 0) {
      const order = this.stages.memory.shift();
      this.stages.complete.unshift(order);
      this.log(`[STAGE 4 -> 5] ${order.id}: Results Published! Score calculated, rank assigned, PDF grade sheet generated & student notified.`, 'cons');
      window.ShopOSAudio?.play('success');
      this.render();
      return;
    }

    // 3 -> 4: Banker's to Memory
    if (this.stages.banker.length > 0) {
      const order = this.stages.banker.shift();
      // Simulate memory allocation
      this.stages.memory.push(order);
      this.log(`[STAGE 3 -> 4] ${order.id}: Passed Banker's Safety Gate! Allocating ${order.ramNeeded} KB in RAM heap.`, 'info');
      window.ShopOSAudio?.play('produce');
      this.render();
      return;
    }

    // 2 -> 3: CPU to Banker's
    if (this.stages.cpu.length > 0) {
      const order = this.stages.cpu.shift();
      this.stages.banker.push(order);
      this.log(`[STAGE 2 -> 3] ${order.id}: CPU auto-grading complete. Requesting [Evaluation Threads, DB Write Lock, PDF Slot]. Evaluating Banker's Safety.`, 'warn');
      window.ShopOSAudio?.play('consume');
      this.render();
      return;
    }

    // 1 -> 2: Buffer to CPU
    if (this.stages.buffer.length > 0) {
      // Pick highest priority order first (Priority Scheduling)
      this.stages.buffer.sort((a, b) => a.prio - b.prio);
      const order = this.stages.buffer.shift();
      this.stages.cpu.push(order);
      this.log(`[STAGE 1 -> 2] ${order.id} (${order.customer}, Priority: ${order.prio}): Dequeued from bounded buffer. Assigned to CPU auto-grading scheduler.`, 'prod');
      window.ShopOSAudio?.play('produce');
      this.render();
      return;
    }

    this.log(`[PIPELINE IDLE] All queued answer submissions processed. Click "Simulate Concurrent Submissions" to run again.`, 'info');
  }

  reset() {
    this.stages = {
      buffer: [],
      cpu: [],
      banker: [],
      memory: [],
      complete: []
    };
    this.seedInitialOrders();
    this.render();
    this.log(`Pipeline state cleared. Re-seeded with 3 baseline exam submissions.`, 'info');
  }

  render() {
    this.renderColumn(this.bufferView, this.stages.buffer, 'Waiting in bounded buffer');
    this.renderColumn(this.cpuView, this.stages.cpu, 'Executing on CPU (Priority)');
    this.renderColumn(this.bankerView, this.stages.banker, 'Banker\'s Safety Verification');
    this.renderColumn(this.memView, this.stages.memory, 'RAM Partition Allocated');
    this.renderColumn(this.completeView, this.stages.complete, 'Results Published & Dispatched');
  }

  renderColumn(container, list, subtext) {
    if (!container) return;
    if (list.length === 0) {
      container.innerHTML = `<div style="color:var(--text-dim); font-size:12px; text-align:center; padding: 24px 0;">(Queue Empty)</div>`;
      return;
    }

    container.innerHTML = list.map(item => `
      <div class="pipeline-order-chip ${item.tier}">
        <div class="chip-top">
          <span>${item.id}</span>
          <span class="prio-tag ${item.tier}">Prio ${item.prio}</span>
        </div>
        <div class="chip-desc"><strong>${item.customer}</strong></div>
        <div class="chip-desc" style="color:var(--text-tertiary);">${item.items} &bull; ${item.ramNeeded} KB RAM</div>
      </div>
    `).join('');
  }

  log(msg, type = 'info') {
    if (!this.pipelineLog) return;
    const time = new Date().toLocaleTimeString();
    const entry = document.createElement('div');
    entry.className = `log-entry log-${type}`;
    entry.innerHTML = `<span class="log-time">[${time}]</span> ${msg}`;
    this.pipelineLog.prepend(entry);

    if (this.pipelineLog.children.length > 50) {
      this.pipelineLog.removeChild(this.pipelineLog.lastChild);
    }
  }
}

window.integratedPipeline = new IntegratedPipeline();
