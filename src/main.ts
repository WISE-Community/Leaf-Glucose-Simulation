import { parseURLParameters } from './util';
import { PlantGlucoseSimulation } from  './plantGlucoseSimulation';
import * as $ from 'jquery';

/**
 * Entry point for the application. Initializes the simulation with parameters
 * given in the URL.
 * @author Hiroki Terashima
 * @author Geoffrey Kwan
 * @author Jonathan Lim-Breitbart
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
  let enableInputControls = true;
  let isDroughtTolerant = false;
  let isShadeTolerant = false;
  let plantImgSrc = null;

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
  if (parameters['enableInputControls'] != null) {
    enableInputControls = parameters['enableInputControls'];
  }
  if (parameters['isDroughtTolerant'] != null) {
    isDroughtTolerant = parameters['isDroughtTolerant'];
  }
  if (parameters['isShadeTolerant'] != null) {
    isShadeTolerant = parameters['isShadeTolerant'];
  }
  if (parameters['plantImgSrc'] != null) {
    plantImgSrc = parameters['plantImgSrc'];
  }

  new PlantGlucoseSimulation('model', numDays, numLightOptions, feedbackPolicy,
      showGraph, showLineGlucoseMade, showLineGlucoseUsed, showLineGlucoseStored,
      showWater, enableInputControls, isDroughtTolerant, isShadeTolerant,
      plantImgSrc);
});
