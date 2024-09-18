import { PlantGlucoseSimulation } from './plantGlucoseSimulation';
import { GlucoseToStorage } from './glucoseToStorage';

export class GlucoseToStorage1 extends GlucoseToStorage {
  constructor(simulation: PlantGlucoseSimulation) {
    super(
      simulation,
      simulation.GLUCOSE_TO_STORAGE1_START_X,
      simulation.GLUCOSE_TO_STORAGE1_START_Y
    );
  }

  protected moveX(): number {
    return (
      this.simulation.STORAGE_X +
      ((this.simulation.glucosesInStorage.length / 2) % 5) * 75 -
      this.buffer
    );
  }

  protected moveY(): number {
    return (
      this.simulation.STORAGE_Y +
      Math.floor(this.simulation.glucosesInStorage.length / 2 / 5) * 75 -
      this.buffer
    );
  }
}
