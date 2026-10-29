/**
 * Memory Management Module for E-Commerce Order Payload Buffer
 * Implements First Fit, Best Fit, and Worst Fit dynamic partition allocation
 * Analyzes and visualizes external and internal fragmentation, memory holes, and compaction.
 */

class MemoryManager {
  constructor() {
    this.totalMemory = 1024; // 1024 KB total physical RAM buffer
    this.blocks = [];
    this.orderCounter = 106;

    this.initDOM();
    this.loadPreset();
  }

  initDOM() {
    this.algoSelect = document.getElementById('mem-algo');
    this.memoryBarEl = document.getElementById('memory-bar');
    this.blocksBodyEl = document.getElementById('memory-blocks-body');
    this.statFreeRam = document.getElementById('stat-free-ram');
    this.statExtFrag = document.getElementById('stat-ext-frag');
    this.statIntFrag = document.getElementById('stat-int-frag');
    this.statRamUtil = document.getElementById('stat-ram-util');

    document.getElementById('btn-preset-memory')?.addEventListener('click', () => this.loadPreset());
    document.getElementById('btn-compact-memory')?.addEventListener('click', () => this.compact());
    document.getElementById('btn-reset-memory')?.addEventListener('click', () => this.reset());
    document.getElementById('btn-allocate-mem')?.addEventListener('click', () => this.allocateFromInput());
  }

  loadPreset() {
    // Initial memory state with exam answer script buffers, token sessions, and free holes
    this.blocks = [
      { id: 'B1', start: 0, size: 160, isAllocated: true, process: 'SUB-#101 (Student Auth & Token Cache)', payloadSize: 150, intFrag: 10 },
      { id: 'B2', start: 160, size: 120, isAllocated: false, process: null, payloadSize: 0, intFrag: 0 },
      { id: 'B3', start: 280, size: 240, isAllocated: true, process: 'SUB-#102 (Answer Script Submission Heap)', payloadSize: 220, intFrag: 20 },
      { id: 'B4', start: 520, size: 180, isAllocated: false, process: null, payloadSize: 0, intFrag: 0 },
      { id: 'B5', start: 700, size: 200, isAllocated: true, process: 'SUB-#103 (Score Matrix & Grade Sheet Buffer)', payloadSize: 190, intFrag: 10 },
      { id: 'B6', start: 900, size: 124, isAllocated: false, process: null, payloadSize: 0, intFrag: 0 }
    ];

    this.render();
  }

  reset() {
    this.blocks = [
      { id: 'B1', start: 0, size: 1024, isAllocated: false, process: null, payloadSize: 0, intFrag: 0 }
    ];
    this.render();
  }

  allocateFromInput() {
    const nameInput = document.getElementById('mem-process-name');
    const sizeInput = document.getElementById('mem-process-size');
    const name = nameInput?.value || `SUB #${this.orderCounter++} (Exam Payload Buffer)`;
    const size = parseInt(sizeInput?.value || '100', 10);

    if (size <= 0 || size > this.totalMemory) {
      alert(`Invalid memory size request: ${size} KB. Range must be 10 - ${this.totalMemory} KB.`);
      return;
    }

    const algo = this.algoSelect ? this.algoSelect.value : 'first-fit';
    const success = this.allocate(name, size, algo);

    if (success) {
      window.ShopOSAudio?.play('success');
      if (nameInput) nameInput.value = `SUB #${++this.orderCounter} (Answer Submission Buffer)`;
    } else {
      window.ShopOSAudio?.play('error');
    }
  }

  allocate(processName, requestSize, algo = 'first-fit') {
    // Find candidate free blocks
    const freeHoles = [];
    this.blocks.forEach((b, idx) => {
      if (!b.isAllocated && b.size >= requestSize) {
        freeHoles.push({ block: b, index: idx });
      }
    });

    if (freeHoles.length === 0) {
      // Memory allocation failure
      const totalFree = this.blocks.filter(b => !b.isAllocated).reduce((sum, b) => sum + b.size, 0);
      if (totalFree >= requestSize) {
        alert(`[EXTERNAL FRAGMENTATION ALERT]\nCannot allocate ${requestSize} KB for "${processName}".\nTotal free memory across multiple holes is ${totalFree} KB, but no single contiguous hole is large enough!\n\nSolution: Click "⚡ Defragment / Compact" to merge holes.`);
      } else {
        alert(`[OUT OF MEMORY]\nCannot allocate ${requestSize} KB. System only has ${totalFree} KB free RAM.`);
      }
      return false;
    }

    let targetHole = null;

    if (algo === 'first-fit') {
      // First hole encountered
      targetHole = freeHoles[0];
    } else if (algo === 'best-fit') {
      // Smallest hole that is >= requestSize
      freeHoles.sort((a, b) => a.block.size - b.block.size);
      targetHole = freeHoles[0];
    } else if (algo === 'worst-fit') {
      // Largest hole available
      freeHoles.sort((a, b) => b.block.size - a.block.size);
      targetHole = freeHoles[0];
    }

    const holeIndex = targetHole.index;
    const oldBlock = this.blocks[holeIndex];

    // Partition hole
    const allocatedBlock = {
      id: `B${Date.now().toString().slice(-4)}`,
      start: oldBlock.start,
      size: requestSize,
      isAllocated: true,
      process: processName,
      payloadSize: requestSize,
      intFrag: 0 // In variable partition dynamic allocation, internal frag = 0 unless fixed chunking used
    };

    const remainingSize = oldBlock.size - requestSize;

    if (remainingSize > 0) {
      const leftoverHole = {
        id: `Hole-${Date.now().toString().slice(-3)}`,
        start: oldBlock.start + requestSize,
        size: remainingSize,
        isAllocated: false,
        process: null,
        payloadSize: 0,
        intFrag: 0
      };
      // Replace old block with allocated block and remaining free hole
      this.blocks.splice(holeIndex, 1, allocatedBlock, leftoverHole);
    } else {
      this.blocks.splice(holeIndex, 1, allocatedBlock);
    }

    this.reindex();
    this.render();
    return true;
  }

  deallocate(index) {
    const b = this.blocks[index];
    if (!b || !b.isAllocated) return;

    b.isAllocated = false;
    b.process = null;
    b.payloadSize = 0;
    b.intFrag = 0;

    // Coalesce adjacent free blocks
    this.coalesce();
    this.reindex();
    this.render();
    window.ShopOSAudio?.play('consume');
  }

  coalesce() {
    const newBlocks = [];
    for (let i = 0; i < this.blocks.length; i++) {
      const current = this.blocks[i];
      if (newBlocks.length > 0 && !newBlocks[newBlocks.length - 1].isAllocated && !current.isAllocated) {
        // Merge into previous free hole
        newBlocks[newBlocks.length - 1].size += current.size;
      } else {
        newBlocks.push(current);
      }
    }
    this.blocks = newBlocks;
  }

  compact() {
    // Relocate all allocated blocks to low memory, combine all free space into one large hole
    const allocated = this.blocks.filter(b => b.isAllocated);
    const totalAllocatedSize = allocated.reduce((sum, b) => sum + b.size, 0);
    const totalFreeSize = this.totalMemory - totalAllocatedSize;

    let currentAddress = 0;
    const compacted = [];

    allocated.forEach(b => {
      compacted.push({
        ...b,
        start: currentAddress
      });
      currentAddress += b.size;
    });

    if (totalFreeSize > 0) {
      compacted.push({
        id: `Hole-Compacted`,
        start: currentAddress,
        size: totalFreeSize,
        isAllocated: false,
        process: null,
        payloadSize: 0,
        intFrag: 0
      });
    }

    this.blocks = compacted;
    this.reindex();
    this.render();
    alert(`⚡ Compaction Complete!\nAll allocated memory blocks were relocated towards base address 0 KB.\nA single contiguous free hole of ${totalFreeSize} KB is now available!`);
    window.ShopOSAudio?.play('success');
  }

  reindex() {
    this.blocks.forEach((b, i) => {
      b.id = `B${i + 1}`;
    });
  }

  computeMetrics() {
    let freeRam = 0;
    let intFrag = 0;
    let allocatedRam = 0;
    const freeHoleSizes = [];

    this.blocks.forEach(b => {
      if (b.isAllocated) {
        allocatedRam += b.size;
        intFrag += b.intFrag;
      } else {
        freeRam += b.size;
        freeHoleSizes.push(b.size);
      }
    });

    // External fragmentation exists if there are multiple free holes
    const extFrag = freeHoleSizes.length > 1 ? freeRam : 0;
    const util = Math.round((allocatedRam / this.totalMemory) * 100);

    return { freeRam, extFrag, intFrag, util };
  }

  render() {
    this.renderBar();
    this.renderTable();
    this.renderAnalytics();
  }

  getBlockColor(idx, id) {
    const palette = [
      { bg: '#4f46e5', border: '#4338ca', text: '#ffffff' }, // Indigo
      { bg: '#0284c7', border: '#0369a1', text: '#ffffff' }, // Cyan / Sky
      { bg: '#059669', border: '#047857', text: '#ffffff' }, // Emerald
      { bg: '#7c3aed', border: '#6d28d9', text: '#ffffff' }, // Purple / Violet
      { bg: '#d97706', border: '#b45309', text: '#ffffff' }, // Amber
      { bg: '#e11d48', border: '#be123c', text: '#ffffff' }, // Rose
      { bg: '#0d9488', border: '#0f766e', text: '#ffffff' }, // Teal
      { bg: '#ea580c', border: '#c2410c', text: '#ffffff' }  // Orange
    ];
    return palette[idx % palette.length];
  }

  renderBar() {
    if (!this.memoryBarEl) return;
    this.memoryBarEl.innerHTML = '';

    this.blocks.forEach((b, idx) => {
      const blockEl = document.createElement('div');
      const widthPct = (b.size / this.totalMemory) * 100;
      blockEl.style.width = `${widthPct}%`;

      if (b.isAllocated) {
        const color = this.getBlockColor(idx, b.id);
        blockEl.className = 'mem-block-render allocated';
        blockEl.style.backgroundColor = color.bg;
        blockEl.style.borderColor = color.border;
        blockEl.style.color = color.text;
        blockEl.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)';
        blockEl.innerHTML = `
          <strong>${b.id}</strong>
          <span>${b.size} KB</span>
          <small style="opacity:0.9">${(b.process || '').slice(0, 14)}...</small>
          ${b.intFrag > 0 ? `<span class="frag-pill">Frag: ${b.intFrag}K</span>` : ''}
        `;
        blockEl.title = `${b.id} [${b.start}KB - ${b.start + b.size}KB]: ${b.process} | Payload: ${b.payloadSize}KB | Frag: ${b.intFrag}KB`;
      } else {
        blockEl.className = 'mem-block-render free';
        blockEl.innerHTML = `
          <strong>FREE</strong>
          <span>${b.size} KB</span>
        `;
        blockEl.title = `Free Memory Hole: ${b.size}KB [${b.start}KB - ${b.start + b.size}KB]`;
      }

      this.memoryBarEl.appendChild(blockEl);
    });
  }

  renderTable() {
    if (!this.blocksBodyEl) return;
    this.blocksBodyEl.innerHTML = '';

    this.blocks.forEach((b, idx) => {
      const tr = document.createElement('tr');
      const color = this.getBlockColor(idx, b.id);
      const statusBadge = b.isAllocated
        ? `<span class="tier-badge" style="background:#059669; color:#fff;">ALLOCATED</span>`
        : `<span class="tier-badge tier-regular">FREE HOLE</span>`;

      tr.innerHTML = `
        <td>
          <div style="display:inline-flex; align-items:center; gap:8px;">
            ${b.isAllocated ? `<span class="task-color-indicator" style="background:${color.bg};"></span>` : ''}
            <strong>${b.id}</strong>
          </div>
        </td>
        <td>${statusBadge}</td>
        <td>${b.start} KB</td>
        <td>${b.size} KB</td>
        <td>${b.process || '—'}</td>
        <td>${b.payloadSize > 0 ? b.payloadSize + ' KB' : '—'}</td>
        <td>${b.intFrag > 0 ? `<strong style="color:var(--accent-amber, #d97706);">${b.intFrag} KB</strong>` : '<span style="color:var(--text-dim);">0 KB</span>'}</td>
        <td>
          ${b.isAllocated
            ? `<button class="btn btn-sm btn-danger" onclick="window.memoryManager.deallocate(${idx})">Free</button>`
            : '—'}
        </td>
      `;
      this.blocksBodyEl.appendChild(tr);
    });
  }

  renderAnalytics() {
    const { freeRam, extFrag, intFrag, util } = this.computeMetrics();
    if (this.statFreeRam) this.statFreeRam.textContent = `${freeRam} KB`;
    if (this.statExtFrag) this.statExtFrag.textContent = `${extFrag} KB`;
    if (this.statIntFrag) this.statIntFrag.textContent = `${intFrag} KB`;
    if (this.statRamUtil) this.statRamUtil.textContent = `${util}%`;
  }
}

window.memoryManager = new MemoryManager();
