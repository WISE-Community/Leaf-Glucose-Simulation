import { Glucose } from './glucose';

export class GlucoseToMitochondrion2 extends Glucose {
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

  getStartX(): number {
    return 675;
  }

  getStartY(): number {
    return 100;
  }
}
