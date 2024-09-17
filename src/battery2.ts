import { PlantGlucoseSimulation } from './plantGlucoseSimulation';
import { Battery } from './battery';

export class Battery2 extends Battery {
  constructor(simulation: PlantGlucoseSimulation) {
    super(
      simulation,
      simulation.mitochondrionBattery2StartX,
      simulation.mitochondrionBattery2StartY
    );
  }

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
}
