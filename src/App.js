import React, { Component } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import GetData from './store/index';
import styled from 'styled-components';
import AssessmentTwoToneIcon from '@material-ui/icons/AssessmentTwoTone';
import ReactApexChart from './components/chart';
import DropdownTypeFilter from './filters/DropdownType';


// chart button hover 
const HoverText = styled.p`
	color: #000;
	:hover {
		color: #ed1212;
		cursor: pointer;
  }
  margin: 0px;
`
// return $ 123,456 
function currencyFormatter(params) {
  return '$' + formatNumber(params.value);
}

// return 123,456 from 123456
function formatNumber(number) {
  let num = (number.value) ? number.value : number;
  return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
}

// return 55% from 0.55
function formatPercentNumber(params) {
  return Math.round(params.value * 100) + "%";
}

// Sum variables
let total_cost = 0;
let total_impressions = 0;
let total_clicks = 0;
let total_conversions = 0;

/**
 * App class type component
 */
export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      columnDefs: [],
      rowData: [],
      rowSelection: 'multiple',
      defaultColDef: {
        editable: false,
        sortable: true,
        filter: true,
        floatingFilter: true,
      },
      // Using dropdown filter
      frameworkComponents: {
        DropdownTypeFilter: DropdownTypeFilter,
      },
      // custome options
      showChartFlag: false,
      showTableFlag: false,
      chartUpdate: false,
      // chart data
      chartData: {
        series: [],
        category: [],
        yaxis: []
      },
      selectedRows: [], // selected row data
    }

    this.setDataFromCSV = this.setDataFromCSV.bind(this);
    this.showChart = this.showChart.bind(this);
  }

  /**
   * Get items for dropdown list without duplication.
   * @param {array} data 
   * @param {string} type
   * @return {array} items 
   */
  getDropDownItems(data, type) {
    let items = [];
    for (let i = 2; i < data.length; i++) {
      if (!items.includes(data[i][type])) {
        items.push(data[i][type]);
      }
    }
    return items;
  }

  /**
   * Get data from csv Set data with ag-grid
   * Using floatingFilterComponent to show sub header
   * 
   * @param {array} data 
   */
  setDataFromCSV(data) {
    // add column data
    let columns = [];
    if (data[0]) {

      columns.push({
        headerName: "Traffic Source", field: "trafficSource", width: 150, pinned: 'left',
        filter: 'agTextColumnFilter',
        floatingFilterComponent: 'DropdownTypeFilter',
        floatingFilterComponentParams: {
          // items is props, passing to Dropdown filter for making dropdown dynamically.
          items: this.getDropDownItems(data, 'trafficSource'),
          suppressFilterButton: true,
        },
      }, {
        headerName: "Media Type", field: "mediaType", width: 150, pinned: 'left',
        filter: 'agTextColumnFilter',
        // items is props, passing to Dropdown filter for making dropdown dynamically.
        floatingFilterComponent: 'DropdownTypeFilter',
        floatingFilterComponentParams: {
          items: this.getDropDownItems(data, 'mediaType'),
          suppressFilterButton: true,
        },
      }, {
        headerName: "Cost", field: "cost", width: 150,
        cellStyle: function (params) {
          return { textAlign: 'right' };
        },
        valueFormatter: currencyFormatter,
        valueGetter: (param) => {
          // Calc for sum of cost
          total_cost += parseFloat(param.data.cost);
          return param.data.cost;
        },
        // Using custom number floating filter to show sum of column values
        floatingFilterComponent: GetNumberFloatingFilter(),
        floatingFilterComponentParams: {
          suppressFilterButton: true,
        },
      }, {
        headerName: "Impressions", field: "impressions", width: 150,
        cellStyle: function (params) {
          return { textAlign: 'right' };
        },
        valueFormatter: formatNumber,
        valueGetter: (param) => {
          // Calc for sum of impressions
          total_impressions += parseInt(param.data.impressions);
          return param.data.impressions;
        },
        filter: 'agNumberColumnFilter',
        // Using custom number floating filter to show sum of column values
        floatingFilterComponent: GetNumberFloatingFilter(),
        floatingFilterComponentParams: {
          suppressFilterButton: true,
        },
      }, {
        headerName: "Clicks", field: "clicks", width: 150,
        cellStyle: function (params) {
          return { textAlign: 'right' };
        },
        valueFormatter: formatNumber,
        valueGetter: (param) => {
          // Calc for sum of clicks
          total_clicks += parseInt(param.data.clicks);
          return param.data.clicks;
        },
        filter: 'agNumberColumnFilter',
        // Using custom number floating filter to show sum of column values
        floatingFilterComponent: GetNumberFloatingFilter(),
        floatingFilterComponentParams: {
          suppressFilterButton: true,
        },
      }, {
        headerName: "Conversions", field: "conversions", width: 150,
        cellStyle: function (params) {
          return { textAlign: 'right' };
        },
        valueFormatter: formatPercentNumber,
        valueGetter: (param) => {
          // Calc for sum of conversions
          total_conversions += parseFloat(param.data.conversions);
          return param.data.conversions;
        },
        filter: 'agNumberColumnFilter',
        // Using custom number floating filter to show sum of column values
        floatingFilterComponent: GetNumberFloatingFilter(),
        floatingFilterComponentParams: {
          suppressFilterButton: true,
        },
      });

      // Set state to show a grid.
      this.setState({
        columnDefs: columns,
        rowData: data.slice(2)
      });
    }
  }

  /**
   * If the grid receives changes due to bound properties, 
   * this event fires after the grid has finished processing the change
   */
  onComponentStateChanged = () => {
    //console.log("onComponentStateChanged")

    // if chart and table is not showing, 
    // each sum of column's data into the each fields.
    if (!this.state.showChartFlag && !this.state.showTableFlag) {
      document.getElementById('cost').value = '$' + formatNumber(total_cost);
      document.getElementById('impressions').value = formatNumber(total_impressions);
      document.getElementById('clicks').value = formatNumber(total_clicks);
      document.getElementById('conversions').value = formatPercentNumber({ value: total_conversions });

      // then set tableflag is true. 
      this.setState({
        showTableFlag: true
      });
    }

    /**
     * gridApi.getFilterInstance function is one of issuses. 
     * When you use filter, this function is working.
     * When you use floating filter, this function is not working.
     */
    // this.gridApi.getFilterInstance('cost', (instance) => {
    // });
  }

  /**
   * The grid has initialised.
   * 
   * @param {} params 
   */
  onGridReady = params => {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
  };

  /**
   * Show chart
   * It controls to re-render chart data when you click the chart button.
   * It prevents to refresh every time when you click row data on table. 
   */
  showChart() {

    // Needs table data. 
    if (this.state.showTableFlag) {

      // If length of selectedRows is zero, the chart uses every rows.
      // Otherwise, the chart uses only selected rows. 
      if (this.state.selectedRows.length == 0) {
        this.makeChartData(this.state.rowData);
      } else {
        this.makeChartData();
      }
    } else {
      alert("Need Table Data");
    }
  }

  // Make chart data from the rows data.
  makeChartData = (rowData) => {
    let selectedRows = rowData ? rowData : this.state.selectedRows;

    // define series
    // next feature is that making series dynamically.
    let series = [{
      name: 'mediaType',
      type: 'column',
      data: []
    }, {
      name: 'trafficSource',
      type: 'column',
      data: []
    }, {
      name: 'cost',
      type: 'column',
      data: []
    }, {
      name: 'impressions',
      type: 'column',
      data: []
    }, {
      name: 'clicks',
      type: 'line',
      data: []
    }, {
      name: 'conversions',
      type: 'line',
      data: []
    }];

    // define category
    let category = [];

    // Set data for series and category 
    let year = 2020;
    for (let i = 0; i < selectedRows.length; i++) {
      let selected = selectedRows[i];

      series[0].data.push(selected.cost);
      series[1].data.push(selected.cost);
      series[2].data.push(selected.cost);
      series[3].data.push(selected.impressions);
      series[4].data.push(selected.clicks);
      series[5].data.push(selected.conversions);

      category.unshift(year - i);
    }

    // Define yaxis
    // Next feature is that making yaxis dynamically
    // Using params 
    let yaxis = [{
      axisTicks: {
        show: true,
      },
      axisBorder: {
        show: true,
        color: '#008FFB'
      },
      labels: {
        style: {
          colors: '#008FFB',
        }
      },
      title: {
        text: "Media (thousand crores)",
        style: {
          color: '#008FFB',
        }
      },
      tooltip: {
        enabled: true
      }
    }, {
      axisTicks: {
        show: true,
      },
      axisBorder: {
        show: true,
        color: '#008FFB'
      },
      labels: {
        style: {
          colors: '#008FFB',
        }
      },
      title: {
        text: "Traffic (thousand crores)",
        style: {
          color: '#008FFB',
        }
      },
      tooltip: {
        enabled: true
      }
    }, {
      axisTicks: {
        show: true,
      },
      axisBorder: {
        show: true,
        color: '#008FFB'
      },
      labels: {
        style: {
          colors: '#008FFB',
        }
      },
      title: {
        text: "Cost (thousand crores)",
        style: {
          color: '#008FFB',
        }
      },
      tooltip: {
        enabled: true
      }
    }, {
      seriesName: 'Impressions',
      opposite: false,
      axisTicks: {
        show: true,
      },
      axisBorder: {
        show: true,
        color: '#00E396'
      },
      labels: {
        style: {
          colors: '#00E396',
        }
      },
      title: {
        text: "Operating Impressions (thousand crores)",
        style: {
          color: '#00E396',
        }
      },
    }, {
      seriesName: 'Clicks',
      opposite: true,
      axisTicks: {
        show: true,
      },
      axisBorder: {
        show: true,
        color: '#FEB019'
      },
      labels: {
        style: {
          colors: '#FEB019',
        },
      },
      title: {
        text: "Clicks (thousand crores)",
        style: {
          color: '#FEB019',
        }
      }
    }, {
      seriesName: 'Conversions',
      opposite: true,
      axisTicks: {
        show: true,
      },
      axisBorder: {
        show: true,
        color: '#FEB019'
      },
      labels: {
        style: {
          colors: '#FEB019',
        },
      },
      title: {
        text: "Conversions (thousand crores)",
        style: {
          color: '#FEB019',
        }
      }
    }];

    // Set state about chart data
    this.setState({
      chartData: {
        series: series,
        category: category,
        yaxis: yaxis
      },
      showChartFlag: true,  // Set chart flag true
      chartUpdate: true     // if chartUpdate is false, the chart doesn't re-render.
    });
  }

  /**
   * 
   */
  onSelectionChanged = () => {

    var selectedRows = this.gridApi.getSelectedRows();
    var selectedRowsString = '';
    var maxToShow = 5;

    // Make string data to show selections
    selectedRows.forEach(function (selectedRow, index) {
      if (index >= maxToShow) {
        return;
      }
      if (index > 0) {
        selectedRowsString += ', ';
      }
      selectedRowsString += `[${selectedRow.trafficSource}-${selectedRow.mediaType}]`;
    });

    // if length of selected rows is greater than maxCount, 
    // show rest of selection count.
    if (selectedRows.length > maxToShow) {
      var othersCount = selectedRows.length - maxToShow;
      selectedRowsString += ' and ' + othersCount + ' other' + (othersCount !== 1 ? 's' : '');
    }
    document.querySelector('#selectedRows').innerHTML = selectedRowsString;

    // if row is selected, set state the selected row data 
    if (selectedRows.length > 0) {
      this.setState({
        selectedRows: selectedRows
      });
    }
  };

  render() {
    return (
      <div>
        {/* 
          After geting csv data from the csv file then call setDataFromCSV function. 
          props: getDataFromCSV 
        */}
        <GetData getDataFromCSV={this.setDataFromCSV} />
        <h1>Data Table Settings</h1>
        <div style={{ display: "flex" }}>
          <div style={{ position: "relative", textAlign: "left" }}>
            <p>
              <b>Dimensions</b>: Traffic Source, Media type
            <b style={{ marginLeft: "20px" }}>Metrics</b>: Cost, Impressions, Clicks and 5 more
          </p>
          </div>
          <div style={{ position: "relative", textAlign: "right", marginLeft: "50px" }}>
            {/* 
              Using icons with material-ui to show chart icons 
              event: onClick: call showChart function.
            */}
            <HoverText><AssessmentTwoToneIcon style={{ fontSize: 40 }} onClick={this.showChart} /></HoverText>
          </div>
        </div>

        <div className="example-header">
          Selection:
            <span id="selectedRows"></span>
        </div>

        <div style={{ display: "flex" }}>

          {/* Draw ag-grid */}
          <div
            className="ag-theme-alpine"
            style={{
              height: '500px',
              width: '50%',
              position: 'relative'
            }}
          >
            <AgGridReact
              columnDefs={this.state.columnDefs}  // columns data
              rowData={this.state.rowData}        // row data
              defaultColDef={this.state.defaultColDef}  // default coloumn def
              rowSelection={this.state.rowSelection}    // using row selection
              rowMultiSelectWithClick={true}            // multiselection with click
              onSelectionChanged={this.onSelectionChanged.bind(this)}   // selection event 
              onGridReady={this.onGridReady}    // grid initialize
              // It is possible to use the framework components such as React, Angular and VueJS inside of ag-Grid
              frameworkComponents={this.state.frameworkComponents}
              // Only used by React, Angular, Web Components, Polymer and VueJS ag-Grid components (not used if doing plain JavaScript or Angular 1.x). 
              // If the grid receives changes due to bound properties, 
              // this event fires after the grid has finished processing the change
              onComponentStateChanged={this.onComponentStateChanged}
            >
            </AgGridReact>
          </div>

          {/* Draw apex chart */}
          <div style={{ position: 'relative', width: '50%' }}>
            {/* when show chart flag is true, the chart will be shown */}
            {this.state.showChartFlag &&

              /**
               * props: chartData - series, category, yaxis
               * props: chartUpdate - Check showing chart or not
               * props: updateChartState - call from child chart component
               *  - after chart showing, chartUpdate flag is false
               *  - because we want to re-render with new chart data when users click the chart button
               */
              <ReactApexChart
                chartData={this.state.chartData}
                chartUpdate={this.state.chartUpdate}
                updateChartStatus={() => {
                  this.setState({
                    chartUpdate: false
                  })
                }} />}
          </div>
        </div>
      </div>
    );
  }
}

/**
 * Custom number floating filter 
 * Create input field with column id.
 * Javascript prototype.  
 * Next feature is that changing this floating filter to React version. 
 */
function GetNumberFloatingFilter() {
  function NumberFloatingFilter() {
  }

  NumberFloatingFilter.prototype.init = function (params) {
    this.gridApi = params.api;
    this.onFloatingFilterChanged = params.onFloatingFilterChanged;
    this.colId = params.column.colId;
    this.eGui = document.createElement('div');
    this.eGui.innerHTML = `<input id="${params.column.colId}" readonly style="width: 100px; text-align: right;" type="text" />`;//'<input id="" style="width:40px" type="text"/>'

    this.currentValue = null;
    this.eFilterInput = this.eGui.querySelector('input');
    let that = this;

    function onInputBoxChanged(e) {
      if (that.eFilterInput.value === '') {
        //Remove the filter
        that.onFloatingFilterChanged(null);
        return;
      }
      that.currentValue = Number(that.eFilterInput.value);
      that.onFloatingFilterChanged(that.currentValue);
    }
    this.eFilterInput.addEventListener('input', onInputBoxChanged);
  };

  /**
   * Show sum of column's data after filtering.
   * When filter changes, each sum of column is changed.
   * @param {*} parentModel 
   */
  NumberFloatingFilter.prototype.onParentModelChanged = function (parentModel) {
    
    this.gridApi.refreshClientSideRowModel('filter')
    
    total_cost = 0;
    total_impressions = 0;
    total_clicks = 0;
    total_conversions = 0;

    this.gridApi.forEachNodeAfterFilter(function(node) {
      // console.log(node);
      total_cost += parseFloat(node.data.cost);
      total_impressions += parseFloat(node.data.impressions);
      total_clicks += parseFloat(node.data.clicks);
      total_conversions += parseFloat(node.data.conversions);
      // select the node
      // node.setSelected(true);
    });

    document.getElementById('cost').value = '$' + formatNumber(total_cost);
    document.getElementById('impressions').value = formatNumber(total_impressions);
    document.getElementById('clicks').value = formatNumber(total_clicks);
    document.getElementById('conversions').value = formatPercentNumber({ value: total_conversions });

    // if (!parentModel) {
    //   this.eFilterInput.value = 0;
    // } else {
      
    // }
    // this.eFilterInput.value = formatNumber(sumData);
    // this.currentValue = sumData;
  };

  NumberFloatingFilter.prototype.getGui = function () {
    return this.eGui;
  };

  return NumberFloatingFilter;
}

