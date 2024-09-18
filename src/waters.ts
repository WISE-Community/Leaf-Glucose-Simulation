import * as SVG from 'svg.js';
import { PlantGlucoseSimulation } from './plantGlucoseSimulation';
type SVG = typeof SVG.Doc;

export class Waters {
  private group: SVG.G;
  protected simulation: PlantGlucoseSimulation;

  constructor(simulation: PlantGlucoseSimulation) {
    this.simulation = simulation;
    this.group = this.simulation.draw.group();
    if (this.simulation.numWaterThisCycle === 4) {
      this.createWaters();
    }
  }

  private createWaters(): void {
    for (let i = 0; i < 4; i++) {
      const shiftX = i % 2 ? 0 : 15;
      const shiftY = i < 2 ? shiftX + 5 : shiftX + 20;
      const waterPlant = this.simulation.draw
        .ellipse(8, 12)
        .fill(this.simulation.WATER_COLOR)
        .attr({ cx: 194 + shiftX, cy: 94 + shiftY });
      const waterChloroplast = this.simulation.draw
        .ellipse(16, 24)
        .fill(this.simulation.WATER_COLOR)
        .attr({ cx: 620 + 2 * shiftX, cy: 60 + 2 * shiftY });
      this.group.add(waterPlant).add(waterChloroplast);
    }
  }

  animate(): any {
    return this.group
      .animate({ duration: this.simulation.animationDuration })
      .move(0, 40)
      .animate({ duration: this.simulation.animationDuration })
      .attr({ opacity: 0 });
  }

  remove(): void {
    this.group.remove();
  }

  getGroup(): SVG.G {
    return this.group;
  }
}
