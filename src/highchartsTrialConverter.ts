import { Trial } from './trial';

export function convertToHighchartsTrial(trial: Trial): any {
  return {
    id: trial.id,
    name: trial.name,
    series: [
      convertToHighchartsSeries(
        trial.id + '-glucoseMade',
        'Total Glucose Made',
        '#72ae2e',
        'shortDot',
        'circle',
        trial.glucoseCreated
      ),
      convertToHighchartsSeries(
        trial.id + '-glucoseStored',
        'Total Glucose Stored',
        '#459db6',
        'dot',
        'circle',
        trial.glucoseStored
      ),
      convertToHighchartsSeries(
        trial.id + '-glucoseUsed',
        'Total Glucose Used',
        '#f17d00',
        'shortDash',
        'circle',
        trial.glucoseUsed
      ),
    ],
  };
}

function convertToHighchartsSeries(
  seriesId: string,
  seriesName: string,
  seriesColor: string,
  dashStyle: string,
  markerSymbol: string,
  seriesData: number[][]
): any {
  const convertedSeries = {
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
