import * as $ from "jquery";
import {PlantGlucoseSimulation} from "./plantGlucoseSimulation";

/**
 * LightSwitch --- Renders the light switch in on/off configuration
 * and responds to user interaction
 *
 * Display an On/Off switch, where On = 100% energy, Off = 0% energy
 *
 * @author Hiroki Terashima
 * @author Geoffrey Kwan
 */
export class LightSwitch2 {
    simulation: PlantGlucoseSimulation;
    // wait image for when user changes the light switch during an animation cycle
    waitImageLightSwitch: any;

    /**
     * Creates a new LightSwitch2 instance
     * @param simulation A reference to the simulation
     */
    constructor(simulation: PlantGlucoseSimulation) {
        this.simulation = simulation;
        this.waitImageLightSwitch = $("#waitImageLightSwitch");
        $(".lightSwitch2").show();
        this.listenForUserInput();
    }

    /**
     * Register listeners for user interactions like
     * when the user changes the value of the light switch slider
     */
    listenForUserInput() {
        let lightSwitch = this;
        $("#lightSwitchInput2").on("change", function() {
            let lightSwitchValue = $(this).val();
            if (lightSwitchValue == 0) {
                // user wants to turn power switch off
                lightSwitch.simulation.addEvent('turnLightOffButtonClicked');
                lightSwitch.simulation.handleLightChangeRequest(0 /* light off */);
            } else {
                // user wants to turn power switch on
                lightSwitch.simulation.addEvent('turnLightOnButtonClicked');
                lightSwitch.simulation.handleLightChangeRequest(100 /* light on */);
            }
        });
    };

    /**
     * Fades away the waiting image indicator
     */
    hideWaitImage() {
        this.waitImageLightSwitch.fadeOut();
    }

    /**
     * Shows the waiting image indicator
     */
    showWaitImage() {
        this.waitImageLightSwitch.show();
    }
}
