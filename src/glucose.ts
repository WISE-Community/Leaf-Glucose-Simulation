import * as SVG from 'svg.js';
import { PlantGlucoseSimulation } from './plantGlucoseSimulation';
type SVG = typeof SVG.Doc;

export abstract class Glucose {
  protected buffer = 25;
  protected image: SVG.Image;
  protected simulation: PlantGlucoseSimulation;
  constructor(simulation: PlantGlucoseSimulation) {
    this.simulation = simulation;
    this.image = this.simulation.draw
      .image('./images/glucose.png', 70, 70)
      .attr({ x: this.getStartX(), y: this.getStartY() });
  }

  abstract animate(): any;
  abstract getStartX(): number;
  abstract getStartY(): number;

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
