import { Event } from './event';
import { Feedback } from './feedback';
import { PlantAnimationCorner } from './plantAnimationCorner';
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
import { Subject } from 'rxjs';
import { Chloroplast } from './chloroplast';
import { Storage } from './storage';
import { Mitochondrion } from './mitochondrion';
import { GlucoseToStorage } from './glucoseToStorage';
import {
  DEFAULT_ANIMATION_DELAY,
  DEFAULT_ANIMATION_DURATION,
} from './constants';
import { Settings } from './settings';
import { Trial } from './trial';
import { convertToHighchartsTrial } from './highchartsTrialConverter';
import { eventBus } from './eventBus';

/**
 * PlantGlucoseSimulation --- Simulation showing the inside of a plant
 * during Photosynthesis.
 * @author Hiroki Terashima
 * @author Geoffrey Kwan
 * @author Jonathan Lim-Breitbart
 */
export class PlantGlucoseSimulation {
  private inputControlsEnabledEvent: Subject<boolean> = new Subject<boolean>();
  public inputControlsEnabledEvent$ =
    this.inputControlsEnabledEvent.asObservable();
  private numWaterChangedEvent: Subject<number> = new Subject<number>();
  public numWaterChangedEvent$ = this.numWaterChangedEvent.asObservable();
  private lightChangedRequest: Subject<number> = new Subject<number>();
  public lightChangedRequest$ = this.lightChangedRequest.asObservable();
  private resetEvent: Subject<void> = new Subject<void>();
  public resetEvent$ = this.resetEvent.asObservable();
  private waterChangedRequest: Subject<number> = new Subject<number>();
  public waterChangedRequest$ = this.waterChangedRequest.asObservable();

  // ratio speed for each animation to complete. 0 = stop -> 1 = full speed
  animationSpeedRatio: number = 1;

  // actual amount of time (in ms) each animation should take to complete
  animationDuration: number =
    DEFAULT_ANIMATION_DURATION * this.animationSpeedRatio;

  // actual amount of time (in ms) delay before starting animation
  animationDelay: number = DEFAULT_ANIMATION_DELAY * this.animationSpeedRatio;

  private chloroplast: Chloroplast;
  private currentAnimation: SVG.Set;
  private waterAnimation: SVG.G;
  currentDayNumber: number = 0;
  currentTrial: Trial;
  draw: SVG.Doc;
  private energyLeft: number = 100;
  feedback: Feedback;

  // the amount of glucose to add/subtract each day
  private glucoseCreatedIncrement: number = 4;
  private glucoseUsedIncrement: number = 2;

  private glucoseToMitochondrion1: GlucoseToMitochondrion1;
  private glucoseToMitochondrion2: GlucoseToMitochondrion2;
  private glucoseToStorage1: GlucoseToStorage1;
  private glucoseToStorage2: GlucoseToStorage2;
  glucosesInStorage: GlucoseToStorage[] = [];
  private initialGlucoseCreated: number = 0;
  private initialGlucoseUsed: number = 0;
  private initialGlucoseStored: number = 0;
  instructions: any[] = [];
  isControlEnabled: boolean = true;
  isLightOn: boolean = true;
  numDays: number = 20;
  private mitochondrion: Mitochondrion;
  private mitochondrionBattery1: Battery1;
  private mitochondrionBattery2: Battery2;
  numPhotonsNextCycle: number;
  numPhotonsThisCycle: number = 4;
  numWaterNextCycle: number;
  numWaterThisCycle: number = 4;

  private photonsGroup: Photons;
  private waterGroup: Waters;
  private plantAnimationCorner: PlantAnimationCorner;
  private playSequence: any[] = [];
  private simulationSpeedSwitch: SimulationSpeedSwitch;
  private simulationState: SimulationState = SimulationState.Stopped;
  private storage: Storage;
  private totalGlucoseCreated = this.initialGlucoseCreated;
  private totalGlucoseUsed = this.initialGlucoseUsed;
  private totalGlucoseStored = this.initialGlucoseStored;
  private trials: any[] = []; // an array of trial data objects including the current trial
  private wiseAPI: WISEAPI;

  /**
   * Instantiates variables with initial values for objects
   * within the simulation. Controlling the simulation (play/pause/reset)
   * is done through the PlayPauseButton, ResetButton, and and SimulationSpeedSwitch class.
   * @param elementId A string containing the id of the DOM element where
   * the simulation should be displayed
   * @param settings initial settings for the simulation
   */
  constructor(elementId: string, private settings: Settings) {
    this.draw = SVG(elementId);
    this.numDays = this.settings.numDays;
    if (!this.settings.showKey) {
      $('.key').hide();
    }

    this.simulationSpeedSwitch = new SimulationSpeedSwitch(this);
    this.plantAnimationCorner = new PlantAnimationCorner(this);
    this.chloroplast = new Chloroplast(this);
    this.mitochondrion = new Mitochondrion(this);
    this.storage = new Storage(this);
    this.feedback = new Feedback(this.draw, this.settings.feedbackPolicy);
    this.wiseAPI = new WISEAPI(this);
    this.startNewTrial();
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
    this.inputControlsEnabledEvent.next(enable);
  }

  private setInputValues(day: any): void {
    if (day) {
      this.lightChangedRequest.next(day.light);
      this.waterChangedRequest.next(day.water);
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

  private startNewTrial(): void {
    this.currentTrial = new Trial(
      `Trial (${this.trials.length + 1})`,
      this.numPhotonsThisCycle,
      this.numWaterThisCycle
    );
    this.trials.push(this.currentTrial);
    this.notifyStudentDataChanged();
  }

  private updateCurrentTrial(
    glucoseCreated: boolean,
    glucoseUsed: boolean
  ): void {
    if (glucoseCreated && this.numWaterThisCycle > 0) {
      this.totalGlucoseCreated += this.glucoseCreatedIncrement;
    }
    if (glucoseUsed) {
      this.updateGlucoseUsed();
    }
    this.totalGlucoseStored = this.totalGlucoseCreated - this.totalGlucoseUsed;
    this.currentTrial.addDayData(
      this.currentDayNumber,
      this.totalGlucoseCreated,
      this.totalGlucoseUsed,
      this.totalGlucoseStored,
      this.numPhotonsThisCycle,
      this.numWaterThisCycle
    );
  }

  private updateGlucoseUsed(): void {
    this.totalGlucoseUsed += this.glucoseUsedIncrement;
    if (
      (this.settings.isDroughtTolerant && this.numWaterThisCycle < 4) ||
      (this.settings.isShadeTolerant && this.numPhotonsThisCycle < 3)
    ) {
      this.totalGlucoseUsed--;
    }
  }

  /**
   * Run the plant animation cycle once.
   * A cycle is one complete cycle, with light and water on or off.
   * Light and water can be switched on/off during the cycle, but it will not take
   * effect until the next cycle.
   */
  private playAnimationCycle(): void {
    this.currentDayNumber++;
    if (this.currentDayNumber > this.numDays) {
      this.handleSimulationEnded();
    } else {
      eventBus.emit('dayChanged', this.currentDayNumber);
      if (this.shouldUpdateNumWaterThisCycle()) {
        this.updateNumWaterThisCycle(this.numWaterNextCycle);
      }
      if (this.shouldUpdateNumPhotonsThisCycle()) {
        this.updateNumPhotonsThisCycle(this.numPhotonsNextCycle);
      }
      if (
        this.glucosesInStorage.length === 0 &&
        (this.glucoseCreatedIncrement === 0 || this.numWaterThisCycle === 0)
      ) {
        // there is no energy coming in or stored. The plant dies now.
        this.currentAnimation = this.draw
          .animate({ duration: this.animationDuration * 3 })
          .during((pos, morph, eased, situation) => {
            this.drainEnergy(100, 0, pos);
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
      if (this.settings.showWater) {
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

  private shouldUpdateNumWaterThisCycle(): boolean {
    return (
      this.numWaterNextCycle != null &&
      this.numWaterNextCycle != this.numWaterThisCycle
    );
  }

  private shouldUpdateNumPhotonsThisCycle(): boolean {
    return (
      this.numPhotonsNextCycle != null &&
      this.numPhotonsNextCycle != this.numPhotonsThisCycle
    );
  }

  updateNumPhotonsThisCycle(numPhotonsThisCycle: number): void {
    this.numPhotonsThisCycle = numPhotonsThisCycle;
    eventBus.emit('numPhotonsChanged', numPhotonsThisCycle);
    this.glucoseCreatedIncrement = this.calculateGlucoseCreatedIncrement();
  }

  updateNumWaterThisCycle(numWaterThisCycle: number): void {
    this.numWaterThisCycle = numWaterThisCycle;
    this.numWaterChangedEvent.next(numWaterThisCycle);
  }

  private animationCallback(): void {
    this.updateCurrentTrial(true, true);
    this.notifyStudentDataChanged();
    this.loopAnimationAfterBriefPause();
  }

  private notifyStudentDataChanged(): void {
    eventBus.emit('studentDataChanged');
    if (this.wiseAPI) {
      let state = {
        messageType: 'studentDataChanged',
        isAutoSave: false,
        isSubmit: false,
        studentData: {
          trial: convertToHighchartsTrial(this.currentTrial),
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
    eventBus.emit('energyLeftChanged', this.energyLeft);
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
      let glucose2InStorage: GlucoseToStorage = null;

      if (this.glucosesInStorage.length >= 2 && !requiresAssist) {
        glucose2InStorage =
          this.glucosesInStorage[this.glucosesInStorage.length - 2];

        if (glucose2InStorage != null) {
          if (
            (this.settings.isDroughtTolerant && this.numPhotonsThisCycle > 2) ||
            (this.settings.isShadeTolerant && this.numWaterThisCycle > 0)
          ) {
            this.mitochondrionBattery2 = new Battery2(this);
          } else {
            glucose2InStorage
              .animate()
              .move(
                this.getMitochondrionBattery2StartPosition().x,
                this.getMitochondrionBattery1StartPosition().y
              )
              .animate()
              .opacity(0)
              .afterAll(() => {
                this.mitochondrionBattery2 = new Battery2(this);
              });
            this.currentAnimation.add(glucose2InStorage);
          }
        }
      }
      let moveToX = this.getMitochondrionBattery1StartPosition().x;
      let moveToY = this.getMitochondrionBattery1StartPosition().y;
      if (requiresAssist) {
        moveToX = this.getMitochondrionBattery2StartPosition().x;
        moveToY = this.getMitochondrionBattery2StartPosition().y;
      }
      glucose1InStorage
        .animate()
        .move(moveToX, moveToY)
        .during((pos, morph, eased, situation) => {
          if (!requiresAssist) {
            this.drainEnergy(100, 75, pos);
          }
        })
        .animate()
        .opacity(0)
        .during((pos, morph, eased, situation) => {
          if (!requiresAssist) {
            this.drainEnergy(75, 50, pos);
          }
        })
        .afterAll(() => {
          // remove the last glucose from storage
          this.glucosesInStorage.splice(this.glucosesInStorage.length - 1, 1);
          glucose1InStorage.remove();
          glucose1InStorage = null;
          if (
            glucose2InStorage != null &&
            ((!this.settings.isDroughtTolerant &&
              this.numWaterThisCycle === 0) ||
              (this.numPhotonsThisCycle < 3 && !this.settings.isShadeTolerant))
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
    this.mitochondrionBattery1
      .animate()
      .during((pos, morph, eased, situation) => {
        if (this.isLightOn) {
          this.drainEnergy(20, 5, pos);
        } else {
          this.drainEnergy(50, 5, pos);
        }
      })
      .afterAll(() => {
        if (this.mitochondrionBattery2 != null) {
          this.resetEnergyToFull();
          this.removeMitochondrionBatteries();
          if (this.glucoseCreatedIncrement >= 3 && this.numWaterThisCycle > 0) {
            this.moveGlucoseFromChloroplastToStorage(animationCallback);
          } else {
            // there is no glucose to move to storage, so go directly to the callback
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
    eventBus.emit('energyLeftChanged', this.energyLeft);
  }

  private handleSimulationEnded(): void {
    this.addEvent('simulationEnded');
    this.pauseSimulation();
    if (this.currentDayNumber === this.numDays + 1) {
      eventBus.emit('statusChanged', 'survived');
    } else {
      eventBus.emit('statusChanged', 'ended');
    }
    this.disableControlButtons();
    this.saveStudentWork();
  }

  private startPlantDeathSequence(): void {
    this.currentAnimation = this.plantAnimationCorner
      .playPlantDeathSequence()
      .afterAll(() => {
        this.addEvent('plantDied');
        eventBus.emit('statusChanged', 'died');
        this.updateCurrentTrial(false, false);
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

  isAnimationPlaying(): boolean {
    return this.currentAnimation != null;
  }

  resetSimulation(): void {
    this.resetEvent.next();
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
    eventBus.emit('dayChanged', 1);

    // re-initialize the variables
    this.currentDayNumber = 0;
    this.totalGlucoseCreated = this.initialGlucoseCreated;
    this.totalGlucoseUsed = this.initialGlucoseUsed;
    this.totalGlucoseStored = this.initialGlucoseStored;
    this.feedback.hideFeedback();
    if (!this.settings.enableInputControls) {
      this.setInputValues(this.playSequence[0]);
    }
    this.startNewTrial();
    this.setEnableControlButtons();
    eventBus.emit('readyToPlay');
  }

  private disableControlButtons(): void {
    this.isControlEnabled = false;
    this.setInputControls(false);
    this.simulationSpeedSwitch.disableUserInput();
    $('#playPause').css('opacity', 0.3);
  }

  private setEnableControlButtons(): void {
    if (this.settings.enableInputControls || this.playSequence.length) {
      this.enableControlButtons();
    } else {
      this.disableControlButtons();
    }
  }

  private enableControlButtons(): void {
    this.isControlEnabled = true;
    this.setInputControls(this.settings.enableInputControls);
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
    this.currentTrial.events.push(event);
  }

  pauseSimulation(): void {
    eventBus.emit('readyToPlay');
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
      DEFAULT_ANIMATION_DURATION * this.animationSpeedRatio;
    this.animationDelay = DEFAULT_ANIMATION_DELAY * this.animationSpeedRatio;
  }

  private calculateGlucoseCreatedIncrement(): number {
    let glucoseCreatedIncrement = this.numPhotonsThisCycle;
    if (this.settings.isShadeTolerant) {
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

  getStorage(): Storage {
    return this.storage;
  }

  getChloroplast(): Chloroplast {
    return this.chloroplast;
  }

  getMitochondrion(): Mitochondrion {
    return this.mitochondrion;
  }

  private getMitochondrionBattery1StartPosition(): any {
    return {
      x: this.mitochondrion.getX() + 100,
      y: this.mitochondrion.getY() + 100,
    };
  }

  private getMitochondrionBattery2StartPosition(): any {
    return {
      x: this.mitochondrion.getX() + 175,
      y: this.mitochondrion.getY() + 50,
    };
  }

  getSettings(): Settings {
    return this.settings;
  }
}
