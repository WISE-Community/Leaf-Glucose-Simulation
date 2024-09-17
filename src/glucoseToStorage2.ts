import { PlantGlucoseSimulation } from './plantGlucoseSimulation';
import { Glucose } from './glucose';

export class GlucoseToStorage2 extends Glucose {
  constructor(simulation: PlantGlucoseSimulation) {
    super(
      simulation,
      simulation.GLUCOSE_TO_STORAGE2_START_X,
      simulation.GLUCOSE_TO_STORAGE2_START_Y
    );
  }

  animate(): any {
    return this.image
      .animate({
        delay: this.simulation.animationDelay,
        duration: this.simulation.animationDuration,
      })
      .move(
        this.simulation.STORAGE_X +
          ((this.simulation.glucosesInStorage.length / 2) % 5) * 75 +
          this.buffer,
        this.simulation.STORAGE_Y +
          Math.floor(this.simulation.glucosesInStorage.length / 2 / 5) * 75 +
          this.buffer
      );
  }
}
