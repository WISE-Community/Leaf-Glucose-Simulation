import * as $ from 'jquery';
import * as Highcharts from 'highcharts';
import { PlantGlucoseSimulation } from './plantGlucoseSimulation';
import {
  BG_COLOR_LIGHT_0,
  BG_COLOR_LIGHT_100,
  BG_COLOR_LIGHT_25,
  BG_COLOR_LIGHT_50,
  BG_COLOR_LIGHT_75,
} from './constants';
import { Settings } from './settings';

/**
 * Graph --- Graphs glucose made, used, and stored over time
 * @author Hiroki Terashima
 * @author Geoffrey Kwan
 * @author Jonathan Lim-Breitbart
 */
export class Graph {
  private chartOptions: any; // options provided to initialize graph with starting values
  private chart: Highcharts.ChartObject; // Chart object that is rendered on the graph

  /**
   * Instantiates the graph with default options
   * @param simulation A reference to the simulation
   * @param settings Settings for the simulation
   */
  constructor(
    private simulation: PlantGlucoseSimulation,
    private settings: Settings
  ) {
    // set the default chart options
    this.chartOptions = {
      simulation: this.simulation,
      chart: {
        renderTo: 'highchartsDiv',
        type: 'line',
        // width: '320',
        style: {
          fontFamily: `'Roboto', Helvetica-Nueue, Arial, sans-serif`,
        },
      },
      plotOptions: {
        line: {
          marker: {
            enabled: false,
          },
        },
      },
      title: {
        text: 'Glucose Over Time',
      },
      xAxis: {
        title: {
          text: 'Time (Days)',
        },
        min: 0,
        max: this.settings.numDays + 1,
        tickInterval: 1,
      },
      yAxis: {
        title: {
          text: 'Units of Glucose',
        },
        min: 0,
        max: 80,
        tickInterval: 20,
      },
      tooltip: {
        formatter: function () {
          return this.points.reduce((accumulated, point) => {
            let pointLabel = '';
            if (point.series.name === 'Light Level') {
              const labels =
                this.series.chart.options.simulation.settings.lightLevelLabels;
              let value;
              if (labels.length === 2) {
                value = labels[point.y / 4];
              } else if (labels.length === 3) {
                value = labels[point.y / 2];
              } else {
                value = labels[point.y];
              }
              pointLabel = `Light: ${value}`;
            } else if (point.series.name === 'Water Level') {
              const labels =
                this.series.chart.options.simulation.settings.waterLevelLabels;
              const value =
                labels.length <= point.y
                  ? labels[labels.length - 1]
                  : labels[0];
              pointLabel = `Water: ${value}`;
            } else {
              pointLabel = `${point.series.name}: ${point.y}`;
            }
            return `${accumulated}<br/>${pointLabel}`;
          }, '<b>Day ' + this.x + '</b>');
        },
        shared: true,
      },
      series: [
        {
          name: 'Total Glucose Made',
          color: '#72ae2e',
          lineWidth: 3,
          data: [],
          dashStyle: 'shortDot',
          showInLegend: this.settings.showLineGlucoseMade,
          visible: this.settings.showLineGlucoseMade,
        },
        {
          name: 'Total Glucose Used',
          color: '#f17d00',
          lineWidth: 3,
          data: [],
          dashStyle: 'shortDash',
          showInLegend: this.settings.showLineGlucoseUsed,
          visible: this.settings.showLineGlucoseUsed,
        },
        {
          name: 'Glucose in Storage',
          color: '#459db6',
          lineWidth: 3,
          data: [],
          dashStyle: 'dot',
          showInLegend: this.settings.showLineGlucoseStored,
          visible: this.settings.showLineGlucoseStored,
        },
        {
          name: 'Light Level',
          color: 'transparent',
          borderColor: 'transparent',
          data: [],
          showInLegend: false,
          visible: true,
        },
        {
          name: 'Water Level',
          color: 'transparent',
          borderColor: 'transparent',
          data: [],
          showInLegend: false,
          visible: true,
        },
      ],
    };

    this.chart = new Highcharts.Chart(this.chartOptions);
    this.registerGraphLineToggleListener();
    this.simulation.resetEvent$.subscribe(() => this.resetGraph());
    this.simulation.studentDataChangedEvent$.subscribe(() =>
      this.updateGraph()
    );
  }

  /**
   * Reset the graph to original blank slate and toggle line on/off
   */
  private resetGraph(): void {
    this.chart.series.map((series) => {
      series.setData([]);
    });
    this.chart.xAxis[0].removePlotBand('plantGlucoseSimulationPlotBand');

    // toggle line on/off, if user previous toggled it
    if (this.settings.showLineGlucoseMade) {
      if (this.simulation.getChloroplast().opacity() === 0.5) {
        this.displaySeries(0, false);
      } else {
        this.displaySeries(0, true);
      }
    }

    if (this.settings.showLineGlucoseUsed) {
      if (this.simulation.getMitochondrion().opacity() === 0.5) {
        this.displaySeries(1, false);
      } else {
        this.displaySeries(1, true);
      }
    }

    if (this.settings.showLineGlucoseStored) {
      if (this.simulation.getStorage().opacity() === 0.5) {
        this.displaySeries(2, false);
      } else {
        this.displaySeries(2, true);
      }
    }
  }

  /**
   * Set the specified series data for the series index,
   * effectively updating the graph display
   * @param seriesIndex the index of the series to set
   * @param seriesData the data for the specified series.
   */
  private setSeriesData(seriesIndex: number, seriesData: any) {
    this.chart.series[seriesIndex].setData(seriesData);
  }

  /**
   * Update the graph with current trial data
   * Update background of graph based on number of photons that came in this day
   * Add a water icon if water is on for this day
   *
   * @param currentTrialData contains glucose created/used/stored information
   * @param dayNumber the day number to plot the graph for
   * @param numPhotonsThisCycle number of photons that came in this day
   */
  private updateGraph(): void {
    this.setSeriesData(0, this.simulation.currentTrialData.glucoseCreatedData);
    this.setSeriesData(1, this.simulation.currentTrialData.glucoseUsedData);
    this.setSeriesData(2, this.simulation.currentTrialData.glucoseStoredData);
    this.setSeriesData(3, this.simulation.currentTrialData.lightLevel);
    this.setSeriesData(4, this.simulation.currentTrialData.waterLevel);

    if (this.simulation.getSettings().showGraphBackground) {
      this.chart.xAxis[0].addPlotBand({
        id: 'plantGlucoseSimulationPlotBand',
        from: this.simulation.currentDayNumber - 1,
        to: this.simulation.currentDayNumber,
        color: this.getColor(this.simulation.numPhotonsThisCycle),
      });
    }
  }

  private getColor(numPhotons: number): string {
    return [
      BG_COLOR_LIGHT_0,
      BG_COLOR_LIGHT_25,
      BG_COLOR_LIGHT_50,
      BG_COLOR_LIGHT_75,
      BG_COLOR_LIGHT_100,
    ][numPhotons];
  }

  /**
   * Shows or hides the specified series
   * @param seriesIndex the index of series to show, 0-indexed
   * @param isDisplay true iff the series should be displayed
   */
  private displaySeries(seriesIndex: number, isDisplay: boolean) {
    if (isDisplay) {
      this.chart.series[seriesIndex].show();
    } else {
      this.chart.series[seriesIndex].hide();
    }
  }

  /**
   * listen for graph line show/hide toggles
   * and toggle corresponding image's opacity.
   */
  private registerGraphLineToggleListener() {
    const toggleableImages = [];
    if (this.settings.showLineGlucoseMade) {
      toggleableImages.push(this.simulation.getChloroplast());
    }
    if (this.settings.showLineGlucoseUsed) {
      toggleableImages.push(this.simulation.getMitochondrion());
    }
    if (this.settings.showLineGlucoseStored) {
      toggleableImages.push(this.simulation.getStorage());
    }

    $('.highcharts-legend-item').on(
      'click',
      { toggleableImages: toggleableImages },
      function (event) {
        // get the index of the line user toggled (0 = glucose made, 1 = used, 2 = stored)
        const lineIndex = $('.highcharts-legend-item').index($(this));

        // get the image object based on which line the user toggled
        const image = event.data.toggleableImages[lineIndex];

        // see if the line clicked is hidden or displayed
        image.opacity(
          $(this).hasClass('highcharts-legend-item-hidden') ? 0.5 : 1
        );
      }
    );
  }
}
