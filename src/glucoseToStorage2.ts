import { GlucoseToStorage } from './glucoseToStorage';

export class GlucoseToStorage2 extends GlucoseToStorage {
  protected getBuffer(): number {
    return this.buffer;
  }

  getStartX(): number {
    return 475;
  }

  getStartY(): number {
    return 150;
  }
}
