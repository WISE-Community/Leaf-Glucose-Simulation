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

  protected moveX(): number {
    return (
      this.simulation.getStorage().getX() +
      ((this.simulation.getTotalGlucoseStored() / 2) % 5) * 75 +
      this.getBuffer()
    );
  }

  protected moveY(): number {
    return (
      this.simulation.getStorage().getY() +
      Math.floor(this.simulation.getTotalGlucoseStored() / 2 / 5) * 75 +
      this.getBuffer()
    );
  }

  protected abstract getBuffer(): number;
}
