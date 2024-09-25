import * as $ from 'jquery';
import * as Highcharts from 'highcharts';
import { PlantGlucoseSimulation } from './plantGlucoseSimulation';
import {
  BG_COLOR_LIGHT_0,
  BG_COLOR_LIGHT_100,
  BG_COLOR_LIGHT_25,
  BG_COLOR_LIGHT_50,
  BG_COLOR_LIGHT_75,
  WATER_COLOR,
} from './constants';

/**
 * Graph --- Graphs glucose made, used, and stored over time
 * @author Hiroki Terashima
 * @author Geoffrey Kwan
 * @author Jonathan Lim-Breitbart
 */
export class Graph {
  chartOptions: any; // options provided to initialize graph with starting values
  chart: Highcharts.ChartObject; // Chart object that is rendered on the graph
  waterIcons: any[];
  simulation: PlantGlucoseSimulation;
  showLineGlucoseMade: boolean;
  showLineGlucoseUsed: boolean;
  showLineGlucoseStored: boolean;

  /**
   * Instantiates the graph with default options
   * @param simulation A reference to the simulation
   * @param dayColorLightOn A hex string containing the default background color of this
   *   day display corner when the light is on
   * @param dayColorLightOff A hex string containing the default background color of this
   *   day display corner when the light is off
   */
  constructor(
    simulation: PlantGlucoseSimulation,
    showLineGlucoseMade: boolean = true,
    showLineGlucoseUsed: boolean = true,
    showLineGlucoseStored: boolean = true,
    numDays: number = 20
  ) {
    this.simulation = simulation;
    this.waterIcons = [];
    this.showLineGlucoseMade = showLineGlucoseMade;
    this.showLineGlucoseUsed = showLineGlucoseUsed;
    this.showLineGlucoseStored = showLineGlucoseStored;

    // set the default chart options
    this.chartOptions = {
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
        max: numDays + 1,
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
        enabled: true,
      },
      series: [
        {
          name: 'Total Glucose Made',
          color: '#72ae2e',
          lineWidth: 3,
          data: [],
          dashStyle: 'shortDot',
          showInLegend: showLineGlucoseMade,
          visible: showLineGlucoseMade,
        },
        {
          name: 'Total Glucose Used',
          color: '#f17d00',
          lineWidth: 3,
          data: [],
          dashStyle: 'shortDash',
          showInLegend: showLineGlucoseUsed,
          visible: showLineGlucoseUsed,
        },
        {
          name: 'Glucose in Storage',
          color: '#459db6',
          lineWidth: 3,
          data: [],
          dashStyle: 'dot',
          showInLegend: showLineGlucoseStored,
          visible: showLineGlucoseStored,
        },
      ],
    };

    this.chart = new Highcharts.Chart(this.chartOptions);
    this.registerGraphLineToggleListener();
    simulation.onReset = () => this.resetGraph();
    simulation.onStudentDataChanged = () => this.updateGraph();
  }

  /**
   * Reset the graph to original blank slate and toggle line on/off
   */
  private resetGraph(): void {
    this.chart.series.map((series) => {
      series.setData([]);
    });
    this.chart.xAxis[0].removePlotBand('plantGlucoseSimulationPlotBand');
    this.removeWaterIcons();

    // toggle line on/off, if user previous toggled it
    if (this.showLineGlucoseMade) {
      if (this.simulation.chloroplast.opacity() === 0.5) {
        this.displaySeries(0, false);
      } else {
        this.displaySeries(0, true);
      }
    }

    if (this.showLineGlucoseUsed) {
      if (this.simulation.mitochondrion.opacity() === 0.5) {
        this.displaySeries(1, false);
      } else {
        this.displaySeries(1, true);
      }
    }

    if (this.showLineGlucoseStored) {
      if (this.simulation.storage.opacity() === 0.5) {
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
  setSeriesData(seriesIndex: number, seriesData: any) {
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

    let plotBandSettings = {
      id: 'plantGlucoseSimulationPlotBand',
      from: this.simulation.currentDayNumber - 1,
      to: this.simulation.currentDayNumber,
      color: this.getColor(this.simulation.numPhotonsThisCycle),
    };
    this.addPlotBand(plotBandSettings);
    if (this.simulation.numWaterThisCycle > 0) {
      this.addWaterIcon();
    }
  }

  getColor(numPhotons: number) {
    return [
      BG_COLOR_LIGHT_0,
      BG_COLOR_LIGHT_25,
      BG_COLOR_LIGHT_50,
      BG_COLOR_LIGHT_75,
      BG_COLOR_LIGHT_100,
    ][numPhotons];
  }

  /**
   * Adds a plot band to the graph
   * @param plotBandSettings settings for the plotband
   */
  addPlotBand(plotBandSettings: any) {
    this.chart.xAxis[0].addPlotBand(plotBandSettings);
  }

  addWaterIcon() {
    const data = this.chart.series[0].data;
    const point = data[data.length - 1];
    const waterIcon = this.chart.renderer
      .rect(point.plotX + 52.5, this.chart.plotTop + 3, 6, 10)
      .attr({
        fill: WATER_COLOR,
        rx: '4',
        zIndex: 2,
      })
      .add();
    this.waterIcons.push(waterIcon);
  }

  removeWaterIcons() {
    for (let i = 0; i < this.waterIcons.length; i++) {
      this.waterIcons[i].destroy();
    }
    this.waterIcons = [];
  }

  /**
   * Shows or hides the specified series
   * @param seriesIndex the index of series to show, 0-indexed
   * @param isDisplay true iff the series should be displayed
   */
  displaySeries(seriesIndex: number, isDisplay: boolean) {
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
  registerGraphLineToggleListener() {
    let simulation = this.simulation;
    let toggleableImages = [];
    if (this.showLineGlucoseMade) {
      toggleableImages.push(simulation.chloroplast);
    }
    if (this.showLineGlucoseUsed) {
      toggleableImages.push(simulation.mitochondrion);
    }
    if (this.showLineGlucoseStored) {
      toggleableImages.push(simulation.storage);
    }

    $('.highcharts-legend-item').on(
      'click',
      { toggleableImages: toggleableImages },
      function (event) {
        // get the index of the line user toggled (0 = glucose made, 1 = used, 2 = stored)
        let lineIndex = $('.highcharts-legend-item').index($(this));

        // get the image object based on which line the user toggled
        let image = event.data.toggleableImages[lineIndex];

        // see if the line clicked is hidden or displayed
        let isHidden = $(this).hasClass('highcharts-legend-item-hidden');
        if (isHidden) {
          image.opacity(0.5);
        } else {
          image.opacity(1);
        }
      }
    );
  }
}
