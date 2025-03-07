import { Glucose } from './glucose';

export abstract class GlucoseToStorage extends Glucose {
  animate(): any {
    const coordinates = this.simulation.getNextGlucoseStoredCoordinates();
    return this.image
      .animate({
        delay: this.simulation.animationDelay,
        duration: this.simulation.animationDuration,
      })
      .move(coordinates[0], coordinates[1]);
  }
}
