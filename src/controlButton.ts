import * as $ from 'jquery';
import { PlantGlucoseSimulation } from './plantGlucoseSimulation';

export abstract class ControlButton {
  protected button;
  protected simulation: PlantGlucoseSimulation;

  constructor(simulation: PlantGlucoseSimulation, selector: string) {
    this.simulation = simulation;
    this.button = $(selector);
    this.button.on('click', () => this.onClickListener());
  }

  abstract onClickListener(): void;
}
