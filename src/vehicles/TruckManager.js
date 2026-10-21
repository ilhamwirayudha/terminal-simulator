import * as THREE from 'three';
import { Truck } from './Truck.js';
import { TruckState } from '../simulation/StateMachine.js';

/**
 * ==============================================================================
 * TruckManager (Terminal Teluk Lamong 4-Zone Lifecycle Engine)
 * ==============================================================================
 *
 * Layout Development Mode: Fleet spawning is paused/disabled so the team
 * can focus purely on developing the physical 3D environment and layout.
 */
export class TruckManager {
  /**
   * @param {THREE.Scene} scene
   * @param {Array<{x: number, y: number, z: number}>} waypoints
   */
  constructor(scene, waypoints) {
    this.scene = scene;
    this.waypoints = waypoints;
    this.trucks = [];

    this._spawnFleet();
  }

  /**
   * Spawns active fleet trucks (currently empty for layout development).
   * @private
   */
  _spawnFleet() {
    // Trucks removed for layout development phase
    const fleetConfig = [];

    fleetConfig.forEach((cfg) => {
      const truck = new Truck({
        id: cfg.id,
        containerNumber: cfg.containerNumber,
        containerColor: cfg.containerColor,
        cabinColor: cfg.cabinColor,
        speed: 8.5,
        hasContainer: cfg.hasContainer,
        mission: cfg.mission
      });

      truck.setRoute(this.waypoints, true, cfg.startIndex);
      this.scene.add(truck.getMesh());
      this.trucks.push(truck);
    });
  }

  getTrucks() {
    return this.trucks;
  }

  getTruckById(id) {
    return this.trucks.find((t) => t.id === id);
  }

  /**
   * Updates truck, Dual Gates, Reach Stacker, and 4-Zone Waypoints.
   * @param {number} deltaTime
   * @param {Object} inGate
   * @param {Object} outGate
   * @param {Object} reachStacker
   */
  update(deltaTime, inGate, outGate, reachStacker) {
    this.trucks.forEach((truck) => {
      const state = truck.getState();
      const pos = truck.getPosition();
      const telemetry = truck.getTelemetry();

      switch (state) {
        case TruckState.ARRIVING:
          if (Math.hypot(pos.x - (-4.5), pos.z - (-70)) < 3.5) {
            truck.transitionTo(TruckState.GATE_INSPECTION);
          }
          break;

        case TruckState.GATE_INSPECTION:
          if (telemetry.timer >= 2.5) {
            truck.transitionTo(TruckState.GATE_CLEARANCE);
            if (inGate) inGate.open();
          }
          break;

        case TruckState.GATE_CLEARANCE:
          if (inGate && inGate.isClear()) {
            truck.transitionTo(TruckState.TRANSIT_TO_CY);
          }
          break;

        case TruckState.TRANSIT_TO_CY:
        case TruckState.MOVING:
          if (pos.z > -55 && pos.z < -20) {
            if (inGate) inGate.close();
          }

          if (Math.hypot(pos.x - (-12), pos.z - 70) < 4.0) {
            if (reachStacker && !reachStacker.isBusy()) {
              truck.transitionTo(TruckState.CY_TRANSFER);

              if (telemetry.mission === 'UNLOAD') {
                reachStacker.startUnload(truck, () => {
                  truck.transitionTo(TruckState.TRANSIT_TO_EXIT);
                });
              } else {
                reachStacker.startLoad(truck, () => {
                  truck.transitionTo(TruckState.TRANSIT_TO_EXIT);
                });
              }
            }
          }
          break;

        case TruckState.CY_TRANSFER:
          break;

        case TruckState.TRANSIT_TO_EXIT:
          if (Math.hypot(pos.x - 4.5, pos.z - (-70)) < 4.5) {
            if (outGate) outGate.open();
          }

          if (pos.z < -100) {
            if (outGate) outGate.close();
          }
          break;
      }

      truck.update(deltaTime);
    });
  }
}
