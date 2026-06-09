/* src/ui/styles.ts — inject once into document.head */

export function injectStyles(): void {
  if (document.getElementById('le-styles')) return;
  const style = document.createElement('style');
  style.id = 'le-styles';
  style.textContent = `
    :root {
      --bg-deep:    #0d1117;
      --bg-panel:   #161b22;
      --bg-card:    #1c2333;
      --bg-hover:   #21262d;
      --border:     #30363d;
      --text-prim:  #e6edf3;
      --text-sec:   #8b949e;
      --accent:     #2563eb;
      --accent-h:   #1d4ed8;
      --gold:       #f59e0b;
      --gold-h:     #d97706;
      --green:      #22c55e;
      --red:        #ef4444;
      --purple:     #a855f7;
      --cyan:       #38bdf8;
      --radius:     8px;
      --radius-lg:  12px;
    }

    #le-root {
      position: fixed;
      top: 0; left: 0; width: 100%; height: 100%;
      display: flex;
      flex-direction: column;
      background: var(--bg-deep);
      color: var(--text-prim);
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      font-size: 14px;
      overflow: hidden;
      -webkit-tap-highlight-color: transparent;
      user-select: none;
    }

    /* === TOP BAR === */
    #le-topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 16px;
      background: var(--bg-panel);
      border-bottom: 1px solid var(--border);
      flex-shrink: 0;
      gap: 8px;
    }
    .le-stat-block {
      display: flex; flex-direction: column; align-items: flex-start;
    }
    .le-stat-label { font-size: 10px; color: var(--text-sec); text-transform: uppercase; letter-spacing: 0.5px; }
    .le-stat-value { font-size: 16px; font-weight: 700; color: var(--gold); }
    .le-stat-ips   { font-size: 11px; color: var(--green); }

    /* === BOOST BADGE === */
    #le-boost-badge {
      display: none;
      background: linear-gradient(135deg, #0ea5e9, #7c3aed);
      border-radius: 20px;
      padding: 4px 10px;
      font-size: 11px;
      font-weight: 700;
      color: white;
      white-space: nowrap;
    }

    /* === TAB BAR === */
    #le-tabbar {
      display: flex;
      background: var(--bg-panel);
      border-bottom: 1px solid var(--border);
      flex-shrink: 0;
      overflow-x: auto;
      scrollbar-width: none;
    }
    #le-tabbar::-webkit-scrollbar { display: none; }
    .le-tab {
      flex: 1; min-width: 60px;
      display: flex; flex-direction: column; align-items: center;
      padding: 8px 4px 6px;
      cursor: pointer;
      color: var(--text-sec);
      font-size: 10px;
      border-bottom: 2px solid transparent;
      transition: color 0.15s, border-color 0.15s;
      gap: 3px;
    }
    .le-tab:hover { color: var(--text-prim); }
    .le-tab.active { color: var(--accent); border-color: var(--accent); }
    .le-tab svg { width: 20px; height: 20px; }

    /* === CONTENT AREA === */
    #le-content {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 12px;
      scrollbar-width: thin;
      scrollbar-color: var(--border) transparent;
    }

    /* === PANEL COMMON === */
    .le-panel { display: none; }
    .le-panel.active { display: block; }
    .le-panel-title {
      font-size: 11px; font-weight: 700; letter-spacing: 1px;
      text-transform: uppercase; color: var(--text-sec);
      margin-bottom: 10px;
    }

    /* === CARD === */
    .le-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 12px;
      margin-bottom: 10px;
    }
    .le-card-header {
      display: flex; align-items: center; gap: 10px; margin-bottom: 8px;
    }
    .le-card-icon { width: 40px; height: 40px; flex-shrink: 0; }
    .le-card-info { flex: 1; min-width: 0; }
    .le-card-name { font-weight: 700; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .le-card-sub  { font-size: 11px; color: var(--text-sec); }

    /* === PROGRESS BAR === */
    .le-progress-wrap {
      height: 4px; background: var(--bg-deep);
      border-radius: 2px; margin: 6px 0; overflow: hidden;
    }
    .le-progress-bar {
      height: 100%; background: var(--accent);
      border-radius: 2px; transition: width 0.3s;
    }

    /* === BUTTONS === */
    .le-btn {
      display: inline-flex; align-items: center; justify-content: center;
      gap: 5px; border: none; border-radius: var(--radius);
      padding: 8px 14px; font-size: 13px; font-weight: 600;
      cursor: pointer; transition: background 0.15s, transform 0.1s, opacity 0.15s;
      white-space: nowrap;
    }
    .le-btn:active { transform: scale(0.96); }
    .le-btn:disabled { opacity: 0.4; cursor: not-allowed; }
    .le-btn-primary   { background: var(--accent);  color: white; }
    .le-btn-primary:hover:not(:disabled) { background: var(--accent-h); }
    .le-btn-gold      { background: var(--gold);    color: #1a0f00; }
    .le-btn-gold:hover:not(:disabled) { background: var(--gold-h); }
    .le-btn-green     { background: var(--green);   color: #021a0a; }
    .le-btn-purple    { background: var(--purple);  color: white; }
    .le-btn-cyan      { background: var(--cyan);    color: #001a2a; }
    .le-btn-ghost     { background: var(--bg-hover); color: var(--text-prim); border: 1px solid var(--border); }
    .le-btn-ghost:hover:not(:disabled) { background: var(--border); }
    .le-btn-sm { padding: 5px 10px; font-size: 11px; }
    .le-btn-full { width: 100%; }

    /* === VEHICLE GRID === */
    .le-vehicle-actions {
      display: flex; gap: 6px; flex-wrap: wrap; margin-top: 8px;
    }
    .le-level-badge {
      display: inline-flex; align-items: center; justify-content: center;
      background: var(--bg-deep); border: 1px solid var(--border);
      border-radius: 6px; padding: 3px 8px; font-size: 11px;
      color: var(--text-sec); font-weight: 700;
    }

    /* === CONTRACT === */
    .le-contract-timer {
      font-size: 12px; color: var(--cyan); font-weight: 600;
    }
    .le-contract-payout {
      font-size: 13px; color: var(--gold); font-weight: 700;
    }

    /* === MODAL === */
    .le-modal-backdrop {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.75);
      z-index: 999;
      display: flex; align-items: center; justify-content: center;
      padding: 16px;
    }
    .le-modal {
      background: var(--bg-panel);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 20px;
      max-width: 340px; width: 100%;
      text-align: center;
    }
    .le-modal h2 { font-size: 18px; margin-bottom: 10px; }
    .le-modal p  { color: var(--text-sec); font-size: 13px; margin-bottom: 16px; line-height: 1.5; }
    .le-modal-actions { display: flex; gap: 8px; justify-content: center; }

    /* === OFFLINE MODAL === */
    .le-offline-reward {
      font-size: 28px; font-weight: 900; color: var(--gold); margin: 8px 0;
    }

    /* === NOTIFICATION === */
    #le-notifications {
      position: fixed; top: 60px; right: 12px;
      display: flex; flex-direction: column; gap: 6px;
      z-index: 1000; pointer-events: none;
      max-width: 220px;
    }
    .le-notif {
      background: var(--bg-panel); border: 1px solid var(--border);
      border-radius: var(--radius); padding: 8px 12px;
      font-size: 12px; font-weight: 600;
      animation: le-slide-in 0.2s ease, le-fade-out 0.3s ease 2.7s forwards;
      pointer-events: none;
    }
    .le-notif-gold   { border-color: var(--gold);   color: var(--gold); }
    .le-notif-green  { border-color: var(--green);  color: var(--green); }
    .le-notif-purple { border-color: var(--purple); color: var(--purple); }
    .le-notif-cyan   { border-color: var(--cyan);   color: var(--cyan); }

    @keyframes le-slide-in {
      from { opacity: 0; transform: translateX(20px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    @keyframes le-fade-out {
      from { opacity: 1; } to { opacity: 0; }
    }

    /* === PRESTIGE PANEL === */
    .le-prestige-level {
      font-size: 48px; font-weight: 900; color: var(--purple);
      text-align: center; margin: 8px 0;
    }
    .le-prestige-mult {
      font-size: 20px; font-weight: 700; color: var(--gold);
      text-align: center; margin-bottom: 12px;
    }

    /* === LOCKED OVERLAY === */
    .le-locked {
      opacity: 0.5;
    }
    .le-locked-label {
      font-size: 10px; color: var(--text-sec); margin-top: 4px;
    }

    /* Scrollbar */
    #le-content::-webkit-scrollbar { width: 4px; }
    #le-content::-webkit-scrollbar-track { background: transparent; }
    #le-content::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }
  `;
  document.head.appendChild(style);
}
