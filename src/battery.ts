import * as SVG from 'svg.js';
import { PlantGlucoseSimulation } from './plantGlucoseSimulation';
type SVG = typeof SVG.Doc;

abstract class Battery {
  protected image: SVG.Image;
  protected simulation: PlantGlucoseSimulation;
  constructor(simulation: PlantGlucoseSimulation, x: number, y: number) {
    this.simulation = simulation;
    this.image = this.simulation.draw
      .image('./images/batteryFull.png')
      .attr({ x: x, y: y });
  }

  remove(): void {
    this.image.remove();
  }

  getImage(): SVG.Image {
    return this.image;
  }
}

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
