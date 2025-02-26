import { GlucoseToStorage } from './glucoseToStorage';

export class GlucoseToStorage1 extends GlucoseToStorage {
  protected getBuffer(): number {
    return this.buffer * -1;
  }

  getStartX(): number {
    return 400;
  }

  getStartY(): number {
    return 100;
  }
}
