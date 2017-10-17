import * as $ from 'jquery';
import * as Highcharts from 'highcharts';
import {PlantGlucoseSimulation} from './plantGlucoseSimulation';

/**
 * Graph --- Graphs glucose made, used, and stored over time
 * @author Hiroki Terashima
 * @author Geoffrey Kwan
*/
export class Graph {
  chartOptions: any;  // options provided to initialize graph with starting values
  chart: Highcharts.ChartObject;  // Chart object that is rendered on the graph
  bgColorLight100: string;
  bgColorLight75: string;
  bgColorLight50: string;
  bgColorLight25: string;
  bgColorLight0: string;
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
   * @param doShowGraph true iff this graph should be displayed
   */
  constructor(simulation: PlantGlucoseSimulation, bgColorLight100: string, bgColorLight75: string,
      bgColorLight50: string, bgColorLight25: string, bgColorLight0: string, doShowGraph: boolean,
      showLineGlucoseMade: boolean = true, showLineGlucoseUsed: boolean = true,
      showLineGlucoseStored: boolean = true) {
    this.simulation = simulation;
    this.bgColorLight100 = bgColorLight100;
    this.bgColorLight75 = bgColorLight75;
    this.bgColorLight50 = bgColorLight50;
    this.bgColorLight25 = bgColorLight25;
    this.bgColorLight0 = bgColorLight0;
    this.showLineGlucoseMade = showLineGlucoseMade;
    this.showLineGlucoseUsed = showLineGlucoseUsed;
    this.showLineGlucoseStored = showLineGlucoseStored;

    // set the default chart options
    this.chartOptions = {
      chart: {
        renderTo: 'highchartsDiv',
        type: 'line',
        width: '320'
      },
      plotOptions: {
        line: {
          marker: {
            enabled: false
          }
        }
      },
      title: {
        text: 'Glucose Over Time',
        x: -20
      },
      xAxis: {
        title: {
          text: 'Time (Days)'
        },
        min: 0,
        max: 21,
        tickInterval: 1
      },
      yAxis: {
        title: {
          text: 'Amount of Glucose'
        },
        min: 0,
        max: 80,
        tickInterval: 20,
      },
      tooltip: {
        enabled: false
      },
      series: [
        {
          name: 'Total Glucose Made',
          color: '#72ae2e',
          lineWidth: 3,
          data: [],
          dashStyle: 'shortDot',
          showInLegend: showLineGlucoseMade,
          visible: showLineGlucoseMade
        },
        {
          name: 'Total Glucose Used',
          color: '#f17d00',
          lineWidth: 3,
          data: [],
          dashStyle: 'shortDash',
          showInLegend: showLineGlucoseUsed,
          visible: showLineGlucoseUsed
        },
        {
          name: 'Total Glucose Stored',
          color: '#459db6',
          lineWidth: 3,
          data: [],
          dashStyle: 'dot',
          showInLegend: showLineGlucoseStored,
          visible: showLineGlucoseStored
        }
      ]
    };

    this.chart = new Highcharts.Chart(this.chartOptions);
    this.showHideGraph(doShowGraph);
    this.registerGraphLineToggleListener();
  }

  /**
   * Reset the graph to original blank slate and toggle line on/off
   */
  resetGraph() {
    this.chart.series.map((series) => {
        series.setData([]);
    });
    this.chart.xAxis[0].removePlotBand('plantGlucoseSimulationPlotBand');

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
   * Toggles this graph's visibility on/off
   * @param doShowGraph true iff this graph should be displayed
   */
  showHideGraph(doShowGraph: boolean) {
    if (doShowGraph) {
      $('#highchartsDiv').show();
    } else {
      $('#highchartsDiv').hide();
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
    * Update background of graph based on number of
    * photons that came in this day
    *
    * @param currentTrialData contains glucose created/used/stored information
    * @param dayNumber the day number to plot the graph for
    * @param numPhotonsThisCycle number of photons that came in this day
    */
   updateGraph(currentTrialData: any, dayNumber: number,
               numPhotonsThisCycle: number) {
     this.setSeriesData(0, currentTrialData.glucoseCreatedData);
     this.setSeriesData(1, currentTrialData.glucoseUsedData);
     this.setSeriesData(2, currentTrialData.glucoseStoredData);

     let plotBandSettings = {
       'id': 'plantGlucoseSimulationPlotBand',
       'from': dayNumber - 1,
       'to': dayNumber,
       'color': this.getColor(numPhotonsThisCycle)
     };
     this.addPlotBand(plotBandSettings);
   }


   getColor(numPhotons: number) {
       return [this.bgColorLight0, this.bgColorLight25, this.bgColorLight50,
           this.bgColorLight75, this.bgColorLight100][numPhotons]
   }

  /**
   * Adds a plot band to the graph
   * @param plotBandSettings settings for the plotband
   */
  addPlotBand(plotBandSettings: any) {
    this.chart.xAxis[0].addPlotBand(plotBandSettings);
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

    $('.highcharts-legend-item').on('click', {toggleableImages: toggleableImages}, function(event) {
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
    });
  }
}
