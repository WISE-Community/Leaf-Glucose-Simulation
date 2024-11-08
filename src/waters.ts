import * as SVG from 'svg.js';
import { WATER_COLOR } from './constants';
import { eventBus } from './eventBus';
import { SimulationState } from './simulationState';
import { PlantGlucoseSimulation } from './plantGlucoseSimulation';
type SVG = typeof SVG.Doc;

export class Waters {
  private animation: SVG.G;
  private group: SVG.G;

  constructor(
    private svg: SVG,
    private simulation: PlantGlucoseSimulation,
    private numWaterThisCycle: number
  ) {
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
      this.animation = this.moveWaterToPlantAndChloroplast().afterAll(() => {
        this.group?.remove();
        this.group = null;
      });
    }
  }

  private addWaters(): void {
    for (let i = 0; i < 4; i++) {
      const shiftX = i % 2 ? 0 : 25;
      const shiftY = i < 2 ? shiftX + 10 : shiftX + 25;
      const waterPlant = this.svg
        .ellipse(8, 12)
        .fill(WATER_COLOR)
        .attr({ cx: 194 + shiftX, cy: 94 + shiftY });
      const waterChloroplast = this.svg
        .image('./images/water.png', 70, 70)
        .attr({ x: 580 + 2 * shiftX, y: 20 + 2 * shiftY });
      this.group.add(waterPlant).add(waterChloroplast);
    }
  }

  private moveWaterToPlantAndChloroplast(): any {
    return this.group
      .animate({ duration: this.simulation.animationDuration })
      .move(0, 40)
      .animate({ duration: this.simulation.animationDuration })
      .attr({ opacity: 0 });
  }
}
