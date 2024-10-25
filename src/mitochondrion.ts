import { PlantGlucoseSimulation } from './plantGlucoseSimulation';

export class Mitochondrion {
  private x = 500;
  private y = 400;

  constructor(simulation: PlantGlucoseSimulation) {
    simulation.draw
      .image('./images/mitochondrion.png')
      .attr({ x: this.x, y: this.y });
  }

  getX(): number {
    return this.x;
  }

  getY(): number {
    return this.y;
  }
}
