import { parseURLParameters } from './util';
import { PlantGlucoseSimulation } from './plantGlucoseSimulation';
import * as $ from 'jquery';
import { ResetButton } from './resetButton';
import { PlayPauseButton } from './playPauseButton';
import { Graph } from './graph';
import { SimulationEndFeedback } from './simulationEndFeedback';
import { EnergyIndicatorView } from './energyIndicatorView';
import { DayDisplayCorner } from './dayDisplayCorner';
import { Settings } from './settings';
import { LightSwitch } from './lightSwitch';
import { LightSwitch3 } from './lightSwitch3';
import { LightSwitch5 } from './lightSwitch5';
import { WaterSwitch } from './waterSwitch';
import { Waters } from './waters';
import * as SVG from 'svg.js';
import { SimulationSpeedSwitch } from './simulationSpeedSwitch';
type SVG = typeof SVG;

/**
 * Entry point for the application. Initializes the simulation with parameters
 * given in the URL.
 * @author Hiroki Terashima
 * @author Geoffrey Kwan
 * @author Jonathan Lim-Breitbart
 */
$(document).ready(function () {
  const parameters: any = parseURLParameters();
  const settings = new Settings(parameters);
  const simulation = new PlantGlucoseSimulation('model', settings);
  new PlayPauseButton();
  new ResetButton();
  new SimulationEndFeedback(simulation);
  if (settings.showSpeedControls) {
    new SimulationSpeedSwitch(simulation);
  } else {
    $('#animationSpeedSwitch').hide();
    simulation.updateAnimationSpeedRatio(0.5);
  }
  if (settings.numLightOptions === 2) {
    new LightSwitch(simulation);
  } else if (settings.numLightOptions === 3) {
    new LightSwitch3(simulation);
  } else if (settings.numLightOptions === 5) {
    new LightSwitch5(simulation);
  }
  if (settings.showWater) {
    new WaterSwitch(simulation);
    new Waters(SVG('model'), simulation, simulation.numWaterThisCycle);
  }
  if (settings.showEnergyNeeds) {
    new EnergyIndicatorView(simulation);
  }
  new DayDisplayCorner(simulation);
  if (settings.showGraph) {
    new Graph(simulation, settings);
  }
  if (!settings.showKey) {
    $('.key').hide();
  }
});
