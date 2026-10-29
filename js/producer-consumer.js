/**
 * Producer-Consumer Simulation for E-Commerce Ingestion Buffer
 * Demonstrates Bounded Buffer Synchronization using Mutex and Semaphores
 */

class ProducerConsumerSimulation {
  constructor() {
    this.capacity = 8;
    this.buffer = [];
    this.mutex = 1;      // 1 = Free, 0 = Locked
    this.emptySlots = 8; // Semaphore counting empty slots
    this.fullSlots = 0;  // Semaphore counting filled slots
    
    this.producers = [
      { id: 1, name: 'Student Portal #1 (Web App)', state: 'idle' },
      { id: 2, name: 'Student Portal #2 (Mobile Exam App)', state: 'idle' }
    ];

    this.consumers = [
      { id: 1, name: 'Auto-Grader #1 (MCQ & Objective)', state: 'idle' },
      { id: 2, name: 'Auto-Grader #2 (Coding & Eval)', state: 'idle' }
    ];

    this.orderCounter = 101;
    this.isRunning = false;
    this.autoTimer = null;

    this.initDOM();
  }

  initDOM() {
    this.bufferSlotsEl = document.getElementById('buffer-slots');
    this.semMutexEl = document.getElementById('sem-mutex');
    this.semEmptyEl = document.getElementById('sem-empty');
    this.semFullEl = document.getElementById('sem-full');
    this.bufferUtilEl = document.getElementById('buffer-util');
    this.syncLogEl = document.getElementById('sync-log');
    this.producerListEl = document.getElementById('producer-list');
    this.consumerListEl = document.getElementById('consumer-list');
    this.capacityInput = document.getElementById('buffer-capacity');

    if (this.capacityInput) {
      this.capacityInput.addEventListener('change', (e) => {
        const val = parseInt(e.target.value, 10);
        if (val >= 4 && val <= 16) {
          this.setCapacity(val);
        }
      });
    }

    document.getElementById('btn-add-producer')?.addEventListener('click', () => this.addProducer());
    document.getElementById('btn-add-consumer')?.addEventListener('click', () => this.addConsumer());
    document.getElementById('btn-flash-burst')?.addEventListener('click', () => this.triggerFlashBurst());
    document.getElementById('btn-sync-toggle')?.addEventListener('click', () => this.toggleAutoEngine());
    document.getElementById('btn-sync-reset')?.addEventListener('click', () => this.reset());
    document.getElementById('btn-clear-sync-log')?.addEventListener('click', () => {
      if (this.syncLogEl) this.syncLogEl.innerHTML = '';
    });

    this.render();
    this.log('ShopOS Producer-Consumer Ingestion Subsystem Initialized. Buffer size: ' + this.capacity, 'info');
  }

  setCapacity(newCap) {
    if (this.buffer.length > newCap) {
      this.log(`Cannot resize capacity to ${newCap}: currently ${this.buffer.length} active orders queued. Drain first.`, 'err');
      return;
    }
    this.capacity = newCap;
    this.emptySlots = this.capacity - this.buffer.length;
    this.render();
    this.log(`Buffer capacity resized to ${newCap} slots.`, 'info');
  }

  addProducer() {
    const id = this.producers.length + 1;
    this.producers.push({ id, name: `Student Portal #${id}`, state: 'idle' });
    document.getElementById('prod-count').textContent = this.producers.length;
    this.renderThreads();
    this.log(`Spawning new exam submission portal thread: Portal #${id}`, 'prod');
  }

  addConsumer() {
    const id = this.consumers.length + 1;
    this.consumers.push({ id, name: `Auto-Evaluation Worker #${id}`, state: 'idle' });
    document.getElementById('cons-count').textContent = this.consumers.length;
    this.renderThreads();
    this.log(`Spawning new auto-evaluation consumer thread: Worker #${id}`, 'cons');
  }

  // Produce an order
  produce(producerIndex = 0) {
    const producer = this.producers[producerIndex] || this.producers[0];

    // Check empty semaphore
    if (this.emptySlots <= 0) {
      producer.state = 'blocked';
      this.renderThreads();
      this.log(`[OVERFLOW BLOCKED] ${producer.name} blocked on wait(empty). Buffer is FULL (${this.capacity}/${this.capacity})!`, 'err');
      window.ShopOSAudio?.play('error');
      return false;
    }

    // Check mutex
    if (this.mutex === 0) {
      producer.state = 'blocked';
      this.renderThreads();
      this.log(`[MUTEX CONTENTION] ${producer.name} blocked on wait(mutex). Critical section busy.`, 'warn');
      return false;
    }

    // Acquire lock & slot
    this.emptySlots--;
    this.mutex = 0;
    producer.state = 'working';
    this.updateSemaphores();
    this.renderThreads();

    const isPrime = Math.random() < 0.35;
    const order = {
      id: `SUB-#${this.orderCounter++}`,
      customer: isPrime ? 'Time-Critical Live Exam' : 'Standard Paper Submission',
      tier: isPrime ? 'prime' : 'regular',
      itemsCount: Math.floor(Math.random() * 40) + 15,
      total: 100,
      time: new Date().toLocaleTimeString()
    };

    setTimeout(() => {
      // Critical Section
      this.buffer.push(order);
      this.log(`[PRODUCE] ${producer.name} queued ${order.id} (${order.customer}, ${order.itemsCount} Questions) -> Buffer [${this.buffer.length}/${this.capacity}]`, 'prod');
      window.ShopOSAudio?.play('produce');

      // Release lock & signal full
      this.mutex = 1;
      this.fullSlots++;
      producer.state = 'idle';

      this.updateSemaphores();
      this.render();
    }, 280);

    return true;
  }

  // Consume an order
  consume(consumerIndex = 0) {
    const consumer = this.consumers[consumerIndex] || this.consumers[0];

    // Check full semaphore
    if (this.fullSlots <= 0 || this.buffer.length === 0) {
      consumer.state = 'blocked';
      this.renderThreads();
      this.log(`[UNDERFLOW BLOCKED] ${consumer.name} blocked on wait(full). Buffer is EMPTY.`, 'warn');
      return false;
    }

    // Check mutex
    if (this.mutex === 0) {
      consumer.state = 'blocked';
      this.renderThreads();
      this.log(`[MUTEX CONTENTION] ${consumer.name} blocked on wait(mutex).`, 'warn');
      return false;
    }

    // Acquire lock & slot
    this.fullSlots--;
    this.mutex = 0;
    consumer.state = 'working';
    this.updateSemaphores();
    this.renderThreads();

    // Mark slot as active take
    const firstSlotEl = this.bufferSlotsEl?.querySelector('.buffer-slot.occupied');
    if (firstSlotEl) firstSlotEl.classList.add('active-take');

    setTimeout(() => {
      // Critical section
      const order = this.buffer.shift();
      this.log(`[CONSUME] ${consumer.name} dequeued ${order.id} (${order.customer}) for CPU auto-grading -> Remaining: ${this.buffer.length}`, 'cons');
      window.ShopOSAudio?.play('consume');

      // Forward order to CPU scheduling tab or integrated pipeline if active
      if (window.cpuScheduler && !window.cpuScheduler.hasTask(order.id)) {
        window.cpuScheduler.addAutoTask({
          id: order.id,
          desc: `${order.customer} (${order.itemsCount} Qs)`,
          tier: order.tier,
          burstTime: Math.floor(Math.random() * 4) + 2,
          priority: order.tier === 'prime' ? 1 : 3
        });
      }

      // Release lock & signal empty
      this.mutex = 1;
      this.emptySlots++;
      consumer.state = 'idle';

      this.updateSemaphores();
      this.render();
    }, 320);

    return true;
  }

  triggerFlashBurst() {
    this.log(`[BURST LOAD] 5 concurrent checkout requests generated.`, 'warn');
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const prodIdx = i % this.producers.length;
        this.produce(prodIdx);
      }, i * 220);
    }
  }

  toggleAutoEngine() {
    const btn = document.getElementById('btn-sync-toggle');
    if (this.isRunning) {
      clearInterval(this.autoTimer);
      this.isRunning = false;
      if (btn) {
        btn.textContent = 'Start Real-Time Ingestion';
        btn.classList.remove('btn-warning');
        btn.classList.add('btn-primary');
      }
      this.log(`Real-Time Ingestion Paused.`, 'info');
    } else {
      this.isRunning = true;
      if (btn) {
        btn.textContent = 'Pause Ingestion';
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-warning');
      }
      this.log(`Real-Time Ingestion Started (Stochastic Poisson Arrival Process).`, 'info');

      this.autoTimer = setInterval(() => {
        // Stochastic arrival
        if (Math.random() < 0.6) {
          const pIdx = Math.floor(Math.random() * this.producers.length);
          this.produce(pIdx);
        }
        if (Math.random() < 0.55 && this.buffer.length > 0) {
          const cIdx = Math.floor(Math.random() * this.consumers.length);
          this.consume(cIdx);
        }
      }, 750);
    }
  }

  reset() {
    if (this.isRunning) this.toggleAutoEngine();
    this.buffer = [];
    this.mutex = 1;
    this.emptySlots = this.capacity;
    this.fullSlots = 0;
    this.producers.forEach(p => p.state = 'idle');
    this.consumers.forEach(c => c.state = 'idle');
    this.render();
    this.log(`Buffer and semaphores reset to initial state.`, 'info');
  }

  updateSemaphores() {
    if (this.semMutexEl) {
      if (this.mutex === 1) {
        this.semMutexEl.textContent = '1 (FREE)';
        this.semMutexEl.className = 'sem-val unlocked';
      } else {
        this.semMutexEl.textContent = '0 (LOCKED)';
        this.semMutexEl.className = 'sem-val locked';
      }
    }
    if (this.semEmptyEl) this.semEmptyEl.textContent = this.emptySlots;
    if (this.semFullEl) this.semFullEl.textContent = this.fullSlots;
    if (this.bufferUtilEl) {
      const util = Math.round((this.buffer.length / this.capacity) * 100);
      this.bufferUtilEl.textContent = `${util}%`;
    }
  }

  render() {
    this.updateSemaphores();
    this.renderSlots();
    this.renderThreads();
  }

  renderSlots() {
    if (!this.bufferSlotsEl) return;
    this.bufferSlotsEl.innerHTML = '';

    for (let i = 0; i < this.capacity; i++) {
      const slotEl = document.createElement('div');
      const order = this.buffer[i];

      if (order) {
        slotEl.className = `buffer-slot occupied ${order.tier === 'prime' ? 'prime-sub' : 'reg-sub'}`;
        slotEl.innerHTML = `
          <span class="slot-index">[#${i}]</span>
          <span class="slot-order-id">${order.id}</span>
          <span class="slot-order-type">${order.tier === 'prime' ? 'LIVE-EXAM' : 'STD-SUB'}</span>
        `;
        slotEl.title = `Slot #${i}: ${order.id} - ${order.customer} (${order.itemsCount} Questions)`;
      } else {
        slotEl.className = 'buffer-slot';
        slotEl.innerHTML = `
          <span class="slot-index">[#${i}]</span>
          <span class="slot-order-type" style="color:var(--text-dim);">EMPTY</span>
        `;
      }
      this.bufferSlotsEl.appendChild(slotEl);
    }
  }

  renderThreads() {
    if (this.producerListEl) {
      this.producerListEl.innerHTML = this.producers.map(p => `
        <div class="thread-item">
          <span>${p.name}</span>
          <span class="thread-status ${p.state}">${p.state.toUpperCase()}</span>
        </div>
      `).join('');
    }

    if (this.consumerListEl) {
      this.consumerListEl.innerHTML = this.consumers.map(c => `
        <div class="thread-item">
          <span>${c.name}</span>
          <span class="thread-status ${c.state}">${c.state.toUpperCase()}</span>
        </div>
      `).join('');
    }
  }

  log(msg, type = 'info') {
    if (!this.syncLogEl) return;
    const time = new Date().toLocaleTimeString();
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.innerHTML = `<span class="log-time">[${time}]</span> <span class="log-${type}">${msg}</span>`;
    this.syncLogEl.prepend(entry);

    if (this.syncLogEl.children.length > 50) {
      this.syncLogEl.removeChild(this.syncLogEl.lastChild);
    }
  }
}

window.producerConsumer = new ProducerConsumerSimulation();
