var json = (function() {
        var json = null;
        $.ajax({
            'async': false,
            'global': false,
            'url': "../data/data.json",
            'dataType': "json",
            'success': function (data) {
                json = data;
            }
        });
        return json;
    })();
    var id_perso = (function() {
        var json = null;
        $.ajax({
            'async': false,
            'global': false,
            'url': "../data/index_perso.json",
            'dataType': "json",
            'success': function (data) {
                json = data;
            }
        });
        return json;
    })();

    console.log(id_perso['Arya Stark']);

		const myChart = TimelinesChart();
    myChart(document.getElementById('myPlot'))
			.xTickFormat(function XLabel(n) {
        if (+n < 70){
          return 'S'+(+n+10).toString().charAt(0);
        }
      })
			.timeFormat('%Q')
			.data(json)
      .zQualitative(true)
      .width(1400)
      .rightMargin(150)
      //.sortChrono(false)
      //.zoomY([1, 35])
      //.zoomYLabels("Gendry", "Ygritte")
      .onLabelClick(function name(d) {
        const ind = id_perso[d];
        myChart.zoomY([ind, ind])
      })
			;