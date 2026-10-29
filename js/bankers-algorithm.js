/**
 * Banker's Algorithm for Deadlock Avoidance in E-Commerce Architecture
 * Resources:
 * R1: Payment Gateway Channels (Stripe/PayPal)
 * R2: Inventory Locks (Database mutex on stock rows)
 * R3: Database Connections (PostgreSQL pool)
 */

class BankersAlgorithm {
  constructor() {
    this.processes = [];
    this.resources = {
      R1: { name: 'Auto-Grading Engine Threads', total: 10 },
      R2: { name: 'Database Write Locks (Result Ledger)', total: 5 },
      R3: { name: 'PDF Generator & Rank Slots', total: 7 }
    };

    this.available = [3, 3, 2]; // Initial default
    this.initDOM();
    this.loadSafePreset();
  }

  initDOM() {
    this.matrixBody = document.getElementById('banker-matrix-body');
    this.vectorAvailableEl = document.getElementById('vector-available');
    this.statusBadgeEl = document.getElementById('safety-status-badge');
    this.resultBoxEl = document.getElementById('safety-result-box');
    this.stepLogEl = document.getElementById('banker-step-log');
    this.processSelectEl = document.getElementById('req-process-select');
    this.feedbackEl = document.getElementById('request-eval-feedback');

    document.getElementById('btn-banker-safe-preset')?.addEventListener('click', () => this.loadSafePreset());
    document.getElementById('btn-banker-unsafe-preset')?.addEventListener('click', () => this.loadUnsafePreset());
    document.getElementById('btn-run-banker')?.addEventListener('click', () => this.runSafetyAlgorithm(true));
    document.getElementById('btn-submit-request')?.addEventListener('click', () => this.evaluateResourceRequest());
  }

  loadSafePreset() {
    this.processes = [
      { id: 'P0', desc: 'SUB-#101 (Student Auth & Token)', alloc: [0, 1, 0], max: [7, 5, 3] },
      { id: 'P1', desc: 'SUB-#102 (MCQ Auto-Grader)', alloc: [2, 0, 0], max: [3, 2, 2] },
      { id: 'P2', desc: 'SUB-#103 (DB Ledger Write Lock)', alloc: [3, 0, 2], max: [9, 0, 2] },
      { id: 'P3', desc: 'SUB-#104 (Grade PDF Gen)', alloc: [2, 1, 1], max: [2, 2, 2] },
      { id: 'P4', desc: 'SUB-#105 (Result Notification)', alloc: [0, 0, 2], max: [4, 3, 3] }
    ];

    this.available = [3, 3, 2];
    this.calculateNeedMatrix();
    this.render();
    this.log('Loaded Online Examination Benchmark Scenario (Safe State Preset).', 'info');
    this.runSafetyAlgorithm(false);
  }

  loadUnsafePreset() {
    this.processes = [
      { id: 'P0', desc: 'SUB-#101 (Student Auth & Token)', alloc: [3, 1, 1], max: [7, 5, 3] },
      { id: 'P1', desc: 'SUB-#102 (MCQ Auto-Grader)', alloc: [2, 1, 1], max: [3, 2, 2] },
      { id: 'P2', desc: 'SUB-#103 (DB Ledger Write Lock)', alloc: [4, 0, 2], max: [9, 0, 2] },
      { id: 'P3', desc: 'SUB-#104 (Grade PDF Gen)', alloc: [1, 2, 1], max: [2, 2, 2] },
      { id: 'P4', desc: 'SUB-#105 (Result Notification)', alloc: [0, 1, 2], max: [4, 3, 3] }
    ];

    // Low availability, total claims exhaust capacity
    this.available = [0, 0, 1];
    this.calculateNeedMatrix();
    this.render();
    this.log('Loaded Peak-Hour Exam Deadlock Hazard (Unsafe State Preset).', 'warn');
    this.runSafetyAlgorithm(false);
  }

  calculateNeedMatrix() {
    this.processes.forEach(p => {
      p.need = [
        Math.max(0, p.max[0] - p.alloc[0]),
        Math.max(0, p.max[1] - p.alloc[1]),
        Math.max(0, p.max[2] - p.alloc[2])
      ];
    });
  }

  runSafetyAlgorithm(isUserInitiated = true) {
    this.calculateNeedMatrix();
    const work = [...this.available];
    const finish = new Array(this.processes.length).fill(false);
    const safeSequence = [];
    const stepsLog = [];

    stepsLog.push(`<strong>Starting Banker's Safety Evaluation:</strong> Initial Available Work Vector = [${work.join(', ')}]`);

    let found = true;
    let iteration = 1;

    while (safeSequence.length < this.processes.length && found) {
      found = false;
      for (let i = 0; i < this.processes.length; i++) {
        if (!finish[i]) {
          const p = this.processes[i];
          // Check if Need_i <= Work
          const canSatisfy = (
            p.need[0] <= work[0] &&
            p.need[1] <= work[1] &&
            p.need[2] <= work[2]
          );

          if (canSatisfy) {
            stepsLog.push(`• <em>Iteration ${iteration}:</em> Checking <strong>${p.id}</strong>: Need [${p.need.join(',')}] &le; Work [${work.join(',')}]. Condition <strong>SATISFIED</strong>.`);
            // Work = Work + Allocation_i
            work[0] += p.alloc[0];
            work[1] += p.alloc[1];
            work[2] += p.alloc[2];
            finish[i] = true;
            safeSequence.push(p.id);
            found = true;
            iteration++;
            stepsLog.push(`  &rarr; Process <strong>${p.id}</strong> finishes & releases resources. New Work = [${work.join(', ')}]`);
            break;
          } else {
            stepsLog.push(`• Checking <strong>${p.id}</strong>: Need [${p.need.join(',')}] > Work [${work.join(',')}]. <em>Process must wait.</em>`);
          }
        }
      }
    }

    const isSafe = safeSequence.length === this.processes.length;
    this.renderSafetyResult(isSafe, safeSequence, stepsLog);

    if (isUserInitiated) {
      if (isSafe) {
        this.log(`Banker's Algorithm: SAFE STATE! Safe Sequence: <${safeSequence.join(', ')}>`, 'cons');
        window.ShopOSAudio?.play('success');
      } else {
        this.log(`Banker's Algorithm: UNSAFE STATE! System cannot guarantee deadlock avoidance.`, 'err');
        window.ShopOSAudio?.play('error');
      }
    }

    return { isSafe, safeSequence };
  }

  evaluateResourceRequest() {
    const pIdx = parseInt(this.processSelectEl.value, 10);
    const p = this.processes[pIdx];
    const req = [
      parseInt(document.getElementById('req-r1').value, 10) || 0,
      parseInt(document.getElementById('req-r2').value, 10) || 0,
      parseInt(document.getElementById('req-r3').value, 10) || 0
    ];

    this.feedbackEl.className = 'request-feedback';

    // Step 1: Check if Request <= Need
    if (req[0] > p.need[0] || req[1] > p.need[1] || req[2] > p.need[2]) {
      const err = `[REJECTED] Request [${req.join(',')}] exceeds Max Need claim [${p.need.join(',')}] for ${p.id}. Process has exceeded its declared maximum!`;
      this.feedbackEl.textContent = err;
      this.feedbackEl.classList.add('error');
      this.log(err, 'err');
      window.ShopOSAudio?.play('error');
      return;
    }

    // Step 2: Check if Request <= Available
    if (req[0] > this.available[0] || req[1] > this.available[1] || req[2] > this.available[2]) {
      const warn = `[BLOCKED] Request [${req.join(',')}] exceeds currently Available resources [${this.available.join(',')}]. ${p.id} must WAIT until resources are freed.`;
      this.feedbackEl.textContent = warn;
      this.feedbackEl.classList.add('error');
      this.log(warn, 'warn');
      window.ShopOSAudio?.play('error');
      return;
    }

    // Step 3: Pretend to allocate
    this.available[0] -= req[0];
    this.available[1] -= req[1];
    this.available[2] -= req[2];

    p.alloc[0] += req[0];
    p.alloc[1] += req[1];
    p.alloc[2] += req[2];

    p.need[0] -= req[0];
    p.need[1] -= req[1];
    p.need[2] -= req[2];

    // Test safety of tentative state
    const { isSafe, safeSequence } = this.runSafetyAlgorithm(false);

    if (isSafe) {
      const okMsg = `[GRANTED] Safe state maintained! Resources [${req.join(',')}] allocated to ${p.id}. Safe sequence: <${safeSequence.join(', ')}>`;
      this.feedbackEl.textContent = okMsg;
      this.feedbackEl.classList.add('success');
      this.log(okMsg, 'cons');
      window.ShopOSAudio?.play('success');
      this.render();
    } else {
      // Rollback
      this.available[0] += req[0];
      this.available[1] += req[1];
      this.available[2] += req[2];

      p.alloc[0] -= req[0];
      p.alloc[1] -= req[1];
      p.alloc[2] += req[2];

      p.need[0] += req[0];
      p.need[1] += req[1];
      p.need[2] += req[2];

      const errMsg = `[DENIED & ROLLED BACK] Granting [${req.join(',')}] to ${p.id} would transition system into an UNSAFE STATE (Deadlock risk). Allocation aborted; process queued.`;
      this.feedbackEl.textContent = errMsg;
      this.feedbackEl.classList.add('error');
      this.log(errMsg, 'err');
      window.ShopOSAudio?.play('error');
      this.render();
    }
  }

  render() {
    if (this.vectorAvailableEl) {
      this.vectorAvailableEl.textContent = `[${this.available.join(', ')}]`;
    }

    if (this.matrixBody) {
      this.matrixBody.innerHTML = '';
      this.processes.forEach((p, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><strong>${p.id}</strong> <br><small style="color:var(--text-muted)">${p.desc}</small></td>
          <td class="matrix-cell">${p.alloc[0]}</td>
          <td class="matrix-cell">${p.alloc[1]}</td>
          <td class="matrix-cell">${p.alloc[2]}</td>
          <td class="matrix-cell">${p.max[0]}</td>
          <td class="matrix-cell">${p.max[1]}</td>
          <td class="matrix-cell">${p.max[2]}</td>
          <td class="matrix-cell" style="color:var(--color-warning)"><strong>${p.need[0]}</strong></td>
          <td class="matrix-cell" style="color:var(--color-warning)"><strong>${p.need[1]}</strong></td>
          <td class="matrix-cell" style="color:var(--color-warning)"><strong>${p.need[2]}</strong></td>
        `;
        this.matrixBody.appendChild(tr);
      });
    }

    if (this.processSelectEl) {
      this.processSelectEl.innerHTML = this.processes.map((p, i) => `
        <option value="${i}">${p.id} - ${p.desc}</option>
      `).join('');
    }
  }

  renderSafetyResult(isSafe, safeSequence, stepsLog) {
    if (this.statusBadgeEl) {
      if (isSafe) {
        this.statusBadgeEl.textContent = 'STATE: SAFE';
        this.statusBadgeEl.className = 'badge-status safe';
      } else {
        this.statusBadgeEl.textContent = 'STATE: UNSAFE (DEADLOCK)';
        this.statusBadgeEl.className = 'badge-status unsafe';
      }
    }

    if (this.resultBoxEl) {
      if (isSafe) {
        this.resultBoxEl.innerHTML = `
          <div style="color:var(--color-success, #059669); font-weight:700; font-size:15px; margin-bottom:8px; display:flex; align-items:center; gap:8px;">
            <span style="display:inline-flex; width:22px; height:22px; border-radius:50%; background:#059669; color:#fff; align-items:center; justify-content:center; font-size:12px;">✓</span>
            Safe State Confirmed: No Deadlock Threat
          </div>
          <p style="font-size:13px; color:var(--text-secondary); margin-bottom:12px;">
            All exam evaluation tasks can complete execution without starvation or resource exhaustion. Safe execution order:
          </p>
          <div class="safe-sequence-display">
            ${safeSequence.map(id => `<span class="seq-item">${id}</span>`).join(' <span class="seq-arrow">&rarr;</span> ')}
          </div>
        `;
      } else {
        this.resultBoxEl.innerHTML = `
          <div style="color:var(--color-danger, #dc2626); font-weight:700; font-size:15px; margin-bottom:8px; display:flex; align-items:center; gap:8px;">
            <span style="display:inline-flex; width:22px; height:22px; border-radius:50%; background:#dc2626; color:#fff; align-items:center; justify-content:center; font-size:12px;">✕</span>
            Unsafe State Detected: Deadlock Threat!
          </div>
          <p style="font-size:13px; color:var(--text-secondary);">
            No valid safe sequence exists. Granting additional requests in this state risks circular wait among exam evaluation processes.
          </p>
        `;
      }
    }

    if (this.stepLogEl) {
      this.stepLogEl.innerHTML = stepsLog.map(s => `<div class="log-entry log-info">${s}</div>`).join('');
    }
  }

  log(msg, type = 'info') {
    // Also append to main step log
    if (this.stepLogEl) {
      const entry = document.createElement('div');
      entry.className = `log-entry log-${type}`;
      entry.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
      this.stepLogEl.prepend(entry);
    }
  }
}

window.bankersAlgorithm = new BankersAlgorithm();
