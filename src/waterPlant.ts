import { WATER_COLOR } from './constants';
import { Waters } from './waters';

export class WaterPlant extends Waters {
  protected createWater(shiftX: number, shiftY: number): any {
    return this.svg
      .ellipse(8, 12)
      .fill(WATER_COLOR)
      .attr({ cx: 194 + shiftX, cy: 94 + shiftY });
  }
}
