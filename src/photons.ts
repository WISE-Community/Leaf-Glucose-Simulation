import * as SVG from 'svg.js';
import { PlantGlucoseSimulation } from './plantGlucoseSimulation';
type SVG = typeof SVG.Doc;

export class Photons {
  private group: SVG.G;
  private photonChloroplast1: SVG.Image;
  private photonChloroplast2: SVG.Image;
  private photonChloroplast3: SVG.Image;
  private photonChloroplast4: SVG.Image;
  private photonPlant1: SVG.Image;
  private photonPlant2: SVG.Image;
  private photonPlant3: SVG.Image;
  private photonPlant4: SVG.Image;
  protected simulation: PlantGlucoseSimulation;
  constructor(simulation: PlantGlucoseSimulation) {
    this.simulation = simulation;
    this.group = this.simulation.draw.group();

    if (this.simulation.numPhotonsThisCycle >= 1) {
      this.photonPlant1 = this.createPhotonToPlant(80, 50);
      this.photonChloroplast1 = this.createPhotonToChloroplast(440, 60);
      this.group.add(this.photonPlant1).add(this.photonChloroplast1);
    }
    if (this.simulation.numPhotonsThisCycle >= 2) {
      this.photonPlant2 = this.createPhotonToPlant(80, 20);
      this.photonChloroplast2 = this.createPhotonToChloroplast(480, 30);
      this.group.add(this.photonPlant2).add(this.photonChloroplast2);
    }
    if (this.simulation.numPhotonsThisCycle >= 3) {
      this.photonPlant3 = this.createPhotonToPlant(30, 50);
      this.photonChloroplast3 = this.createPhotonToChloroplast(340, 60);
      this.group.add(this.photonPlant3).add(this.photonChloroplast3);
    }
    if (this.simulation.numPhotonsThisCycle === 4) {
      this.photonPlant4 = this.createPhotonToPlant(50, 20);
      this.photonChloroplast4 = this.createPhotonToChloroplast(380, 30);
      this.group.add(this.photonPlant4).add(this.photonChloroplast4);
    }
  }

  private createPhotonToPlant(x: number, y: number): any {
    return this.simulation.draw
      .image('./images/photon.png', 30, 30)
      .attr({ x: x, y: y });
  }

  private createPhotonToChloroplast(x: number, y: number): any {
    return this.simulation.draw
      .image('./images/photon.png', 50, 50)
      .attr({ x: x, y: y });
  }

  animate(): any {
    return this.group
      .animate({ duration: this.simulation.animationDuration })
      .move(50, 50)
      .during((pos, morph, eased, situation) => {
        this.simulation.drainEnergy(100 /* start */, 75 /* end */, pos);
      })
      .animate({ duration: this.simulation.animationDuration })
      .attr({ opacity: 0 })
      .during((pos, morph, eased, situation) => {
        this.simulation.drainEnergy(75 /* start */, 50 /* end */, pos);
      });
  }

  remove(): void {
    this.group.remove();
  }

  getGroup(): SVG.G {
    return this.group;
  }
}
