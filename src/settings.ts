export class Settings {
  enableInputControls = true;
  feedbackPolicy: string = null; // contain the identifier of the feedback to use
  isDroughtTolerant = false;
  isShadeTolerant = false;
  lightLevelLabels = ['OFF', 'ON'];
  numDays = 20;
  numLightOptions = 2; // 2 = On/Off, 3 = Full/Half/Off, 5 = 100%/75%/50%/25%/0%
  plantImgSrc: string = null;
  showEnergyNeeds = false; // whether to show the battery and energy needs animation
  showGraph = true;
  showGraphBackground = false;
  showLineGlucoseMade = true;
  showLineGlucoseUsed = true;
  showLineGlucoseStored = true;
  showSpeedControls = true;
  showWater = false; // whether the water control should be displayed or not
  waterLevelLabels = ['NO', 'YES'];

  constructor(parameters: any) {
    this.numDays = parameters['numDays'] ?? 20;
    this.numLightOptions = parameters['numLightOptions'] ?? 2;
    this.feedbackPolicy = parameters['feedbackPolicy'] ?? null;
    this.showGraph = parameters['showGraph'] ?? true;
    this.showGraphBackground = parameters['showGraphBackground'] ?? false;
    this.showLineGlucoseMade = parameters['showLineGlucoseMade'] ?? true;
    this.showLineGlucoseUsed = parameters['showLineGlucoseUsed'] ?? true;
    this.showLineGlucoseStored = parameters['showLineGlucoseStored'] ?? true;
    this.showSpeedControls = parameters['showSpeedControls'] ?? true;
    this.showWater = parameters['showWater'] ?? false;
    this.enableInputControls = parameters['enableInputControls'] ?? true;
    this.isDroughtTolerant = parameters['isDroughtTolerant'] ?? false;
    this.isShadeTolerant = parameters['isShadeTolerant'] ?? false;
    this.plantImgSrc = parameters['plantImgSrc'] ?? null;
    this.showEnergyNeeds = parameters['showEnergyNeeds'] ?? false;
    this.lightLevelLabels = parameters['lightLevelLabels']
      ? parameters['lightLevelLabels'].split(',')
      : ['ON', 'OFF'];
    this.waterLevelLabels = parameters['waterLevelLabels']
      ? parameters['waterLevelLabels'].split(',')
      : ['NO', 'YES'];
  }
}
