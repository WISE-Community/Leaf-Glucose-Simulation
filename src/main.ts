import { parseURLParameters } from "./util";
import { PlantGlucoseSimulation } from  "./plantGlucoseSimulation";
import { WISEAPI } from "./wiseAPI";
import * as $ from "jquery";

/**
 * Entry point for the application. Initializes the simulation with parameters
 * given in the URL.
 * @author Hiroki Terashima
 * @author Geoffrey Kwan
 */
$(document).ready(function() {
  let parameters: any = parseURLParameters();
  let feedbackPolicy = null;
  let lightMode = 2;
  let showGraph = true;

  if (parameters['feedbackPolicy'] != null) {
    feedbackPolicy = parameters['feedbackPolicy'];
  }
  if (parameters['showGraph'] != null) {
    showGraph = parameters['showGraph'];
  }
  if (parameters["lightMode"] != null) {
    lightMode = parameters["lightMode"];
  }

  let wiseAPI = new WISEAPI();
  new PlantGlucoseSimulation("model", lightMode, feedbackPolicy, showGraph);
});
