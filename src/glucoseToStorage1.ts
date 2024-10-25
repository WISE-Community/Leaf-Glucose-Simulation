import { GlucoseToStorage } from './glucoseToStorage';

export class GlucoseToStorage1 extends GlucoseToStorage {
  protected moveX(): number {
    return (
      this.simulation.getStorage().getX() +
      ((this.simulation.glucosesInStorage.length / 2) % 5) * 75 -
      this.buffer
    );
  }

  protected moveY(): number {
    return (
      this.simulation.getStorage().getY() +
      Math.floor(this.simulation.glucosesInStorage.length / 2 / 5) * 75 -
      this.buffer
    );
  }

  getStartX(): number {
    return 400;
  }

  getStartY(): number {
    return 100;
  }
}
