import { Battery } from './battery';

export class Battery1 extends Battery {
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

  getStartX(): number {
    return this.simulation.getMitochondrion().getX() + 100;
  }

  getStartY(): number {
    return this.simulation.getMitochondrion().getY() + 100;
  }
}
