export class Settings {
  enableInputControls = true;
  feedbackPolicy: string = null; // contain the identifier of the feedback to use
  isDroughtTolerant = false;
  isShadeTolerant = false;
  lightLevelLabels = ['OFF', 'ON'];
  numDays = 20;
  numLightOptions = 2; // 2 = On/Off, 3 = Full/Half/Off, 5 = 100%/75%/50%/25%/0%
  plantImgSrc: string[] = [];
  showEnergyNeeds = false; // whether to show the battery and energy needs animation
  showGraph = true;
  showGraphBackground = false;
  showKey = true;
  showLightBulb = false;
  showLineGlucoseMade = true;
  showLineGlucoseUsed = true;
  showLineGlucoseStored = true;
  showOrganelles = true;
  showPlant = true;
  showSpeedControls = false;
  showWater = false; // whether the water control should be displayed or not
  waterLevelLabels = ['NO', 'YES'];

  constructor(parameters: any) {
    this.numDays = parameters['numDays'] ?? 20;
    this.numLightOptions = parameters['numLightOptions'] ?? 2;
    this.feedbackPolicy = parameters['feedbackPolicy'] ?? null;
    this.showGraph = parameters['showGraph'] ?? true;
    this.showGraphBackground = parameters['showGraphBackground'] ?? false;
    this.showKey = parameters['showKey'] ?? true;
    this.showOrganelles = parameters['showOrganelles'] ?? true;
    this.showLightBulb = parameters['showLightBulb'] ?? false;
    this.showLineGlucoseMade = parameters['showLineGlucoseMade'] ?? true;
    this.showLineGlucoseUsed = parameters['showLineGlucoseUsed'] ?? true;
    this.showLineGlucoseStored = parameters['showLineGlucoseStored'] ?? true;
    this.showPlant = parameters['showPlant'] ?? true;
    this.showSpeedControls = parameters['showSpeedControls'] ?? false;
    this.showWater = parameters['showWater'] ?? false;
    this.enableInputControls = parameters['enableInputControls'] ?? true;
    this.isDroughtTolerant = parameters['isDroughtTolerant'] ?? false;
    this.isShadeTolerant = parameters['isShadeTolerant'] ?? false;
    this.setPlantImgSrc(parameters['plantImgSrc']);
    this.showEnergyNeeds = parameters['showEnergyNeeds'] ?? false;
    this.lightLevelLabels = parameters['lightLevelLabels']
      ? parameters['lightLevelLabels'].split(',')
      : ['OFF', 'ON'];
    this.waterLevelLabels = parameters['waterLevelLabels']
      ? parameters['waterLevelLabels'].split(',')
      : ['NO', 'YES'];
  }

  private setPlantImgSrc(imgParam: string): void {
    if (imgParam) {
      const imgParamTokens = imgParam.split(',');
      let counter = 0;
      imgParamTokens.forEach((token) => {
        counter++;
        if (counter <= 5) this.plantImgSrc.push(token);
      });
      if (counter < 5) {
        for (let i = counter; i < 5; i++) {
          this.plantImgSrc.push(imgParamTokens.at(imgParamTokens.length - 1));
        }
      }
    } else {
      this.plantImgSrc = null;
    }
  }
}
