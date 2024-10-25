import { PlantGlucoseSimulation } from './plantGlucoseSimulation';

export class Chloroplast {
  private x = 400;
  private y = 100;

  constructor(simulation: PlantGlucoseSimulation) {
    simulation.draw
      .image('./images/chloroplast.png')
      .attr({ x: this.x, y: this.y });
  }

  getX(): number {
    return this.x;
  }

  getY(): number {
    return this.y;
  }
}
