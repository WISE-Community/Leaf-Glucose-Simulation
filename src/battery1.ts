import { Battery } from './battery';

export class Battery1 extends Battery {
  animate(): any {
    return this.image
      .animate({
        delay: this.simulation.animationDelay,
        duration: this.simulation.animationDuration,
      })
      .move(
        this.simulation.BATTERY_EMPTY_REPAIR_DAMAGE_X,
        this.simulation.BATTERY_EMPTY_REPAIR_DAMAGE_Y
      );
  }

  getStartX(): number {
    return this.simulation.getMitochondrion().getX() + 100;
  }

  getStartY(): number {
    return this.simulation.getMitochondrion().getY() + 100;
  }
}
