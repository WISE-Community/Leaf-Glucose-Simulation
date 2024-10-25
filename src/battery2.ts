import { Battery } from './battery';
import {
  BATTERY_EMPTY_TRANSPORT_NUTRIENTS_X,
  BATTERY_EMPTY_TRANSPORT_NUTRIENTS_Y,
} from './constants';

export class Battery2 extends Battery {
  animate(): any {
    return this.image
      .animate({
        delay: this.animationDelay,
        duration: this.animationDuration,
      })
      .move(
        BATTERY_EMPTY_TRANSPORT_NUTRIENTS_X,
        BATTERY_EMPTY_TRANSPORT_NUTRIENTS_Y
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
