import * as $ from "jquery";
import * as Highcharts from "highcharts";
import {PlantGlucoseSimulation} from "./plantGlucoseSimulation";

/**
 * Graph --- Graphs glucose made, used, and stored over time
 * @author Hiroki Terashima
 * @author Geoffrey Kwan
*/
export class Graph {
    chartOptions: any;  // options provided to initialize graph with starting values
    chart: Highcharts.ChartObject;  // Chart object that is rendered on the graph
    dayColorLightOn: string;
    dayColorLightOff: string;
    simulation: PlantGlucoseSimulation;

    /**
     * Instantiates the graph with default options
     * @param simulation A reference to the simulation
     * @param dayColorLightOn A hex string containing the default background color of this
     *     day display corner when the light is on
     * @param dayColorLightOff A hex string containing the default background color of this
     *     day display corner when the light is off
     * @param doShowGraph true iff this graph should be displayed
     */
    constructor(simulation: PlantGlucoseSimulation, dayColorLightOn: string, dayColorLightOff: string, doShowGraph: boolean) {
        this.simulation = simulation;
        this.dayColorLightOn = dayColorLightOn;
        this.dayColorLightOff = dayColorLightOff;
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
                    dashStyle: "shortDot"
                },
                {
                    name: 'Total Glucose Used',
                    color: '#f17d00',
                    lineWidth: 3,
                    data: [],
                    dashStyle: "shortDash"
                },
                {
                    name: 'Total Glucose Stored',
                    color: '#459db6',
                    lineWidth: 3,
                    data: [],
                    dashStyle: "dot"
                }
            ]
        };

        this.chart = new Highcharts.Chart(this.chartOptions);
        this.showHideGraph(doShowGraph);
        this.registerGraphLineToggleListener();
    }

    /**
     * Reset the graph to original blank slate
     */
    resetGraph() {
        for (let i = 0; i < this.chart.series.length; i++) {
            this.chart.series[i].setData([]);
        }
        this.chart.xAxis[0].removePlotBand("plantGlucoseSimulationPlotBand"); // moves all the plot bands
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
      * Update background of graph based on light on (yellow) or off (gray)
      *
      * @param currentTrialData contains glucose created/used/stored information
      * @param dayNumber the day number to plot the graph for
      * @param glucoseCreated whether the glucose was created for the specified day
      */
     updateGraph(currentTrialData: any, dayNumber: number, isGlucoseCreated: boolean) {
         this.setSeriesData(0, currentTrialData.glucoseCreatedData);
         this.setSeriesData(1, currentTrialData.glucoseUsedData);
         this.setSeriesData(2, currentTrialData.glucoseStoredData);

         let plotBandSettings = {
             "id": "plantGlucoseSimulationPlotBand",
             "from": dayNumber - 1,
             "to": dayNumber,
             "color": isGlucoseCreated ? this.dayColorLightOn :
                 this.dayColorLightOff
         };
         this.addPlotBand(plotBandSettings);
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
     * listen for graph line show/hide toggles and toggle corresponding image's opacity.
     */
    registerGraphLineToggleListener() {
        let simulation = this.simulation;
        $(".highcharts-legend-item").on("click", function() {
            // get the index of the line user toggled (0 = glucose made, 1 = used, 2 = stored)
            let lineIndex = $(".highcharts-legend-item").index($(this));

            // is the line hidden or displayed?
            let isHidden = $(this).hasClass("highcharts-legend-item-hidden");

            // get the image object based on which line the user toggled
            let image = [simulation.chloroplast,
                simulation.mitochondrion, simulation.storage][lineIndex];

            // set the opacity of the image object accordingly
            if (isHidden) {
                image.opacity(0.5);
            } else {
                image.opacity(1);
            }
        });
    }
}
