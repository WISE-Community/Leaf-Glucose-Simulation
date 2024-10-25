import { Glucose } from './glucose';

export class GlucoseToMitochondrion1 extends Glucose {
  animate(): any {
    return this.image
      .animate({
        delay: this.simulation.animationDelay,
        duration: this.simulation.animationDuration,
      })
      .dmove(20, 350)
      .during((pos, morph, eased, situation) => {
        this.simulation.drainEnergy(50, 35, pos);
      })
      .animate({ duration: this.simulation.animationDuration })
      .attr({ opacity: 0 })
      .during((pos, morph, eased, situation) => {
        this.simulation.drainEnergy(35, 20, pos);
      });
  }

  getStartX(): number {
    return 600;
  }

  getStartY(): number {
    return 150;
  }
}
