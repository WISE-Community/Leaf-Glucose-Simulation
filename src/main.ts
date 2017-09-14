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
  new PlantGlucoseSimulation("model", lightMode,
    feedbackPolicy, showGraph);

  if (parent != null && parent.node != null) {
    // set the trials array into the parent node if it exists. this is
    // used for saving student data when the model is used in WISE4
    // where the external script is used for saving.
    parent.node.trials = pgm.trials;
  }

  //alert("The simulation will now start with all three lines on the graph.
  // If you'd like to change which lines are shown on the graph,
  // click on the label in the legend.");
});
