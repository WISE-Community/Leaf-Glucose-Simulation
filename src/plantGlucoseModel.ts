import { DayDisplayCorner } from "./dayDisplayCorner";
import { EnergyIndicatorView } from "./energyIndicatorView";
import { Feedback } from "./feedback";
import { Graph } from "./graph";
import { PlantAnimationCorner } from "./plantAnimationCorner";
import { SimulationEndFeedback } from "./simulationEndFeedback";

export class PlantGlucoseModel {
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
    LIGHT_ON_GRAPH_REGION_COLOR: string = "#fff9a5";  // color of graph region when light is on
    LIGHT_OFF_GRAPH_REGION_COLOR: string = "#dddddd";  // color of graph region when light is off
    MAX_DAYS = 20;  // max number of days
    MITOCHONDRION_X = 500;
    MITOCHONDRION_Y = 400;
    STORAGE_X = 50;
    STORAGE_Y = 375;

    animationSpeedRatio: number = 1; // ratio speed for each animation to complete. 0=stop -> 1=full speed

    // actual amount of time (in milliseconds) each animation should take to complete
    animationDuration: number = this.DEFAULT_ANIMATION_DURATION * this.animationSpeedRatio;

    chloroplast: any;
    currentAnimation: any;  // stores the currently-playing/pausing animation
    currentTrialData: any;  // current trial data
    dayNumber: number = 0;  // the current day number
    draw: any;  // the SVG draw object
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
    glucose1: any;
    glucose2: any;
    glucose3: any;
    glucose4: any;
    glucosesInStorage: any[] = [];

    // the starting glucose amounts
    initialGlucoseCreated: number = 0;
    initialGlucoseUsed: number = 0;
    initialGlucoseStored: number = 0;
    isLightOn: boolean = true;

    mitochondrion: any;
    mitochondrionBatteryGroup: any;
    mitochondrionBattery1: any;
    mitochondrionBattery1_startingX = this.MITOCHONDRION_X + 100;
    mitochondrionBattery1_startingY = this.MITOCHONDRION_Y + 100;
    mitochondrionBattery2_startingX = this.MITOCHONDRION_X + 175;
    mitochondrionBattery2_startingY = this.MITOCHONDRION_Y + 50;

    mitochondrionBattery2: any;
    photonChloroplast1: any;
    photonChloroplast2: any;
    photonPlant1: any;
    photonPlant2: any;

    photonsGroup: any;
    plantAnimationCorner: PlantAnimationCorner;
    running: boolean = false;  // whether the simulation is currently running or not
    simulationEnded: boolean = false;
    simulationEndFeedback: SimulationEndFeedback;
    storage: any;

    // the current total amount of glucose created/used/stored
    totalGlucoseCreated = this.initialGlucoseCreated;
    totalGlucoseUsed = this.initialGlucoseUsed;
    totalGlucoseStored = this.initialGlucoseStored;

    trials: any[] = [];  // an array of trial data objects, including the current trial
    waitImageLightSwitch: any;  // wait image for when user changes the light switch during an animation cycle

    constructor(elementId: string, parameters: any, feedbackPolicy: any = null, showGraph: boolean = true) {

        this.draw = SVG(elementId);

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

        this.waitImageLightSwitch = $("#waitImageLightSwitch");

        // initialize the graph
        this.graph = new Graph(showGraph);

        // initialize a new trial data
        this.startNewTrial();

        // listen for user inputs
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
     * Initialize a new trial data
     */
    startNewTrial() {

        // create the trial
        this.currentTrialData = {
            glucoseCreatedData: [[0, this.initialGlucoseCreated]],
            glucoseUsedData: [[0, this.initialGlucoseUsed]],
            glucoseStoredData: [[0, this.initialGlucoseStored]],
            events: []
        };

        this.trials.push(this.currentTrialData);
    }

    /**
     * Update the graph
     * @param dayNumber the day number
     * @param glucoseCreated whether the glucose was created for the specified day
     */
    updateGraph(dayNumber, isGlucoseCreated) {

        // update the data series for each line in the graph
        this.graph.setSeriesData(0, this.currentTrialData.glucoseCreatedData);
        this.graph.setSeriesData(1, this.currentTrialData.glucoseUsedData);
        this.graph.setSeriesData(2, this.currentTrialData.glucoseStoredData);

        // update background of graph based on light on (yellow) or off (gray)
        let plotBandSettings = {
            "from": dayNumber - 1,
            "to": dayNumber,
            "color": isGlucoseCreated ? this.LIGHT_ON_GRAPH_REGION_COLOR : this.LIGHT_OFF_GRAPH_REGION_COLOR
        };

        this.graph.addPlotBand(plotBandSettings);
    }

    /**
     * Update the glucose values
     * @param dayNumber which day it is
     * @param createGlucose whether to create glucose
     */
    updateGlucoseValues(dayNumber: number, createGlucose: boolean) {
        if (createGlucose) {
            // we are creating glucose so we will add to the glucoseCreated
            this.totalGlucoseCreated += this.glucoseCreatedIncrement;
        }

        // increase the glucose used by the plant
        this.totalGlucoseUsed += this.glucoseUsedIncrement;

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

        // increment the day number
        this.dayNumber++;

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
        } else {
            // the simulation has not reached the end yet

            // update the day number display
            this.updateDayText('Day ' + this.dayNumber);

            if (this.isLightOn) {
                // the light is on
                this.turnLightOn(true);

                // animate the photons
                function lightOnAnimationCallback() {

                    let glucoseCreated = true;

                    // update the glucose values
                    this.updateGlucoseValues(this.dayNumber, glucoseCreated);

                    // update the graph
                    this.updateGraph(this.dayNumber, glucoseCreated);

                    // loop animation after brief pause
                    window.setTimeout(function() { this.playAnimationLoop(); }.bind(this), 750 * this.animationSpeedRatio);
                }
                this.startLightOnAnimation(lightOnAnimationCallback.bind(this));
            } else  {
                // the light is off
                this.turnLightOn(false);

                function lightOffAnimationCallback() {

                    let glucoseCreated = false;

                    // update the glucose values
                    this.updateGlucoseValues(this.dayNumber, glucoseCreated);

                    // update the graph
                    this.updateGraph(this.dayNumber, glucoseCreated);

                    if (this.totalGlucoseStored < 0) {
                        // the amount of glucose stored is 0 or less which means
                        // the plant has died

                        // disable control buttons
                        this.disableControlButtons();

                        // start leaf death sequence, which by default takes 3 seconds
                        this.currentAnimation = this.mitochondrion
                            .animate(3000 * this.animationSpeedRatio).dmove(1,1)
                            .during(function(pos, morph, eased, situation) {
                                // get the death leaf index based on time (0)
                                let deathLeafIndex = 0;
                                if (pos < .33) {
                                    deathLeafIndex = 1;
                                } else if (pos < .66) {
                                    deathLeafIndex = 2;
                                } else {
                                    deathLeafIndex = 3;
                                }
                                this.plantAnimationCorner.showLeaf(deathLeafIndex);
                            }.bind(this)).afterAll(function() {
                                // end the trial
                                // TODO: uncomment me
                                //this.endTrial();

                                // create the plant died event
                                this.addEvent('plantDied');

                                // show the plant died message
                                this.simulationEndFeedback.showPlantDied();
                            }.bind(this));
                    } else {
                        // loop animation after brief pause©
                        window.setTimeout(function() { this.playAnimationLoop(); }.bind(this), 750 * this.animationSpeedRatio);
                    }
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
        let pgm: PlantGlucoseModel = this;
        // create the photon image objects
        this.photonPlant1 = this.draw.image('./photon.png', 30, 30).attr({
            'x': 80,
            'y': 50
        });

        this.photonPlant2 = this.photonPlant1.clone().attr({
            'x': 30,
            'y': 50
        });

        this.photonChloroplast1 = this.draw.image('./photon.png', 50, 50).attr({
            "x": 430,
            "y": 50
        });

        this.photonChloroplast2 = this.photonChloroplast1.clone().attr({
            'x': 530,
            'y': 50
        });

        this.photonsGroup = this.draw.group()
            .add(this.photonPlant1).add(this.photonPlant2)
            .add(this.photonChloroplast1).add(this.photonChloroplast2);
        pgm.currentAnimation = pgm.photonsGroup;
        pgm.photonsGroup.animate({"duration": pgm.animationDuration}).move(50, 50)
        .during(function(pos, morph, eased, situation) {
            // update the battery indicator during the animation. "pos" is a number between 0 (beginning) -> 1 (end) of the animation
            pgm.energyLeft = 100 - 25 * pos;
            pgm.updateEnergyDisplay(pgm.energyLeft); // update the energy display section
        })
        .animate({"duration": pgm.animationDuration}).attr({"opacity": 0})
        .during(function(pos, morph, eased, situation) {
            // update the battery indicator during the animation. "pos" is a number between 0 (beginning) -> 1 (end) of the animation
            pgm.energyLeft = 75 - 25 * pos;
            pgm.updateEnergyDisplay(pgm.energyLeft);
        })
        .afterAll(function() {
            // reset the photons to original place
            pgm.photonsGroup.move(-50, -50);
            pgm.photonsGroup.hide();

            // make glucose appear
            pgm.glucose1 = pgm.draw.image('./glucose.png', 70, 70).attr({
                "x": 450,
                "y": 100
            });
            pgm.glucose2 = pgm.glucose1.clone().attr({
                "x": 525,
                "y": 150
            });
            pgm.glucose3 = pgm.glucose1.clone().attr({
                "x": 600,
                "y": 150
            });
            pgm.glucose4 = pgm.glucose1.clone().attr({
                "x": 675,
                "y": 100
            });

            let glucoseToMitochondrionGroup = pgm.draw.group();
            glucoseToMitochondrionGroup.add(pgm.glucose3).add(pgm.glucose4);

            pgm.currentAnimation = glucoseToMitochondrionGroup;
            // move glucose3 and glucose4 to mitochondrion
            glucoseToMitochondrionGroup.animate({"delay": pgm.DEFAULT_ANIMATION_DELAY * pgm.animationSpeedRatio, "duration": pgm.animationDuration}).dmove(20, 350)
                .during(function(pos, morph, eased, situation) {
                    // update the battery indicator during the animation.
                    // "pos" is a number between 0 (beginning) -> 1 (end) of the animation
                    pgm.energyLeft = 50 - 15 * pos;
                    pgm.updateEnergyDisplay(pgm.energyLeft);
                })
                .animate({"duration": pgm.animationDuration}).attr({"opacity": 0})
                .during(function(pos, morph, eased, situation) {
                    pgm.energyLeft = 35 - 15 * pos;
                    pgm.updateEnergyDisplay(pgm.energyLeft);
                })
                .afterAll(function() {
                    // show the full batteries on the mitochondrion
                    pgm.createMitochondrionBatteries();

                    let countMitochondrionBatteriesMoved = 0;
                    // callback for after mitochondrion batteries are moved from mitochondrion to battery indicator.
                    // when it's called twice, we know that both batteries have finished moving, so we can move forward in the animation
                    function mitochondrionBatteriesMovedCallback() {
                        countMitochondrionBatteriesMoved++;
                        if (countMitochondrionBatteriesMoved === 2) {

                            pgm.energyLeft = 100; // reset to full battery
                            pgm.updateEnergyDisplay(pgm.energyLeft);

                            // remove the mitochondrion batteries
                            pgm.removeMitochondrionBatteries();

                            let countGlucoseToStorageMoved = 0;
                            // callback for after glucose is moved from chloroplast to storage.
                            // when it's called twice, we know that both glucose have finished moving, so we can move forward in the animation
                            function glucoseToStorageMovedCallback() {
                                countGlucoseToStorageMoved++;
                                if (countGlucoseToStorageMoved === 2) {
                                    let glucose1InStorage = pgm.glucose1.clone();
                                    let glucose2InStorage = pgm.glucose2.clone();
                                    pgm.glucosesInStorage.push(glucose1InStorage, glucose2InStorage);
                                    glucose1InStorage.width(pgm.glucose1.width()/1.25).height(pgm.glucose1.height()/1.25).dx(25).dy(-25);
                                    glucose2InStorage.width(pgm.glucose1.width()/1.25).height(pgm.glucose1.height()/1.25).dx(-25).dy(25);

                                    // hide the glucose1 and glucose2
                                    pgm.glucose1.hide();
                                    pgm.glucose2.hide();

                                    // now that we're done with the animation, invoke the callback
                                    animationCallback();
                                }
                            }

                            // now move glucose1 and glucose2 to storage
                            let glucoseToStorageGroup = pgm.draw.set()
                                .add(pgm.glucose1).add(pgm.glucose2);

                            // calculate where to move based on existing glucose count in storage.
                            pgm.currentAnimation = glucoseToStorageGroup;
                            pgm.glucose1.animate({"delay":pgm.DEFAULT_ANIMATION_DELAY * pgm.animationSpeedRatio, "duration": pgm.animationDuration})
                            .move(pgm.STORAGE_X + ((pgm.glucosesInStorage.length / 2) % 5) * 75,
                                  pgm.STORAGE_Y + (Math.floor((pgm.glucosesInStorage.length / 2) / 5)) * 75)
                                .afterAll(glucoseToStorageMovedCallback);
                            pgm.glucose2.animate({"delay":pgm.DEFAULT_ANIMATION_DELAY * pgm.animationSpeedRatio, "duration": pgm.animationDuration})
                            .move(pgm.STORAGE_X + ((pgm.glucosesInStorage.length / 2) % 5) * 75,
                                pgm.STORAGE_Y + (Math.floor((pgm.glucosesInStorage.length / 2) / 5)) * 75)
                                .afterAll(glucoseToStorageMovedCallback);
                        }
                    }

                    let mitochondrionBatteryAnimationGroup = pgm.draw.set()
                        .add(pgm.mitochondrionBattery1).add(pgm.mitochondrionBattery2);
                    pgm.currentAnimation = mitochondrionBatteryAnimationGroup;
                    // move mitochondrion battery 1 to repair damage and battery 2 to transport nutrients after delay
                    pgm.mitochondrionBattery1.animate({"delay": pgm.DEFAULT_ANIMATION_DELAY * pgm.animationSpeedRatio, "duration": pgm.animationDuration})
                        .move(pgm.BATTERY_EMPTY_REPAIR_DAMAGE_X, pgm.BATTERY_EMPTY_REPAIR_DAMAGE_Y)
                        .during(function(pos, morph, eased, situation) {
                          // update the battery indicator during the animation. "pos" is a number between 0 (beginning) -> 1 (end) of the animation
                          pgm.energyLeft = 20 - 15 * pos;
                          pgm.updateEnergyDisplay(pgm.energyLeft);
                        })
                        .afterAll(mitochondrionBatteriesMovedCallback);
                    pgm.mitochondrionBattery2.animate({"delay": pgm.DEFAULT_ANIMATION_DELAY * pgm.animationSpeedRatio, "duration": pgm.animationDuration})
                        .move(pgm.BATTERY_EMPTY_TRANSPORT_NUTRIENTS_X, pgm.BATTERY_EMPTY_TRANSPORT_NUTRIENTS_Y)
                        .afterAll(mitochondrionBatteriesMovedCallback);
                });
        });
    }

    /**
     * Start the animation in a state where light is off
     */
    startLightOffAnimation(animationCallback: () => {}) {
        let pgm = this;

        if (pgm.glucosesInStorage.length > 0) {
            // get the last two stored glucose from storage
            let glucose1InStorageIndex = pgm.glucosesInStorage.length - 1;
            let glucose1InStorage = pgm.glucosesInStorage[glucose1InStorageIndex];
            glucose1InStorage.width(glucose1InStorage.width() * 1.25).height(glucose1InStorage.height() * 1.25);

            let glucose2InStorageIndex = pgm.glucosesInStorage.length - 2;
            let glucose2InStorage = pgm.glucosesInStorage[glucose2InStorageIndex];
            glucose2InStorage.width(glucose2InStorage.width() * 1.25).height(glucose2InStorage.height() * 1.25);

            let storageToMitochondrionGroup = pgm.draw.set();
            storageToMitochondrionGroup.add(glucose1InStorage).add(glucose2InStorage);
            pgm.currentAnimation = storageToMitochondrionGroup;

            // move the glucose to center of mitochondrion
            let countGlucoseMovedFromStorageToMitochondrion = 0;
            // callback for after glucose is moved from storage to mitochondrion.
            // when it's called twice, we know that both glucose have finished moving,
            // so we can move forward in the animation
            function glucoseMovedFromStorageToMitochondrion() {
                countGlucoseMovedFromStorageToMitochondrion++;

                if (countGlucoseMovedFromStorageToMitochondrion === 2) {
                    // remove glucose from storage
                    pgm.glucosesInStorage.splice(glucose2InStorageIndex, 2);

                    let countMitochondrionBatteriesMoved = 0;
                    // callback for after mitochondrion batteries are moved from mitochondrion to battery indicator.
                    // when it's called twice, we know that both batteries have finished moving,
                    // so we can move forward in the animation
                    function mitochondrionBatteriesMovedCallback() {
                        countMitochondrionBatteriesMoved++;
                        if (countMitochondrionBatteriesMoved === 2) {
                            pgm.energyLeft = 100; // reset energy to 100%
                            pgm.updateEnergyDisplay(pgm.energyLeft);

                            // remove the mitochondrion batteries
                            pgm.removeMitochondrionBatteries();

                            // now that we're done with the animation, invoke the callback
                            animationCallback();
                        }
                    }

                    // show the full batteries on the mitochondrion
                    pgm.createMitochondrionBatteries();

                    let mitochondrionBatteryAnimationGroup = pgm.draw.set()
                        .add(pgm.mitochondrionBattery1).add(pgm.mitochondrionBattery2);
                    pgm.currentAnimation = mitochondrionBatteryAnimationGroup;

                    // move mitochondrion battery 1 to repair damage and battery 2 to transport nutrients after delay
                    pgm.mitochondrionBattery1.animate({"delay": pgm.DEFAULT_ANIMATION_DELAY * pgm.animationSpeedRatio, "duration": pgm.animationDuration})
                        .move(pgm.BATTERY_EMPTY_REPAIR_DAMAGE_X, pgm.BATTERY_EMPTY_REPAIR_DAMAGE_Y)
                        .during(function(pos, morph, eased, situation) {
                            // update the battery indicator during the animation. "pos" is a number between 0 (beginning) -> 1 (end) of the animation
                            pgm.energyLeft = 50 - 45 * pos;
                            pgm.updateEnergyDisplay(pgm.energyLeft);
                        })
                        .afterAll(mitochondrionBatteriesMovedCallback);
                    pgm.mitochondrionBattery2.animate({"delay": pgm.DEFAULT_ANIMATION_DELAY * pgm.animationSpeedRatio, "duration": pgm.animationDuration})
                        .move(pgm.BATTERY_EMPTY_TRANSPORT_NUTRIENTS_X, pgm.BATTERY_EMPTY_TRANSPORT_NUTRIENTS_Y)
                        .afterAll(mitochondrionBatteriesMovedCallback);
                }
            }

            glucose1InStorage.animate({"duration": pgm.animationDuration})
                .move(pgm.mitochondrionBattery1_startingX, pgm.mitochondrionBattery1_startingY)
                .during(function(pos, morph, eased, situation) {
                    // update the battery indicator during the animation. "pos" is a number between 0 (beginning) -> 1 (end) of the animation
                    pgm.energyLeft = 100 - 25 * pos;
                    pgm.updateEnergyDisplay(pgm.energyLeft);
                })
                .animate({"duration": pgm.animationDuration}).opacity(0)
                .during(function(pos, morph, eased, situation) {
                    // update the battery indicator during the animation. "pos" is a number between 0 (beginning) -> 1 (end) of the animation
                    pgm.energyLeft = 75 - 25 * pos;
                    pgm.updateEnergyDisplay(pgm.energyLeft);
                })
                .afterAll(glucoseMovedFromStorageToMitochondrion);
            glucose2InStorage.animate({"duration": pgm.animationDuration})
                .move(pgm.mitochondrionBattery2_startingX, pgm.mitochondrionBattery1_startingY)
                .animate({"duration": pgm.animationDuration}).opacity(0).afterAll(glucoseMovedFromStorageToMitochondrion);
        } else {
            // there's no glucose stored in storage
            if (pgm.energyLeft > 0) {
                pgm.currentAnimation = pgm.storage.animate({"duration": pgm.animationDuration * 3}).dmove(1,1)
                .during(function(pos, morph, eased, situation) {
                    // update the battery indicator during the animation. "pos" is a number between 0 (beginning) -> 1 (end) of the animation
                    pgm.energyLeft = 100 - 100 * pos;
                    pgm.updateEnergyDisplay(pgm.energyLeft);
                })
                .afterAll(function() {
                    animationCallback();
                });
            } else {
                // no energy left, we're done with the animation, invoke the callback
                animationCallback();
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

        // clear out the glucose in storage
        this.glucosesInStorage.map((glucoseInStorage) => {
            glucoseInStorage.remove();
        });

        this.glucosesInStorage = [];

        // reset the day message text
        this.updateDayText('Day 1');

        // initialize the variables
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

        // hide the wait image
        this.waitImageLightSwitch.fadeOut();

        // initialize the trial data
        this.startNewTrial();

        // set this flag back to false because we are going to start a new trial
        this.simulationEnded = false;
    }

    /**
     * Disable control buttons
     */
    disableControlButtons() {
        $("#lightSwitchInput").prop("disabled", true);
        $("#animationSpeedSwitchInput").prop("disabled", true);
        $("#playPause").css("opacity", 0.3);
    }

    /**
     * Enable control buttons
     */
    enableControlButtons() {
        $("#lightSwitchInput").prop("disabled", false);
        $("#animationSpeedSwitchInput").prop("disabled", false);
        $("#playPause").css("opacity", 1);
    }

    /**
     * Called when the end of the simulation is reached
     */
    endReached() {
        // create the simulation ended event
        this.addEvent('simulationEnded');
        this.simulationEndFeedback.showSimulationEnded();
    }

    updateDayText(text: string) {
        this.dayDisplayCorner.updateDayText(text);
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
     * Register listeners for user input
     */
    registerListenersForUserInput() {
        let pgm = this;

        // power switch handler
        $("#lightSwitchInput").on("change", function() {
            let lightSwitchValue = $(this).val();
            if (lightSwitchValue == 0) {
                // user wants to turn power switch off
                pgm.addEvent('turnLightOffButtonClicked');
                pgm.handleLightChangeRequest(false);
            } else {
                // user wants to turn power switch on
                pgm.addEvent('turnLightOnButtonClicked');
                pgm.handleLightChangeRequest(true);
            }
        });

        // animation speed switch handler
        $("#animationSpeedSwitchInput").on("change", function() {
            let animationSpeedSwitchValue = $(this).val();
            if (animationSpeedSwitchValue == 1) {
                // user wants to run at normal speed
                pgm.addEvent('animationSpeedNormalClicked');
                pgm.updateAnimationSpeedRatio(pgm.ANIMATION_SPEED_RATIO_NORMAL);
            } else if (animationSpeedSwitchValue == 2) {
                // user wants to run at double speed
                pgm.addEvent('animationSpeed2xClicked');
                pgm.updateAnimationSpeedRatio(pgm.ANIMATION_SPEED_RATIO_DOUBLE);
            } else {
                // user wants to run at 4x speed
                pgm.addEvent('animationSpeed4xClicked');
                pgm.updateAnimationSpeedRatio(pgm.ANIMATION_SPEED_RATIO_QUADRUPLE);
            }
        });

        // play/pause button handler
        $("#playPause").on("click", function() {
            let isControlEnabled = !$("#lightSwitchInput").prop("disabled");
            if (isControlEnabled) {
                let playPause = $(this).attr("src");

                if (playPause === "play_circle.png") {
                    // user wants to start or resume the simulation
                    if (pgm.currentAnimation == null) {
                        //  we are not currently running the simulation so we will start running the simulation
                        pgm.addEvent('startButtonClicked');
                        pgm.start();
                    } else {
                        // we are resuming a paused animation
                        pgm.addEvent('resumeButtonClicked');
                        pgm.currentAnimation.play();
                    }

                    // change the play/pause button to pause
                    $("#playPause").attr("src", "pause_circle.png");

                } else {
                    // user wants to pause the simulation
                    pgm.addEvent('pauseButtonClicked');
                    pgm.pause();
                }
            }
        });

        // reset button handler
        $("#reset").on("click", function() {
            pgm.addEvent('resetButtonClicked');
            pgm.reset();
        });

        // listen for graph line show/hide toggles and toggle corresponding image's opacity.
        this.registerGraphLineToggleListener();
    }

    /**
     * listen for graph line show/hide toggles and toggle corresponding image's opacity.
     */
    registerGraphLineToggleListener() {
        let pgm = this;

        $(".highcharts-legend-item").on("click", function() {
            // get the index of the line user toggled (0 = glucose made, 1 = used, 2 = stored)
            let lineIndex = $(".highcharts-legend-item").index($(this));

            // is the line hidden or displayed?
            let isHidden = $(this).hasClass("highcharts-legend-item-hidden");

            // get the appropriate image object based on which line user toggled
            let image = [pgm.chloroplast, pgm.mitochondrion, pgm.storage][lineIndex];

            // set the opacity accordingly
            if (isHidden) {
                image.opacity(0.5);
            } else {
                image.opacity(1);
            }
        });
    }

    /**
     * Add an event to the current trial data
     * @param eventName the name of the event
     */
    addEvent(eventName: string) {
        // get the timestamp
        let timestamp = new Date().getTime();

        // create the event object
        let event = {
            name: eventName,
            timestamp: timestamp
        };

        // add the event to the array of events in the trial
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

    updateAnimationSpeedRatio(newAnimationSpeedRatio: number) {
        this.animationSpeedRatio = newAnimationSpeedRatio;
        this.animationDuration = this.DEFAULT_ANIMATION_DURATION * this.animationSpeedRatio;
    }

    /**
     * requestLightOn: true if request to turn light on, false if request to turn light off
     */
    handleLightChangeRequest(requestLightOn: boolean) {
        if (this.currentAnimation != null) {
            // if the animation is currently playing,
            // show a wait image so user knows the change will take effect next time
            this.waitImageLightSwitch.show();
            this.isLightOn = requestLightOn;  // this variable will be read in at the beginning of the next animation cycle
        } else {
            // otherwise, turn the light on/off right now
            if (requestLightOn) {
                this.turnLightOn(true);
            } else {
                this.turnLightOn(false);
            }
        }
    }

    /**
     * Turn the light on
     * @param doPowerOn = true if power should be turned on. false if power should be turned off.
     */
    turnLightOn(doPowerOn: boolean) {
        // match day display rectangle color to graph's region color
        this.isLightOn = doPowerOn;
        this.dayDisplayCorner.updateDayColor(this.isLightOn);

        // update the plant animation
        this.plantAnimationCorner.turnLightOn(doPowerOn);

        // hide the wait image now that the light change has taken effect
        this.waitImageLightSwitch.fadeOut();
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
