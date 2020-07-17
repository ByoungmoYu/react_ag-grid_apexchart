import React from 'react';
import ReactApexChart from 'react-apexcharts';

export default class ApexChart extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            series: props.chartData.series, // using props data
            options: {
                chart: {
                    height: 350,
                    type: 'line',
                    stacked: false,
                    redrawOnParentResize: true
                },
                dataLabels: {
                    enabled: false
                },
                stroke: {
                    width: [1, 1, 4]
                },
                title: {
                    text: 'XYZ - Stock Analysis (2009 - 2016)',
                    align: 'left',
                    offsetX: 110
                },
                xaxis: {
                    categories: props.chartData.categories, // using props data
                },
                yaxis: props.chartData.yaxis, // using props data
                tooltip: {
                    fixed: {
                        enabled: true,
                        position: 'topLeft', // topRight, topLeft, bottomRight, bottomLeft
                        offsetY: 30,
                        offsetX: 60
                    },
                },
                legend: {
                    horizontalAlign: 'left',
                    offsetX: 40
                }
            },
        };
    }

    componentDidMount() {
        this.props.updateChartStatus();
    }

    componentDidUpdate() {

        // Chart update when table data is changed.
        // Then call update chart status to the parent component.
        if (this.props.chartUpdate) {
            this.setState({
                series: this.props.chartData.series
            });
            this.props.updateChartStatus();
        }
    }

    render() {
        return (
            <div id="chart">
                <ReactApexChart options={this.state.options} series={this.state.series} type="line" height="500px" width="100%" />
            </div>
        )
    }
}