import * as SVG from 'svg.js';
import { PlantGlucoseSimulation } from './plantGlucoseSimulation';
type SVG = typeof SVG.Doc;

export class Photons {
  private group: SVG.G;

  constructor(private simulation: PlantGlucoseSimulation) {
    this.group = SVG('model').group();

    if (this.simulation.numPhotonsThisCycle >= 1) {
      this.group.add(this.createPhoton(440, 60));
    }
    if (this.simulation.numPhotonsThisCycle >= 2) {
      this.group.add(this.createPhoton(480, 30));
    }
    if (this.simulation.numPhotonsThisCycle >= 3) {
      this.group.add(this.createPhoton(340, 60));
    }
    if (this.simulation.numPhotonsThisCycle === 4) {
      this.group.add(this.createPhoton(380, 30));
    }
  }

  private createPhoton(x: number, y: number): void {
    return SVG('plantAnimation')
      .image('./images/photon.png', 50, 50)
      .attr({ x: x, y: y });
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
