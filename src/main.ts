import { parseURLParameters } from './util';
import { PlantGlucoseSimulation } from  './plantGlucoseSimulation';
import { WISEAPI } from './wiseAPI';
import * as $ from 'jquery';

/**
 * Entry point for the application. Initializes the simulation with parameters
 * given in the URL.
 * @author Hiroki Terashima
 * @author Geoffrey Kwan
 */
$(document).ready(function() {
  let parameters: any = parseURLParameters();
  let feedbackPolicy = null;
  let numDays = 20;
  let numLightOptions = 2;
  let showGraph = true;
  let showLineGlucoseMade = true;
  let showLineGlucoseUsed = true;
  let showLineGlucoseStored = true;
  let showWater = false;

  if (parameters['numDays'] != null) {
    numDays = parameters['numDays'];
  }
  if (parameters['numLightOptions'] != null) {
    numLightOptions = parameters['numLightOptions'];
  }
  if (parameters['feedbackPolicy'] != null) {
    feedbackPolicy = parameters['feedbackPolicy'];
  }
  if (parameters['showGraph'] != null) {
    showGraph = parameters['showGraph'];
  }
  if (parameters['showLineGlucoseMade'] != null) {
    showLineGlucoseMade = parameters['showLineGlucoseMade'];
  }
  if (parameters['showLineGlucoseUsed'] != null) {
    showLineGlucoseUsed = parameters['showLineGlucoseUsed'];
  }
  if (parameters['showLineGlucoseStored'] != null) {
    showLineGlucoseStored = parameters['showLineGlucoseStored'];
  }
  if (parameters['showWater'] != null) {
    showWater = parameters['showWater'];
  }

  new PlantGlucoseSimulation('model', numDays, numLightOptions, feedbackPolicy,
      showGraph, showLineGlucoseMade, showLineGlucoseUsed,
      showLineGlucoseStored, showWater);
});
