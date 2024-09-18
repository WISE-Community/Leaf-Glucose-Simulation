import * as SVG from 'svg.js';
import { PlantGlucoseSimulation } from './plantGlucoseSimulation';
type SVG = typeof SVG.Doc;

export abstract class Glucose {
  protected buffer = 25;
  protected image: SVG.Image;
  protected simulation: PlantGlucoseSimulation;
  constructor(simulation: PlantGlucoseSimulation, x: number, y: number) {
    this.simulation = simulation;
    this.image = this.simulation.draw
      .image('./images/glucose.png', 70, 70)
      .attr({ x: x, y: y });
  }

  abstract animate(): any;

  clone(): any {
    return this.image.clone();
  }

  remove(): void {
    this.image.remove();
  }

  getImage(): SVG.Image {
    return this.image;
  }
}
