import { DayDisplayCorner } from "./dayDisplayCorner";
import { EnergyIndicatorView } from "./energyIndicatorView";
import { Event } from "./event";
import { Feedback } from "./feedback";
import { Graph } from "./graph";
import { LightSwitch2 } from "./lightSwitch2";
import { LightSwitch3 } from "./lightSwitch3";
import { PlantAnimationCorner } from "./plantAnimationCorner";
import { SimulationEndFeedback } from "./simulationEndFeedback";
import * as SVG from "svg.js";
import "svg.draggable.js";
import * as $ from "jquery";

/**
 * PlantGlucoseSimulation --- Simulation showing the inside of a plant
 * during Photosynthesis.
 * @author Hiroki Terashima
 * @author Geoffrey Kwan
 */
export class PlantGlucoseSimulation {
    ANIMATION_SPEED_RATIO_NORMAL: number = 1;
    ANIMATION_SPEED_RATIO_DOUBLE: number = 0.5;
    ANIMATION_SPEED_RATIO_QUADRUPLE: number = 0.25;

    BATTERY_EMPTY_REPAIR_DAMAGE_X: number = 325;
    BATTERY_EMPTY_REPAIR_DAMAGE_Y: number = 815;
    BATTERY_EMPTY_TRANSPORT_NUTRIENTS_X: number = 625;
    BATTERY_EMPTY_TRANSPORT_NUTRIENTS_Y: number = 815;
    CHLOROPLAST_X = 450;
    CHLOROPLAST_Y = 100;
    DEFAULT_ANIMATION_DURATION: number = 750; // default amount of time (in ms) each animation should take to complete
    DEFAULT_ANIMATION_DELAY: number = 250; // default delay before staring animation in ms
    GLUCOSE_GROWTH_SCALE: number = 1.25;  // scale for growing/shrinking glucose
    LIGHT_ON_GRAPH_REGION_COLOR: string = "#fff9a5";  // color of graph region when light is on
    LIGHT_OFF_GRAPH_REGION_COLOR: string = "#dddddd";  // color of graph region when light is off
    MAX_DAYS = 20;  // max number of days
    MITOCHONDRION_X = 500;
    MITOCHONDRION_Y = 400;
    STORAGE_X = 50;
    STORAGE_Y = 375;

    // ratio speed for each animation to complete. 0 = stop -> 1 = full speed
    animationSpeedRatio: number = 1;
    // actual amount of time (in milliseconds) each animation should take to complete
    animationDuration: number = this.DEFAULT_ANIMATION_DURATION * this.animationSpeedRatio;

    chloroplast: SVG;
    currentAnimation: SVG;  // stores the currently-playing/pausing animation
    currentTrialData: any;  // current trial data
    dayNumber: number = 0;  // the current day number
    draw: SVG;  // the SVG draw object
    dayDisplayCorner: DayDisplayCorner;
    energyIndicatorView: EnergyIndicatorView;
    energyLeft: number = 100;
    feedback: Feedback;
    graph: Graph;

    // the data points for the glucose lines
    glucoseCreatedData: any[] = [];
    glucoseUsedData: any[] = [];
    glucoseStoredData: any[] = [];

    glucoseCreatedIncrement: number = 4;  // the amount of glucose to add each week
    glucoseUsedIncrement: number = 2;  // the amount of glucose to subtract each week
    glucose1: SVG;
    glucose2: SVG;
    glucose3: SVG;
    glucose4: SVG;
    glucosesInStorage: SVG[] = [];

    // the starting glucose amounts
    initialGlucoseCreated: number = 0;
    initialGlucoseUsed: number = 0;
    initialGlucoseStored: number = 0;
    isControlEnabled = true;  // can user interact with the controls?
    isLightOn: boolean = true;
    lightEnergyPercent: number = 100;
    lightMode: number = 2;
    lightSwitch: any;
    mitochondrion: SVG;
    mitochondrionBatteryGroup: SVG;
    mitochondrionBattery1: SVG;
    mitochondrionBattery1_startingX = this.MITOCHONDRION_X + 100;
    mitochondrionBattery1_startingY = this.MITOCHONDRION_Y + 100;
    mitochondrionBattery2_startingX = this.MITOCHONDRION_X + 175;
    mitochondrionBattery2_startingY = this.MITOCHONDRION_Y + 50;
    mitochondrionBattery2: SVG;
    photonChloroplast1: SVG;
    photonChloroplast2: SVG;
    photonPlant1: SVG;
    photonPlant2: SVG;
    photonsGroup: SVG;
    plantAnimationCorner: PlantAnimationCorner;
    running: boolean = false;  // whether the simulation is currently running or not
    simulationEnded: boolean = false;
    simulationEndFeedback: SimulationEndFeedback;
    storage: SVG;

    // the current total amount of glucose created/used/stored
    totalGlucoseCreated = this.initialGlucoseCreated;
    totalGlucoseUsed = this.initialGlucoseUsed;
    totalGlucoseStored = this.initialGlucoseStored;

    trials: any[] = [];  // an array of trial data objects, including the current trial

    /**
     * Instantiates variables with initial values for objects
     * within the simulation.
     * @param elementId A string containing the id of the DOM element where
     *     the simulation should be displayed
     * @param lightMode A number containing the number of options for light.
     *     2 = On/Off, 3 = Full/Half/Off
     * @param feedbackPolicy A string containing the identifier of the feedback
     *     to use.
     * @param showGraph A boolean whether the graph should be displayed or not
     */
    constructor(elementId: string, lightMode: number = 2,
        feedbackPolicy: any = null, showGraph: boolean = true) {
        this.draw = SVG(elementId);
        this.lightMode = lightMode;
        if (this.lightMode === 2) {
            // the light can only be ON/OFF.
            this.lightSwitch = new LightSwitch2(this);
            this.glucoseCreatedIncrement = 4;
            this.glucoseUsedIncrement = 2;
        } else if (this.lightMode === 3) {
            // the light can be ON/HALF/FULL.
            this.lightSwitch = new LightSwitch3(this);
        }

        // create the background
        this.draw.rect(1000,1000).x(0).y(0).fill('#DEEBF7');

        this.plantAnimationCorner = new PlantAnimationCorner(this.draw);
        this.dayDisplayCorner = new DayDisplayCorner(this.draw,
            this.LIGHT_ON_GRAPH_REGION_COLOR, this.LIGHT_OFF_GRAPH_REGION_COLOR);
        this.simulationEndFeedback = new SimulationEndFeedback(this.draw);
        this.energyIndicatorView = new EnergyIndicatorView(this.draw);
        this.feedback = new Feedback(this.draw, feedbackPolicy);

        // create the chloroplast image and add it to canvas
        this.chloroplast = this.draw.image("./chloroplast.png").attr({
            "x": this.CHLOROPLAST_X,
            "y": this.CHLOROPLAST_Y
        });

        // create the mitochondrion image and add it to canvas
        this.mitochondrion = this.draw.image("./mitochondrion.png").attr({
            "x": this.MITOCHONDRION_X,
            "y": this.MITOCHONDRION_Y
        });

        // create the storage image and add it to canvas
        this.storage = this.draw.image("./storage.png").attr({
            "x": this.STORAGE_X,
            "y": this.STORAGE_Y
        });

        // initialize the graph
        this.graph = new Graph(this, showGraph);

        // initialize a new trial data
        this.startNewTrial();

        this.registerListenersForUserInput();
    }

    /**
     * Start the simulation
     */
    start() {
        console.log(this.trials);
        if (this.currentTrialData == null) {
            // initialize a new trial data
            this.startNewTrial();
        }

        // show feedback if necessary
        this.feedback.showFeedback(this.trials);

        // run the simulation
        this.playAnimationLoop();
    }

    /**
     * Initialize and adds new trial to all trials array
     */
    startNewTrial() {
        this.currentTrialData = {
            glucoseCreatedData: [[0, this.initialGlucoseCreated]],
            glucoseUsedData: [[0, this.initialGlucoseUsed]],
            glucoseStoredData: [[0, this.initialGlucoseStored]],
            events: []
        };

        this.trials.push(this.currentTrialData);
    }

    /**
     * Update the graph display with current trial data
     * @param dayNumber the day number
     * @param glucoseCreated whether the glucose was created for the specified day
     */
    updateGraph(dayNumber: number, isGlucoseCreated: boolean) {
        // update the data series for each line in the graph
        this.graph.setSeriesData(0, this.currentTrialData.glucoseCreatedData);
        this.graph.setSeriesData(1, this.currentTrialData.glucoseUsedData);
        this.graph.setSeriesData(2, this.currentTrialData.glucoseStoredData);

        // update background of graph based on light on (yellow) or off (gray)
        let plotBandSettings = {
            "id": "plantGlucoseSimulationPlotBand",
            "from": dayNumber - 1,
            "to": dayNumber,
            "color": isGlucoseCreated ? this.LIGHT_ON_GRAPH_REGION_COLOR :
                this.LIGHT_OFF_GRAPH_REGION_COLOR
        };

        this.graph.addPlotBand(plotBandSettings);
    }

    /**
     * Update the glucose values
     * @param dayNumber which day it is
     * @param glucoseCreated whether glucose was created
     * @param glucoseUsed whether glucose was used
     */
    updateGlucoseValues(dayNumber: number, glucoseCreated: boolean,
        glucoseUsed: boolean) {
        if (glucoseCreated) {
            // we are creating glucose so we will add to the glucoseCreated
            this.totalGlucoseCreated += this.glucoseCreatedIncrement;
        }

        if (glucoseUsed) {
            // increase the glucose used by the plant
            this.totalGlucoseUsed += this.glucoseUsedIncrement;
        }

        // update the amount of glucose stored
        this.totalGlucoseStored = this.totalGlucoseCreated - this.totalGlucoseUsed;

        // update the glucose created data array
        this.currentTrialData.glucoseCreatedData.push([dayNumber, this.totalGlucoseCreated]);

        // update the glucose used data array
        this.currentTrialData.glucoseUsedData.push([dayNumber, this.totalGlucoseUsed]);

        // update the glucose stored data array
        this.currentTrialData.glucoseStoredData.push([dayNumber, this.totalGlucoseStored]);
    }

    /**
     * Run the plant animation cycle once
     * A cycle is one complete cycle, either with light on or off.
     * The light can be switched on/off during the cycle, but it will not
     * affect the current cycle.
     */
    playAnimationLoop() {
        this.dayNumber++; // start new day

        if (this.dayNumber > this.MAX_DAYS) {
            // we have reached the end of the simulation

            // pause the simulation
            this.pause();

            // display the 'Simulation ended' message
            this.endReached();

            // end the trial
            // TODO: uncomment me
            //this.endTrial();

            // disable control buttons
            this.disableControlButtons();
        } else { // the simulation has not reached the end yet
            this.dayDisplayCorner.updateDayText('Day ' + this.dayNumber);

            if (this.isLightOn) {
                this.turnLightOn();

                function lightOnAnimationCallback() {
                    let glucoseCreated = true;
                    let glucoseUsed = true;

                    // update the glucose values
                    this.updateGlucoseValues(this.dayNumber, glucoseCreated, glucoseUsed);

                    // update the graph
                    this.updateGraph(this.dayNumber, glucoseCreated);

                    // loop animation after brief pause
                    window.setTimeout(function() { this.playAnimationLoop(); }.bind(this), 750 * this.animationSpeedRatio);
                }
                this.startLightOnAnimation(lightOnAnimationCallback.bind(this));
            } else {
                this.turnLightOff();

                function lightOffAnimationCallback() {
                    let glucoseCreated = false;

                    // update the graph
                    this.updateGraph(this.dayNumber, glucoseCreated);

                    // loop animation after brief pause©
                    window.setTimeout(function() { this.playAnimationLoop(); }.bind(this), 750 * this.animationSpeedRatio);
                }
                // start the animation
                this.startLightOffAnimation(lightOffAnimationCallback.bind(this));
            }
        }
    }

    /**
     * Start the animation in a state where light is on
     */
    startLightOnAnimation(animationCallback: () => {}) {
        let pgs: PlantGlucoseSimulation = this;
        // create the photon image objects
        this.photonPlant1 = this.draw.image('./photon.png', 30, 30).attr({
            'x': 80,
            'y': 50
        });
        this.photonChloroplast1 = this.draw.image('./photon.png', 50, 50).attr({
            "x": 530,
            "y": 50
        });
        this.photonsGroup = this.draw.group()
            .add(this.photonPlant1)
            .add(this.photonChloroplast1);

        if (pgs.glucoseCreatedIncrement === 4) {
            this.photonPlant2 = this.draw.image('./photon.png', 30, 30).attr({
                'x': 30,
                'y': 50
            });
            this.photonChloroplast2 = this.draw.image('./photon.png', 50, 50)
                .attr({
                    'x': 430,
                    'y': 50
                });
            this.photonsGroup.add(this.photonPlant2).add(this.photonChloroplast2);
        }

        pgs.currentAnimation = pgs.photonsGroup;
        pgs.photonsGroup.animate({"duration": pgs.animationDuration}).move(50, 50)
        .during(function(pos, morph, eased, situation) {
            // update the battery indicator from 100 -> 75 during the animation.
            pgs.energyLeft = 100 - 25 * pos;
            pgs.updateEnergyDisplay(pgs.energyLeft);
        })
        .animate({"duration": pgs.animationDuration}).attr({"opacity": 0})
        .during(function(pos, morph, eased, situation) {
            // update the battery indicator from 75 -> 50 during the animation.
            pgs.energyLeft = 75 - 25 * pos;
            pgs.updateEnergyDisplay(pgs.energyLeft);
        })
        .afterAll(function() {
            // reset the photons to original place
            pgs.photonsGroup.move(-50, -50);
            pgs.photonsGroup.hide();

            // make glucose appear
            pgs.glucose3 = pgs.draw.image('./glucose.png', 70, 70).attr({
                "x": 600,
                "y": 150
            });
            pgs.glucose4 = pgs.draw.image('./glucose.png', 70, 70).attr({
                "x": 675,
                "y": 100
            });

            if (pgs.glucoseCreatedIncrement === 4) {
                pgs.glucose1 = pgs.draw.image('./glucose.png', 70, 70).attr({
                    "x": 450,
                    "y": 100
                });
                pgs.glucose2 = pgs.draw.image('./glucose.png', 70, 70).attr({
                    "x": 525,
                    "y": 150
                });
            }

            let glucoseToMitochondrionGroup = pgs.draw.group();
            glucoseToMitochondrionGroup.add(pgs.glucose3).add(pgs.glucose4);
            pgs.currentAnimation = glucoseToMitochondrionGroup;
            // move glucose3 and glucose4 to mitochondrion
            glucoseToMitochondrionGroup.animate(
                {"delay": pgs.DEFAULT_ANIMATION_DELAY * pgs.animationSpeedRatio, "duration": pgs.animationDuration})
                .dmove(20, 350)
                .during(function(pos, morph, eased, situation) {
                    // update the battery indicator during the animation.
                    // "pos" is a number between 0 (beginning) -> 1 (end) of the animation
                    pgs.energyLeft = 50 - 15 * pos;
                    pgs.updateEnergyDisplay(pgs.energyLeft);
                })
                .animate({"duration": pgs.animationDuration}).attr({"opacity": 0})
                .during(function(pos, morph, eased, situation) {
                    pgs.energyLeft = 35 - 15 * pos;
                    pgs.updateEnergyDisplay(pgs.energyLeft);
                })
                .afterAll(function() {
                    // show the full batteries on the mitochondrion
                    pgs.createMitochondrionBatteries();

                    // callback for after mitochondrion batteries are moved from mitochondrion to battery indicator.
                    function mitochondrionBatteriesMovedCallback() {
                        pgs.energyLeft = 100; // reset to full battery
                        pgs.updateEnergyDisplay(pgs.energyLeft);

                        // remove the mitochondrion batteries
                        pgs.removeMitochondrionBatteries();

                        // callback for after glucose is moved from chloroplast to storage.
                        function glucoseToStorageMovedCallback() {
                            let glucose1InStorage = pgs.glucose1.clone();
                            let glucose2InStorage = pgs.glucose2.clone();
                            pgs.glucosesInStorage.push(glucose1InStorage, glucose2InStorage);
                            glucose1InStorage.width(pgs.glucose1.width() / pgs.GLUCOSE_GROWTH_SCALE)
                                .height(pgs.glucose1.height() / pgs.GLUCOSE_GROWTH_SCALE)
                                .dx(25).dy(-25);
                            glucose2InStorage.width(pgs.glucose1.width() / pgs.GLUCOSE_GROWTH_SCALE)
                                .height(pgs.glucose1.height() / pgs.GLUCOSE_GROWTH_SCALE)
                                .dx(-25).dy(25);
                            pgs.glucose1.hide();
                            pgs.glucose2.hide();

                            // now that we're done with the animation, invoke the callback
                            animationCallback();
                        }

                        // now move glucose1 and glucose2 to storage
                        if (pgs.glucoseCreatedIncrement === 4) {
                            let glucoseToStorageGroup = pgs.draw.set()
                                .add(pgs.glucose1).add(pgs.glucose2);
                            // calculate where to move based on existing glucose count in storage.
                            pgs.currentAnimation = glucoseToStorageGroup;
                            pgs.glucose1.animate({"delay":pgs.DEFAULT_ANIMATION_DELAY * pgs.animationSpeedRatio, "duration": pgs.animationDuration})
                                .move(pgs.STORAGE_X + ((pgs.glucosesInStorage.length / 2) % 5) * 75,
                                    pgs.STORAGE_Y + (Math.floor((pgs.glucosesInStorage.length / 2) / 5)) * 75)
                                .afterAll(glucoseToStorageMovedCallback);
                            pgs.glucose2.animate({"delay":pgs.DEFAULT_ANIMATION_DELAY * pgs.animationSpeedRatio, "duration": pgs.animationDuration})
                                .move(pgs.STORAGE_X + ((pgs.glucosesInStorage.length / 2) % 5) * 75,
                                    pgs.STORAGE_Y + (Math.floor((pgs.glucosesInStorage.length / 2) / 5)) * 75);
                        } else {
                            // there is no glucose moving to storage, so
                            // go directly to the callback
                            animationCallback();
                        }

                    }

                    let mitochondrionBatteryAnimationGroup = pgs.draw.set()
                        .add(pgs.mitochondrionBattery1).add(pgs.mitochondrionBattery2);
                    pgs.currentAnimation = mitochondrionBatteryAnimationGroup;
                    // move mitochondrion battery 1 to repair damage and battery 2 to transport nutrients after delay
                    pgs.mitochondrionBattery1.animate({"delay": pgs.DEFAULT_ANIMATION_DELAY * pgs.animationSpeedRatio, "duration": pgs.animationDuration})
                        .move(pgs.BATTERY_EMPTY_REPAIR_DAMAGE_X, pgs.BATTERY_EMPTY_REPAIR_DAMAGE_Y)
                        .during(function(pos, morph, eased, situation) {
                          // update the battery indicator during the animation. "pos" is a number between 0 (beginning) -> 1 (end) of the animation
                          pgs.energyLeft = 20 - 15 * pos;
                          pgs.updateEnergyDisplay(pgs.energyLeft);
                        })
                        .afterAll(mitochondrionBatteriesMovedCallback);
                    pgs.mitochondrionBattery2.animate({"delay": pgs.DEFAULT_ANIMATION_DELAY * pgs.animationSpeedRatio, "duration": pgs.animationDuration})
                        .move(pgs.BATTERY_EMPTY_TRANSPORT_NUTRIENTS_X, pgs.BATTERY_EMPTY_TRANSPORT_NUTRIENTS_Y)
                });
        });
    }

    /**
     * Move the glucose to center of mitochondrion
     * @param lastTwoGlucoses An array of last two glucoses in storage
     * @param animationCallback A callback of animation
     */
    moveGlucoseToCenterOfMitochondrion(
        lastTwoGlucoses: any[], animationCallback: () => {}) {
        let pgs = this;
        let glucose1InStorage = lastTwoGlucoses[0];
        let glucose2InStorage = lastTwoGlucoses[1];

        let storageToMitochondrionGroup = pgs.draw.set();
        storageToMitochondrionGroup.add(glucose1InStorage).add(glucose2InStorage);
        pgs.currentAnimation = storageToMitochondrionGroup;

        // callback for after glucose is moved from storage to mitochondrion.
        function glucoseMovedFromStorageToMitochondrion() {
            // remove last two glucose from storage
            pgs.glucosesInStorage.splice(pgs.glucosesInStorage.length - 2, 2);

            // callback for after mitochondrion batteries are moved from mitochondrion to battery indicator.
            function mitochondrionBatteriesMovedCallback() {
                pgs.energyLeft = 100; // reset energy to 100%
                pgs.updateEnergyDisplay(pgs.energyLeft);

                // remove the mitochondrion batteries
                pgs.removeMitochondrionBatteries();

                let glucoseCreated = false;
                let glucoseUsed = true;

                // update the glucose values
                pgs.updateGlucoseValues(pgs.dayNumber, glucoseCreated,
                    glucoseUsed);

                // now that we're done with the animation, invoke the callback
                animationCallback();
            }

            // display two full batteries on the mitochondrion
            pgs.createMitochondrionBatteries();

            let mitochondrionBatteryAnimationGroup = pgs.draw.set()
                .add(pgs.mitochondrionBattery1).add(pgs.mitochondrionBattery2);
            pgs.currentAnimation = mitochondrionBatteryAnimationGroup;

            // move mitochondrion battery 1 to repair damage and battery 2 to transport nutrients after delay
            pgs.mitochondrionBattery1.animate({"delay": pgs.DEFAULT_ANIMATION_DELAY * pgs.animationSpeedRatio, "duration": pgs.animationDuration})
                .move(pgs.BATTERY_EMPTY_REPAIR_DAMAGE_X, pgs.BATTERY_EMPTY_REPAIR_DAMAGE_Y)
                .during(function(pos, morph, eased, situation) {
                    // update the battery indicator during the animation. "pos" is a number between 0 (beginning) -> 1 (end) of the animation
                    pgs.energyLeft = 50 - 45 * pos;
                    pgs.updateEnergyDisplay(pgs.energyLeft);
                })
                .afterAll(mitochondrionBatteriesMovedCallback);
            pgs.mitochondrionBattery2.animate({"delay": pgs.DEFAULT_ANIMATION_DELAY * pgs.animationSpeedRatio, "duration": pgs.animationDuration})
                .move(pgs.BATTERY_EMPTY_TRANSPORT_NUTRIENTS_X, pgs.BATTERY_EMPTY_TRANSPORT_NUTRIENTS_Y);

        }

        glucose1InStorage.animate({"duration": pgs.animationDuration})
        .move(pgs.mitochondrionBattery1_startingX, pgs.mitochondrionBattery1_startingY)
            .during(function(pos, morph, eased, situation) {
                // update the battery indicator during the animation. "pos" is a number between 0 (beginning) -> 1 (end) of the animation
                pgs.energyLeft = 100 - 25 * pos;
                pgs.updateEnergyDisplay(pgs.energyLeft);
            })
            .animate({"duration": pgs.animationDuration}).opacity(0)
            .during(function(pos, morph, eased, situation) {
                // update the battery indicator during the animation. "pos" is a number between 0 (beginning) -> 1 (end) of the animation
                pgs.energyLeft = 75 - 25 * pos;
                pgs.updateEnergyDisplay(pgs.energyLeft);
            })
            .afterAll(glucoseMovedFromStorageToMitochondrion);
        glucose2InStorage.animate({"duration": pgs.animationDuration})
            .move(pgs.mitochondrionBattery2_startingX, pgs.mitochondrionBattery1_startingY)
            .animate({"duration": pgs.animationDuration}).opacity(0)
    }

    /**
     * Increases the size of last two glucoses in storage by the
     *     GLUCOSE_GROWTH_SCALE factor
     * @returns {[SVG,SVG]} An array of last two glucoses in storage after
     *     growing it in size
     */
    increaseLastTwoGlucoseSizes() {
        let glucose1InStorageIndex = this.glucosesInStorage.length - 1;
        let glucose1InStorage = this.glucosesInStorage[glucose1InStorageIndex];
        glucose1InStorage.width(glucose1InStorage.width() * this.GLUCOSE_GROWTH_SCALE)
            .height(glucose1InStorage.height() * this.GLUCOSE_GROWTH_SCALE);

        let glucose2InStorageIndex = this.glucosesInStorage.length - 2;
        let glucose2InStorage = this.glucosesInStorage[glucose2InStorageIndex];
        glucose2InStorage.width(glucose2InStorage.width() * this.GLUCOSE_GROWTH_SCALE)
            .height(glucose2InStorage.height() * this.GLUCOSE_GROWTH_SCALE);
        return [glucose1InStorage, glucose2InStorage];
    }

    /**
     * Start the animation in a state where light is off
     */
    startLightOffAnimation(animationCallback: () => {}) {
        let pgs = this;

        if (pgs.glucosesInStorage.length > 0) {
            let lastTwoGlucoses = pgs.increaseLastTwoGlucoseSizes();
            pgs.moveGlucoseToCenterOfMitochondrion(lastTwoGlucoses, animationCallback);
        } else {
            // there's no glucose stored in storage, and the light is off
            // so it's the last cycle before death
            if (pgs.energyLeft > 0) {
                pgs.currentAnimation = pgs.storage.animate({"duration": pgs.animationDuration * 3}).dmove(1,1)
                .during(function(pos, morph, eased, situation) {
                    // update the battery indicator during the animation. "pos" is a number between 0 (beginning) -> 1 (end) of the animation
                    pgs.energyLeft = 100 - 100 * pos;
                    pgs.updateEnergyDisplay(pgs.energyLeft);
                })
                .afterAll(function() {
                    // disable control buttons
                    pgs.disableControlButtons();

                    // start leaf death sequence, which by default takes 3 seconds
                    pgs.currentAnimation = pgs.mitochondrion
                        .animate(3000 * pgs.animationSpeedRatio).dmove(1,1)
                        .during(function(pos: number, morph, eased, situation) {
                            // get the death sequence animation leaf index based on time
                            let deathLeafIndex = 0;
                            if (pos < .33) {
                                deathLeafIndex = 1;
                            } else if (pos < .66) {
                                deathLeafIndex = 2;
                            } else {
                                deathLeafIndex = 3;
                            }
                            pgs.plantAnimationCorner.showLeaf(deathLeafIndex);
                        }.bind(pgs)).afterAll(function() {
                            // end the trial
                            // TODO: uncomment me
                            //this.endTrial();

                            // create the plant died event
                            pgs.addEvent('plantDied');

                            // show the plant died message
                            pgs.simulationEndFeedback.showPlantDied();

                            let glucoseCreated = false;
                            let glucoseUsed = false;

                            // update the glucose values
                            pgs.updateGlucoseValues(pgs.dayNumber, glucoseCreated,
                                glucoseUsed);

                            // update the graph and don't call the callback
                            this.updateGraph(this.dayNumber, glucoseCreated);

                        }.bind(pgs));
                });
            }
        }
    }

    removeMitochondrionBatteries() {
        if (this.mitochondrionBatteryGroup != null) {
            this.mitochondrionBatteryGroup.members.map((mitochondrionBattery) => {
                mitochondrionBattery.remove();
            });
        }
    }

    reset() {
        // end the current trial
        // TODO: uncomment me when ready
        //endTrial();

        // enable the control buttons
        this.enableControlButtons();

        // change the play/pause button to 'play'
        $("#playPause").attr("src", "play_circle.png");

        // reset current animation
        if (this.currentAnimation != null) {
            this.currentAnimation.stop();
            this.currentAnimation = null;
        }
        if (this.photonsGroup != null) {
            this.photonsGroup.remove();
        }
        if (this.glucose1 != null) {
            this.glucose1.remove();
        }
        if (this.glucose2 != null) {
            this.glucose2.remove();
        }
        if (this.glucose3 != null) {
            this.glucose3.remove();
        }
        if (this.glucose4 != null) {
            this.glucose4.remove();
        }
        this.removeMitochondrionBatteries();  // hide the batteries on mitochondrion
        this.energyLeft = 100;  // revert to 100%
        this.updateEnergyDisplay(this.energyLeft);  // update the energy display section
        this.plantAnimationCorner.showLeaf(0);
        this.dayDisplayCorner.updateDayText('Day 1');

        // clear out the glucose in storage
        this.glucosesInStorage.map((glucoseInStorage) => {
            glucoseInStorage.remove();
        });
        this.glucosesInStorage = [];

        // re-initialize the variables
        this.dayNumber = 0;
        this.totalGlucoseCreated = this.initialGlucoseCreated;
        this.totalGlucoseUsed = this.initialGlucoseUsed;
        this.totalGlucoseStored = this.initialGlucoseStored;

        // hide the 'Plant Died' and 'Simulation Ended' message
        this.simulationEndFeedback.hideAll();

        // reset the graph and toggle line on/off, if user previous toggled it
        this.graph.resetGraph();
        let parts = [this.chloroplast, this.mitochondrion, this.storage];
        for (let i = 0; i < parts.length; i++) {
            let part = parts[i];
            if (part.opacity() === 0.5) {
                this.graph.displaySeries(i, false);
            } else {
                this.graph.displaySeries(i, true);
            }
        }

        // hide the 'Feedback' message
        this.feedback.hideFeedback();
        // TODO: uncomment me when ready
        /*

        if (wiseAPI.wise5) {
            // get the student work from other components
            wiseAPI.getStudentWork();
        }
        */

        this.lightSwitch.hideWaitImage();

        // initialize the trial data
        this.startNewTrial();

        // set this flag back to false because we are going to start a new trial
        this.simulationEnded = false;
    }

    /**
     * Disable control buttons
     */
    disableControlButtons() {
        this.isControlEnabled = false;
        $("#lightSwitchInput").prop("disabled", true);
        $("#animationSpeedSwitchInput").prop("disabled", true);
        $("#playPause").css("opacity", 0.3);
    }

    /**
     * Enable control buttons
     */
    enableControlButtons() {
        this.isControlEnabled = true;
        $("#lightSwitchInput").prop("disabled", false);
        $("#animationSpeedSwitchInput").prop("disabled", false);
        $("#playPause").css("opacity", 1);
    }

    /**
     * Called when the end of the simulation is reached
     */
    endReached() {
        this.addEvent('simulationEnded');
        this.simulationEndFeedback.showSimulationEnded();
    }

    /**
     * Updates the energy display section at the bottom of the window
     * @param energyRemaining an integer between 0 and 100
     */
    updateEnergyDisplay(energyRemaining: number) {
        this.energyIndicatorView.showEnergyNeeds(energyRemaining);
        this.energyIndicatorView.showBatteryIndicator(energyRemaining);
    }

    /**
     * Register listeners for user interactions like
     * button clicks and slider moved
     */
    registerListenersForUserInput() {
        let pgs = this;

        // animation speed switch handler
        $("#animationSpeedSwitchInput").on("change", function() {
            let animationSpeedSwitchValue = $(this).val();
            if (animationSpeedSwitchValue == 1) {
                // user wants to run at normal speed
                pgs.addEvent('animationSpeedNormalClicked');
                pgs.updateAnimationSpeedRatio(pgs.ANIMATION_SPEED_RATIO_NORMAL);
            } else if (animationSpeedSwitchValue == 2) {
                // user wants to run at double speed
                pgs.addEvent('animationSpeed2xClicked');
                pgs.updateAnimationSpeedRatio(pgs.ANIMATION_SPEED_RATIO_DOUBLE);
            } else {
                // user wants to run at 4x speed
                pgs.addEvent('animationSpeed4xClicked');
                pgs.updateAnimationSpeedRatio(pgs.ANIMATION_SPEED_RATIO_QUADRUPLE);
            }
        });

        // play/pause button handler
        $("#playPause").on("click", function() {
            if (pgs.isControlEnabled) {
                let playPause = $(this).attr("src");

                if (playPause === "play_circle.png") {
                    // user wants to start or resume the simulation
                    if (pgs.currentAnimation == null) {
                        // the simulation is stopped, so start it
                        pgs.addEvent('startButtonClicked');
                        pgs.start();
                    } else {
                        // resume a paused animation
                        pgs.addEvent('resumeButtonClicked');
                        pgs.currentAnimation.play();
                    }
                    // change the play/pause button to pause
                    $("#playPause").attr("src", "pause_circle.png");
                } else {
                    // user wants to pause the simulation
                    pgs.addEvent('pauseButtonClicked');
                    pgs.pause();
                }
            }
        });

        // reset button handler
        $("#reset").on("click", function() {
            pgs.addEvent('resetButtonClicked');
            pgs.reset();
        });
    }

    /**
     * Add an event to the current trial data
     * @param eventName the name of the event
     */
    addEvent(eventName: string) {
        // create the event object
        let event: Event = {
            name: eventName,
            timestamp: new Date().getTime()  // get the current time
        };
        // add the new event to the array of events in the trial
        this.currentTrialData.events.push(event);
    }

    /**
     * Pause the simulation
     */
    pause() {
        // change the play/pause button to play
        $("#playPause").attr("src", "play_circle.png");

        if (this.currentAnimation != null) {
            this.currentAnimation.pause();
        }
    }

    /**
     * Update animation speed ratio
     */
    updateAnimationSpeedRatio(newAnimationSpeedRatio: number) {
        this.animationSpeedRatio = newAnimationSpeedRatio;
        this.animationDuration = this.DEFAULT_ANIMATION_DURATION * this.animationSpeedRatio;
    }

    /**
     * Updates the model light energy percentage
     * @param requestedLightEnergyPercent the new energy percentage requested by
     *     the user. Possible values are 0, 50, or 100
     */
    handleLightChangeRequest(requestedLightEnergyPercent: number) {
        this.lightEnergyPercent = requestedLightEnergyPercent;
        if (this.currentAnimation != null) {
            /*
             * if the animation is currently playing, show a wait image
             * so the user knows the change will take effect next time
             */
            this.lightSwitch.showWaitImage();
            if (requestedLightEnergyPercent >= 50) {
                // this variable will be read in at the beginning of the
                // next animation cycle
                this.isLightOn = true;
            } else {
                this.isLightOn = false;
            }
        } else {
            // otherwise, turn the light on/off right now
            if (requestedLightEnergyPercent >= 50) {
                this.turnLightOn();
            } else {
                this.turnLightOff();
            }
        }
    }

    /**
     * Turn the light on which affect the number of photons to appear
     */
    turnLightOn() {
        if (this.lightEnergyPercent === 50) {
            this.glucoseCreatedIncrement = 2;
            this.glucoseUsedIncrement = 2;
        } else if (this.lightEnergyPercent === 100) {
            this.glucoseCreatedIncrement = 4;
            this.glucoseUsedIncrement = 2;
        }
        this.toggleLight(true);
    }

    /**
     * Turn the light off which makes no photons appear
     */
    turnLightOff() {
        this.toggleLight(false);
    }

    /**
     * Toggle light on or off. The effect is immediate.
     * @param doToggleOn
     */
    toggleLight(doToggleOn: boolean) {
        this.isLightOn = doToggleOn;
        this.dayDisplayCorner.updateDayColor(this.isLightOn);
        this.plantAnimationCorner.turnLightOn(this.isLightOn);
        this.lightSwitch.hideWaitImage();
    }

    /**
     * Create batteries that appear on the mitochondrion
     */
    createMitochondrionBatteries() {
        this.mitochondrionBattery1 = this.draw.image('./battery_full.png').attr({
            "x": this.mitochondrionBattery1_startingX,
            "y": this.mitochondrionBattery1_startingY
        });
        this.mitochondrionBattery2 = this.draw.image('./battery_full.png').attr({
            "x": this.mitochondrionBattery2_startingX,
            "y": this.mitochondrionBattery2_startingY
        });
        this.mitochondrionBatteryGroup = this.draw.set()
            .add(this.mitochondrionBattery1).add(this.mitochondrionBattery2);
    }

    /**
     * End the trial
     */
    endTrial() {
        // record tracking variables for strategy
        // TODO: uncomment me when I implement trials
        //this.feedback.recordInfoForFeedback(this.currentTrialData);

        /*
         * Check if the simulation has already ended.
         * endTrial() is called when
         * 1. the plant dies
         * 2. the time reaches the end
         * 3. the student clicks reset
         * We want to save student work when these events occur with one exception.
         * If the plant dies or the time reaches the end, we do not want the subsequent
         * reset click to save the work again. This is why we need to check if the
         * simulation has previously ended (and therefore already saved) before saving.
         */
        if (!this.simulationEnded) {
            // save the student data to WISE
            this.wiseAPI.save();
        }

        this.simulationEnded = true;
    }
}
