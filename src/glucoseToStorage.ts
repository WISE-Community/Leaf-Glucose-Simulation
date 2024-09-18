import { Glucose } from './glucose';

export abstract class GlucoseToStorage extends Glucose {
  animate(): any {
    return this.image
      .animate({
        delay: this.simulation.animationDelay,
        duration: this.simulation.animationDuration,
      })
      .move(this.moveX(), this.moveY());
  }

  protected abstract moveX(): number;
  protected abstract moveY(): number;
}
