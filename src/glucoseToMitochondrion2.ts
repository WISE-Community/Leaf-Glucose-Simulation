import { PlantGlucoseSimulation } from './plantGlucoseSimulation';
import { Glucose } from './glucose';

export class GlucoseToMitochondrion2 extends Glucose {
  constructor(simulation: PlantGlucoseSimulation) {
    super(
      simulation,
      simulation.GLUCOSE_TO_MITOCHONDRION2_START_X,
      simulation.GLUCOSE_TO_MITOCHONDRION2_START_Y
    );
  }

  animate(): any {
    return this.image
      .animate({
        delay: this.simulation.animationDelay,
        duration: this.simulation.animationDuration,
      })
      .dmove(20, 350)
      .animate({ duration: this.simulation.animationDuration })
      .attr({ opacity: 0 });
  }
}
