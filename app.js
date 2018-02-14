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
    window.temperatureLineChart.update();
    window.rainLineChart.update();
    window.sunLineChart.update();
}

function new_chart() {
    var ctx_temperature = document.getElementById('chart_temperature').getContext("2d");
    var ctx_rain = document.getElementById('chart_rain').getContext("2d");
    var ctx_sun = document.getElementById('chart_sun').getContext("2d");
    window.temperatureLineChart = new Chart(ctx_temperature, config_temperature);
    window.rainLineChart = new Chart(ctx_rain, config_rain);
    window.sunLineChart = new Chart(ctx_sun, config_sun);
}

function draw_chart(label, avg_temperature, avg_rain, avg_sun) {
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

    window.temperatureLineChart.update();
    window.rainLineChart.update();
    window.sunLineChart.update();
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
        animation: {
            onProgress: drawBarValues,
            onComplete: drawBarValues
        },
    }
};
var config_temperature = $.extend(true, {}, config);
config_temperature['options']['title']['text'] = '歷史平均溫度';
config_temperature['options']['scales']['yAxes'][0]['scaleLabel']['labelString'] = 'Temperature';
config_temperature['options']['scales']['yAxes'][0]['ticks'] = {min: 8, max: 32};

var config_rain = $.extend(true, {}, config);
config_rain['options']['title']['text'] = '歷史降雨量統計';
config_rain['options']['scales']['yAxes'][0]['scaleLabel']['labelString'] = 'Rain';
config_rain['options']['scales']['yAxes'][0]['ticks'] = {min: 0, max: 900};

var config_sun = $.extend(true, {}, config);
config_sun['options']['title']['text'] = '歷史日射量統計';
config_sun['options']['scales']['yAxes'][0]['scaleLabel']['labelString'] = 'Sun';
config_sun['options']['scales']['yAxes'][0]['ticks'] = {min: 0, max: 700};

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
        avg_temperature = Array(12);
        avg_rain = Array(12);
        avg_sun = Array(12);
        label = $('#station').val().split('_')[1] + ' ' + $('#start_year').val() + '~' + $('#end_year').val();

        base_url = 'https://raw.githubusercontent.com/OpenHackFarm/CODiS-data/master/STATION_NAME/YEAR.json'
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
        }

        draw_chart(label, avg_temperature, avg_rain, avg_sun);

        HoldOn.close();
    });

    $('#clear').click(function() {
        clear_chart();
    });
});
