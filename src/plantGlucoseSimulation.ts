import { DayDisplayCorner } from './dayDisplayCorner';
import { EnergyIndicatorView } from './energyIndicatorView';
import { Event } from './event';
import { Feedback } from './feedback';
import { Graph } from './graph';
import { LightSwitch2 } from './lightSwitch2';
import { LightSwitch3 } from './lightSwitch3';
import { LightSwitch5 } from './lightSwitch5';
import { PlantAnimationCorner } from './plantAnimationCorner';
import { PlayBackControl } from './playBackControl';
import { SimulationEndFeedback } from './simulationEndFeedback';
import { SimulationSpeedSwitch } from './simulationSpeedSwitch';
import { SimulationState } from './simulationState';
import * as SVG from 'svg.js';
import 'svg.draggable.js';
import * as $ from 'jquery';
import {WISEAPI} from "./wiseAPI";

/**
 * PlantGlucoseSimulation --- Simulation showing the inside of a plant
 * during Photosynthesis.
 * @author Hiroki Terashima
 * @author Geoffrey Kwan
 */
export class PlantGlucoseSimulation {
  BATTERY_EMPTY_REPAIR_DAMAGE_X: number = 325;
  BATTERY_EMPTY_REPAIR_DAMAGE_Y: number = 815;
  BATTERY_EMPTY_TRANSPORT_NUTRIENTS_X: number = 625;
  BATTERY_EMPTY_TRANSPORT_NUTRIENTS_Y: number = 815;
  CHLOROPLAST_X = 450;
  CHLOROPLAST_Y = 100;

  // default amount of time (in ms) each animation should take to complete
  DEFAULT_ANIMATION_DURATION: number = 750;

  // default delay before staring animation in ms
  DEFAULT_ANIMATION_DELAY: number = 250;

  BG_COLOR_LIGHT_100: string = '#ffffca';
  BG_COLOR_LIGHT_75: string = '#fff077';
  BG_COLOR_LIGHT_50: string = '#fed34b';
  BG_COLOR_LIGHT_25: string = '#febf2c';
  BG_COLOR_LIGHT_0: string = '#bfbfbf';

  MAX_DAYS = 20;
  MITOCHONDRION_X = 500;
  MITOCHONDRION_Y = 400;
  STORAGE_X = 50;
  STORAGE_Y = 375;

  // ratio speed for each animation to complete. 0 = stop -> 1 = full speed
  animationSpeedRatio: number = 1;

  // actual amount of time (in ms) each animation should take to complete
  animationDuration: number =
      this.DEFAULT_ANIMATION_DURATION * this.animationSpeedRatio;

  // actual amount of time (in ms) delay before starting animation
  animationDelay: number =
      this.DEFAULT_ANIMATION_DELAY * this.animationSpeedRatio;

  chloroplast: SVG;
  currentAnimation: SVG;
  currentDayNumber: number = 0;
  currentTrialData: any;
  draw: SVG;
  dayDisplayCorner: DayDisplayCorner;
  energyIndicatorView: EnergyIndicatorView;
  energyLeft: number = 100;
  feedback: Feedback;
  graph: Graph;
  glucoseCreatedData: any[] = [];
  glucoseUsedData: any[] = [];
  glucoseStoredData: any[] = [];

  // the amount of glucose to add/subtract each day
  glucoseCreatedIncrement: number = 4;
  glucoseUsedIncrement: number = 2;

  glucoseToMitochondrion1: SVG;
  glucoseToMitochondrion2: SVG;
  glucoseToStorage1: SVG;
  glucoseToStorage2: SVG;
  glucosesInStorage: SVG[] = [];
  initialGlucoseCreated: number = 0;
  initialGlucoseUsed: number = 0;
  initialGlucoseStored: number = 0;
  isControlEnabled = true;
  isLightOn: boolean = true;
  isLightOnRequestedInNextCycle: boolean = false;
  isLightOffRequestedInNextCycle: boolean = false;
  numLightOptions: number = 2;
  lightSwitch: any;
  mitochondrion: SVG;
  mitochondrionBattery1: SVG;
  mitochondrionBattery1StartX = this.MITOCHONDRION_X + 100;
  mitochondrionBattery1StartY = this.MITOCHONDRION_Y + 100;
  mitochondrionBattery2StartX = this.MITOCHONDRION_X + 175;
  mitochondrionBattery2StartY = this.MITOCHONDRION_Y + 50;
  mitochondrionBattery2: SVG;
  numPhotonsNextCycle: number;
  numPhotonsThisCycle: number = 4;
  photonChloroplast1: SVG;
  photonChloroplast2: SVG;
  photonChloroplast3: SVG;
  photonChloroplast4: SVG;
  photonPlant1: SVG;
  photonPlant2: SVG;
  photonPlant3: SVG;
  photonPlant4: SVG;
  photonsGroup: SVG;
  plantAnimationCorner: PlantAnimationCorner;
  playBackControl: PlayBackControl;
  simulationEndFeedback: SimulationEndFeedback;
  simulationSpeedSwitch: SimulationSpeedSwitch;
  simulationState: SimulationState = SimulationState.Stopped;
  storage: SVG;

  // the current total amount of glucose created/used/stored
  totalGlucoseCreated = this.initialGlucoseCreated;
  totalGlucoseUsed = this.initialGlucoseUsed;
  totalGlucoseStored = this.initialGlucoseStored;

  // an array of trial data objects including the current trial
  trials: any[] = [];

  wiseAPI: WISEAPI;

  /**
   * Instantiates variables with initial values for objects
   * within the simulation. Controlling the simulation (play/pause/reset)
   * is done through the PlayBackControl and SimulationSpeedSwitch class.
   * @param elementId A string containing the id of the DOM element where
   * the simulation should be displayed
   * @param numLightOptions A number containing the number of options for light.
   * 2 = On/Off, 3 = Full/Half/Off, 5 = 100%/75%/50%/25%/0%
   * @param feedbackPolicy A string containing the identifier of the feedback
   * to use.
   * @param showGraph A boolean whether the graph should be displayed or not
   */
  constructor(elementId: string, numLightOptions: number = 2,
      feedbackPolicy: any = null, showGraph: boolean = true,
      showLineGlucoseMade: boolean = true, showLineGlucoseUsed: boolean = true,
      showLineGlucoseStored: boolean = true) {
    this.draw = SVG(elementId);
    this.numLightOptions = numLightOptions;
    if (this.numLightOptions === 2) {
      this.lightSwitch = new LightSwitch2(this);
    } else if (this.numLightOptions === 3) {
      this.lightSwitch = new LightSwitch3(this);
    } else if (this.numLightOptions === 5) {
      this.lightSwitch = new LightSwitch5(this);
    }
    this.simulationSpeedSwitch = new SimulationSpeedSwitch(this);
    this.playBackControl = new PlayBackControl(this);
    this.plantAnimationCorner = new PlantAnimationCorner(this.draw, this.BG_COLOR_LIGHT_100,
        this.BG_COLOR_LIGHT_75, this.BG_COLOR_LIGHT_50,
        this.BG_COLOR_LIGHT_25, this.BG_COLOR_LIGHT_0);
    this.dayDisplayCorner = new DayDisplayCorner(this.draw,
        this.BG_COLOR_LIGHT_100, this.BG_COLOR_LIGHT_75, this.BG_COLOR_LIGHT_50,
        this.BG_COLOR_LIGHT_25, this.BG_COLOR_LIGHT_0);
    this.simulationEndFeedback = new SimulationEndFeedback(this.draw);
    this.energyIndicatorView = new EnergyIndicatorView(this.draw);
    this.graph = new Graph(this, this.BG_COLOR_LIGHT_100, this.BG_COLOR_LIGHT_75, this.BG_COLOR_LIGHT_50,
        this.BG_COLOR_LIGHT_25, this.BG_COLOR_LIGHT_0, showGraph, showLineGlucoseMade,
        showLineGlucoseUsed, showLineGlucoseStored);
    this.feedback = new Feedback(this.draw, feedbackPolicy);
    this.chloroplast = this.draw.image('./images/chloroplast.png')
        .attr({ 'x': this.CHLOROPLAST_X, 'y': this.CHLOROPLAST_Y });
    this.mitochondrion = this.draw.image('./images/mitochondrion.png')
        .attr({ 'x': this.MITOCHONDRION_X, 'y': this.MITOCHONDRION_Y });
    this.storage = this.draw.image('./images/storage.png')
        .attr({ 'x': this.STORAGE_X, 'y': this.STORAGE_Y });
    this.wiseAPI = new WISEAPI();
    this.startNewTrial();
  }

  startSimulation() {
    this.simulationState = SimulationState.Running;
    this.playAnimationCycle();
  }

  resumeSimulation() {
    this.simulationState = SimulationState.Running;
    this.currentAnimation.play();
  }

  isSimulationStopped() : boolean {
    return this.simulationState === SimulationState.Stopped;
  }

  isSimulationPaused() : boolean {
    return this.simulationState === SimulationState.Paused;
  }

  isSimulationRunning() : boolean {
    return this.simulationState === SimulationState.Running;
  }

  /**
   * Initialize and adds a new trial to all trials array
   */
  startNewTrial() {
    this.currentTrialData = {
      id: new Date().getTime(),
      name: 'Trial ' + (this.trials.length + 1),
      glucoseCreatedData: [[0, this.initialGlucoseCreated]],
      glucoseUsedData: [[0, this.initialGlucoseUsed]],
      glucoseStoredData: [[0, this.initialGlucoseStored]],
      events: []
    };
    this.trials.push(this.currentTrialData);
    this.saveCurrentTrialData();
  }

  /**
   * Update the glucose values
   * @param dayNumber which day to update values for
   * @param glucoseCreated whether glucose was created
   * @param glucoseUsed whether glucose was used
   */
  updateGlucoseValues(dayNumber: number, glucoseCreated: boolean,
      glucoseUsed: boolean) {
    if (glucoseCreated) {
      this.totalGlucoseCreated += this.glucoseCreatedIncrement;
    }
    if (glucoseUsed) {
      this.totalGlucoseUsed += this.glucoseUsedIncrement;
    }
    this.totalGlucoseStored = this.totalGlucoseCreated - this.totalGlucoseUsed;
    this.currentTrialData.glucoseCreatedData.push([dayNumber, this.totalGlucoseCreated]);
    this.currentTrialData.glucoseUsedData.push([dayNumber, this.totalGlucoseUsed]);
    this.currentTrialData.glucoseStoredData.push([dayNumber, this.totalGlucoseStored]);
  }

  /**
   * Run the plant animation cycle once.
   *
   * A cycle is one complete cycle, either with light on or off.
   *
   * The light can be switched on/off during the cycle, but it will not take
   * effect until the next cycle
   */
  playAnimationCycle() {
    this.currentDayNumber++;
    if (this.currentDayNumber > this.MAX_DAYS) {
      this.handleSimulationEnded();
    } else {
      this.dayDisplayCorner.updateDayText('Day ' + this.currentDayNumber);

      if (this.numPhotonsNextCycle != null &&
          this.numPhotonsNextCycle != this.numPhotonsThisCycle) {
        this.updateNumPhotonsThisCycle(this.numPhotonsNextCycle);
        this.lightSwitch.hideWaitImage();
      }

      if (this.glucosesInStorage.length === 0 &&
          this.numPhotonsThisCycle === 0) {
        // there is no energy coming in or stored. The plant dies now.
        this.currentAnimation = this.draw.animate(
            {'duration': this.animationDuration * 3})
            .during((pos, morph, eased, situation) => {
              let startingEnergy = parseInt(this.energyLeft);
              this.drainEnergy(100 /* start */, 0 /* end */, pos);
            })
            .afterAll(() => {
              this.disableControlButtons();
              this.startPlantDeathSequence();
            });
      } else if (this.numPhotonsThisCycle > 0) {
        this.movePhotonsToPlantAndChloroplast(
            this.animationCallback.bind(this));
      } else if (this.glucosesInStorage.length > 0) {
        this.moveGlucoseFromStorageToMitochondrion(
            this.animationCallback.bind(this));
      }
      this.numPhotonsNextCycle = null;
    }
  }

  updateNumPhotonsThisCycle(numPhotonsThisCycle: number) {
    this.numPhotonsThisCycle = numPhotonsThisCycle;
    this.glucoseCreatedIncrement = numPhotonsThisCycle;
    this.dayDisplayCorner.updateDayColor(numPhotonsThisCycle);
    this.plantAnimationCorner.updateBackground(numPhotonsThisCycle);
  }

  animationCallback() {
    const isGlucoseCreated = true;
    const isGlucoseUsed = true;
    this.updateGlucoseValues(this.currentDayNumber, isGlucoseCreated,
        isGlucoseUsed);
    this.graph.updateGraph(this.currentTrialData, this.currentDayNumber,
        this.numPhotonsThisCycle);

    this.saveCurrentTrialData();
    this.loopAnimationAfterBriefPause();
  }

  saveCurrentTrialData() {
    if (this.wiseAPI) {
      let state = {
        messageType: 'studentDataChanged',
        isAutoSave: false,
        isSubmit: false,
        studentData:
            {
              'trial': this.convertToHighchartsTrial(this.currentTrialData)
            }
      };

      this.wiseAPI.sendMessage(state);
    }
  }

  convertToHighchartsTrial(trialData) {
    let convertedTrial = {
      id: trialData.id,
      name: trialData.name,
      series: []
    };

    let glucoseCreatedSeries = this.convertToHighchartsSeries(
        trialData.id + '-glucoseMade',
        'Total Glucose Made',
        '#72ae2e',
        'shortDot',
        'circle',
        trialData.glucoseCreatedData);

    let glucoseUsedSeries = this.convertToHighchartsSeries(
        trialData.id + '-glucoseUsed',
        'Total Glucose Used',
        '#f17d00',
        'shortDash',
        'circle',
        trialData.glucoseUsedData);
    let glucoseStoredSeries = this.convertToHighchartsSeries(
        trialData.id + '-glucoseStored',
        'Total Glucose Stored',
        '#459db6',
        'dot',
        'circle',
        trialData.glucoseStoredData);
    convertedTrial.series.push(glucoseCreatedSeries);
    convertedTrial.series.push(glucoseUsedSeries);
    convertedTrial.series.push(glucoseStoredSeries);
    return convertedTrial;
  }

  convertToHighchartsSeries(seriesId, seriesName, seriesColor, dashStyle, markerSymbol, seriesData) {
    let convertedSeries = {
      id: seriesId,
      name: seriesName,
      color: seriesColor,
      dashStyle: dashStyle,
      marker: { symbol: markerSymbol },
      data: []
    };
    for (let seriesDataPoint of seriesData) {
      convertedSeries.data.push(
          {
            x: seriesDataPoint[0],
            y: seriesDataPoint[1]
          }
      );
    }
    return convertedSeries;
  }


  loopAnimationAfterBriefPause() {
    window.setTimeout(() => {
      this.playAnimationCycle();
    }, this.animationDuration);
  }

  movePhotonsToPlantAndChloroplast(animationCallback: () => {}) {
    this.photonsGroup = this.createPhotons();
    this.currentAnimation = this.photonsGroup;
    this.photonsGroup.animate({'duration': this.animationDuration})
        .move(50, 50)
        .during((pos, morph, eased, situation) => {
          this.drainEnergy(100 /* start */, 75 /* end */, pos);
        })
        .animate({'duration': this.animationDuration})
        .attr({'opacity': 0})
        .during((pos, morph, eased, situation) => {
          this.drainEnergy(75 /* start */, 50 /* end */, pos);
        })
        .afterAll(() => {
          this.photonsGroup.remove();
          this.photonsGroup = null;
          this.createGlucosesToMitochondrion();
          this.createGlucosesToStorage();
          this.moveGlucoseFromChloroplastToMitochondrion(animationCallback);
        });
  }

  moveGlucoseFromChloroplastToMitochondrion(animationCallback: () => {}) {
    this.currentAnimation = this.draw.set();
    if (this.glucoseToMitochondrion2 != null) {
      this.glucoseToMitochondrion2.animate(
          {'delay': this.animationDelay, 'duration': this.animationDuration})
          .dmove(20, 350)
          .animate({'duration': this.animationDuration}).attr({'opacity': 0})
          .afterAll(() => {
            this.glucoseToMitochondrion2 = null;
            this.mitochondrionBattery2 = this.createBattery(
                this.mitochondrionBattery2StartX, this.mitochondrionBattery2StartY);
          });
      this.currentAnimation.add(this.glucoseToMitochondrion2);
    }

    this.glucoseToMitochondrion1.animate(
        {'delay': this.animationDelay, 'duration': this.animationDuration})
        .dmove(20, 350)
        .during((pos, morph, eased, situation) => {
          this.drainEnergy(50 /* start */, 35 /* end */, pos);
        })
        .animate({'duration': this.animationDuration}).attr({'opacity': 0})
        .during((pos, morph, eased, situation) => {
          this.drainEnergy(35 /* start */, 20 /* end */, pos);
        })
        .afterAll(() => {
          this.glucoseToMitochondrion1.remove();
          this.mitochondrionBattery1 =
              this.createBattery(this.mitochondrionBattery1StartX,
                  this.mitochondrionBattery1StartY);
          if (this.numPhotonsThisCycle === 1 && !this.glucoseToMitochondrion2) {
            this.moveGlucoseFromStorageToMitochondrion(() => {
              this.moveBatteryFromMitochondrionToEnergyIndicator(animationCallback);
            }, true /* requires assist */);
          } else {
            this.moveBatteryFromMitochondrionToEnergyIndicator(animationCallback);
          }
        });
    this.currentAnimation.add(this.glucoseToMitochondrion1);
  }

  /**
   * Update EnergyLeft to a value between from and to, based on the ratio.
   * @param from A number between 0 -> 100 starting max
   * @param to A number between 0 -> 100 ending min
   * @param ratio A number between 0 -> 1 ratio between from and to that
   * should be the new energyLeft
   */
  drainEnergy(from: number, to: number, ratio: number) {
    this.energyLeft = from - ((from - to) * ratio);
    this.energyIndicatorView.updateEnergyDisplay(this.energyLeft);
  }

  createPhotonToPlant(x: number, y: number) {
    return this.draw.image('./images/photon.png', 30, 30)
        .attr({ 'x': x, 'y': y });
  }

  createPhotonToChloroplast(x: number, y: number) {
    return this.draw.image('./images/photon.png', 50, 50)
        .attr({ 'x': x, 'y': y });
  }

  createPhotons() {
    const photonsGroup = this.draw.group();
    if (this.glucoseCreatedIncrement >= 1) {
      this.photonPlant1 = this.createPhotonToPlant(80, 50);
      this.photonChloroplast1 = this.createPhotonToChloroplast(530, 60);
      photonsGroup.add(this.photonPlant1).add(this.photonChloroplast1)
    }
    if (this.glucoseCreatedIncrement >= 2) {
      this.photonPlant2 = this.createPhotonToPlant(80, 20);
      this.photonChloroplast2 = this.createPhotonToChloroplast(570, 30);
      photonsGroup.add(this.photonPlant2).add(this.photonChloroplast2)
    }
    if (this.glucoseCreatedIncrement >= 3) {
      this.photonPlant3 = this.createPhotonToPlant(30, 50);
      this.photonChloroplast3 = this.createPhotonToChloroplast(430, 60);
      photonsGroup.add(this.photonPlant3).add(this.photonChloroplast3)
    }
    if (this.glucoseCreatedIncrement === 4) {
      this.photonPlant4 = this.createPhotonToPlant(50, 20);
      this.photonChloroplast4 = this.createPhotonToChloroplast(470, 30);
      photonsGroup.add(this.photonPlant4).add(this.photonChloroplast4);
    }
    return photonsGroup;
  }

  createGlucose(x: number, y: number) {
    return this.draw.image('./images/glucose.png', 70, 70).attr({
      'x': x,
      'y': y
    });
  }

  /**
   * Create glucose that will be moved from chloroplast
   * to mitochondrion and returns a group containing them
   */
  createGlucosesToMitochondrion() {
    if (this.glucoseCreatedIncrement >= 1) {
      this.glucoseToMitochondrion1 = this.createGlucose(600, 150);
    }
    if (this.glucoseCreatedIncrement >= 2) {
      this.glucoseToMitochondrion2 = this.createGlucose(675, 100);
    }
  }

  /**
   * Create glucose that will be moved from chloroplast
   * to storage and returns a group containing them
   */
  createGlucosesToStorage() {
    if (this.glucoseCreatedIncrement === 3) {
      this.glucoseToStorage1 = this.createGlucose(450, 100);
    } else if (this.glucoseCreatedIncrement === 4) {
      this.glucoseToStorage1 = this.createGlucose(450, 100);
      this.glucoseToStorage2 = this.createGlucose(525, 150);
    }
  }

  moveGlucoseFromChloroplastToStorage(animationCallback: () => {}) {
    this.currentAnimation = this.draw.set();

    let buffer = 25;

    // move the glucose to storage in rows
    this.glucoseToStorage1.animate(
        {'delay': this.animationDelay,
        'duration': this.animationDuration})
        .move(this.STORAGE_X + ((this.glucosesInStorage.length / 2) % 5) * 75 - buffer,
            this.STORAGE_Y +
            (Math.floor((this.glucosesInStorage.length / 2) / 5)) * 75 - buffer)
        .afterAll(() => {
          this.glucosesInStorage.push(this.glucoseToStorage1.clone());
          this.glucoseToStorage1.remove();
          this.glucoseToStorage1 = null;
          animationCallback();
        });
    this.currentAnimation.add(this.glucoseToStorage1);
    if (this.glucoseCreatedIncrement === 4) {
      this.glucoseToStorage2.animate(
          {'delay': this.animationDelay,
          'duration': this.animationDuration})
          .move(this.STORAGE_X + ((this.glucosesInStorage.length / 2) % 5) * 75 + buffer,
              this.STORAGE_Y +
              (Math.floor((this.glucosesInStorage.length / 2) / 5)) * 75 + buffer)
          .afterAll(() => {
            this.glucosesInStorage.push(this.glucoseToStorage2.clone());
            this.glucoseToStorage2.remove();
            this.glucoseToStorage2 = null;
          });
      this.currentAnimation.add(this.glucoseToStorage2);
    }
  }

  /**
   * Move the glucose to center of mitochondrion during light OFF cycle
   * @param animationCallback A callback of animation
   */
  moveGlucoseFromStorageToMitochondrion(
      animationCallback: () => {}, requiresAssist: boolean = false) {
    if (this.glucosesInStorage.length === 0) {
      animationCallback();
    } else {
      this.currentAnimation = this.draw.set();
      const glucose1InStorage = this.glucosesInStorage[this.glucosesInStorage.length - 1];

      if (this.glucosesInStorage.length >= 2 && !requiresAssist) {
        const glucose2InStorage = this.glucosesInStorage[this.glucosesInStorage.length - 2];

        if (glucose2InStorage != null) {
          glucose2InStorage.animate({'duration': this.animationDuration})
              .move(this.mitochondrionBattery2StartX,
                  this.mitochondrionBattery1StartY)
              .animate({'duration': this.animationDuration})
              .opacity(0)
              .afterAll(() => {
                this.mitochondrionBattery2 =
                    this.createBattery(this.mitochondrionBattery2StartX,
                        this.mitochondrionBattery2StartY);
              });
          this.currentAnimation.add(glucose2InStorage);
        }
      }
      let moveToX = this.mitochondrionBattery1StartX;
      let moveToY = this.mitochondrionBattery1StartY;
      if (requiresAssist) {
        moveToX = this.mitochondrionBattery2StartX;
        moveToY = this.mitochondrionBattery2StartY;
      }
      glucose1InStorage.animate({'duration': this.animationDuration})
          .move(moveToX, moveToY)
          .during((pos, morph, eased, situation) => {
            if (!requiresAssist) {
              this.drainEnergy(100 /* start */, 75 /* end */, pos);
            }
          })
          .animate({'duration': this.animationDuration})
          .opacity(0)
          .during((pos, morph, eased, situation) => {
            if (!requiresAssist) {
              this.drainEnergy(75 /* start */, 50 /* end */, pos);
            }
          })
          .afterAll(() => {
            // remove the last glucose from storage
            this.glucosesInStorage.splice(this.glucosesInStorage.length - 1, 1);
            glucose1InStorage.remove();
            glucose1InStorage = null;
            if (glucose2InStorage != null) {
              this.glucosesInStorage.splice(this.glucosesInStorage.length - 1, 1);
              glucose2InStorage.remove();
              glucose2InStorage = null;
            }
            if (this.numPhotonsThisCycle === 1) {
              this.mitochondrionBattery2 =
                  this.createBattery(this.mitochondrionBattery2StartX,
                      this.mitochondrionBattery2StartY);
              animationCallback();
            } else {
              this.mitochondrionBattery1 =
                  this.createBattery(this.mitochondrionBattery1StartX,
                      this.mitochondrionBattery1StartY);
              this.moveBatteryFromMitochondrionToEnergyIndicator(animationCallback);
            }
          });
      this.currentAnimation.add(glucose1InStorage);
      }
  }

  moveBatteryFromMitochondrionToEnergyIndicator(animationCallback: () => {}) {
    this.currentAnimation = this.draw.set();
    // move battery 2 to transport nutrients
    if (this.mitochondrionBattery2 != null) {
      this.mitochondrionBattery2.animate(
          {'delay': this.animationDelay,
          'duration': this.animationDuration})
          .move(this.BATTERY_EMPTY_TRANSPORT_NUTRIENTS_X,
              this.BATTERY_EMPTY_TRANSPORT_NUTRIENTS_Y)
          .afterAll(() => {
          });
      this.currentAnimation.add(this.mitochondrionBattery2);
    }

    // move mitochondrion battery 1 to repair damage
    this.mitochondrionBattery1.animate(
        {'delay': this.animationDelay,
        'duration': this.animationDuration})
        .move(this.BATTERY_EMPTY_REPAIR_DAMAGE_X,
            this.BATTERY_EMPTY_REPAIR_DAMAGE_Y)
        .during((pos, morph, eased, situation) => {
          if (this.isLightOn) {
            this.drainEnergy(20 /* start */, 5 /* end */, pos);
          } else {
            this.drainEnergy(50 /* start */, 5 /* end */, pos);
          }
        })
        .afterAll(() => {
          if (this.mitochondrionBattery2 != null) {
            this.resetEnergyToFull();
            this.removeMitochondrionBatteries();
            if (this.glucoseCreatedIncrement >= 3) {
              this.moveGlucoseFromChloroplastToStorage(animationCallback);
            } else {
              // there is no glucose to move to storage, so
              // go directly to the callback
              animationCallback();
            }
          } else {
            this.disableControlButtons();
            this.startPlantDeathSequence();
          }
        });
    this.currentAnimation.add(this.mitochondrionBattery1);
  }

  resetEnergyToFull() {
    this.energyLeft = 100;
    this.energyIndicatorView.updateEnergyDisplay(this.energyLeft);
  }

  handleSimulationEnded() {
    this.addEvent('simulationEnded');
    this.pauseSimulation();
    this.simulationEndFeedback.showSimulationEnded();
    this.disableControlButtons();
  }

  startPlantDeathSequence() {
    this.currentAnimation = this.draw
      .animate(3000 * this.animationSpeedRatio)
      .during((pos, morph, eased, situation) => {
        // show the death sequence animation leaf based on time
        if (pos < .33) {
          this.plantAnimationCorner.showLightGreenLeaf();
        } else if (pos < .66) {
          this.plantAnimationCorner.showYellowLeaf();
        } else {
          this.plantAnimationCorner.showDeadLeaf();
        }
      })
      .afterAll(() => {
        this.addEvent('plantDied');
        this.simulationEndFeedback.showPlantDied();
        const glucoseCreated = false;
        const glucoseUsed = false;
        this.updateGlucoseValues(this.currentDayNumber, glucoseCreated,
            glucoseUsed);
        this.graph.updateGraph(this.currentTrialData,
            this.currentDayNumber, this.numPhotonsThisCycle);
        this.saveCurrentTrialData();
      });
  }

  removeMitochondrionBatteries() {
    if (this.mitochondrionBattery1 != null) {
      this.mitochondrionBattery1.remove();
      this.mitochondrionBattery1 = null;
    }
    if (this.mitochondrionBattery2 != null) {
      this.mitochondrionBattery2.remove();
      this.mitochondrionBattery2 = null;
    }
  }

  removeGlucoses() {
    if (this.glucoseToStorage1 != null) {
      this.glucoseToStorage1.remove();
    }
    if (this.glucoseToStorage2 != null) {
      this.glucoseToStorage2.remove();
    }
    if (this.glucoseToMitochondrion1 != null) {
      this.glucoseToMitochondrion1.remove();
    }
    if (this.glucoseToMitochondrion2 != null) {
      this.glucoseToMitochondrion2.remove();
    }
  }

  removeGlucosesInStorage() {
    this.glucosesInStorage.map((glucoseInStorage) => {
      glucoseInStorage.remove();
    });
    this.glucosesInStorage = [];
  }

  resetSimulation() {
    this.enableControlButtons();
    this.playBackControl.showPlayButton();
    this.simulationState = SimulationState.Stopped;

    if (this.currentAnimation != null) {
      this.currentAnimation.stop();
      this.currentAnimation = null;
    }
    if (this.photonsGroup != null) {
      this.photonsGroup.remove();
    }
    this.removeGlucoses();
    this.removeGlucosesInStorage();
    this.removeMitochondrionBatteries();
    this.resetEnergyToFull();
    this.plantAnimationCorner.showGreenLeaf();
    this.dayDisplayCorner.updateDayText('Day 1');

    // re-initialize the variables
    this.currentDayNumber = 0;
    this.totalGlucoseCreated = this.initialGlucoseCreated;
    this.totalGlucoseUsed = this.initialGlucoseUsed;
    this.totalGlucoseStored = this.initialGlucoseStored;
    this.simulationEndFeedback.hideAll();
    this.graph.resetGraph();
    this.feedback.hideFeedback();
    this.lightSwitch.hideWaitImage();
    this.startNewTrial();
  }

  disableControlButtons() {
    this.isControlEnabled = false;
    this.lightSwitch.disableUserInput();
    this.simulationSpeedSwitch.disableUserInput();
    $('#playPause').css('opacity', 0.3);
  }

  enableControlButtons() {
    this.isControlEnabled = true;
    this.lightSwitch.enableUserInput();
    this.simulationSpeedSwitch.enableUserInput();
    $('#playPause').css('opacity', 1);
  }

  /**
   * Add an event to the current trial data
   * @param eventName the name of the event
   */
  addEvent(eventName: string) {
    const event: Event = {
      name: eventName,
      timestamp: new Date().getTime()
    };
    this.currentTrialData.events.push(event);
  }

  pauseSimulation() {
    this.playBackControl.showPlayButton();
    if (this.currentAnimation != null) {
      this.currentAnimation.pause();
    }
    this.simulationState = SimulationState.Paused;
  }

  /**
   * @param newAnimationSpeedRatio A number for the new animation speed
   */
  updateAnimationSpeedRatio(newAnimationSpeedRatio: number) {
    this.animationSpeedRatio = newAnimationSpeedRatio;
    this.animationDuration =
        this.DEFAULT_ANIMATION_DURATION * this.animationSpeedRatio;
    this.animationDelay =
        this.DEFAULT_ANIMATION_DELAY * this.animationSpeedRatio;
  }

  /**
   * Updates the number of photons coming in from light source
   *
   * If the request comes during an animation cycle, set a variable flag and
   * show a wait image so the user knows the change will take effect
   * at the beginning of the next animation cycle.
   *
   * @param numPhotonsNextCycle the new photon count requested by
   * the user. Possible values are 0, 1, 2, 3, or 4
   */
   handleLightChangeRequest(numPhotonsNextCycle: number) {
     if (this.currentAnimation != null) {
       this.lightSwitch.showWaitImage();
       this.numPhotonsNextCycle = numPhotonsNextCycle;
     } else {
       // animation is stopped, so update the light setting now
       this.updateNumPhotonsThisCycle(numPhotonsNextCycle);
     }
   }

  createBattery(x: number, y: number) {
    return this.draw.image('./images/batteryFull.png').attr({ 'x': x, 'y': y });
  }
}
