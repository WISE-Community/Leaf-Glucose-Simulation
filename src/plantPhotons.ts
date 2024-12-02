import * as SVG from 'svg.js';
import { PlantGlucoseSimulation } from './plantGlucoseSimulation';
import { eventBus } from './eventBus';
import { SimulationState } from './simulationState';

export class PlantPhotons {
  private group: SVG.G;
  constructor(private simulation: PlantGlucoseSimulation) {
    eventBus.on('animationCyclePhase1Started').subscribe(() => this.animate());
    eventBus.on('simulationReset').subscribe(() => this.group?.remove());
    eventBus.on('simulationStateChanged').subscribe((state) => {
      if (state === SimulationState.Paused) {
        this.group?.pause();
      } else if (state === SimulationState.Running) {
        this.group?.play();
      }
    });
  }

  private createPhoton(x: number, y: number): void {
    return SVG('plantAnimation')
      .image('./images/photon.png', 60, 60)
      .rotate(18)
      .attr({ x: x, y: y });
  }

  private animate(): void {
    this.group = SVG('plantAnimation').group();
    if (this.simulation.numPhotonsThisCycle >= 1) {
      this.group.add(this.createPhoton(200, 270));
    }
    if (this.simulation.numPhotonsThisCycle >= 2) {
      this.group.add(this.createPhoton(215, 210));
    }
    if (this.simulation.numPhotonsThisCycle >= 3) {
      this.group.add(this.createPhoton(140, 270));
    }
    if (this.simulation.numPhotonsThisCycle === 4) {
      this.group.add(this.createPhoton(150, 210));
    }

    this.group
      .animate({ duration: this.simulation.animationDuration })
      .move(60, 120)
      .during((pos, morph, eased, situation) => {
        this.simulation.drainEnergy(100, 75, pos);
      })
      .animate({ duration: this.simulation.animationDuration })
      .attr({ opacity: 0 })
      .during((pos, morph, eased, situation) => {
        this.simulation.drainEnergy(75, 50, pos);
      })
      .afterAll(() => {
        this.group.remove();
      });
  }
}
