import { PlantGlucoseSimulation } from './plantGlucoseSimulation';
import { Battery } from './battery';

export class Battery1 extends Battery {
  constructor(simulation: PlantGlucoseSimulation) {
    super(
      simulation,
      simulation.mitochondrionBattery1StartX,
      simulation.mitochondrionBattery1StartY
    );
  }

  animate(): any {
    return this.image
      .animate({
        delay: this.simulation.animationDelay,
        duration: this.simulation.animationDuration,
      })
      .move(
        this.simulation.BATTERY_EMPTY_REPAIR_DAMAGE_X,
        this.simulation.BATTERY_EMPTY_REPAIR_DAMAGE_Y
      )
      .during((pos, morph, eased, situation) => {
        if (this.simulation.isLightOn) {
          this.simulation.drainEnergy(20 /* start */, 5 /* end */, pos);
        } else {
          this.simulation.drainEnergy(50 /* start */, 5 /* end */, pos);
        }
      });
  }
}
