export class Trial {
  id: number;
  name: string;
  glucoseCreated: number[][];
  glucoseUsed: number[][] = [[0, 0]];
  glucoseStored: number[][];
  lightLevel: number[][];
  waterLevel: number[][];
  events: any[] = [];

  constructor(
    name: string,
    numPhotons: number,
    numWater: number,
    initialGlucoseStored: number
  ) {
    this.id = new Date().getTime();
    this.name = name;
    this.lightLevel = [[0, numPhotons]];
    this.waterLevel = [[0, numWater]];
    this.glucoseCreated = [[0, initialGlucoseStored]];
    this.glucoseStored = [[0, initialGlucoseStored]];
  }

  addDayData(
    dayNumber: number,
    glucoseCreated: number,
    glucoseUsed: number,
    glucoseStored: number,
    lightLevel: number,
    waterLevel: number
  ): void {
    this.glucoseCreated.push([dayNumber, glucoseCreated]);
    this.glucoseUsed.push([dayNumber, glucoseUsed]);
    this.glucoseStored.push([dayNumber, glucoseStored]);
    this.lightLevel.push([dayNumber, lightLevel]);
    this.waterLevel.push([dayNumber, waterLevel]);
  }
}
