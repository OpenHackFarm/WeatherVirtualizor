function search_nearby_station(address) {
    url = 'http://52.183.94.1:8001/?backend=CWB&get=stations&q={"address":"' + address + '"}';
    console.log(url);

    $.ajax({
        url: url,
        type: 'GET',
        data: {},
        success: function(data) {
            $('#nearby').empty();
            $.each(data, function(idx, li) {
                if (li['distance_km'] < 10) {
                    text = li['station_id'] + '_' + li['station_name'] + ' - ' + li['distance_km'] + 'km';
                    if(li['start_date'] < '2005') {
                      text = '<b>' + text + '</b>';
                    }
                    button = '<button class="station_choose" data-station="' + li['station_id'] + '_' + li['station_name'] + '" type="button">選擇</button>'
                    $('#nearby').append('<div class="col-4">' + button + ' ' + text + '</div>');
                }
            });

            $('.station_choose').each(function() {
                var $this = $(this);
                $this.on("click", function() {
                    alert('Choose station: ' + $(this).data('station'));
                    $('#station').val($(this).data('station')).trigger('change');
                });
            });
        },
        error: function(jqXHR, exception) {
            console.log(jqXHR);
        }
    });
}

var dynamicColors = function() {
    var r = Math.floor(Math.random() * 255);
    var g = Math.floor(Math.random() * 255);
    var b = Math.floor(Math.random() * 255);
    return "rgb(" + r + "," + g + "," + b + ")";
}

function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}

function isValidURL(url) {
    var isValid = false;

    $.ajax({
        url: url,
        type: "get",
        async: false,
        dataType: "json",
        success: function(data) {
            isValid = true;
        },
        error: function(){
            isValid = false;
        }
    });

    return isValid;
}


function drawBarValues() {
    // render the value of the chart above the bar
    var ctx = this.chart.ctx;
    ctx.font = Chart.helpers.fontString(Chart.defaults.global.defaultFontSize, 'normal', Chart.defaults.global.defaultFontFamily);
    ctx.fillStyle = this.chart.config.options.defaultFontColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    this.data.datasets.forEach(function(dataset) {
        for (var i = 0; i < dataset.data.length; i++) {
            if (dataset.hidden === true && dataset._meta[Object.keys(dataset._meta)[0]].hidden !== false) {
                continue;
            }
            var model = dataset._meta[Object.keys(dataset._meta)[0]].data[i]._model;
            if (dataset.data[i] !== null) {
                ctx.fillText(dataset.data[i], model.x - 1, model.y - 5);
            }
        }
    });
}

function clear_chart() {
    config_temperature.data.datasets.splice(-1, 1);
    config_rain.data.datasets.splice(-1, 1);
    config_sun.data.datasets.splice(-1, 1);
    config_td.data.datasets.splice(-1, 1);
    window.temperatureLineChart.update();
    window.rainLineChart.update();
    window.sunLineChart.update();
    window.tdLineChart.update();
}

function new_chart() {
    var ctx_temperature = document.getElementById('chart_temperature').getContext("2d");
    var ctx_rain = document.getElementById('chart_rain').getContext("2d");
    var ctx_sun = document.getElementById('chart_sun').getContext("2d");
    var ctx_td = document.getElementById('chart_td').getContext("2d");
    window.temperatureLineChart = new Chart(ctx_temperature, config_temperature);
    window.rainLineChart = new Chart(ctx_rain, config_rain);
    window.sunLineChart = new Chart(ctx_sun, config_sun);
    window.tdLineChart = new Chart(ctx_td, config_td);
}

function draw_chart(label, avg_temperature, avg_rain, avg_sun, avg_td) {
    if (window.temperatureLineChart === undefined) {
        new_chart();
    }

    var newColor = dynamicColors();
    config_temperature.data.datasets.push({
        label: label + ' - 氣溫',
        data: avg_temperature,
        fill: false,
        backgroundColor: newColor,
        borderColor: newColor,
    });
    config_rain.data.datasets.push({
        label: label + ' - 降雨量',
        data: avg_rain,
        fill: false,
        backgroundColor: newColor,
        borderColor: newColor,
    });
    config_sun.data.datasets.push({
        label: label + ' - 日射量',
        data: avg_sun,
        fill: false,
        backgroundColor: newColor,
        borderColor: newColor,
    });
    config_td.data.datasets.push({
        label: label + ' - 露點溫度',
        data: avg_td,
        fill: false,
        backgroundColor: newColor,
        borderColor: newColor,
    });

    // update middle line (春分、秋分)
    config_sun.options.annotation.annotations[0].value = (parseFloat(avg_sun[3-1]) + parseFloat(avg_sun[10-1])) / 2;

    window.temperatureLineChart.update();
    window.rainLineChart.update();
    window.sunLineChart.update();
    window.tdLineChart.update();
}

function shift_left(){
  config_temperature.data.labels.push(config_temperature.data.labels.shift());
  config_rain.data.labels.push(config_rain.data.labels.shift());
  config_sun.data.labels.push(config_sun.data.labels.shift());
  config_td.data.labels.push(config_td.data.labels.shift());

  config_temperature.data.datasets[0].data.push(config_temperature.data.datasets[0].data.shift());
  config_rain.data.datasets[0].data.push(config_rain.data.datasets[0].data.shift());
  config_sun.data.datasets[0].data.push(config_sun.data.datasets[0].data.shift());
  config_td.data.datasets[0].data.push(config_td.data.datasets[0].data.shift());

  window.temperatureLineChart.update();
  window.rainLineChart.update();
  window.sunLineChart.update();
  window.tdLineChart.update();
}

function shift_right(){
  config_temperature.data.labels.unshift(config_temperature.data.labels.pop());
  config_rain.data.labels.unshift(config_rain.data.labels.pop());
  config_sun.data.labels.unshift(config_sun.data.labels.pop());
  config_td.data.labels.unshift(config_td.data.labels.pop());

  config_temperature.data.datasets[0].data.unshift(config_temperature.data.datasets[0].data.pop());
  config_rain.data.datasets[0].data.unshift(config_rain.data.datasets[0].data.pop());
  config_sun.data.datasets[0].data.unshift(config_sun.data.datasets[0].data.pop());
  config_td.data.datasets[0].data.unshift(config_td.data.datasets[0].data.pop());

  window.temperatureLineChart.update();
  window.rainLineChart.update();
  window.sunLineChart.update();
  window.tdLineChart.update();
}

var station_url = "https://raw.githubusercontent.com/OpenHackFarm/CODiS_carwler/master/CWB_Stations_171226.json";
var dataset = [];
var config = {
    type: 'line',
    data: {
        labels: Array.from(new Array(12), (val, index) => ("0" + (index + 1)).slice(-2)),
        datasets: []
    },
    options: {
        responsive: true,
        title: {
            display: true,
            text: ''
        },
        tooltips: {
            mode: 'index',
            intersect: false,
        },
        hover: {
            mode: 'nearest',
            intersect: true
        },
        scales: {
            xAxes: [{
                display: true,
                scaleLabel: {
                    display: true,
                    labelString: 'Month'
                }
            }],
            yAxes: [{
                display: true,
                scaleLabel: {
                    display: true,
                    labelString: ''
                },
                ticks: {},
            }]
        },
        maintainAspectRatio: false,
        annotation: {
          annotations: [{
              type: 'line',
              mode: 'horizontal',
              scaleID: 'y-axis-0',
              value: '-99999',
              borderColor: 'tomato',
              borderWidth: 0
          },{
              type: 'line',
              mode: 'horizontal',
              scaleID: 'y-axis-0',
              value: '99999',
              borderColor: 'tomato',
              borderWidth: 2
          }],
          drawTime: "afterDraw" // (default)
        },
        animation: {
            onProgress: drawBarValues,
            onComplete: drawBarValues
        },
    }
};
var config_temperature = $.extend(true, {}, config);
config_temperature['options']['title']['text'] = '歷史平均溫度 (℃)';
config_temperature['options']['scales']['yAxes'][0]['scaleLabel']['labelString'] = 'Temperature';
config_temperature['options']['scales']['yAxes'][0]['ticks'] = {min: 8, max: 32};
config_temperature['options']['annotation']['annotations'][0]['value'] = 18; // 喜溫性蔬菜生長最適宜的溫度為18~26℃
config_temperature['options']['annotation']['annotations'][1]['value'] = 26;

var config_rain = $.extend(true, {}, config);
config_rain['options']['title']['text'] = '歷史平均降雨量 (mm)';
config_rain['options']['scales']['yAxes'][0]['scaleLabel']['labelString'] = 'Rain';
config_rain['options']['scales']['yAxes'][0]['ticks'] = {min: 0, max: 900};
config_rain['options']['annotation']['annotations'][0]['value'] = 130;
config_rain['options']['annotation']['annotations'][1]['value'] = 270;

var config_sun = $.extend(true, {}, config);
config_sun['options']['title']['text'] = '歷史平均日射量 (MJ/㎡)';
config_sun['options']['scales']['yAxes'][0]['scaleLabel']['labelString'] = 'Sun';
config_sun['options']['scales']['yAxes'][0]['ticks'] = {min: 0, max: 800};

var config_td = $.extend(true, {}, config);
config_td['options']['title']['text'] = '歷史平均露點溫度統計 (℃)';
config_td['options']['scales']['yAxes'][0]['scaleLabel']['labelString'] = 'Td';
config_td['options']['scales']['yAxes'][0]['ticks'] = {min: 8, max: 32};
config_td['options']['annotation']['annotations'][0]['value'] = 18.5; // 霜降 (10月23日或24日) 高地之楓葉亦漸轉紅，常綠植物則是逐漸枯黃掉落，大地略顯得沉重

$(function() {
    $.getJSON(station_url, function(data) {
        $.each(data, function(idx, li) {
            text = li['站號'] + '_' + li['站名'];
            $('#station').append($("<option></option>").attr("value", li['id']).text(text));
        });
    });

    for (var i = 2005; i <= 2018; i++) {
        $('#start_year').append($("<option></option>").attr("value", i).text(i + ' 年'));
        $('#end_year').append($("<option></option>").attr("value", i).text(i + ' 年'));
    }

    $('#start_year').change(function() {
        $('#end_year').val($(this).val()).trigger('change')
    });

    $('#search').click(function() {
        HoldOn.open({
            theme: "sk-bounce"
        });
        search_nearby_station($('#address').val());
        HoldOn.close();
    });

    $('#draw').click(function() {
        HoldOn.open({
            theme: "sk-bounce"
        });

        month_temperature = Array.apply(null, Array(12)).map(Number.prototype.valueOf, 0.0);
        month_rain = Array.apply(null, Array(12)).map(Number.prototype.valueOf, 0.0);
        month_sun = Array.apply(null, Array(12)).map(Number.prototype.valueOf, 0.00);
        month_td = Array.apply(null, Array(12)).map(Number.prototype.valueOf, 0.00);
        avg_temperature = Array(12);
        avg_rain = Array(12);
        avg_sun = Array(12);
        avg_td = Array(12);
        label = $('#station').val().split('_')[1] + ' ' + $('#start_year').val() + '~' + $('#end_year').val();

        base_url = 'https://raw.githubusercontent.com/OpenHackFarm/CODiS-data/master/STATION_NAME/YEAR.json'
        new_url = base_url.replace('STATION_NAME', $('#station').val()).replace('YEAR', $('#start_year').val() + '-' + $('#end_year').val());
        console.log(new_url);
        if(isValidURL(new_url)){
            $.ajax({
                url: new_url,
                type: 'GET',
                dataType: 'json',
                async: false,
                success: function(data) {
                    $.each(data, function(idx, li) {
                        avg_temperature[parseInt(idx) - 1] = parseFloat(li['Temperature']);
                        avg_rain[parseInt(idx) - 1] = parseFloat(li['Precp']);
                        avg_sun[parseInt(idx) - 1] = parseFloat(li['GloblRad']);
                        avg_td[parseInt(idx) - 1] = parseFloat(li['Td dew point']);
                    });
                }
            });
        } else {
          year_count = 0;
          for (var i = $('#start_year').val(); i <= $('#end_year').val(); i++) {
              new_url = base_url.replace('STATION_NAME', $('#station').val());
              new_url = new_url.replace('YEAR', i);
              console.log(new_url);

              $.ajax({
                  url: new_url,
                  type: 'GET',
                  dataType: 'json',
                  async: false,
                  success: function(data) {
                      if (isEmpty(data)) {
                          $.notify(i + "無資料", "error");
                      } else {
                          $.each(data, function(idx, li) {
                              month = idx.split('-')[1];
                              month_temperature[parseInt(month) - 1] += parseFloat(li['Temperature']);
                              month_rain[parseInt(month) - 1] += parseFloat(li['Precp']);
                              month_sun[parseInt(month) - 1] += parseFloat(li['GloblRad']);
                              month_td[parseInt(month) - 1] += parseFloat(li['Td dew point']);
                          });
                      }
                  }
              });

              year_count = year_count + 1;
          }

          // average temperature
          for (var i = 0; i < 12; i++) {
              avg_temperature[i] = (month_temperature[i] / year_count).toFixed(1);
              avg_rain[i] = (month_rain[i] / year_count).toFixed(1);
              avg_sun[i] = (month_sun[i] / year_count).toFixed(2);
              avg_td[i] = (month_td[i] / year_count).toFixed(2);
          }
        }

        draw_chart(label, avg_temperature, avg_rain, avg_sun, avg_td);

        HoldOn.close();
    });

    $('#clear').click(function() {
        clear_chart();
    });

    $('#shift_left').click(function() {
        shift_left();
    });
    $('#shift_right').click(function() {
        shift_right();
    });
});
