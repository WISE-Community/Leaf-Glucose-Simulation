import * as SVG from 'svg.js';
import { PlantGlucoseSimulation } from './plantGlucoseSimulation';
type SVG = typeof SVG.Doc;

export class Photons {
  private group: SVG.G;
  protected simulation: PlantGlucoseSimulation;

  constructor(simulation: PlantGlucoseSimulation) {
    this.simulation = simulation;
    this.group = this.simulation.draw.group();

    if (this.simulation.numPhotonsThisCycle >= 1) {
      this.createPhotons(80, 50, 440, 60);
    }
    if (this.simulation.numPhotonsThisCycle >= 2) {
      this.createPhotons(80, 20, 480, 30);
    }
    if (this.simulation.numPhotonsThisCycle >= 3) {
      this.createPhotons(30, 50, 340, 60);
    }
    if (this.simulation.numPhotonsThisCycle === 4) {
      this.createPhotons(50, 20, 380, 30);
    }
  }

  private createPhotons(
    toPlant_X: number,
    toPlant_Y: number,
    toChloroplast_X: number,
    toChloroplast_Y: number
  ): void {
    const photonToPlant = this.simulation.draw
      .image('./images/photon.png', 30, 30)
      .attr({ x: toPlant_X, y: toPlant_Y });
    const photonToChloroplast = this.simulation.draw
      .image('./images/photon.png', 50, 50)
      .attr({ x: toChloroplast_X, y: toChloroplast_Y });
    this.group.add(photonToPlant).add(photonToChloroplast);
  }

  animate(): any {
    return this.group
      .animate({ duration: this.simulation.animationDuration })
      .move(50, 50)
      .during((pos, morph, eased, situation) => {
        this.simulation.drainEnergy(100, 75, pos);
      })
      .animate({ duration: this.simulation.animationDuration })
      .attr({ opacity: 0 })
      .during((pos, morph, eased, situation) => {
        this.simulation.drainEnergy(75, 50, pos);
      });
  }

  remove(): void {
    this.group.remove();
  }

  getGroup(): SVG.G {
    return this.group;
  }
}
