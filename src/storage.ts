import { PlantGlucoseSimulation } from './plantGlucoseSimulation';

export class Storage {
  private x = 50;
  private y = 375;

  constructor(simulation: PlantGlucoseSimulation) {
    simulation.draw
      .image('./images/storage.png')
      .attr({ x: this.x, y: this.y });
  }

  getX(): number {
    return this.x;
  }

  getY(): number {
    return this.y;
  }
}
