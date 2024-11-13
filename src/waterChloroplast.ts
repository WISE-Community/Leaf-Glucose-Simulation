import { Waters } from './waters';

export class WaterChloroplast extends Waters {
  protected createWater(shiftX: number, shiftY: number): any {
    return this.svg
      .image('./images/water.png', 70, 70)
      .attr({ x: 580 + 2 * shiftX, y: 20 + 2 * shiftY });
  }
}
