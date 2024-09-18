import { DayDisplayCorner } from './dayDisplayCorner';
import { EnergyIndicatorView } from './energyIndicatorView';
import { Event } from './event';
import { Feedback } from './feedback';
import { Graph } from './graph';
import { LightSwitch } from './lightSwitch';
import { LightSwitch3 } from './lightSwitch3';
import { LightSwitch5 } from './lightSwitch5';
import { WaterSwitch } from './waterSwitch';
import { PlantAnimationCorner } from './plantAnimationCorner';
import { SimulationEndFeedback } from './simulationEndFeedback';
import { SimulationSpeedSwitch } from './simulationSpeedSwitch';
import { SimulationState } from './simulationState';
import * as SVG from 'svg.js';
type SVG = typeof SVG;
import 'svg.draggable.js';
import * as $ from 'jquery';
import { WISEAPI } from './wiseAPI';
import { Battery1 } from './battery1';
import { Battery2 } from './battery2';
import { GlucoseToStorage1 } from './glucoseToStorage1';
import { GlucoseToStorage2 } from './glucoseToStorage2';
import { GlucoseToMitochondrion1 } from './glucoseToMitochondrion1';
import { GlucoseToMitochondrion2 } from './glucoseToMitochondrion2';
import { Photons } from './photons';
import { Waters } from './waters';

/**
 * PlantGlucoseSimulation --- Simulation showing the inside of a plant
 * during Photosynthesis.
 * @author Hiroki Terashima
 * @author Geoffrey Kwan
 * @author Jonathan Lim-Breitbart
 */
export class PlantGlucoseSimulation {
  BATTERY_EMPTY_REPAIR_DAMAGE_X: number = 325;
  BATTERY_EMPTY_REPAIR_DAMAGE_Y: number = 815;
  BATTERY_EMPTY_TRANSPORT_NUTRIENTS_X: number = 625;
  BATTERY_EMPTY_TRANSPORT_NUTRIENTS_Y: number = 815;
  CHLOROPLAST_X = 400;
  CHLOROPLAST_Y = 100;

  // default amount of time (in ms) each animation should take to complete
  DEFAULT_ANIMATION_DURATION: number = 750;

  // default delay before staring animation in ms
  DEFAULT_ANIMATION_DELAY: number = 250;

  BG_COLOR_LIGHT_100: string = '#ffffca';
  BG_COLOR_LIGHT_75: string = '#fff077';
  BG_COLOR_LIGHT_50: string = '#fed34b';
  BG_COLOR_LIGHT_25: string = '#febf2c';
  BG_COLOR_LIGHT_0: string = '#dddddd';
  WATER_COLOR: string = '#0066cc';

  MITOCHONDRION_X = 500;
  MITOCHONDRION_Y = 400;
  STORAGE_X = 50;
  STORAGE_Y = 375;

  GLUCOSE_TO_STORAGE1_START_X = 400;
  GLUCOSE_TO_STORAGE1_START_Y = 100;
  GLUCOSE_TO_STORAGE2_START_X = 475;
  GLUCOSE_TO_STORAGE2_START_Y = 150;

  GLUCOSE_TO_MITOCHONDRION1_START_X = 600;
  GLUCOSE_TO_MITOCHONDRION1_START_Y = 150;
  GLUCOSE_TO_MITOCHONDRION2_START_X = 675;
  GLUCOSE_TO_MITOCHONDRION2_START_Y = 100;

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
  waterAnimation: SVG;
  currentDayNumber: number = 0;
  currentTrialData: any;
  dayDisplayCorner: DayDisplayCorner;
  draw: SVG.Doc;
  enableInputControls: boolean = true;
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

  glucoseToMitochondrion1: GlucoseToMitochondrion1;
  glucoseToMitochondrion2: GlucoseToMitochondrion2;
  glucoseToStorage1: GlucoseToStorage1;
  glucoseToStorage2: GlucoseToStorage2;
  glucosesInStorage: SVG[] = [];
  initialGlucoseCreated: number = 0;
  initialGlucoseUsed: number = 0;
  initialGlucoseStored: number = 0;
  instructions: any[] = [];
  isControlEnabled: boolean = true;
  isDroughTolerant: boolean = false;
  isShadeTolerant: boolean = false;
  isLightOn: boolean = true;
  isLightOnRequestedInNextCycle: boolean = false;
  isLightOffRequestedInNextCycle: boolean = false;
  numDays: number = 20;
  targetDays: number = 20;
  numLightOptions: number = 2;
  lightSwitch: any;
  waterSwitch: WaterSwitch;
  mitochondrion: SVG;
  mitochondrionBattery1: Battery1;
  mitochondrionBattery1StartX = this.MITOCHONDRION_X + 100;
  mitochondrionBattery1StartY = this.MITOCHONDRION_Y + 100;
  mitochondrionBattery2StartX = this.MITOCHONDRION_X + 175;
  mitochondrionBattery2StartY = this.MITOCHONDRION_Y + 50;
  mitochondrionBattery2: Battery2;
  numPhotonsNextCycle: number;
  numPhotonsThisCycle: number = 4;
  numWaterNextCycle: number;
  numWaterThisCycle: number = 4;
  public onReadyToPlay: () => void;

  private photonsGroup: Photons;
  private waterGroup: Waters;
  plantAnimationCorner: PlantAnimationCorner;
  plantImgSrc: string;
  playSequence: any[] = [];
  showKey: boolean;
  showWater: boolean;
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
   * is done through the PlayPauseButton, ResetButton, and and SimulationSpeedSwitch class.
   * @param elementId A string containing the id of the DOM element where
   * the simulation should be displayed
   * @param numLightOptions A number containing the number of options for light.
   * 2 = On/Off, 3 = Full/Half/Off, 5 = 100%/75%/50%/25%/0%
   * @param feedbackPolicy A string containing the identifier of the feedback
   * to use
   * @param showGraph A boolean whether the graph should be displayed or not
   * @param showWater A boolean whether the water control should be displayed or
   * not
   * @param showKey A boolean whether the key should be displayed or not
   */
  constructor(
    elementId: string,
    numDays: number = 20,
    numLightOptions: number = 2,
    feedbackPolicy: any = null,
    showGraph: boolean = true,
    showLineGlucoseMade: boolean = true,
    showLineGlucoseUsed: boolean = true,
    showLineGlucoseStored: boolean = true,
    showWater: boolean = true,
    showKey: boolean = true,
    enableInputControls: boolean = true,
    isDroughTolerant: boolean = false,
    isShadeTolerant: boolean = false,
    plantImgSrc: string = null
  ) {
    this.draw = SVG(elementId);
    this.numDays = this.targetDays = numDays;
    this.numLightOptions = numLightOptions;
    this.showWater = showWater;
    this.showKey = showKey;
    this.enableInputControls = enableInputControls;
    this.isDroughTolerant = isDroughTolerant;
    this.isShadeTolerant = isShadeTolerant;
    this.plantImgSrc = plantImgSrc;
    if (this.numLightOptions === 2) {
      this.lightSwitch = new LightSwitch(this, enableInputControls);
    } else if (this.numLightOptions === 3) {
      this.lightSwitch = new LightSwitch3(this, enableInputControls);
    } else if (this.numLightOptions === 5) {
      this.lightSwitch = new LightSwitch5(this, enableInputControls);
    }
    if (this.showWater) {
      this.waterSwitch = new WaterSwitch(this, enableInputControls);
    }
    if (!this.showKey) {
      $('.key').hide();
    }
    this.simulationSpeedSwitch = new SimulationSpeedSwitch(this);
    this.plantAnimationCorner = new PlantAnimationCorner(
      this.draw,
      this.BG_COLOR_LIGHT_100,
      this.BG_COLOR_LIGHT_75,
      this.BG_COLOR_LIGHT_50,
      this.BG_COLOR_LIGHT_25,
      this.BG_COLOR_LIGHT_0,
      this.showWater,
      this.plantImgSrc
    );
    this.dayDisplayCorner = new DayDisplayCorner(
      this.draw,
      this.BG_COLOR_LIGHT_100,
      this.BG_COLOR_LIGHT_75,
      this.BG_COLOR_LIGHT_50,
      this.BG_COLOR_LIGHT_25,
      this.BG_COLOR_LIGHT_0
    );
    this.simulationEndFeedback = new SimulationEndFeedback(this.draw);
    this.energyIndicatorView = new EnergyIndicatorView(this.draw);
    this.chloroplast = this.draw
      .image('./images/chloroplast.png')
      .attr({ x: this.CHLOROPLAST_X, y: this.CHLOROPLAST_Y });
    this.mitochondrion = this.draw
      .image('./images/mitochondrion.png')
      .attr({ x: this.MITOCHONDRION_X, y: this.MITOCHONDRION_Y });
    this.storage = this.draw
      .image('./images/storage.png')
      .attr({ x: this.STORAGE_X, y: this.STORAGE_Y });
    this.graph = new Graph(
      this,
      this.BG_COLOR_LIGHT_100,
      this.BG_COLOR_LIGHT_75,
      this.BG_COLOR_LIGHT_50,
      this.BG_COLOR_LIGHT_25,
      this.BG_COLOR_LIGHT_0,
      this.WATER_COLOR,
      showGraph,
      showLineGlucoseMade,
      showLineGlucoseUsed,
      showLineGlucoseStored,
      numDays
    );
    this.feedback = new Feedback(this.draw, feedbackPolicy);
    this.wiseAPI = new WISEAPI(this);
    this.startNewTrial();
    this.handleLightChangeRequest(this.numPhotonsThisCycle);
    this.handleWaterChangeRequest(this.numWaterThisCycle);
    this.setEnableControlButtons();
  }

  loadInstructions(instructions: any[]): void {
    this.playSequence = [];
    this.numDays = 0;
    for (let i = 0; i < instructions.length; i++) {
      this.addDaysToPlaySequence(instructions[i]);
    }
    this.resetSimulation();
    this.setInputValues(this.playSequence[0]);
    this.enableControlButtons();
  }

  private addDaysToPlaySequence(instruction: any): void {
    for (let i = 0; i < instruction.days; i++) {
      this.playSequence.push({
        light: instruction.light,
        water: instruction.water,
      });
      this.numDays++;
    }
  }

  private setInputControls(enable: boolean): void {
    this.lightSwitch.setEnableUserInput(enable);
    if (this.waterSwitch) {
      this.waterSwitch.setEnableUserInput(enable);
    }
  }

  private setInputValues(day: any): void {
    if (day) {
      this.handleLightChangeRequest(day.light);
      this.handleWaterChangeRequest(day.water);
    }
  }

  startSimulation(): void {
    this.simulationState = SimulationState.Running;
    this.playAnimationCycle();
  }

  resumeSimulation(): void {
    this.simulationState = SimulationState.Running;
    this.currentAnimation.play();
    if (this.waterAnimation) {
      this.waterAnimation.play();
    }
  }

  isSimulationStopped(): boolean {
    return this.simulationState === SimulationState.Stopped;
  }

  isSimulationPaused(): boolean {
    return this.simulationState === SimulationState.Paused;
  }

  isSimulationRunning(): boolean {
    return this.simulationState === SimulationState.Running;
  }

  /**
   * Initialize and adds a new trial to all trials array
   */
  startNewTrial(): void {
    this.currentTrialData = {
      id: new Date().getTime(),
      name: 'Trial ' + (this.trials.length + 1),
      glucoseCreatedData: [[0, this.initialGlucoseCreated]],
      glucoseUsedData: [[0, this.initialGlucoseUsed]],
      glucoseStoredData: [[0, this.initialGlucoseStored]],
      events: [],
    };
    this.trials.push(this.currentTrialData);
    this.notifyStudentDataChanged();
  }

  /**
   * Update the glucose values
   * @param dayNumber which day to update values for
   * @param glucoseCreated whether glucose was created
   * @param glucoseUsed whether glucose was used
   */
  private updateGlucoseValues(
    dayNumber: number,
    glucoseCreated: boolean,
    glucoseUsed: boolean
  ): void {
    if (glucoseCreated) {
      if (this.numWaterThisCycle > 0) {
        this.totalGlucoseCreated += this.glucoseCreatedIncrement;
      }
    }
    if (glucoseUsed) {
      this.updateGlucoseUsed();
    }
    this.totalGlucoseStored = this.totalGlucoseCreated - this.totalGlucoseUsed;
    this.currentTrialData.glucoseCreatedData.push([
      dayNumber,
      this.totalGlucoseCreated,
    ]);
    this.currentTrialData.glucoseUsedData.push([
      dayNumber,
      this.totalGlucoseUsed,
    ]);
    this.currentTrialData.glucoseStoredData.push([
      dayNumber,
      this.totalGlucoseStored,
    ]);
  }

  private updateGlucoseUsed(): void {
    this.totalGlucoseUsed += this.glucoseUsedIncrement;
    if (
      (this.isDroughTolerant && this.numWaterThisCycle < 4) ||
      (this.isShadeTolerant && this.numPhotonsThisCycle < 3)
    ) {
      this.totalGlucoseUsed--;
    }
  }

  /**
   * Run the plant animation cycle once.
   *
   * A cycle is one complete cycle, with light and water on or off.
   *
   * Light and water can be switched on/off during the cycle, but it will not take
   * effect until the next cycle
   */
  private playAnimationCycle(): void {
    this.currentDayNumber++;
    if (this.currentDayNumber > this.numDays) {
      this.handleSimulationEnded();
    } else {
      this.dayDisplayCorner.updateDayText('Day ' + this.currentDayNumber);

      if (
        this.numWaterNextCycle != null &&
        this.numWaterNextCycle != this.numWaterThisCycle
      ) {
        this.updateNumWaterThisCycle(this.numWaterNextCycle);
        this.waterSwitch.hideWaitImage();
      }

      if (
        this.numPhotonsNextCycle != null &&
        this.numPhotonsNextCycle != this.numPhotonsThisCycle
      ) {
        this.updateNumPhotonsThisCycle(this.numPhotonsNextCycle);
        this.lightSwitch.hideWaitImage();
      }

      if (
        this.glucosesInStorage.length === 0 &&
        (this.glucoseCreatedIncrement === 0 || this.numWaterThisCycle === 0)
      ) {
        // there is no energy coming in or stored. The plant dies now.
        this.currentAnimation = this.draw
          .animate({ duration: this.animationDuration * 3 })
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
          this.animationCallback.bind(this)
        );
      } else if (this.glucosesInStorage.length > 0) {
        this.moveGlucoseFromStorageToMitochondrion(
          this.animationCallback.bind(this)
        );
      }
      if (this.showWater) {
        this.moveWaterToPlantAndChloroplast();
      }
      const nextDay = this.playSequence[this.currentDayNumber];
      if (nextDay) {
        this.setInputValues(nextDay);
      } else {
        this.numPhotonsNextCycle = null;
        this.numWaterNextCycle = null;
      }
    }
  }

  private updateNumPhotonsThisCycle(numPhotonsThisCycle: number): void {
    this.numPhotonsThisCycle = numPhotonsThisCycle;
    this.glucoseCreatedIncrement = this.calculateGlucoseCreatedIncrement();
    this.dayDisplayCorner.updateDayColor(numPhotonsThisCycle);
    this.plantAnimationCorner.updateBackground(numPhotonsThisCycle);
  }

  private updateNumWaterThisCycle(numWaterThisCycle: number): void {
    this.numWaterThisCycle = numWaterThisCycle;
    this.plantAnimationCorner.updateWatering(numWaterThisCycle);
  }

  private animationCallback(): void {
    const isGlucoseCreated = true;
    const isGlucoseUsed = true;
    this.updateGlucoseValues(
      this.currentDayNumber,
      isGlucoseCreated,
      isGlucoseUsed
    );
    this.graph.updateGraph(
      this.currentTrialData,
      this.currentDayNumber,
      this.numPhotonsThisCycle,
      this.numWaterThisCycle
    );

    this.notifyStudentDataChanged();
    this.loopAnimationAfterBriefPause();
  }

  private notifyStudentDataChanged(): void {
    if (this.wiseAPI) {
      let state = {
        messageType: 'studentDataChanged',
        isAutoSave: false,
        isSubmit: false,
        studentData: {
          trial: this.convertToHighchartsTrial(this.currentTrialData),
        },
      };

      this.wiseAPI.sendMessage(state);
    }
  }

  private saveStudentWork(): void {
    if (this.wiseAPI) {
      let state = {
        messageType: 'studentWork',
        isAutoSave: false,
        isSubmit: false,
        studentData: {
          trials: this.trials,
        },
      };

      this.wiseAPI.sendMessage(state);
    }
  }

  private convertToHighchartsTrial(trialData: any): any {
    let convertedTrial = {
      id: trialData.id,
      name: trialData.name,
      series: [],
    };

    let glucoseCreatedSeries = this.convertToHighchartsSeries(
      trialData.id + '-glucoseMade',
      'Total Glucose Made',
      '#72ae2e',
      'shortDot',
      'circle',
      trialData.glucoseCreatedData
    );

    let glucoseUsedSeries = this.convertToHighchartsSeries(
      trialData.id + '-glucoseUsed',
      'Total Glucose Used',
      '#f17d00',
      'shortDash',
      'circle',
      trialData.glucoseUsedData
    );
    let glucoseStoredSeries = this.convertToHighchartsSeries(
      trialData.id + '-glucoseStored',
      'Total Glucose Stored',
      '#459db6',
      'dot',
      'circle',
      trialData.glucoseStoredData
    );
    convertedTrial.series.push(glucoseCreatedSeries);
    convertedTrial.series.push(glucoseUsedSeries);
    convertedTrial.series.push(glucoseStoredSeries);
    return convertedTrial;
  }

  private convertToHighchartsSeries(
    seriesId,
    seriesName,
    seriesColor,
    dashStyle,
    markerSymbol,
    seriesData
  ): any {
    let convertedSeries = {
      id: seriesId,
      name: seriesName,
      color: seriesColor,
      dashStyle: dashStyle,
      marker: { symbol: markerSymbol },
      data: [],
    };
    for (let seriesDataPoint of seriesData) {
      convertedSeries.data.push({
        x: seriesDataPoint[0],
        y: seriesDataPoint[1],
      });
    }
    return convertedSeries;
  }

  private loopAnimationAfterBriefPause(): void {
    window.setTimeout(() => {
      this.playAnimationCycle();
    }, this.animationDuration);
  }

  private movePhotonsToPlantAndChloroplast(animationCallback: () => {}): void {
    this.photonsGroup = new Photons(this);
    this.currentAnimation = this.photonsGroup.getGroup();
    this.photonsGroup.animate().afterAll(() => {
      this.photonsGroup.remove();
      this.photonsGroup = null;
      if (this.numWaterThisCycle > 0 && this.glucoseCreatedIncrement > 0) {
        this.createGlucosesToMitochondrion();
        this.createGlucosesToStorage();
        this.moveGlucoseFromChloroplastToMitochondrion(animationCallback);
      } else {
        this.moveGlucoseFromStorageToMitochondrion(animationCallback);
      }
    });
  }

  private moveWaterToPlantAndChloroplast(): void {
    this.waterGroup = new Waters(this);
    this.waterAnimation = this.waterGroup.getGroup();
    this.waterGroup.animate().afterAll(() => {
      this.waterGroup.remove();
      this.waterGroup = null;
      this.waterAnimation = null;
    });
  }

  private moveGlucoseFromChloroplastToMitochondrion(
    animationCallback: () => {}
  ): void {
    this.currentAnimation = this.draw.set();
    if (this.glucoseToMitochondrion2 != null) {
      this.glucoseToMitochondrion2.animate().afterAll(() => {
        this.glucoseToMitochondrion2 = null;
        this.mitochondrionBattery2 = new Battery2(this);
      });
      this.currentAnimation.add(this.glucoseToMitochondrion2.getImage());
    }

    this.glucoseToMitochondrion1
      .animate()

      .afterAll(() => {
        this.glucoseToMitochondrion1.remove();
        this.mitochondrionBattery1 = new Battery1(this);
        if (
          this.glucoseCreatedIncrement === 1 &&
          !this.glucoseToMitochondrion2
        ) {
          this.moveGlucoseFromStorageToMitochondrion(() => {
            this.moveBatteryFromMitochondrionToEnergyIndicator(
              animationCallback
            );
          }, true /* requires assist */);
        } else {
          this.moveBatteryFromMitochondrionToEnergyIndicator(animationCallback);
        }
      });
    this.currentAnimation.add(this.glucoseToMitochondrion1.getImage());
  }

  /**
   * Update EnergyLeft to a value between from and to, based on the ratio.
   * @param from A number between 0 -> 100 starting max
   * @param to A number between 0 -> 100 ending min
   * @param ratio A number between 0 -> 1 ratio between from and to that
   * should be the new energyLeft
   */
  drainEnergy(from: number, to: number, ratio: number): void {
    this.energyLeft = from - (from - to) * ratio;
    this.energyIndicatorView.updateEnergyDisplay(this.energyLeft);
  }

  /**
   * Create glucose that will be moved from chloroplast
   * to mitochondrion and returns a group containing them
   */
  private createGlucosesToMitochondrion(): void {
    if (this.glucoseCreatedIncrement >= 1) {
      this.glucoseToMitochondrion1 = new GlucoseToMitochondrion1(this);
    }
    if (this.glucoseCreatedIncrement >= 2) {
      this.glucoseToMitochondrion2 = new GlucoseToMitochondrion2(this);
    }
  }

  /**
   * Create glucose that will be moved from chloroplast
   * to storage and returns a group containing them
   */
  private createGlucosesToStorage(): void {
    if (this.glucoseCreatedIncrement === 3) {
      this.glucoseToStorage1 = new GlucoseToStorage1(this);
    } else if (this.glucoseCreatedIncrement === 4) {
      this.glucoseToStorage1 = new GlucoseToStorage1(this);
      this.glucoseToStorage2 = new GlucoseToStorage2(this);
    }
  }

  private moveGlucoseFromChloroplastToStorage(
    animationCallback: () => {}
  ): void {
    this.currentAnimation = this.draw.set();
    // move the glucose to storage in rows
    this.glucoseToStorage1.animate().afterAll(() => {
      this.glucosesInStorage.push(this.glucoseToStorage1.clone());
      this.glucoseToStorage1.remove();
      this.glucoseToStorage1 = null;
      animationCallback();
    });
    this.currentAnimation.add(this.glucoseToStorage1.getImage());
    if (this.glucoseCreatedIncrement === 4) {
      this.glucoseToStorage2.animate().afterAll(() => {
        this.glucosesInStorage.push(this.glucoseToStorage2.clone());
        this.glucoseToStorage2.remove();
        this.glucoseToStorage2 = null;
      });
      this.currentAnimation.add(this.glucoseToStorage2.getImage());
    }
  }

  /**
   * Move the glucose to center of mitochondrion during light OFF cycle
   * @param animationCallback A callback of animation
   */
  private moveGlucoseFromStorageToMitochondrion(
    animationCallback: () => {},
    requiresAssist: boolean = false
  ): void {
    if (this.glucosesInStorage.length === 0) {
      animationCallback();
    } else {
      this.currentAnimation = this.draw.set();
      let glucose1InStorage =
        this.glucosesInStorage[this.glucosesInStorage.length - 1];
      let glucose2InStorage = null;

      if (this.glucosesInStorage.length >= 2 && !requiresAssist) {
        glucose2InStorage =
          this.glucosesInStorage[this.glucosesInStorage.length - 2];

        if (glucose2InStorage != null) {
          if (
            (this.isDroughTolerant && this.numPhotonsThisCycle > 2) ||
            (this.isShadeTolerant && this.numWaterThisCycle > 0)
          ) {
            this.mitochondrionBattery2 = new Battery2(this);
          } else {
            glucose2InStorage
              .animate({ duration: this.animationDuration })
              .move(
                this.mitochondrionBattery2StartX,
                this.mitochondrionBattery1StartY
              )
              .animate({ duration: this.animationDuration })
              .opacity(0)
              .afterAll(() => {
                this.mitochondrionBattery2 = new Battery2(this);
              });
            this.currentAnimation.add(glucose2InStorage);
          }
        }
      }
      let moveToX = this.mitochondrionBattery1StartX;
      let moveToY = this.mitochondrionBattery1StartY;
      if (requiresAssist) {
        moveToX = this.mitochondrionBattery2StartX;
        moveToY = this.mitochondrionBattery2StartY;
      }
      glucose1InStorage
        .animate({ duration: this.animationDuration })
        .move(moveToX, moveToY)
        .during((pos, morph, eased, situation) => {
          if (!requiresAssist) {
            this.drainEnergy(100 /* start */, 75 /* end */, pos);
          }
        })
        .animate({ duration: this.animationDuration })
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
          if (
            glucose2InStorage != null &&
            ((!this.isDroughTolerant && this.numWaterThisCycle === 0) ||
              (this.numPhotonsThisCycle < 3 && !this.isShadeTolerant))
          ) {
            this.glucosesInStorage.splice(this.glucosesInStorage.length - 1, 1);
            glucose2InStorage.remove();
            glucose2InStorage = null;
          }
          if (this.glucoseCreatedIncrement === 1) {
            this.mitochondrionBattery2 = new Battery2(this);
            animationCallback();
          } else {
            this.mitochondrionBattery1 = new Battery1(this);
            this.moveBatteryFromMitochondrionToEnergyIndicator(
              animationCallback
            );
          }
        });
      this.currentAnimation.add(glucose1InStorage);
    }
  }

  private moveBatteryFromMitochondrionToEnergyIndicator(
    animationCallback: () => {}
  ): void {
    this.currentAnimation = this.draw.set();
    // move battery 2 to transport nutrients
    if (this.mitochondrionBattery2 != null) {
      this.mitochondrionBattery2.animate();
      this.currentAnimation.add(this.mitochondrionBattery2.getImage());
    }

    // move mitochondrion battery 1 to repair damage
    this.mitochondrionBattery1.animate().afterAll(() => {
      if (this.mitochondrionBattery2 != null) {
        this.resetEnergyToFull();
        this.removeMitochondrionBatteries();
        if (this.glucoseCreatedIncrement >= 3 && this.numWaterThisCycle > 0) {
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
    this.currentAnimation.add(this.mitochondrionBattery1.getImage());
  }

  private resetEnergyToFull(): void {
    this.energyLeft = 100;
    this.energyIndicatorView.updateEnergyDisplay(this.energyLeft);
  }

  private handleSimulationEnded(): void {
    this.addEvent('simulationEnded');
    this.pauseSimulation();
    if (this.currentDayNumber === this.targetDays + 1) {
      this.simulationEndFeedback.showPlantAlive();
    } else {
      this.simulationEndFeedback.showSimulationEnded();
    }
    this.disableControlButtons();
    this.saveStudentWork();
  }

  private startPlantDeathSequence(): void {
    this.currentAnimation = this.draw
      .animate(3000 * this.animationSpeedRatio)
      .during((pos, morph, eased, situation) => {
        // show the death sequence animation leaf based on time
        if (pos < 0.33) {
          this.plantAnimationCorner.showLightGreenLeaf();
        } else if (pos < 0.66) {
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
        this.updateGlucoseValues(
          this.currentDayNumber,
          glucoseCreated,
          glucoseUsed
        );
        this.graph.updateGraph(
          this.currentTrialData,
          this.currentDayNumber,
          this.numPhotonsThisCycle,
          this.numWaterThisCycle
        );
        this.notifyStudentDataChanged();
        this.saveStudentWork();
      });
  }

  private removeMitochondrionBatteries(): void {
    if (this.mitochondrionBattery1 != null) {
      this.mitochondrionBattery1.remove();
      this.mitochondrionBattery1 = null;
    }
    if (this.mitochondrionBattery2 != null) {
      this.mitochondrionBattery2.remove();
      this.mitochondrionBattery2 = null;
    }
  }

  private removeGlucoses(): void {
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

    this.glucosesInStorage.map((glucoseInStorage) => {
      glucoseInStorage.remove();
    });
    this.glucosesInStorage = [];
  }

  private isAnimationPlaying(): boolean {
    return this.currentAnimation != null;
  }

  resetSimulation(): void {
    this.simulationState = SimulationState.Stopped;

    if (this.isAnimationPlaying()) {
      this.currentAnimation.stop();
      this.currentAnimation = null;
    }
    if (this.photonsGroup != null) {
      this.photonsGroup.remove();
    }
    if (this.waterGroup != null) {
      this.waterGroup.remove();
      this.waterAnimation.stop();
      this.waterAnimation = null;
    }
    this.removeGlucoses();
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
    if (!this.enableInputControls) {
      this.setInputValues(this.playSequence[0]);
    }
    this.startNewTrial();
    this.setEnableControlButtons();
    this.onReadyToPlay();
  }

  private disableControlButtons(): void {
    this.isControlEnabled = false;
    this.setInputControls(false);
    this.simulationSpeedSwitch.disableUserInput();
    $('#playPause').css('opacity', 0.3);
  }

  private setEnableControlButtons(): void {
    if (this.enableInputControls || this.playSequence.length) {
      this.enableControlButtons();
    } else {
      this.disableControlButtons();
    }
  }

  private enableControlButtons(): void {
    this.isControlEnabled = true;
    this.setInputControls(this.enableInputControls);
    this.simulationSpeedSwitch.enableUserInput();
    $('#playPause').css('opacity', 1);
  }

  /**
   * Add an event to the current trial data
   * @param eventName the name of the event
   */
  addEvent(eventName: string): void {
    const event: Event = {
      name: eventName,
      timestamp: new Date().getTime(),
    };
    this.currentTrialData.events.push(event);
  }

  pauseSimulation(): void {
    this.onReadyToPlay();
    if (this.isAnimationPlaying()) {
      this.currentAnimation.pause();
    }
    if (this.waterAnimation != null) {
      this.waterAnimation.pause();
    }
    this.simulationState = SimulationState.Paused;
  }

  /**
   * @param newAnimationSpeedRatio A number for the new animation speed
   */
  updateAnimationSpeedRatio(newAnimationSpeedRatio: number): void {
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
  handleLightChangeRequest(numPhotonsNextCycle: number): void {
    if (this.isAnimationPlaying()) {
      this.lightSwitch.showWaitImage();
      this.numPhotonsNextCycle = numPhotonsNextCycle;
    } else {
      // animation is stopped, so update the light setting now
      this.updateNumPhotonsThisCycle(numPhotonsNextCycle);
    }
  }

  /**
   * Updates the amount of water coming in from water source
   *
   * If the request comes during an animation cycle, set a variable flag and
   * show a wait image so the user knows the change will take effect
   * at the beginning of the next animation cycle.
   *
   * @param numWaterNextCycle the new water count requested by the user.
   * Possible values are 0, 1
   */
  handleWaterChangeRequest(numWaterNextCycle: number): void {
    if (this.isAnimationPlaying()) {
      this.waterSwitch.showWaitImage();
      this.numWaterNextCycle = numWaterNextCycle;
    } else {
      // animation is stopped, so update the water setting now
      this.updateNumWaterThisCycle(numWaterNextCycle);
    }
  }

  private calculateGlucoseCreatedIncrement(): number {
    let glucoseCreatedIncrement = this.numPhotonsThisCycle;
    if (this.isShadeTolerant) {
      const shadeTolerantPhotonsToCreated: any = {
        4: 4,
        3: 4,
        2: 3,
        1: 2,
        0: 0,
      };
      glucoseCreatedIncrement =
        shadeTolerantPhotonsToCreated[this.numPhotonsThisCycle];
    }
    return glucoseCreatedIncrement;
  }
}
