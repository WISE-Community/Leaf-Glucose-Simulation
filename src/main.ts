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
    // parse the URL parameters for initializing the model
    let parameters: any = parseURLParameters();

    let feedbackPolicy = null;
    let showGraph = true;

    if (parameters['feedbackPolicy'] != null) {
        // get the feedbackPolicy from the URL parameters
        feedbackPolicy = parameters['feedbackPolicy'];
    }

    if (parameters['showGraph'] != null) {
        // get the showGraph value from the URL parameters
        showGraph = parameters['showGraph'];
    }

    let wiseAPI = new WISEAPI();

    // create the PlantGlucoseSimulation
    let pgm = new PlantGlucoseSimulation("model", feedbackPolicy, showGraph);

    if (parent != null && parent.node != null) {
        // set the trials array into the parent node if it exists. this is
        // used for saving student data when the model is used in WISE4
        // where the external script is used for saving.
        parent.node.trials = pgm.trials;
    }

    //alert("The simulation will now start with all three lines on the graph. If you'd like to change which lines are shown on the graph, click on the label in the legend.");
});
