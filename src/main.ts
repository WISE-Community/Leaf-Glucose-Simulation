import { parseURLParameters } from "./util";
import { PlantGlucoseModel } from  "./plantGlucoseModel";
import { WISEAPI } from "./wiseAPI";

$(document).ready(function() {
    // parse the URL parameters for initializing the model
    let parameters = parseURLParameters();

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

    // create the PlantGlucoseModel
    let pgm = new PlantGlucoseModel("model", parameters, feedbackPolicy, showGraph);

    if (parent != null && parent.node != null) {
        /*
         * set the trials array into the parent node if it exists. this is
         * used for saving student data when the model is used in WISE4
         * where the external script is used for saving.
         */
        parent.node.trials = pgm.trials;
    }

    //alert("The simulation will now start with all three lines on the graph. If you'd like to change which lines are shown on the graph, click on the label in the legend.");
});
