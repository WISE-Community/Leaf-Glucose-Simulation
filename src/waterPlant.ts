import { WATER_COLOR } from './constants';
import { Waters } from './waters';

export class WaterPlant extends Waters {
  protected createWater(shiftX: number, shiftY: number): any {
    return this.svg
      .ellipse(24, 36)
      .fill(WATER_COLOR)
      .attr({ cx: 282 + shiftX, cy: 310 + shiftY });
  }
}
