/**
 * ==============================================================================
 * Operation State Machine (Reach Stacker & Alternating Truck Lifecycle)
 * ==============================================================================
 *
 * Supported Truck Lifecycle States:
 * 1. ARRIVING         - Approaching Gate 01 entrance lane
 * 2. GATE_INSPECTION  - Stopped at gate for document scan & weigh-in bridge
 * 3. GATE_CLEARANCE   - Barrier arm raised, traffic light green, cleared to pass
 * 4. TRANSIT_TO_CY    - Moving along west-to-north corridor to Container Yard
 * 5. CY_TRANSFER      - Stopped at CY bay for Reach Stacker unloading / loading
 * 6. TRANSIT_TO_EXIT  - Heading along east quay to terminal exit
 * 7. COMPLETED        - Reached exit loop, ready to re-enter
 */

export const TruckState = {
  ARRIVING: 'ARRIVING',
  GATE_INSPECTION: 'GATE_INSPECTION',
  GATE_CLEARANCE: 'GATE_CLEARANCE',
  TRANSIT_TO_CY: 'TRANSIT_TO_CY',
  CY_TRANSFER: 'CY_TRANSFER',
  TRANSIT_TO_EXIT: 'TRANSIT_TO_EXIT',
  MOVING: 'MOVING',
  COMPLETED: 'COMPLETED'
};

// Metadata mapping for UI telemetry
export const StateInfo = {
  [TruckState.ARRIVING]: {
    label: 'ARRIVING',
    description: 'Approaching Gate 01 entrance corridor',
    next: 'Document & Weigh-In Inspection',
    badgeClass: 'badge-arriving'
  },
  [TruckState.GATE_INSPECTION]: {
    label: 'GATE & WEIGH-IN',
    description: 'Scanning container barcode & weigh-in bridge scale verification',
    next: 'Barrier Clearance',
    badgeClass: 'badge-inspection'
  },
  [TruckState.GATE_CLEARANCE]: {
    label: 'GATE CLEARANCE',
    description: 'Barrier arm raised. Access granted for terminal entry',
    next: 'Transit to Container Yard (CY B04)',
    badgeClass: 'badge-clearance'
  },
  [TruckState.TRANSIT_TO_CY]: {
    label: 'TRANSIT TO CY',
    description: 'Navigating North corridor to Container Yard transfer slot',
    next: 'Reach Stacker Crane Operation',
    badgeClass: 'badge-moving'
  },
  [TruckState.CY_TRANSFER]: {
    label: 'CY REACH STACKER',
    description: 'Reach Stacker crane operating (unloading / loading container)',
    next: 'Transit to Terminal Exit',
    badgeClass: 'badge-inspection'
  },
  [TruckState.TRANSIT_TO_EXIT]: {
    label: 'TRANSIT TO EXIT',
    description: 'Navigating East Quay corridor toward terminal exit',
    next: 'Terminal Exit & Loop',
    badgeClass: 'badge-moving'
  },
  [TruckState.MOVING]: {
    label: 'MOVING',
    description: 'Navigating internal terminal transit corridors',
    next: 'Terminal Circuit',
    badgeClass: 'badge-moving'
  },
  [TruckState.COMPLETED]: {
    label: 'COMPLETED',
    description: 'Completed mission circuit. Looping to entrance',
    next: 'Next Inbound Cycle',
    badgeClass: 'badge-completed'
  }
};

export class TruckStateMachine {
  /**
   * @param {string} [initialState=TruckState.ARRIVING]
   * @param {'UNLOAD' | 'LOAD'} [initialMission='UNLOAD']
   */
  constructor(initialState = TruckState.ARRIVING, initialMission = 'UNLOAD') {
    this.currentState = initialState;
    this.previousState = null;
    this.stateTimer = 0;
    this.mission = initialMission; // 'UNLOAD' (Delivery) | 'LOAD' (Pickup)
  }

  /**
   * Transitions to a new state and resets the state timer.
   * @param {string} newState
   */
  transitionTo(newState) {
    if (this.currentState === newState) return;
    this.previousState = this.currentState;
    this.currentState = newState;
    this.stateTimer = 0;
  }

  /**
   * Toggles active mission between UNLOAD (Drop-off) and LOAD (Pickup).
   */
  toggleMission() {
    this.mission = this.mission === 'UNLOAD' ? 'LOAD' : 'UNLOAD';
  }

  /**
   * Returns active mission string.
   * @returns {'UNLOAD' | 'LOAD'}
   */
  getMission() {
    return this.mission;
  }

  /**
   * Updates state timer.
   * @param {number} deltaTime
   */
  update(deltaTime) {
    this.stateTimer += deltaTime;
  }

  /**
   * Returns current active state.
   * @returns {string}
   */
  getState() {
    return this.currentState;
  }

  /**
   * Returns UI telemetry metadata for active state.
   * @returns {Object}
   */
  getTelemetry() {
    const info = StateInfo[this.currentState] || {
      label: this.currentState,
      description: 'Operating',
      next: 'Next Activity',
      badgeClass: 'badge-moving'
    };

    // Contextual description based on current mission
    let dynamicDesc = info.description;
    if (this.currentState === TruckState.CY_TRANSFER) {
      dynamicDesc = this.mission === 'UNLOAD'
        ? 'Reach Stacker picking container from truck & placing on yard stack'
        : 'Reach Stacker picking container from yard stack & mounting onto truck bed';
    }

    return {
      ...info,
      description: dynamicDesc,
      mission: this.mission,
      timer: this.stateTimer
    };
  }
}
