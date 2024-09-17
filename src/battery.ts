import * as SVG from 'svg.js';
import { PlantGlucoseSimulation } from './plantGlucoseSimulation';
type SVG = typeof SVG.Doc;

export abstract class Battery {
  protected image: SVG.Image;
  protected simulation: PlantGlucoseSimulation;
  constructor(simulation: PlantGlucoseSimulation, x: number, y: number) {
    this.simulation = simulation;
    this.image = this.simulation.draw
      .image('./images/batteryFull.png')
      .attr({ x: x, y: y });
  }

  abstract animate(): any;

  remove(): void {
    this.image.remove();
  }

  getImage(): SVG.Image {
    return this.image;
  }
}
