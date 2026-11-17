import { EQUIPMENT_LIMITS } from '../simulation/SectorDataStore.js';

function createMetricRow(label, value, highlight = false) {
  const row = document.createElement('div');
  row.className = 'sector-metric-row';

  const lbl = document.createElement('span');
  lbl.className = 'metric-label';
  lbl.textContent = label;

  const val = document.createElement('span');
  val.className = highlight ? 'metric-value is-highlight' : 'metric-value';
  val.textContent = value;

  row.appendChild(lbl);
  row.appendChild(val);
  return row;
}

function createReadinessChip(label, active, max = null, unit = '') {
  const chip = document.createElement('div');
  chip.className = 'readiness-chip';

  const lbl = document.createElement('span');
  lbl.className = 'chip-lbl';
  lbl.textContent = label;

  const val = document.createElement('span');
  val.className = 'chip-val';
  if (max === null) {
    val.textContent = `${active}${unit}`;
  } else {
    val.textContent = unit ? `${active}/${max}${unit}` : `${active}/${max}`;
  }

  chip.appendChild(lbl);
  chip.appendChild(val);
  return chip;
}

function createProgressLine(label, done, total, colorClass = '') {
  const pct = total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0;

  const wrap = document.createElement('div');
  wrap.className = 'vessel-progress-row';

  const head = document.createElement('div');
  head.className = 'vessel-progress-head';

  const lblEl = document.createElement('span');
  lblEl.textContent = label;

  const valEl = document.createElement('span');
  valEl.className = 'mono-val';
  valEl.textContent = `${done}/${total} (${pct}%)`;

  head.appendChild(lblEl);
  head.appendChild(valEl);

  const track = document.createElement('div');
  track.className = 'progress-track';

  const fill = document.createElement('div');
  fill.className = `progress-fill ${colorClass}`.trim();
  fill.style.width = `${pct}%`;

  track.appendChild(fill);
  wrap.appendChild(head);
  wrap.appendChild(track);
  return wrap;
}

/**
 * ==============================================================================
 * InformationPanel.js (Panel Activity-by-Data & Kesiapan Alat per Sektor)
 * ==============================================================================
 */
export class InformationPanel {
  constructor(dataStore) {
    this.dataStore = dataStore;

    this.panelEl = document.getElementById('sector-activity-panel');
    this.dotEl = document.getElementById('sector-accent-dot');
    this.nameEl = document.getElementById('sector-name');
    this.statusEl = document.getElementById('sector-status-badge');
    this.codeEl = document.getElementById('sector-code-badge');

    this.activeContainer = document.getElementById('sector-active-block');
    this.doneContainer = document.getElementById('sector-done-block');
    this.readinessContainer = document.getElementById('sector-readiness-block');

    this.btnPrev = document.getElementById('btn-sector-prev');
    this.btnNext = document.getElementById('btn-sector-next');
    this.btnFocus = document.getElementById('btn-sector-focus');
    this.btnClose = document.getElementById('btn-sector-close');

    this.currentSector = null;
    this.onFocusRequest = null;
    this.onCloseRequest = null;
    this.onStepRequest = null;

    this._initEvents();
    this.dataStore?.onChange(() => {
      if (this.currentSector) {
        this.render(this.currentSector);
      }
    });

    this.render(null);
  }

  _initEvents() {
    this.btnPrev?.addEventListener('click', () => {
      if (typeof this.onStepRequest === 'function') this.onStepRequest(-1);
    });
    this.btnNext?.addEventListener('click', () => {
      if (typeof this.onStepRequest === 'function') this.onStepRequest(1);
    });
    this.btnFocus?.addEventListener('click', () => {
      if (this.currentSector && typeof this.onFocusRequest === 'function') {
        this.onFocusRequest(this.currentSector);
      }
    });
    this.btnClose?.addEventListener('click', () => {
      if (typeof this.onCloseRequest === 'function') {
        this.onCloseRequest();
      }
    });
  }

  render(sector) {
    this.currentSector = sector;
    if (!this.panelEl) return;

    if (!sector) {
      this.panelEl.classList.add('is-hidden');
      return;
    }

    this.panelEl.classList.remove('is-hidden');
    this.panelEl.style.setProperty('--sector-accent', sector.accentColor);

    if (this.dotEl) this.dotEl.style.backgroundColor = sector.accentColor;
    if (this.nameEl) this.nameEl.textContent = sector.fullName;
    if (this.statusEl) this.statusEl.textContent = sector.statusLabel;
    if (this.codeEl) this.codeEl.textContent = `${sector.code}/05`;

    const data = this.dataStore?.getSectorData(sector.id);
    if (!data) return;

    this.activeContainer?.replaceChildren();
    this.doneContainer?.replaceChildren();
    this.readinessContainer?.replaceChildren();

    switch (sector.id) {
      case 'PRE_GATE':
        this._renderPreGate(data);
        break;
      case 'WAITING_CY':
        this._renderWaitingCy(data);
        break;
      case 'MAIN_GATE':
        this._renderMainGate(data);
        break;
      case 'CONTAINER_YARD':
        this._renderContainerYard(data);
        break;
      case 'DERMAGA':
        this._renderDermaga(data);
        break;
    }
  }

  _renderPreGate(d) {
    this.activeContainer?.appendChild(
      createMetricRow('Sedang Cek TBS & WIM', `${d.activeChecking} truk`)
    );
    const note = document.createElement('div');
    note.className = 'sector-inline-note';
    note.textContent = d.lastEvent;
    this.activeContainer?.appendChild(note);

    this.doneContainer?.appendChild(
      createMetricRow('Lolos ke Main Gate', `${d.passedToMainGate} truk`, true)
    );
    this.doneContainer?.appendChild(
      createMetricRow('Dialihkan ke Waiting', `${d.divertedToWaiting} truk`)
    );

    const grid = document.createElement('div');
    grid.className = 'readiness-grid';
    grid.appendChild(createReadinessChip('Portal WIM', d.portalsReady, d.portalsTotal, ' Lajur'));
    this.readinessContainer?.appendChild(grid);

    const portalHint = document.createElement('div');
    portalHint.className = 'sector-inline-note';
    portalHint.textContent = 'Data hanya dari 3 jalur berportal (jalur umum tanpa portal tidak terdata).';
    this.readinessContainer?.appendChild(portalHint);
  }

  _renderWaitingCy(d) {
    this.activeContainer?.appendChild(
      createMetricRow('Truk Tunggu Resolusi', `${d.waitingTrucks} / ${d.slotCapacity} slot`, true)
    );
    this.activeContainer?.appendChild(
      createMetricRow('Aktivitas Buffer', 'TR 2 · TR 4 · TR 5')
    );

    this.doneContainer?.appendChild(
      createMetricRow('Solved & Keluar ke CY', `${d.resolvedExited} truk`, true)
    );
    this.doneContainer?.appendChild(
      createMetricRow('Kontainer Buffer', `${d.bufferContainersHandled} box`)
    );

    const grid = document.createElement('div');
    grid.className = 'readiness-grid';
    grid.appendChild(createReadinessChip('Slot Tunggu', d.waitingTrucks, d.slotCapacity));
    grid.appendChild(createReadinessChip('RS Ready', d.equipment.rsReady, EQUIPMENT_LIMITS.RS));
    grid.appendChild(createReadinessChip('EH Ready', d.equipment.ehReady, EQUIPMENT_LIMITS.EH));
    this.readinessContainer?.appendChild(grid);
  }

  _renderMainGate(d) {
    this.activeContainer?.appendChild(
      createMetricRow('Sedang Proses Gate', `In: ${d.activeInGate} · Out: ${d.activeOutGate}`)
    );

    // Sub-kartu khusus Data Truk Terakhir Lewat Main Gate
    const lastBox = document.createElement('div');
    lastBox.className = 'last-truck-box';

    const lastTitle = document.createElement('div');
    lastTitle.className = 'last-truck-title';
    lastTitle.textContent = 'TRUK TERAKHIR MELINTAS';
    lastBox.appendChild(lastTitle);

    if (d.lastTruck) {
      const t = d.lastTruck;
      lastBox.appendChild(
        createMetricRow(`${t.direction === 'IN' ? 'Gate-In' : 'Gate-Out'} (${t.lane})`, t.truckId, true)
      );
      lastBox.appendChild(createMetricRow('Kontainer', t.containerNo));
      lastBox.appendChild(createMetricRow('Job / Blok CY', `${t.jobOrder} · ${t.block}`));
      lastBox.appendChild(createMetricRow('Waktu', t.timeStr));
    } else {
      const empty = document.createElement('div');
      empty.className = 'sector-inline-note';
      empty.textContent = 'Belum ada transaksi truk (menunggu simulasi aktif).';
      lastBox.appendChild(empty);
    }
    this.activeContainer?.appendChild(lastBox);

    this.doneContainer?.appendChild(
      createMetricRow('Total Gate-In Selesai', `${d.completedIn} truk`, true)
    );
    this.doneContainer?.appendChild(
      createMetricRow('Total Gate-Out Selesai', `${d.completedOut} truk`)
    );
    this.doneContainer?.appendChild(
      createMetricRow('Rata-rata Dwell', `${d.avgDwellSec} dtk`)
    );

    const grid = document.createElement('div');
    grid.className = 'readiness-grid';
    grid.appendChild(createReadinessChip('In Aktif', d.activeInGate, 4, ' Lajur'));
    grid.appendChild(createReadinessChip('Out Aktif', d.activeOutGate, 4, ' Lajur'));
    this.readinessContainer?.appendChild(grid);
  }

  _renderContainerYard(d) {
    this.activeContainer?.appendChild(
      createMetricRow('Job Truk Eksternal (R/D)', `${d.activeExternalJobs} aktif`)
    );
    this.activeContainer?.appendChild(
      createMetricRow('Job Truk Internal (Dermaga)', `${d.activeInternalJobs} aktif`)
    );

    this.doneContainer?.appendChild(
      createMetricRow('Total Box Ditangani', `${d.completedBoxes} box`, true)
    );
    this.doneContainer?.appendChild(
      createMetricRow('Okupansi Yard (YOR)', `${d.yorPercent.toFixed(1)}%`)
    );

    const grid = document.createElement('div');
    grid.className = 'readiness-grid';
    grid.appendChild(createReadinessChip('ASC', d.equipment.ascReady, EQUIPMENT_LIMITS.ASC));
    grid.appendChild(createReadinessChip('RTG', d.equipment.rtgReady, EQUIPMENT_LIMITS.RTG));
    grid.appendChild(createReadinessChip('RS', d.equipment.rsReady, EQUIPMENT_LIMITS.RS));
    grid.appendChild(createReadinessChip('EH', d.equipment.ehReady, EQUIPMENT_LIMITS.EH));
    this.readinessContainer?.appendChild(grid);
  }

  _renderDermaga(d) {
    if (d.vessels.length > 0) {
      d.vessels.forEach((v) => {
        const card = document.createElement('div');
        card.className = 'vessel-card';

        const top = document.createElement('div');
        top.className = 'vessel-card-top';

        const nameEl = document.createElement('span');
        nameEl.className = 'vessel-name';
        nameEl.textContent = `${v.name} (${v.berthSide})`;

        const stsEl = document.createElement('span');
        stsEl.className = 'vessel-sts-badge';
        stsEl.textContent = `${v.allocatedSts} STS`;

        top.appendChild(nameEl);
        top.appendChild(stsEl);
        card.appendChild(top);

        card.appendChild(createProgressLine('Discharge', v.dischargeDone, v.dischargeTotal, 'is-discharge'));
        card.appendChild(createProgressLine('Load', v.loadDone, v.loadTotal, 'is-load'));
        this.activeContainer?.appendChild(card);
      });
    } else {
      const empty = document.createElement('div');
      empty.className = 'sector-inline-note';
      empty.textContent = '0 kapal sandar — Alokasi CC/STS & progress Load/Discharge per kapal tampil saat simulasi berjalan.';
      this.activeContainer?.appendChild(empty);
    }

    this.doneContainer?.appendChild(
      createMetricRow('Total Discharge', `${d.totalDischarged} box`, true)
    );
    this.doneContainer?.appendChild(
      createMetricRow('Total Load', `${d.totalLoaded} box`, true)
    );

    const grid = document.createElement('div');
    grid.className = 'readiness-grid';
    grid.appendChild(createReadinessChip('BOR Total', d.borPercent.toFixed(0), null, '%'));
    grid.appendChild(createReadinessChip('STS Alokasi', d.stsAllocated, d.stsMax));
    grid.appendChild(createReadinessChip('STS Ready', d.stsReady, d.stsMax));
    this.readinessContainer?.appendChild(grid);

    const borBreakdown = document.createElement('div');
    borBreakdown.className = 'sector-inline-note';
    borBreakdown.textContent = `BOR Int: ${d.borIntPercent.toFixed(0)}% · BOR Dom: ${d.borDomPercent.toFixed(0)}% · Pier ${d.pierLengthM}m`;
    this.readinessContainer?.appendChild(borBreakdown);
  }
}
