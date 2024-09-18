import { PlantGlucoseSimulation } from './plantGlucoseSimulation';
import { Glucose } from './glucose';

export class GlucoseToMitochondrion1 extends Glucose {
  constructor(simulation: PlantGlucoseSimulation) {
    super(
      simulation,
      simulation.GLUCOSE_TO_MITOCHONDRION1_START_X,
      simulation.GLUCOSE_TO_MITOCHONDRION1_START_Y
    );
  }

  animate(): any {
    return this.image
      .animate({
        delay: this.simulation.animationDelay,
        duration: this.simulation.animationDuration,
      })
      .dmove(20, 350)
      .during((pos, morph, eased, situation) => {
        this.simulation.drainEnergy(50 /* start */, 35 /* end */, pos);
      })
      .animate({ duration: this.simulation.animationDuration })
      .attr({ opacity: 0 })
      .during((pos, morph, eased, situation) => {
        this.simulation.drainEnergy(35 /* start */, 20 /* end */, pos);
      });
  }
}
