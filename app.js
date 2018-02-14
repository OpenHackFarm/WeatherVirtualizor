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
    config.data.datasets.splice(-1, 1);
    window.myLineChart.update();
}

function new_chart() {
    var ctx = document.getElementById("chart").getContext("2d");
    window.myLineChart = new Chart(ctx, config);
}

function draw_chart(label, avg_temperature) {
    if (window.myLineChart === undefined) {
        new_chart();
    }

    var newColor = dynamicColors();
    config.data.datasets.push({
        label: label,
        data: avg_temperature,
        fill: false,
        backgroundColor: newColor,
        borderColor: newColor
    });

    window.myLineChart.update();
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
            text: '歷史平均溫度統計'
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
                    labelString: 'Temperature'
                },
                ticks: {
                    min: 8,
                    max: 32,
                }
            }]
        },
        animation: {
            onProgress: drawBarValues,
            onComplete: drawBarValues
        },
    }
};

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
        avg_temperature = Array(12);
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
                        });
                    }
                }
            });

            year_count = year_count + 1;
        }

        // average temperature
        for (var i = 0; i < 12; i++) {
            avg_temperature[i] = (month_temperature[i] / year_count).toFixed(1);
        }

        draw_chart(label, avg_temperature);

        HoldOn.close();
    });

    $('#clear').click(function() {
        clear_chart();
    });
});
