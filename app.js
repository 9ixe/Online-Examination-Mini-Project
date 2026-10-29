/**
 * Operating Systems Algorithm Visualizer Controller
 * Handles tab navigation, module views, and state initialization.
 */

// Safe no-op audio placeholder
window.ShopOSAudio = {
  play: function() {}
};

document.addEventListener('DOMContentLoaded', () => {
  const tabTitles = {
    'dashboard': {
      title: 'System Architecture & Overview',
      desc: 'Demonstration of Operating Systems resource management in an online examination and result processing platform'
    },
    'sync': {
      title: 'Module 1: Producer-Consumer Problem',
      desc: 'Bounded answer submission queue synchronized between student portals and evaluation workers'
    },
    'cpu': {
      title: 'Module 2: CPU Scheduling Algorithms',
      desc: 'Priority (Preemptive & Non-Preemptive), Round Robin, FCFS, and SJF with Gantt charts and TAT/WT metrics'
    },
    'deadlock': {
      title: 'Module 3: Deadlock Avoidance (Banker\'s Algorithm)',
      desc: 'Dynamic evaluation of Evaluation Engine Threads, Database Write Locks, and PDF Generator slot safety'
    },
    'memory': {
      title: 'Module 4: Memory Management (Contiguous Dynamic Partitioning)',
      desc: 'First Fit, Best Fit, and Worst Fit allocation for student payloads with internal/external fragmentation tracking'
    }
  };

  const navItems = document.querySelectorAll('.nav-item');
  const tabContents = document.querySelectorAll('.tab-content');
  const titleEl = document.getElementById('current-tab-title');
  const descEl = document.getElementById('current-tab-desc');

  function switchTab(tabId) {
    navItems.forEach(item => {
      item.classList.toggle('active', item.dataset.tab === tabId);
    });

    tabContents.forEach(content => {
      content.classList.toggle('active', content.id === `tab-${tabId}`);
    });

    if (tabTitles[tabId]) {
      if (titleEl) titleEl.textContent = tabTitles[tabId].title;
      if (descEl) descEl.textContent = tabTitles[tabId].desc;
    }

    // Refresh layout-sensitive components
    if (tabId === 'cpu' && window.cpuScheduler) {
      window.cpuScheduler.run();
    }
    if (tabId === 'deadlock' && window.bankersAlgorithm) {
      window.bankersAlgorithm.render();
    }
    if (tabId === 'memory' && window.memoryManager) {
      window.memoryManager.render();
    }
  }

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      switchTab(item.dataset.tab);
    });
  });

  // Overview card direct links
  document.querySelectorAll('.module-card').forEach(card => {
    card.addEventListener('click', () => {
      const target = card.dataset.goto;
      if (target) switchTab(target);
    });
  });
});
