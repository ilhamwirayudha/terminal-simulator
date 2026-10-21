import { TruckState } from '../simulation/StateMachine.js';

/**
 * ==============================================================================
 * InformationPanel (Terminal Teluk Lamong Telemetry Dashboard - 4-Zone Layout)
 * ==============================================================================
 */
export class InformationPanel {
  constructor() {
    this.activeTab = 'LOCATION'; // Defaults to Location Intel for layout development

    this.tabTruckBtn = document.querySelector('#tab-truck-btn');
    this.tabLocationBtn = document.querySelector('#tab-location-btn');
    this.viewTruck = document.querySelector('#view-truck-intel');
    this.viewLocation = document.querySelector('#view-location-intel');

    this.telId = document.querySelector('#tel-id');
    this.telStateBadge = document.querySelector('#tel-state-badge');
    this.telContainer = document.querySelector('#tel-container');
    this.telLocation = document.querySelector('#tel-location');
    this.telOperation = document.querySelector('#tel-operation');
    this.telDestination = document.querySelector('#tel-destination');
    this.telSpeed = document.querySelector('#tel-speed');

    this.timelineNodes = document.querySelectorAll('.timeline-step');

    this.locName = document.querySelector('#loc-name');
    this.locType = document.querySelector('#loc-type');
    this.locOperation = document.querySelector('#loc-operation');
    this.locEquipment = document.querySelector('#loc-equipment');
    this.locActiveTruck = document.querySelector('#loc-active-truck');
    this.locNextEvent = document.querySelector('#loc-next-event');

    this._initTabs();
    this.switchTab('LOCATION');
  }

  _initTabs() {
    if (this.tabTruckBtn && this.tabLocationBtn) {
      this.tabTruckBtn.addEventListener('click', () => this.switchTab('TRUCK'));
      this.tabLocationBtn.addEventListener('click', () => this.switchTab('LOCATION'));
    }
  }

  switchTab(tabName) {
    this.activeTab = tabName;

    if (tabName === 'TRUCK') {
      this.tabTruckBtn?.classList.add('active');
      this.tabLocationBtn?.classList.remove('active');
      if (this.viewTruck) this.viewTruck.style.display = 'block';
      if (this.viewLocation) this.viewLocation.style.display = 'none';
    } else {
      this.tabLocationBtn?.classList.add('active');
      this.tabTruckBtn?.classList.remove('active');
      if (this.viewLocation) this.viewLocation.style.display = 'block';
      if (this.viewTruck) this.viewTruck.style.display = 'none';
    }
  }

  update(truck, cameraManager, inGate, outGate, fleetTrucks = []) {
    this._updateLocationIntel(cameraManager, inGate, outGate, fleetTrucks);

    if (!truck) {
      if (this.telId) this.telId.textContent = 'LAYOUT DEVELOPMENT MODE';
      if (this.telStateBadge) {
        this.telStateBadge.textContent = 'STANDBY';
        this.telStateBadge.className = 'state-badge badge-clearance';
      }
      if (this.telContainer) this.telContainer.textContent = 'N/A';
      if (this.telLocation) this.telLocation.textContent = 'Terminal Teluk Lamong Complex';
      if (this.telOperation) this.telOperation.textContent = '3D Environment & Layout Engineering';
      if (this.telDestination) this.telDestination.textContent = 'Zone Infrastructure Inspection';
      if (this.telSpeed) this.telSpeed.textContent = '0.0 m/s';
      return;
    }

    const truckPos = truck.getPosition();
    const truckState = truck.getState();
    const telemetry = truck.getTelemetry();

    const locationName = this._getDynamicLocationName(truckPos, truckState);
    const destinationName = this._getDestinationName(truckPos, truckState, telemetry.mission);

    if (this.telId) this.telId.textContent = `${truck.id} [${telemetry.mission === 'UNLOAD' ? 'DELIVERY' : 'PICKUP'}]`;
    if (this.telStateBadge) {
      this.telStateBadge.textContent = telemetry.label;
      this.telStateBadge.className = `state-badge ${telemetry.badgeClass}`;
    }
    if (this.telContainer) this.telContainer.textContent = truck.getContainerNumber();
    if (this.telLocation) this.telLocation.textContent = locationName;
    if (this.telOperation) this.telOperation.textContent = telemetry.description;
    if (this.telDestination) this.telDestination.textContent = destinationName;
    if (this.telSpeed) {
      const isStopped = truckState === TruckState.GATE_INSPECTION || truckState === TruckState.CY_TRANSFER || truck.speed <= 0.01;
      this.telSpeed.textContent = isStopped ? '0.0 m/s (Halted / Dwell)' : `${truck.speed.toFixed(1)} m/s (Active)`;
    }

    this._updateTimeline(truckState, truckPos);
  }

  _getDynamicLocationName(pos, state) {
    if (pos.z < -170) return 'Zone A: Mainland Access Highway';
    if (pos.z >= -170 && pos.z < -110) return 'Bridge 1: Mainland-to-Small-Island Causeway';
    if (pos.z >= -110 && pos.z < -30) {
      if (state === TruckState.GATE_INSPECTION) return 'Zone B: Small Island In-Gate 01 (Weighbridge & Security Scan)';
      if (state === TruckState.GATE_CLEARANCE) return 'Zone B: Small Island In-Gate 01 (Portal Clearance)';
      return 'Zone B: Small Island (Head Office & Waiting Area)';
    }
    if (pos.z >= -30 && pos.z < 20) return 'Bridge 2: Inter-Island Connector Bridge';
    if (pos.z >= 20 && pos.z < 120) {
      if (state === TruckState.CY_TRANSFER) return 'Zone C: Large Island Container Yard (Reach Stacker Bay)';
      return 'Zone C: Large Island Container Yard (CY)';
    }
    if (pos.z >= 120 && pos.z < 250) return 'Bridge 3: Long Offshore Trestle (Over Deep Sea)';
    if (pos.z >= 250) return 'Zone D: Offshore Quay (STS Super Post-Panamax & Vessel Berth)';

    return 'Terminal Teluk Lamong (TTL) Complex';
  }

  _getDestinationName(pos, state, mission) {
    if (pos.z < -170) return 'Mainland Security Checkpoint & Bridge 1';
    if (state === TruckState.ARRIVING || state === TruckState.GATE_INSPECTION) return 'Small Island In-Gate 01 & Weighbridge';
    if (state === TruckState.TRANSIT_TO_CY) return mission === 'UNLOAD' ? 'Zone C: CY Storage (Drop-off)' : 'Zone C: CY Storage (Pickup)';
    if (state === TruckState.CY_TRANSFER) return 'Reach Stacker Crane Operation';
    if (pos.z >= 120 && pos.z < 250) return 'Zone D: Offshore Deep-Sea Quay';
    if (pos.z >= 250) return 'Trestle Return & Out-Gate 02';
    return 'Small Island Out-Gate 02 & Mainland Return';
  }

  _updateTimeline(state, pos) {
    if (!this.timelineNodes || this.timelineNodes.length < 6) return;

    let activeIndex = 0;
    if (pos.z < -170) activeIndex = 0;
    else if ((pos.z >= -170 && pos.z < -30) && (state === TruckState.ARRIVING || state === TruckState.GATE_INSPECTION)) activeIndex = 1;
    else if (state === TruckState.GATE_CLEARANCE || state === TruckState.TRANSIT_TO_CY || state === TruckState.CY_TRANSFER) activeIndex = 2;
    else if (pos.z >= 120 && pos.z < 250) activeIndex = 3;
    else if (pos.z >= 250) activeIndex = 4;
    else activeIndex = 5;

    this.timelineNodes.forEach((node, index) => {
      node.classList.remove('step-completed', 'step-active', 'step-pending');
      if (index < activeIndex) node.classList.add('step-completed');
      else if (index === activeIndex) node.classList.add('step-active');
      else node.classList.add('step-pending');
    });
  }

  _updateLocationIntel(cameraManager, inGate, outGate, fleetTrucks) {
    const activeStation = cameraManager.getActiveStationKey();

    if (activeStation === 'GATE') {
      if (this.locName) this.locName.textContent = 'ZONE B: SMALL ADMINISTRATIVE & GATE ISLAND';
      if (this.locType) this.locType.textContent = 'Gate Plaza, Head Office HQ & Truck Waiting Area';
      if (this.locOperation) this.locOperation.textContent = `In-Gate: ${inGate ? inGate.state : 'ONLINE'} | Out-Gate: ${outGate ? outGate.state : 'ONLINE'}`;
      if (this.locEquipment) this.locEquipment.textContent = 'In/Out Portals, Weighbridge Scale, Barrier Arms, Shelter';
      if (this.locActiveTruck) this.locActiveTruck.textContent = 'Layout Inspection Mode (Truck Spawning Paused)';
      if (this.locNextEvent) this.locNextEvent.textContent = 'Gate & HQ Infrastructure Inspection';
    } else if (activeStation === 'CY') {
      if (this.locName) this.locName.textContent = 'ZONE C: LARGE CONTAINER YARD (CY) ISLAND';
      if (this.locType) this.locType.textContent = 'Industrial Stacking Blocks, CFS Warehouse & ASC Rails';
      if (this.locOperation) this.locOperation.textContent = 'Reach Stacker Container Stacking & Dispatch';
      if (this.locEquipment) this.locEquipment.textContent = 'Reach Stacker RS-01, 3x ASC Overhead Gantries, 6 Yard Blocks';
      if (this.locActiveTruck) this.locActiveTruck.textContent = 'Layout Inspection Mode (Truck Spawning Paused)';
      if (this.locNextEvent) this.locNextEvent.textContent = 'CY Stacking Blocks & Roadway Development';
    } else if (activeStation === 'TRESTLE') {
      if (this.locName) this.locName.textContent = 'CONNECTION 3: LONG OFFSHORE TRESTLE';
      if (this.locType) this.locType.textContent = 'Elevated Deep-Water Marine Causeway (130m)';
      if (this.locOperation) this.locOperation.textContent = 'Inter-facility Transit across Teluk Lamong Deep Water';
      if (this.locEquipment) this.locEquipment.textContent = 'Concrete Parapets, Deep Marine Pilings, Streetlights';
      if (this.locActiveTruck) this.locActiveTruck.textContent = 'Clear Marine Causeway';
      if (this.locNextEvent) this.locNextEvent.textContent = 'Deep-Sea Pier Connection';
    } else if (activeStation === 'BERTH') {
      if (this.locName) this.locName.textContent = 'ZONE D: OFFSHORE DEEP-SEA QUAY (DERMAGA)';
      if (this.locType) this.locType.textContent = 'Deep-Water Pier Platform (150m x 26m)';
      if (this.locOperation) this.locOperation.textContent = 'Ship-to-Shore Container Handling';
      if (this.locEquipment) this.locEquipment.textContent = '2x STS Super Post-Panamax Cranes, Moored Cargo Vessel';
      if (this.locActiveTruck) this.locActiveTruck.textContent = 'Berth Facility Standby';
      if (this.locNextEvent) this.locNextEvent.textContent = 'Quay Crane & Pier Infrastructure Development';
    } else {
      // OVERVIEW
      if (this.locName) this.locName.textContent = 'TERMINAL TELUK LAMONG (TTL) SURABAYA';
      if (this.locType) this.locType.textContent = '4-Zone Geographic Topology Simulation';
      if (this.locOperation) this.locOperation.textContent = 'Mainland ➔ Bridge 1 ➔ Small Island ➔ Bridge 2 ➔ Large Island ➔ Trestle ➔ Quay';
      if (this.locEquipment) this.locEquipment.textContent = 'Mainland Post, Gate Plaza, Head Office, CY Blocks, Reach Stacker, Trestle, STS Cranes';
      if (this.locActiveTruck) this.locActiveTruck.textContent = 'Layout Development Phase (Trucks Paused)';
      if (this.locNextEvent) this.locNextEvent.textContent = 'World Map & Facility Layout Refinement';
    }
  }
}
