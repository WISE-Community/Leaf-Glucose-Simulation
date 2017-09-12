import * as $ from "jquery";
import {PlantGlucoseSimulation} from "./plantGlucoseSimulation";

/**
 * LightSwitch --- Rendering the light switch in Full/Half/Off configurations
 * and responds to user interaction
 *
 * Full = 100% energy, Half = 50% energy, and Off = 0% energy
 *
 * When the light is at Half, it shines with one photon, and two glucose
 *     get produced, which all go to get used.
 *
 * @author Hiroki Terashima
 * @author Geoffrey Kwan
 */
export class LightSwitch3 {
    simulation: PlantGlucoseSimulation;
    // wait image for when the light switch changes during an animation cycle
    waitImageLightSwitch: any;

    /**
     * Creates a new LightSwitch3 instance
     * @param simulation A reference to the plant glucose simulation
     */
    constructor(simulation: PlantGlucoseSimulation) {
        this.simulation = simulation;
        this.waitImageLightSwitch = $("#waitImageLightSwitch");
        $(".lightSwitch3").show();
        this.listenForUserInput();
    }

    /**
     * Register listeners for user interactions like
     * when the user changes the value of the light switch slider
     */
    listenForUserInput() {
        let lightSwitch = this;

        $("#lightSwitchInput3").on("change", function () {
            let lightSwitchValue = $(this).val();
            if (lightSwitchValue == 0) {
                // user wants to turn power switch off
                lightSwitch.simulation.addEvent('turnLightOffButtonClicked');
                lightSwitch.simulation.handleLightChangeRequest(0 /* light off */);
            } else if (lightSwitchValue == 1) {
                // user wants to turn power to half
                lightSwitch.simulation.addEvent('turnLightHalfButtonClicked');
                lightSwitch.simulation.handleLightChangeRequest(50 /* light half on */);

            } else {
                // user wants to turn power switch to full
                lightSwitch.simulation.addEvent('turnLightFullButtonClicked');
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
