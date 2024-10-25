import * as SVG from 'svg.js';
import { PlantGlucoseSimulation } from './plantGlucoseSimulation';
type SVG = typeof SVG.Doc;

export abstract class Battery {
  protected animationDelay: number;
  protected animationDuration: number;
  protected image: SVG.Image;
  constructor(protected simulation: PlantGlucoseSimulation) {
    this.simulation = simulation;
    this.image = this.simulation.draw
      .image('./images/batteryFull.png')
      .attr({ x: this.getStartX(), y: this.getStartY() });
    if (!this.simulation.getSettings().showEnergyNeeds) {
      this.animationDelay = 1;
      this.animationDuration = 1;
      this.image.hide();
    }
  }

  abstract animate(): any;
  abstract getStartX(): number;
  abstract getStartY(): number;

  remove(): void {
    this.image.remove();
  }

  getImage(): SVG.Image {
    return this.image;
  }
}
