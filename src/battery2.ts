import { Battery } from './battery';

export class Battery2 extends Battery {
  animate(): any {
    return this.image
      .animate({
        delay: this.simulation.animationDelay,
        duration: this.simulation.animationDuration,
      })
      .move(
        this.simulation.BATTERY_EMPTY_TRANSPORT_NUTRIENTS_X,
        this.simulation.BATTERY_EMPTY_TRANSPORT_NUTRIENTS_Y
      )
      .afterAll(() => {});
  }

  getStartX(): number {
    return this.simulation.getMitochondrion().getX() + 175;
  }

  getStartY(): number {
    return this.simulation.getMitochondrion().getY() + 50;
  }
}
