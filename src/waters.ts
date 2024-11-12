import * as SVG from 'svg.js';
import { eventBus } from './eventBus';
import { SimulationState } from './simulationState';
import { PlantGlucoseSimulation } from './plantGlucoseSimulation';
type SVG = typeof SVG.Doc;

export abstract class Waters {
  private animation: SVG.G;
  private group: SVG.G;
  private numWaterThisCycle: number;

  constructor(protected svg: SVG, private simulation: PlantGlucoseSimulation) {
    this.numWaterThisCycle = simulation.numWaterThisCycle;
    eventBus
      .on('animationCyclePhase1Started')
      .subscribe(() => this.startAnimation());
    eventBus.on('simulationReset').subscribe(() => this.group?.remove());
    eventBus.on('simulationStateChanged').subscribe((state) => {
      if (state === SimulationState.Paused) {
        this.animation?.pause();
      } else if (state === SimulationState.Running) {
        this.animation?.play();
      }
    });
    eventBus.on('numWaterChanged').subscribe((numWater) => {
      this.numWaterThisCycle = numWater;
    });
  }

  private startAnimation(): void {
    if (this.numWaterThisCycle === 4) {
      this.group = this.svg.group();
      this.addWaters();
      this.animation = this.moveWater().afterAll(() => {
        this.group?.remove();
        this.group = null;
      });
    }
  }

  private addWaters(): void {
    for (let i = 0; i < 4; i++) {
      const shiftX = i % 2 ? 0 : 25;
      const shiftY = i < 2 ? shiftX + 10 : shiftX + 25;
      this.group.add(this.createWater(shiftX, shiftY));
    }
  }

  protected abstract createWater(shiftX: number, shiftY: number): any;

  private moveWater(): any {
    return this.group
      .animate({ duration: this.simulation.animationDuration })
      .move(0, 40)
      .animate({ duration: this.simulation.animationDuration })
      .attr({ opacity: 0 });
  }
}
