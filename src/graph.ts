/**
 * Graphs glucose made, used, and stored
 */
export class Graph {
    chartOptions: any;
    chart: any;
    constructor(doShowGraph: boolean) {

          // set the chart options
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
                  x: -20 //center
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
                      data: 0,
                      dashStyle: "shortDot"
                  },
                  {
                      name: 'Total Glucose Used',
                      color: '#f17d00',
                      lineWidth: 3,
                      data: 0,
                      dashStyle: "shortDash"
                  },
                  {
                      name: 'Total Glucose Stored',
                      color: '#459db6',
                      lineWidth: 3,
                      data: 0,
                      dashStyle: "dot"
                  }
              ]
          };

          // Initialize the chart
          this.chart = new Highcharts.Chart(this.chartOptions);
          this.showHideGraph(doShowGraph);
    }

    /**
     * reset the graph
     */
    resetGraph() {
        for (var i = 0; i < this.chart.series.length; i++) {
          this.chart.series[i].setData(0);
        }
        this.chart.xAxis[0].removePlotBand();

        //this.chart = new Highcharts.Chart(this.chartOptions);
    }

    showHideGraph(doShowGraph) {
        if (doShowGraph) {
            $('#highchartsDiv').show();
        } else {
            $('#highchartsDiv').hide();
        }
    }

    /**
     * Set the specified series data for the series index,
     * effectively updating the graph display
     */
    setSeriesData(seriesIndex: number, seriesData: any) {
      this.chart.series[seriesIndex].setData(seriesData);
    }

    /**
     * Adds a plot band to the graph
     */
    addPlotBand(plotBandSettings: any) {
      this.chart.xAxis[0].addPlotBand(plotBandSettings);
    }

    displaySeries(seriesIndex: number, isDisplay: boolean) {
        if (isDisplay) {
            this.chart.series[seriesIndex].show();
        } else {
            this.chart.series[seriesIndex].hide();
        }
    }

}
