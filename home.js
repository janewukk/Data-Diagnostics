var module_list = [];
var line_chart_list = [];
var year_list = [];
var institute_list = [];
var value_data;
var pass_theshold;
var fail_theshold;
var cur_start_index = -1;
var cur_end_index = -1;
var script;
var cur_institution = [];
var cur_state = "";

/////////////////////////////////////////////////// get chart /////////////////////////////////////////////
function getChart(id) {
    var allCharts = AmCharts.charts;
    for (var i = 0; i < allCharts.length; i++) {
        if (id == allCharts[i].div.id) {
            return allCharts[i];
        }
    }
}

var generateRandomColors = function (number) {
    /*
    This generates colors using the following algorithm:
    Each time you create a color:
        Create a random, but attractive, color{
            Red, Green, and Blue are set to random luminosity.
            One random value is reduced significantly to prevent grayscale.
            Another is increased by a random amount up to 100%.
            They are mapped to a random total luminosity in a medium-high range (bright but not white).
        }
        Check for similarity to other colors{
            Check if the colors are very close together in value.
            Check if the colors are of similar hue and saturation.
            Check if the colors are of similar luminosity.
            If the random color is too similar to another,
            and there is still a good opportunity to change it:
                Change the hue of the random color and try again.
        }
        Output array of all colors generated
    */
    //if we've passed preloaded colors and they're in hex format
    if (typeof (arguments[1]) != 'undefined' && arguments[1].constructor == Array && arguments[1][0] && arguments[1][0].constructor != Array) {
        for (var i = 0; i < arguments[1].length; i++) { //for all the passed colors
            var vals = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(arguments[1][i]); //get RGB values
            arguments[1][i] = [parseInt(vals[1], 16), parseInt(vals[2], 16), parseInt(vals[3], 16)]; //and convert them to base 10
        }
    }
    var loadedColors = typeof (arguments[1]) == 'undefined' ? [] : arguments[1],//predefine colors in the set
        number = number + loadedColors.length,//reset number to include the colors already passed
        lastLoadedReduction = Math.floor(Math.random() * 3),//set a random value to be the first to decrease
        rgbToHSL = function (rgb) {//converts [r,g,b] into [h,s,l]
            var r = rgb[0], g = rgb[1], b = rgb[2], cMax = Math.max(r, g, b), cMin = Math.min(r, g, b), delta = cMax - cMin, l = (cMax + cMin) / 2, h = 0, s = 0; if (delta == 0) h = 0; else if (cMax == r) h = 60 * ((g - b) / delta % 6); else if (cMax == g) h = 60 * ((b - r) / delta + 2); else h = 60 * ((r - g) / delta + 4); if (delta == 0) s = 0; else s = delta / (1 - Math.abs(2 * l - 1)); return [h, s, l]
        }, hslToRGB = function (hsl) {//converts [h,s,l] into [r,g,b]
            var h = hsl[0], s = hsl[1], l = hsl[2], c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs(h / 60 % 2 - 1)), m = l - c / 2, r, g, b; if (h < 60) { r = c; g = x; b = 0 } else if (h < 120) { r = x; g = c; b = 0 } else if (h < 180) { r = 0; g = c; b = x } else if (h < 240) { r = 0; g = x; b = c } else if (h < 300) { r = x; g = 0; b = c } else { r = c; g = 0; b = x } return [r, g, b]
        }, shiftHue = function (rgb, degree) {//shifts [r,g,b] by a number of degrees
            var hsl = rgbToHSL(rgb); //convert to hue/saturation/luminosity to modify hue
            hsl[0] += degree; //increment the hue
            if (hsl[0] > 360) { //if it's too high
                hsl[0] -= 360 //decrease it mod 360
            } else if (hsl[0] < 0) { //if it's too low
                hsl[0] += 360 //increase it mod 360
            }
            return hslToRGB(hsl); //convert back to rgb
        }, differenceRecursions = {//stores recursion data, so if all else fails we can use one of the hues already generated
            differences: [],//used to calculate the most distant hue
            values: []//used to store the actual colors
        }, fixDifference = function (color) {//recursively asserts that the current color is distinctive
            if (differenceRecursions.values.length > 23) {//first, check if this is the 25th recursion or higher. (can we try any more unique hues?)
                //if so, get the biggest value in differences that we have and its corresponding value
                var ret = differenceRecursions.values[differenceRecursions.differences.indexOf(Math.max.apply(null, differenceRecursions.differences))];
                differenceRecursions = { differences: [], values: [] }; //then reset the recursions array, because we're done now
                return ret; //and then return up the recursion chain
            } //okay, so we still have some hues to try.
            var differences = []; //an array of the "difference" numbers we're going to generate.
            for (var i = 0; i < loadedColors.length; i++) { //for all the colors we've generated so far
                var difference = loadedColors[i].map(function (value, index) { //for each value (red,green,blue)
                    return Math.abs(value - color[index]) //replace it with the difference in that value between the two colors
                }), sumFunction = function (sum, value) { //function for adding up arrays
                    return sum + value
                }, sumDifference = difference.reduce(sumFunction), //add up the difference array
                    loadedColorLuminosity = loadedColors[i].reduce(sumFunction), //get the total luminosity of the already generated color
                    currentColorLuminosity = color.reduce(sumFunction), //get the total luminosity of the current color
                    lumDifference = Math.abs(loadedColorLuminosity - currentColorLuminosity), //get the difference in luminosity between the two
                    //how close are these two colors to being the same luminosity and saturation?
                    differenceRange = Math.max.apply(null, difference) - Math.min.apply(null, difference),
                    luminosityFactor = 50, //how much difference in luminosity the human eye should be able to detect easily
                    rangeFactor = 75; //how much difference in luminosity and saturation the human eye should be able to dect easily
                if (luminosityFactor / (lumDifference + 1) * rangeFactor / (differenceRange + 1) > 1) { //if there's a problem with range or luminosity
                    //set the biggest difference for these colors to be whatever is most significant
                    differences.push(Math.min(differenceRange + lumDifference, sumDifference));
                }
                differences.push(sumDifference); //otherwise output the raw difference in RGB values
            }
            var breakdownAt = 64, //if you're generating this many colors or more, don't try so hard to make unique hues, because you might fail.
                breakdownFactor = 25, //how much should additional colors decrease the acceptable difference
                shiftByDegrees = 15, //how many degrees of hue should we iterate through if this fails
                acceptableDifference = 250, //how much difference is unacceptable between colors
                breakVal = loadedColors.length / number * (number - breakdownAt), //break down progressively (if it's the second color, you can still make it a unique hue)
                totalDifference = Math.min.apply(null, differences); //get the color closest to the current color
            if (totalDifference > acceptableDifference - (breakVal < 0 ? 0 : breakVal) * breakdownFactor) { //if the current color is acceptable
                differenceRecursions = { differences: [], values: [] } //reset the recursions object, because we're done
                return color; //and return that color
            } //otherwise the current color is too much like another
            //start by adding this recursion's data into the recursions object
            differenceRecursions.differences.push(totalDifference);
            differenceRecursions.values.push(color);
            color = shiftHue(color, shiftByDegrees); //then increment the color's hue
            return fixDifference(color); //and try again
        }, color = function () { //generate a random color
            var scale = function (x) { //maps [0,1] to [300,510]
                return x * 210 + 300 //(no brighter than #ff0 or #0ff or #f0f, but still pretty bright)
            }, randVal = function () { //random value between 300 and 510
                return Math.floor(scale(Math.random()))
            }, luminosity = randVal(), //random luminosity
                red = randVal(), //random color values
                green = randVal(), //these could be any random integer but we'll use the same function as for luminosity
                blue = randVal(),
                rescale, //we'll define this later
                thisColor = [red, green, blue], //an array of the random values
				/*
				#ff0 and #9e0 are not the same colors, but they are on the same range of the spectrum, namely without blue.
				Try to choose colors such that consecutive colors are on different ranges of the spectrum.
				This shouldn't always happen, but it should happen more often then not.
				Using a factor of 2.3, we'll only get the same range of spectrum 15% of the time.
				*/
                valueToReduce = Math.floor(lastLoadedReduction + 1 + Math.random() * 2.3) % 3, //which value to reduce
				/*
				Because 300 and 510 are fairly close in reference to zero,
				increase one of the remaining values by some arbitrary percent betweeen 0% and 100%,
				so that our remaining two values can be somewhat different.
				*/
                valueToIncrease = Math.floor(valueToIncrease + 1 + Math.random() * 2) % 3, //which value to increase (not the one we reduced)
                increaseBy = Math.random() + 1; //how much to increase it by
            lastLoadedReduction = valueToReduce; //next time we make a color, try not to reduce the same one
            thisColor[valueToReduce] = Math.floor(thisColor[valueToReduce] / 16); //reduce one of the values
            thisColor[valueToIncrease] = Math.ceil(thisColor[valueToIncrease] * increaseBy) //increase one of the values
            rescale = function (x) { //now, rescale the random numbers so that our output color has the luminosity we want
                return x * luminosity / thisColor.reduce(function (a, b) { return a + b }) //sum red, green, and blue to get the total luminosity
            };
            thisColor = fixDifference(thisColor.map(function (a) { return rescale(a) })); //fix the hue so that our color is recognizable
            if (Math.max.apply(null, thisColor) > 255) { //if any values are too large
                rescale = function (x) { //rescale the numbers to legitimate hex values
                    return x * 255 / Math.max.apply(null, thisColor)
                }
                thisColor = thisColor.map(function (a) { return rescale(a) });
            }
            return thisColor;
        };
    for (var i = loadedColors.length; i < number; i++) { //Start with our predefined colors or 0, and generate the correct number of colors.
        loadedColors.push(color().map(function (value) { //for each new color
            return Math.round(value) //round RGB values to integers
        }));
    }
    //then, after you've made all your colors, convert them to hex codes and return them.
    return loadedColors.map(function (color) {
        var hx = function (c) { //for each value
            var h = c.toString(16);//then convert it to a hex code
            return h.length < 2 ? '0' + h : h//and assert that it's two digits
        }
        return "#" + hx(color[0]) + hx(color[1]) + hx(color[2]); //then return the hex code
    });
}


/////////////////////////////////////////////////// log out, reset //////////////////////////////////////////////////////////
function logout() {
    $.when(
        $.ajax({
            type: 'POST',
            url: 'Default.aspx/logout',
            contentType: "application/json; charset=utf-8",
            data: {},
            dataType: 'json'
        }))
        .done(function (data) {
            var id_token = data.d;
            var currentURL = window.location.href;
            if (currentURL.indexOf(':63855') > 0) {
                var address = 'http://localhost:63855/auth.html';
            } else {
                var address = 'http://casmpogwebsdv1:86/auth.html';
            }
            var url = "http://www.aspirecqi.org/HIEBus/IdentityServer/connect/endsession?id_token_hint=" + id_token + "&post_logout_redirect_uri=" + address;
            window.location.href = url;
        })
        .fail(function () {
            alert("Server error. Log out failed. Please try again.");
        });
}

function reset_click() {
    var chart = getChart("chartdiv");
    chart.zoomToIndexes(0, chart.dataProvider.length);

    $('#hover-content').hide();
    document.getElementById("1_year_btn").style.background = " #76bff0";
    document.getElementById("5_year_btn").style.background = "#76bff0";
    document.getElementById("10_year_btn").style.background = " #76bff0";
    document.getElementById("show_all_btn").style.background = "#686a6b";
    document.getElementById("stats_btn").style.background = "#f4b942";
    document.getElementById("selected_stats_btn").style.background = " #f4b942";
    document.getElementById("anomly_btn").style.background = " #76bff0";
    document.getElementById("passing_btn").style.background = "#76bff0";
    document.getElementById("border_btn").style.background = "#76bff0";
    document.getElementById("discont_btn").style.background = " #76bff0";
    document.getElementById("original_btn").style.background = " #686a6b";
    $('#institute_select').val(institute_list);
    $('#institute_select').multiselect("refresh");
    $('#statsdiv').hide();

    for (var i = 0; i < chart.graphs.length; i = i + 1) {
        chart.graphs[i]["hidden"] = false;
    }
    chart.validateData();

    cur_institution = institute_list;
    cur_state = "original";
    $('#start_year').val(year_list[0].substr(0, 7));
    $('#end_year').val(year_list[year_list.length - 1].substr(0, 7));
}


//////////////////////////////////////////////////// download data /////////////////////////////////////////////////////////
function download_all_data() {
    var data = [];
    //console.log(cur_start_index + " " + cur_end_index);
    for (var i = 0; i < institute_list.length; i = i + 1) {
        for (var j = cur_start_index; j <= cur_end_index; j = j + 1) {
            var temp = [];
            temp.push(institute_list[i]);
            temp.push(year_list[j]);
            temp.push(value_data[i][j]);
            data.push(temp);
        }
    }
    var csvContent = "data:text/csv;charset=utf-8,";
    data.forEach(function (infoArray, index) {
        dataString = infoArray.join(",");
        csvContent += index < data.length ? dataString + "\n" : dataString;
    });
    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "my_data.csv");
    document.body.appendChild(link); // Required for FF
    link.click();
}

function download_selected_data() {
    var data = [];
    for (var i = 0; i < institute_list.length; i = i + 1) {
        if (cur_institution.indexOf(institute_list[i]) != -1) {
            for (var j = cur_start_index; j <= cur_end_index; j = j + 1) {
                var temp = [];
                temp.push(institute_list[i]);
                temp.push(year_list[j]);
                temp.push(value_data[i][j]);
                data.push(temp);
            }
        }
    }
    var csvContent = "data:text/csv;charset=utf-8,";
    data.forEach(function (infoArray, index) {
        dataString = infoArray.join(",");
        csvContent += index < data.length ? dataString + "\n" : dataString;
    });
    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "my_data.csv");
    document.body.appendChild(link); // Required for FF
    link.click();
}

//////////////////////////////////////////////////// show hide graph stats /////////////////////////////////////////////////////
function calculate_stats() {
    script = "";
    for (var i = 0; i < institute_list.length; i = i + 1) {
        var fail_case = 0;
        var border_case = 0;
        var pass_case = 0;
        var empty_case = 0;
        var first_case = false;
        var first_case_index = 0;
        var last_case_index = 0;
        var total_case = 0;
        for (var j = cur_start_index; j <= cur_end_index; j = j + 1) {
            if (value_data[i][j] == null) {
                empty_case += 1;
            }
            else {
                if (first_case == false) {
                    first_case_index = j - cur_start_index;
                    first_case = true;
                }
                if (parseFloat(value_data[i][j]) < fail_theshold) {
                    fail_case += 1;
                    last_case_index = j - cur_start_index;
                }
                else if (parseFloat(value_data[i][j]) >= fail_theshold && parseFloat(value_data[i][j]) < pass_theshold) {
                    border_case += 1;
                    last_case_index = j - cur_start_index;
                }
                else {
                    pass_case += 1;
                    last_case_index = j - cur_start_index;
                }
            }
            total_case = total_case + 1;
        }
        script += "<tr><td>" + institute_list[i] + "</td><td>" + fail_case + "</td><td>" + border_case + "</td><td>" + pass_case + "</td><td>" + total_case + "</td>";
        if (empty_case === total_case) {
            script += "<td>No data available</td>";
        }
        else if (empty_case === 0) {
            script += "<td>Full range available</td>";
        }
        else {
            script += "<td>Partial range available</td>";
        }
        if (empty_case === total_case) {
            script += "<td></td></tr>";
        }
        else {
            if ((empty_case + (last_case_index - first_case_index + 1)) === total_case) {
                script += "<td>No</td></tr>";
            }
            else {
                script += "<td>Yes</td></tr>";
            }
        }

        //var dict = {};
        //dict.fail = fail_case;
        //dict.border = border_case;
        //dict.pass = pass_case;
        //dict.empty = empty_case;
        //dict.total_case = total_case;
        //data_result.push(dict);
    }
}

function show_stats() {
    document.getElementById("stats_btn").style.background = " #f46b41";
    document.getElementById("selected_stats_btn").style.background = " #f4b942";
    $('#statsdiv').show();
    $('#stats_tb').DataTable().destroy();
    $('#stats_tb tbody').empty();
    calculate_stats();
    $('#stats_tb tbody').append(script);
    var table = $('#stats_tb').DataTable({
        "pageLength": 15,
        aLengthMenu: [
            [15, 30, 60, -1],
            [15, 30, 60, "All"]
        ],
        iDisplayLength: -1,
        dom: 'Blfrtip',
        buttons: [
            'copy', 'csv', 'excel', 'pdf', 'print'
        ]
    });
    $('#curtain_stats').hide();
    $('#stats_tb_div').show();
    var target = this.hash, $target = $('#statsdiv');
    $('html, body').stop().animate({
        'scrollTop': $target.offset().top
    }, 700, 'swing', function () {
        window.location.hash = target;
    });
}

function calculate_current_stats() {
    script = "";
    for (var i = 0; i < institute_list.length; i = i + 1) {
        if (cur_institution.indexOf(institute_list[i]) != -1) {
            var fail_case = 0;
            var border_case = 0;
            var pass_case = 0;
            var empty_case = 0;
            var first_case = false;
            var first_case_index = 0;
            var last_case_index = 0;
            var total_case = 0;
            for (var j = cur_start_index; j <= cur_end_index; j = j + 1) {
                if (value_data[i][j] == null) {
                    empty_case += 1;
                }
                else {
                    if (first_case == false) {
                        first_case_index = j - cur_start_index;
                        first_case = true;
                    }
                    if (parseFloat(value_data[i][j]) < fail_theshold) {
                        fail_case += 1;
                        last_case_index = j - cur_start_index;
                    }
                    else if (parseFloat(value_data[i][j]) >= fail_theshold && parseFloat(value_data[i][j]) < pass_theshold) {
                        border_case += 1;
                        last_case_index = j - cur_start_index;
                    }
                    else {
                        pass_case += 1;
                        last_case_index = j - cur_start_index;
                    }
                }
                total_case = total_case + 1;
            }
            script += "<tr><td>" + institute_list[i] + "</td><td>" + fail_case + "</td><td>" + border_case + "</td><td>" + pass_case + "</td><td>" + total_case + "</td>";
            if (empty_case === total_case) {
                script += "<td>No data available</td>";
            }
            else if (empty_case === 0) {
                script += "<td>Full range available</td>";
            }
            else {
                script += "<td>Partial range available</td>";
            }
            if (empty_case === total_case) {
                script += "<td></td></tr>";
            }
            else {
                if ((empty_case + (last_case_index - first_case_index + 1)) === total_case) {
                    script += "<td>No</td></tr>";
                }
                else {
                    script += "<td>Yes</td></tr>";
                }
            }
        }
    }
}

function show_current_stats() {
    document.getElementById("selected_stats_btn").style.background = " #f46b41";
    document.getElementById("stats_btn").style.background = " #f4b942";
    $('#statsdiv').show();
    $('#stats_tb').DataTable().destroy();
    $('#stats_tb tbody').empty();
    calculate_current_stats();
    $('#stats_tb tbody').append(script);
    var table = $('#stats_tb').DataTable({
        "pageLength": 15,
        aLengthMenu: [
            [15, 30, 60, -1],
            [15, 30, 60, "All"]
        ],
        iDisplayLength: -1,
        dom: 'Blfrtip',
        buttons: [
            'copy', 'csv', 'excel', 'pdf', 'print'
        ]
    });
    $('#curtain_stats').hide();
    $('#stats_tb_div').show();
    var target = this.hash, $target = $('#statsdiv');
    $('html, body').stop().animate({
        'scrollTop': $target.offset().top
    }, 700, 'swing', function () {
        window.location.hash = target;
    });
}

function sub_table(institution_name) {
    var tbody_val = '<table cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;" id="' + institution_name + '">';
    tbody_val += '<thead><tr><th>X Value</th><th>Y Value</th></tr></thead><tbody> ';
    var i = institute_list.indexOf(institution_name);
    for (var j = cur_start_index; j <= cur_end_index; j = j + 1) {
        tbody_val += "<tr>";
        tbody_val += "<td>" + year_list[j] + "</td>";
        if (value_data[i][j] == null) {
            tbody_val += "<td>n/a</td>";
        }
        else {
            tbody_val += "<td>" + value_data[i][j] + "</td>";
        }
        tbody_val += "</tr>";
    }
    tbody_val += "</tbody></table>"
    return tbody_val;
}

function show_raw_data() {
    var tbody_val = "";
    for (var i = 0; i < institute_list.length; i = i + 1) {
        tbody_val += "<tr>";
        tbody_val += "<td class='details-control'>+</td>";
        tbody_val += "<td>" + institute_list[i] + "</td>";
        var total = 0;
        var month = 0;
        for (var j = cur_start_index; j <= cur_end_index; j = j + 1) {
            month += 1;
            if (value_data[i][j] != null) {
                total += value_data[i][j];
            }
        }
        tbody_val += "<td>" + (total / month * 100).toFixed(2) + "%</td>";
        tbody_val += "</tr>";
    }
    $('#raw_data_tb').DataTable().destroy();
    $('#raw_data_tb tbody').empty();
    $('#raw_data_tb tbody').append(tbody_val);
    var table = $('#raw_data_tb').DataTable({
        "pageLength": 15,
        aLengthMenu: [
            [15, 30, 60, -1],
            [15, 30, 60, "All"]
        ],
        iDisplayLength: -1,
        dom: 'Blfrtip',
        buttons: [
            'copy', 'csv', 'excel', 'pdf', 'print'
        ],
    });

    $('#raw_data_tb tbody').on('click', 'td.details-control', function () {
        var tr = $(this).closest('tr');
        var row = table.row(tr);
        if (row.child.isShown()) {
            row.child.hide();
            //tr.removeClass('shown');
        }
        else {
            row.child(sub_table(row.data()[1])).show();
            //tr.addClass('shown');
        }
    });

    $('#statsdiv').show();
    $('#curtain_stats').hide();
    $('#raw_data_tb_div').show();
    var target = this.hash, $target = $('#raw_data_tb_div');
    $('html, body').stop().animate({
        'scrollTop': $target.offset().top
    }, 700, 'swing', function () {
        window.location.hash = target;
    });
}


///////////////////////////////////////////////////////// institution change /////////////////////////////////////////////
$(function () {
    $('#institute_select').change(function () {
        var chart = getChart("chartdiv");
        if (chart != null) {
            var chart = getChart("chartdiv");
            var list_display = $(this).val();
            cur_institution = list_display;
            for (var i = 0; i < chart.graphs.length; i = i + 1) {
                var id = chart.graphs[i]["id"];
                if (list_display === null || list_display.indexOf(id) == -1) {
                    chart.graphs[i]["hidden"] = true;
                }
                else {
                    chart.graphs[i]["hidden"] = false;
                }
            }
            chart.validateData();
            chart.zoomToIndexes(cur_start_index, cur_end_index);
        }
        else {
            var list_display = $(this).val();
            cur_institution = list_display;
        }
    });
});


/////////////////////////////////////////////////// show 1 year, 5 year, 10 year ///////////////////////////////////////////
function show_1_year() {
    $('#hover-content').hide();
    document.getElementById("1_year_btn").style.background = " #686a6b";
    document.getElementById("5_year_btn").style.background = "#76bff0";
    document.getElementById("10_year_btn").style.background = " #76bff0";
    document.getElementById("show_all_btn").style.background = "#76bff0";
    document.getElementById("stats_btn").style.background = "#f4b942";
    document.getElementById("selected_stats_btn").style.background = " #f4b942";
    $('#statsdiv').hide();
    var end_index = year_list.length;
    var end_year = parseInt(String(year_list[year_list.length - 1]).substr(0, 4));
    var start_year = end_year - 1;
    var start_month = parseInt(String(year_list[year_list.length - 1]).substr(5, 2));
    var start_index = end_index;
    var start_ok = false;

    for (var i = year_list.length - 1; i >= 0; i = i - 1) {
        if (start_ok === false) {
            if (start_year === parseInt(year_list[i].substr(0, 4)) &&
                start_month === parseInt(year_list[i].substr(5, 2))) {
                start_index = i;
                start_ok = true;
                break;
            }
        }
    }
    cur_start_index = start_index;
    cur_end_index = year_list.length - 1;
    if (start_month < 10) {
        $('#start_year').val(start_year + '-0' + start_month);
        $('#end_year').val(end_year + '-0' + start_month);
    }
    else {
        $('#start_year').val(start_year + '-' + start_month);
        $('#end_year').val(end_year + '-' + start_month);
    }
    var chart = getChart("chartdiv");
    if (chart != null) {
        chart.zoomToIndexes(start_index, end_index);
        if (cur_state === "anomly") {
            anomly_detection();
        }
        else if (cur_state === "border") {
            border_detection();
        }
        else if (cur_state === "passing") {
            passing_detection();
        }
        else if (cur_state === "discont") {
            discont_detection();
        }
    }
}

function show_5_year() {
    $('#hover-content').hide();
    document.getElementById("1_year_btn").style.background = " #76bff0";
    document.getElementById("5_year_btn").style.background = "#686a6b";
    document.getElementById("10_year_btn").style.background = " #76bff0";
    document.getElementById("show_all_btn").style.background = "#76bff0";
    document.getElementById("stats_btn").style.background = "#f4b942";
    document.getElementById("selected_stats_btn").style.background = " #f4b942";
    $('#statsdiv').hide();
    var end_index = year_list.length;
    var end_year = parseInt(String(year_list[year_list.length - 1]).substr(0, 4));
    var start_year = end_year - 5;
    var start_month = parseInt(String(year_list[year_list.length - 1]).substr(5, 2));
    var start_index = end_index;
    var start_ok = false;

    for (var i = year_list.length - 1; i >= 0; i = i - 1) {
        if (start_ok === false) {
            if (start_year === parseInt(year_list[i].substr(0, 4)) &&
                start_month === parseInt(year_list[i].substr(5, 2))) {
                start_index = i;
                start_ok = true;
                break;
            }
        }
    }
    cur_start_index = start_index;
    cur_end_index = year_list.length - 1;
    if (start_month < 10) {
        $('#start_year').val(start_year + '-0' + start_month);
        $('#end_year').val(end_year + '-0' + start_month);
    }
    else {
        $('#start_year').val(start_year + '-' + start_month);
        $('#end_year').val(end_year + '-' + start_month);
    }

    var chart = getChart("chartdiv");
    if (chart != null) {
        chart.zoomToIndexes(start_index, end_index);
        if (cur_state === "anomly") {
            anomly_detection();
        }
        else if (cur_state === "border") {
            border_detection();
        }
        else if (cur_state === "passing") {
            passing_detection();
        }
        else if (cur_state === "discont") {
            discont_detection();
        }
    }
}

function show_10_year() {
    $('#hover-content').hide();
    document.getElementById("1_year_btn").style.background = " #76bff0";
    document.getElementById("5_year_btn").style.background = "#76bff0";
    document.getElementById("10_year_btn").style.background = " #686a6b";
    document.getElementById("show_all_btn").style.background = "#76bff0";
    document.getElementById("stats_btn").style.background = "#f4b942";
    document.getElementById("selected_stats_btn").style.background = " #f4b942";
    $('#statsdiv').hide();
    var end_index = year_list.length;
    var end_year = parseInt(String(year_list[year_list.length - 1]).substr(0, 4));
    var start_year = end_year - 10;
    var start_month = parseInt(String(year_list[year_list.length - 1]).substr(5, 2));
    var start_index = end_index;
    var start_ok = false;
    for (var i = year_list.length - 1; i >= 0; i = i - 1) {
        if (start_ok === false) {
            if (start_year === parseInt(year_list[i].substr(0, 4)) &&
                start_month === parseInt(year_list[i].substr(5, 2))) {
                start_index = i;
                start_ok = true;
                break;
            }
        }
    }
    cur_start_index = start_index;
    cur_end_index = year_list.length - 1;
    if (start_month < 10) {
        $('#start_year').val(start_year + '-0' + start_month);
        $('#end_year').val(end_year + '-0' + start_month);
    }
    else {
        $('#start_year').val(start_year + '-' + start_month);
        $('#end_year').val(end_year + '-' + start_month);
    }

    var chart = getChart("chartdiv");
    if (chart != null) {
        chart.zoomToIndexes(start_index, end_index);
        if (cur_state === "anomly") {
            anomly_detection();
        }
        else if (cur_state === "border") {
            border_detection();
        }
        else if (cur_state === "passing") {
            passing_detection();
        }
        else if (cur_state === "discont") {
            discont_detection();
        }
    }
}

function show_all() {
    $('#hover-content').hide();
    document.getElementById("1_year_btn").style.background = " #76bff0";
    document.getElementById("5_year_btn").style.background = "#76bff0";
    document.getElementById("10_year_btn").style.background = " #76bff0";
    document.getElementById("show_all_btn").style.background = "#686a6b";
    document.getElementById("stats_btn").style.background = "#f4b942";
    document.getElementById("selected_stats_btn").style.background = " #f4b942";
    $('#statsdiv').hide();
    cur_start_index = 0;
    cur_end_index = year_list.length - 1;
    var chart = getChart("chartdiv");
    var end_year = parseInt(String(year_list[year_list.length - 1]).substr(0, 4));
    var end_month = parseInt(String(year_list[year_list.length - 1]).substr(5, 2));
    var start_year = parseInt(String(year_list[0]).substr(0, 4));
    var start_month = parseInt(String(year_list[0]).substr(5, 2));
    if (start_month < 10) {
        $('#start_year').val(start_year + '-0' + start_month);
        $('#end_year').val(end_year + '-0' + end_month);
    }
    else {
        $('#start_year').val(start_year + '-' + start_month);
        $('#end_year').val(end_year + '-' + start_month);
    }
    if (chart != null) {
        chart.zoomToIndexes(0, year_list.length);
        if (cur_state === "anomly") {
            anomly_detection();
        }
        else if (cur_state === "border") {
            border_detection();
        }
        else if (cur_state === "passing") {
            passing_detection();
        }
        else if (cur_state === "discont") {
            discont_detection();
        }
    }
}

function update_year() {
    $('#hover-content').hide();
    var chart = getChart("chartdiv");
    $('#statsdiv').hide();
    document.getElementById("stats_btn").style.background = "#f4b942";
    document.getElementById("selected_stats_btn").style.background = " #f4b942";
    document.getElementById("1_year_btn").style.background = " #76bff0";
    document.getElementById("5_year_btn").style.background = "#76bff0";
    document.getElementById("10_year_btn").style.background = " #76bff0";
    document.getElementById("show_all_btn").style.background = "#76bff0";

    var index = $('#start_year').val().indexOf('-');
    var idx = $('#end_year').val().indexOf('-');
    if (index == -1) {
        // 2000 - 2006
        if (idx == -1) {
            var start_year = parseInt($('#start_year').val());
            var start_month = 1;
            var end_year = parseInt($('#end_year').val());
            var end_month = 12;
        }
        // 2000 - 2006-01
        else if (idx == 4) {
            var start_year = parseInt($('#start_year').val());
            var start_month = 1;
            var end_year = parseInt($('#end_year').val().split('-')[0]);
            var end_month = parseInt($('#end_year').val().split('-')[1]);
        }
        // 2000 - 01-2006
        else {
            var end_year = parseInt($('#end_year').val());
            var end_month = 12;
            var end_year = parseInt($('#end_year').val().split('-')[1]);
            var end_month = parseInt($('#end_year').val().split('-')[0]);
        }
    }
    else {
        if (idx == -1) {
            if (index != 2 && index != 1) {
                var start_year = parseInt($('#start_year').val().split('-')[0]);
                var start_month = parseInt($('#start_year').val().split('-')[1]);
                var end_year = parseInt($('#end_year').val());
                var end_month = 12;
            }
            // 01-2006 - 12-2006
            else {
                var start_year = parseInt($('#start_year').val().split('-')[1]);
                var start_month = parseInt($('#start_year').val().split('-')[0]);
                var end_year = parseInt($('#end_year').val());
                var end_month = 12;
            }
        }
        else {
            if (index != 2 && index != 1) {
                // 2006-01 - 2006-12
                if (idx != 2 && idx != 1) {
                    var start_year = parseInt($('#start_year').val().split('-')[0]);
                    var start_month = parseInt($('#start_year').val().split('-')[1]);
                    var end_year = parseInt($('#end_year').val().split('-')[0]);
                    var end_month = parseInt($('#end_year').val().split('-')[1]);
                }
                // 2006-01 - 12-2006
                else {
                    var start_year = parseInt($('#start_year').val().split('-')[0]);
                    var start_month = parseInt($('#start_year').val().split('-')[1]);
                    var end_year = parseInt($('#end_year').val().split('-')[1]);
                    var end_month = parseInt($('#end_year').val().split('-')[0]);
                }
            }
            else {
                // 01-2006 - 12-2006
                if (idx == 2 || idx == 1) {
                    var start_year = parseInt($('#start_year').val().split('-')[1]);
                    var start_month = parseInt($('#start_year').val().split('-')[0]);
                    var end_year = parseInt($('#end_year').val().split('-')[1]);
                    var end_month = parseInt($('#end_year').val().split('-')[0]);
                }
                // 01-2006 - 2006-12
                else {
                    var start_year = parseInt($('#start_year').val().split('-')[1]);
                    var start_month = parseInt($('#start_year').val().split('-')[0]);
                    var end_year = parseInt($('#end_year').val().split('-')[0]);
                    var end_month = parseInt($('#end_year').val().split('-')[1]);
                }
            }
        }
    }

    cur_end_year = end_year;
    cur_end_month = end_month;
    var start_index = 0;
    var start_ok = false;
    var end_index = chart.dataProvider.length;
    var end_ok = false;

    if (start_year === "" || (start_year < parseInt(year_list[0].substr(0, 4)))) {
        start_index = 0;
        start_ok = true;
    }

    if (end_year === "" || (end_year > parseInt(year_list[year_list.length - 1].substr(0, 4)))) {
        end_index = chart.dataProvider.length;
        end_ok = true;
    }

    if (end_year === parseInt(year_list[year_list.length - 1].substr(0, 4))
        && end_month >= parseInt(year_list[year_list.length - 1].substr(5, 2))) {
        end_index = chart.dataProvider.length;
        end_ok = true;
    }

    if (start_year === parseInt(year_list[0].substr(0, 4)) &&
        start_month <= parseInt(year_list[0].substr(5, 2))) {
        start_index = 0;
        start_ok = true;
    }

    var cur_year;
    var cur_month;
    for (var i = 0; i < chart.dataProvider.length; i = i + 1) {
        cur_year = parseInt(year_list[i].substr(0, 4));
        cur_month = parseInt(year_list[i].substr(5, 2));
        if (start_ok === false) {
            if (start_year === parseInt(year_list[i].substr(0, 4)) && start_month <= parseInt(year_list[i].substr(5, 2))) {
                start_index = i;
                start_ok = true;
            }
        }
        if (end_ok === false) {
            if (end_year <= parseInt(year_list[i].substr(0, 4)) && end_month <= parseInt(year_list[i].substr(5, 2))) {
                end_index = i;
                end_ok = true;
            }
        }
    }
    cur_start_index = start_index;
    cur_end_index = end_index;

    if (chart != null) {
        chart.zoomToIndexes(start_index, end_index);
        if (cur_state === "anomly") {
            anomly_detection();
        }
        else if (cur_state === "border") {
            border_detection();
        }
        else if (cur_state === "passing") {
            passing_detection();
        }
        else if (cur_state === "discont") {
            discont_detection();
        }
    }
}


/////////////////////////////////////////////////////// anomly detection //////////////////////////////////////////////
function anomly_detection() {
    document.getElementById("anomly_btn").style.background = " #686a6b";
    document.getElementById("passing_btn").style.background = "#76bff0";
    document.getElementById("original_btn").style.background = " #76bff0";
    document.getElementById("border_btn").style.background = "#76bff0";
    document.getElementById("discont_btn").style.background = " #76bff0";
    document.getElementById("stats_btn").style.background = "#f4b942";
    document.getElementById("selected_stats_btn").style.background = " #f4b942";
    $('#statsdiv').hide();

    cur_state = "anomly";
    var anomly_institution = [];
    cur_institution = [];

    for (i = 0; i < institute_list.length; i = i + 1) {
        anomly_institution.push(false);
    }
    for (var i = cur_start_index; i <= cur_end_index; i = i + 1) {
        for (var j = 0; j < institute_list.length; j = j + 1) {
            if (anomly_institution[j] == false) {
                if (value_data[j][i] !== null && parseFloat(value_data[j][i]) < fail_theshold) {
                    cur_institution.push(institute_list[j]);
                    anomly_institution[j] = true;
                }
            }
        }
    }

    var chart = getChart("chartdiv");
    for (var i = 0; i < chart.graphs.length; i = i + 1) {
        var id = chart.graphs[i]["id"];
        if (cur_institution.length === null || cur_institution.indexOf(id) == -1) {
            chart.graphs[i]["hidden"] = true;
        }
        else {
            chart.graphs[i]["hidden"] = false;
        }
    }
    chart.validateData();
    if (cur_institution.length == 0) {
        $('#hover-content').show();
        $('#institute_select option:selected').prop("selected", false);
        $('#institute_select').multiselect("refresh");
    }
    else {
        $('#hover-content').hide();
        $('#institute_select').val(cur_institution);
        $('#institute_select').multiselect("refresh");
    }
    chart.zoomToIndexes(cur_start_index, cur_end_index);
}

function border_detection() {
    document.getElementById("anomly_btn").style.background = " #76bff0";
    document.getElementById("passing_btn").style.background = "#76bff0";
    document.getElementById("original_btn").style.background = " #76bff0";
    document.getElementById("border_btn").style.background = "#686a6b";
    document.getElementById("discont_btn").style.background = " #76bff0";
    document.getElementById("stats_btn").style.background = "#f4b942";
    document.getElementById("selected_stats_btn").style.background = " #f4b942";
    $('#statsdiv').hide();

    var anomly_institution = [];
    cur_institution = [];
    cur_state = "border";
    for (i = 0; i < institute_list.length; i = i + 1) {
        anomly_institution.push(false);
    }
    for (j = 0; j < institute_list.length; j = j + 1) {
        var not_fail_case = 0;
        var pass_case = 0;
        var total_case = 0;
        for (i = cur_start_index; i <= cur_end_index; i = i + 1) {
            if (value_data[j][i] != null) {
                if (parseFloat(value_data[j][i]) >= fail_theshold) {
                    not_fail_case += 1;
                }
                if (parseFloat(value_data[j][i]) >= pass_theshold) {
                    pass_case += 1;
                }
                total_case += 1;
            }
        }
        if (not_fail_case == total_case && not_fail_case > pass_case) {
            anomly_institution[j] = true;
            cur_institution.push(institute_list[j]);
        }
    }

    var chart = getChart("chartdiv");
    for (var i = 0; i < chart.graphs.length; i = i + 1) {
        var id = chart.graphs[i]["id"];
        if (cur_institution.length === null || cur_institution.indexOf(id) == -1) {
            chart.graphs[i]["hidden"] = true;
        }
        else {
            chart.graphs[i]["hidden"] = false;
        }
    }
    chart.validateData();
    if (cur_institution.length == 0) {
        $('#hover-content').show();
        $('#institute_select option:selected').prop("selected", false);
        $('#institute_select').multiselect("refresh");
    }
    else {
        $('#hover-content').hide();
        $('#institute_select').val(cur_institution);
        $('#institute_select').multiselect("refresh");
    }
    chart.zoomToIndexes(cur_start_index, cur_end_index);
}

function discont_detection() {
    document.getElementById("anomly_btn").style.background = " #76bff0";
    document.getElementById("passing_btn").style.background = "#76bff0";
    document.getElementById("original_btn").style.background = " #76bff0";
    document.getElementById("border_btn").style.background = "#76bff0";
    document.getElementById("discont_btn").style.background = " #686a6b";
    document.getElementById("stats_btn").style.background = "#f4b942";
    document.getElementById("selected_stats_btn").style.background = " #f4b942";
    $('#statsdiv').hide();

    var anomly_institution = [];
    cur_state = "discont";
    for (i = 0; i < institute_list.length; i = i + 1) {
        anomly_institution.push(false);
    }
    cur_institution = [];
    for (var i = 0; i < institute_list.length; i = i + 1) {
        var empty_case = 0;
        var first_case = false;
        var first_case_index = 0;
        var last_case_index = 0;
        var total_case = 0;
        for (var j = cur_start_index; j <= cur_end_index; j = j + 1) {
            if (value_data[i][j] == null) {
                empty_case += 1;
            }
            else {
                if (first_case == false) {
                    first_case_index = j - cur_start_index;
                    first_case = true;
                }
                last_case_index = j - cur_start_index;
            }
            total_case = total_case + 1;
        }
        if (empty_case != total_case && (empty_case + (last_case_index - first_case_index + 1)) > total_case) {
            anomly_institution[i] = true;
            cur_institution.push(institute_list[i]);
        }
    }

    var chart = getChart("chartdiv");
    for (var i = 0; i < chart.graphs.length; i = i + 1) {
        var id = chart.graphs[i]["id"];
        if (cur_institution.length === null || cur_institution.indexOf(id) == -1) {
            chart.graphs[i]["hidden"] = true;
        }
        else {
            chart.graphs[i]["hidden"] = false;
        }
    }
    chart.validateData();
    if (cur_institution.length == 0) {
        $('#hover-content').show();
        $('#institute_select option:selected').prop("selected", false);
        $('#institute_select').multiselect("refresh");
    }
    else {
        $('#hover-content').hide();
        $('#institute_select').val(cur_institution);
        $('#institute_select').multiselect("refresh");
    }
    chart.zoomToIndexes(cur_start_index, cur_end_index);
}

function passing_detection() {
    document.getElementById("anomly_btn").style.background = " #76bff0";
    document.getElementById("passing_btn").style.background = "#686a6b";
    document.getElementById("original_btn").style.background = " #76bff0";
    document.getElementById("border_btn").style.background = "#76bff0";
    document.getElementById("discont_btn").style.background = " #76bff0";
    document.getElementById("stats_btn").style.background = "#f4b942";
    document.getElementById("selected_stats_btn").style.background = " #f4b942";
    $('#statsdiv').hide();

    var anomly_institution = [];
    cur_state = "passing";
    for (i = 0; i < institute_list.length; i = i + 1) {
        anomly_institution.push(false);
    }
    for (i = cur_start_index; i <= cur_end_index; i = i + 1) {
        for (j = 0; j < institute_list.length; j = j + 1) {
            if (anomly_institution[j] == false) {
                if (value_data[j][i] !== null && parseFloat(value_data[j][i]) < pass_theshold) {
                    anomly_institution[j] = true;
                }
            }
        }
    }

    cur_institution = [];
    for (i = 0; i < institute_list.length; i = i + 1) {
        if (anomly_institution[i] == false) {
            cur_institution.push(institute_list[i]);
        }
    }
    var chart = getChart("chartdiv");
    for (var i = 0; i < chart.graphs.length; i = i + 1) {
        var id = chart.graphs[i]["id"];
        if (cur_institution.length === null || cur_institution.indexOf(id) == -1) {
            chart.graphs[i]["hidden"] = true;
        }
        else {
            chart.graphs[i]["hidden"] = false;
        }
    }
    chart.validateData();
    if (cur_institution.length == 0) {
        $('#hover-content').show();
        $('#institute_select option:selected').prop("selected", false);
        $('#institute_select').multiselect("refresh");
    }
    else {
        $('#hover-content').hide();
        $('#institute_select').val(cur_institution);
        $('#institute_select').multiselect("refresh");
    }
    chart.zoomToIndexes(cur_start_index, cur_end_index);
}

function return_all() {
    document.getElementById("anomly_btn").style.background = " #76bff0";
    document.getElementById("passing_btn").style.background = "#76bff0";
    document.getElementById("original_btn").style.background = " #686a6b";
    document.getElementById("border_btn").style.background = "#76bff0";
    document.getElementById("discont_btn").style.background = " #76bff0";
    document.getElementById("stats_btn").style.background = "#f4b942";
    document.getElementById("selected_stats_btn").style.background = " #f4b942";
    $('#statsdiv').hide();

    $('#hover-content').hide();
    cur_state = "original";
    cur_institution = institute_list;
    $('#institute_select').val(institute_list);
    $('#institute_select').multiselect("refresh");
    var chart = getChart("chartdiv");
    for (var i = 0; i < chart.graphs.length; i = i + 1) {
        chart.graphs[i]["hidden"] = false;
    }
    chart.validateData();
    chart.zoomToIndexes(cur_start_index, cur_end_index);
}


/////////////////////////////////////////////////// module change ////////////////////////////////////
function module_select_change() {
    $('#statsdiv').hide();
    //$('#institute_select').val(institute_list);
    //$('#institute_select').multiselect("refresh");

    document.getElementById("stats_btn").style.background = "#f4b942";
    document.getElementById("selected_stats_btn").style.background = " #f4b942";
    document.getElementById("anomly_btn").style.background = " #76bff0";
    document.getElementById("passing_btn").style.background = "#76bff0";
    document.getElementById("original_btn").style.background = " #686a6b";
    document.getElementById("border_btn").style.background = "#76bff0";
    document.getElementById("discont_btn").style.background = " #76bff0";

    $('#curtain').hide("fast");
    $('#nograph').show("fast");
    var chart = getChart("chartdiv");
    if (chart != null) {
        chart.clear();
    }
    $('#chartdiv').empty();

    var id = $('#module_select option:selected').val();
    if (id != "any") {
        var options2 = $("#line_chart_select");
        options2.empty();
        options2.append('<option value="empty">...</option>');
        for (var i = 0; i < line_chart_list.length; i++) {
            if (line_chart_list[i]["module_id"] == id) {
                options2.append('<option value="' + line_chart_list[i]["module_id"] + '">' + line_chart_list[i]["display_name"] + '</option>');
            }
        }
    }
    else {
        var options2 = $("#line_chart_select");
        options2.empty();
        options2.append('<option value="empty">...</option>');
        for (var i = 0; i < line_chart_list.length; i++) {
            options2.append('<option value="' + line_chart_list[i]["module_id"] + '">' + line_chart_list[i]["display_name"] + '</option>');
        }
    }
}


////////////////////////////////////////////////////////// new line chart //////////////////////////////////////////////
function line_chart_select_change() {
    if ($('#line_chart_select option:selected').text() != "...") {
        $('#module_select').prop('disabled', true);
        $('#line_chart_select').prop('disabled', true);
        var line_chart = $('#line_chart_select option:selected').text();
        $('#statsdiv').hide();
        document.getElementById("stats_btn").style.background = "#f4b942";
        document.getElementById("selected_stats_btn").style.background = " #f4b942";
        document.getElementById("anomly_btn").style.background = " #76bff0";
        document.getElementById("passing_btn").style.background = "#76bff0";
        document.getElementById("original_btn").style.background = " #686a6b";
        document.getElementById("border_btn").style.background = "#76bff0";
        document.getElementById("discont_btn").style.background = " #76bff0";
        cur_state = "original";
        $('#nograph').hide("fast");
        $('#chartdiv').show(100);
        $('#curtain').show(200);
        var id;
        for (var i = 0; i < line_chart_list.length; i = i + 1) {
            if (line_chart === line_chart_list[i]["display_name"]) {
                id = line_chart_list[i]["line_chart_id"];
            }
        }

        var chart = getChart("chartdiv");
        if (chart != null) {
            chart.clear();
        }
        $('#chartdiv').empty();
        $.when(
            $.ajax({
                url: 'Graph.aspx/getImage',
                type: 'POST',
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify({ line_chart_id: id }),
                dataType: 'json'
            }))
            .done(function (response) {
                $('#hover-content').hide();
                $('#year_div').tooltip('disable');
                $('#filter_div').tooltip('disable');

                jQuery.fn.extend({
                    disable: function (state) {
                        return this.each(function () {
                            this.disabled = state;
                        });
                    }
                });

                $('input[type="button"]').disable(false);
                $('#start_year').prop('disabled', false);
                $('#end_year').prop('disabled', false);

                var is_percentage = response.d["is_percentage"];
                if (response.d["failing_theshold"] != null) {
                    fail_theshold = parseFloat(response.d["failing_theshold"]);
                }
                else {
                    fail_theshold = response.d["failing_theshold"];
                }
                if (response.d["passing_theshold"] != null) {
                    pass_theshold = parseFloat(response.d["passing_theshold"]);
                }
                else {
                    pass_theshold = response.d["passing_theshold"];
                }
                if (response.d["y_min"] != null) {
                    var y_min = parseFloat(response.d["y_min"]);
                }
                else {
                    var y_min = response.d["y_min"];
                }
                if (response.d["y_max"] != null) {
                    var y_max = parseFloat(response.d["y_max"]);
                }
                else {
                    var y_max = response.d["y_max"];
                }

                value_data = response.d["value"];
                year_list = response.d["date"];
                $('#long_display_name').text(response.d["display_name"]);

                if ($('#start_year').val() === "2000-01" && $('#start_year').val() === "2000-01") {
                    $('#start_year').val(year_list[0].substr(0, 7));
                    $('#end_year').val(year_list[year_list.length - 1].substr(0, 7));
                }
                if (cur_start_index == -1 && cur_end_index == -1) {
                    cur_start_index = 0;
                    cur_end_index = year_list.length - 1;
                }
                if (cur_institution.length == 0) {
                    cur_institution = institute_list;
                }
                var chartdata = [];
                var graph_val = [];
                var guide_val = [];
                var color = generateRandomColors(institute_list.length);

                // helper function declared as variable
                var balloonfunction = function (graphDataItem, graph) {
                    var percent = (graphDataItem["dataContext"][graph["id"]] * 100).toFixed(2);
                    return graph["id"] + "<br>" + graphDataItem["category"] + "<br>" + percent + "%";
                }
                var balloon_percentange_false = function (graphDataItem, graph) {
                    var percent = (graphDataItem["dataContext"][graph["id"]]).toFixed(2);
                    return graph["id"] + "<br>" + graphDataItem["category"] + "<br>" + percent;
                }
                var value_label_func = function (item) {
                    var percent = (item * 100).toFixed(2);
                    return percent + "%";
                };
                var category_label_func = function (item) {
                    if (typeof item != 'undefined') {
                        var date = "";
                        var month = String(item).substr(5, 2);
                        if (month === '01') {
                            date = "Jan";
                        }
                        else if (month === '02') {
                            date = "Feb";
                        }
                        else if (month === '03') {
                            date = "Mar";
                        }
                        else if (month === '04') {
                            date = "Apr";
                        }
                        else if (month === '05') {
                            date = "May";
                        }
                        else if (month === '06') {
                            date = "Jun";
                        }
                        else if (month === '07') {
                            date = "Jul";
                        }
                        else if (month === '08') {
                            date = "Aug";
                        }
                        else if (month === '09') {
                            date = "Sep";
                        }
                        else if (month === '10') {
                            date = "Oct";
                        }
                        else if (month === '11') {
                            date = "Nov";
                        }
                        else {
                            date += "Dec";
                        }
                        date += "-" + String(item).substr(2, 2);
                        return date;
                    }
                };

                // control anomly/passing/border display or not
                if (fail_theshold != null && pass_theshold != null) {
                    $('#anomly_btn').show(100);
                    $('#passing_btn').show(100);
                    $('#border_btn').show(100);
                }
                else if (fail_theshold == null && pass_theshold != null) {
                    $('#anomly_btn').hide(100);
                    $('#passing_btn').show(100);
                    $('#border_btn').hide(100);
                }
                else if (fail_theshold != null && pass_theshold == null) {
                    $('#anomly_btn').show(100);
                    $('#passing_btn').hide(100);
                    $('#border_btn').hide(100);
                }
                else {
                    $('#anomly_btn').hide(100);
                    $('#passing_btn').hide(100);
                    $('#border_btn').hide(100);
                }

                // push chart data
                for (i = 0; i < year_list.length; i = i + 1) {
                    var dict = {};
                    dict.year = String(year_list[i]).substr(0, 7);
                    for (var j = 0; j < institute_list.length; j = j + 1) {
                        if (value_data[j][i] != null) {
                            dict[institute_list[j]] = parseFloat(value_data[j][i]);
                        }
                    }
                    chartdata.push(dict);
                }

                // push graph variable
                if (is_percentage === "True") {
                    for (i = 0; i < institute_list.length; i = i + 1) {
                        var dict = {};
                        dict.id = institute_list[i];
                        dict.balloonFunction = balloonfunction;
                        if (cur_institution.indexOf(institute_list[i]) == -1) {
                            dict.hidden = true;
                        }
                        else {
                            dict.hidden = false;
                        }
                        dict.connect = false;
                        dict.bullet = "round";
                        dict.valueField = institute_list[i];
                        dict.fillAlphas = 0;
                        dict.lineColor = color[i];
                        graph_val.push(dict);
                    }
                    con_val = {};
                    con_val.connect = false;
                    graph_val.push(con_val);
                }
                else {
                    for (i = 0; i < institute_list.length; i = i + 1) {
                        var dict = {};
                        dict.id = institute_list[i];
                        dict.balloonFunction = balloon_percentange_false;
                        if (cur_institution.indexOf(institute_list[i]) == -1) {
                            dict.hidden = true;
                        }
                        else {
                            dict.hidden = false;
                        }
                        dict.connect = false;
                        dict.bullet = "round";
                        dict.valueField = institute_list[i];
                        dict.fillAlphas = 0;
                        dict.lineColor = color[i];
                        graph_val.push(dict);
                    }
                    con_val = {};
                    con_val.connect = false;
                    graph_val.push(con_val);
                }

                // push guide separating failing/passing theshold
                if (is_percentage === "True" && fail_theshold != null && pass_theshold != null) {
                    guide_val = [{
                        "fillAlpha": 0.1,
                        "fillColor": "#FE3106",
                        "lineAlpha": 0,
                        "toValue": fail_theshold,
                        "value": y_min
                    },
                    {
                        "fillAlpha": 0.1,
                        "fillColor": "#FEEB06",
                        "lineAlpha": 0,
                        "toValue": pass_theshold,
                        "value": fail_theshold
                    },
                    {
                        "fillAlpha": 0.1,
                        "fillColor": "#99dc67",
                        "lineAlpha": 0,
                        "toValue": y_max,
                        "value": pass_theshold
                    }];
                }

                // set amchart by condition
                if (y_min == null && y_max == null) {
                    if (is_percentage === "True") {
                        var chart = AmCharts.makeChart("chartdiv", {
                            "type": "serial",
                            "theme": "light",
                            "marginTop": 0,
                            "marginRight": 50,
                            "dataProvider": chartdata,
                            "valueAxes": [{
                                "axisAlpha": 0,
                                "position": "left",
                                "guides": guide_val,
                                "includeAllData": true,
                                "labelFunction": value_label_func
                            }],
                            "graphs": graph_val,
                            "chartScrollbar": {
                                "graph": institute_list[0],
                                "updateOnReleaseOnly": true,
                                "gridAlpha": 0,
                                "color": "#888888",
                                "scrollbarHeight": 55,
                                "backgroundAlpha": 0.01,
                                "selectedBackgroundAlpha": 0.05,
                                "selectedBackgroundColor": "#3d3333",
                                "graphFillAlpha": 0,
                                "autoGridCount": true,
                                "selectedGraphFillAlpha": 0,
                                "graphLineAlpha": 0.2,
                                "graphLineColor": "#c2c2c2",
                                "selectedGraphLineColor": "#b5b1b1",
                                "selectedGraphLineAlpha": 1
                            },
                            "categoryField": "year",
                            "categoryAxis": {
                                "dataDateFormat": "YYYY-MM",
                                "minorGridAlpha": 0.1,
                                "minorGridEnabled": false,
                                "labelFunction": category_label_func
                            },
                            //"export": {
                            //    "enabled": true
                            //},
                            "listeners": [{
                                "event": "rendered",
                                "method": function (e) {
                                    $('#curtain').hide();
                                }
                            }]
                        });
                    }
                    else {
                        var chart = AmCharts.makeChart("chartdiv", {
                            "type": "serial",
                            "theme": "light",
                            "marginTop": 0,
                            "marginRight": 50,
                            "dataProvider": chartdata,
                            "valueAxes": [{
                                "axisAlpha": 0,
                                "position": "left",
                                "guides": guide_val,
                                "includeAllData": true
                            }],
                            "graphs": graph_val,
                            "chartScrollbar": {
                                "graph": institute_list[0],
                                "updateOnReleaseOnly": true,
                                "gridAlpha": 0,
                                "color": "#888888",
                                "scrollbarHeight": 55,
                                "backgroundAlpha": 0.01,
                                "selectedBackgroundAlpha": 0.05,
                                "selectedBackgroundColor": "#3d3333",
                                "graphFillAlpha": 0,
                                "autoGridCount": true,
                                "selectedGraphFillAlpha": 0,
                                "graphLineAlpha": 0.2,
                                "graphLineColor": "#c2c2c2",
                                "selectedGraphLineColor": "#b5b1b1",
                                "selectedGraphLineAlpha": 1
                            },
                            "categoryField": "year",
                            "categoryAxis": {
                                "dataDateFormat": "YYYY-MM",
                                "minorGridAlpha": 0.1,
                                "minorGridEnabled": false
                            },
                            //"export": {
                            //    "enabled": true
                            //},
                            "listeners": [{
                                "event": "rendered",
                                "method": function (e) {
                                    $('#curtain').hide();
                                }
                            }]
                        });
                    }
                }
                else if (y_min != null && y_max == null) {
                    if (is_percentage === "True") {
                        var chart = AmCharts.makeChart("chartdiv", {
                            "type": "serial",
                            "theme": "light",
                            "marginTop": 0,
                            "marginRight": 50,
                            "dataProvider": chartdata,
                            "valueAxes": [{
                                "axisAlpha": 0,
                                "position": "left",
                                "guides": guide_val,
                                "includeAllData": true,
                                "labelFunction": value_label_func,
                                "minimum": y_min
                            }],
                            "graphs": graph_val,
                            "chartScrollbar": {
                                "graph": institute_list[0],
                                "updateOnReleaseOnly": true,
                                "gridAlpha": 0,
                                "color": "#888888",
                                "scrollbarHeight": 55,
                                "backgroundAlpha": 0.01,
                                "selectedBackgroundAlpha": 0.05,
                                "selectedBackgroundColor": "#3d3333",
                                "graphFillAlpha": 0,
                                "autoGridCount": true,
                                "selectedGraphFillAlpha": 0,
                                "graphLineAlpha": 0.2,
                                "graphLineColor": "#c2c2c2",
                                "selectedGraphLineColor": "#b5b1b1",
                                "selectedGraphLineAlpha": 1
                            },
                            "categoryField": "year",
                            "categoryAxis": {
                                "dataDateFormat": "YYYY-MM",
                                "minorGridAlpha": 0.1,
                                "minorGridEnabled": false,
                                "labelFunction": category_label_func
                            },
                            //"export": {
                            //    "enabled": true
                            //},
                            "listeners": [{
                                "event": "rendered",
                                "method": function (e) {
                                    $('#curtain').hide();
                                }
                            }]
                        });
                    }
                    else {
                        var chart = AmCharts.makeChart("chartdiv", {
                            "type": "serial",
                            "theme": "light",
                            "marginTop": 0,
                            "marginRight": 50,
                            "dataProvider": chartdata,
                            "valueAxes": [{
                                "axisAlpha": 0,
                                "position": "left",
                                "guides": guide_val,
                                "includeAllData": true,
                                "minimum": y_min
                            }],
                            "graphs": graph_val,
                            "chartScrollbar": {
                                "graph": institute_list[0],
                                "updateOnReleaseOnly": true,
                                "gridAlpha": 0,
                                "color": "#888888",
                                "scrollbarHeight": 55,
                                "backgroundAlpha": 0.01,
                                "selectedBackgroundAlpha": 0.05,
                                "selectedBackgroundColor": "#3d3333",
                                "graphFillAlpha": 0,
                                "autoGridCount": true,
                                "selectedGraphFillAlpha": 0,
                                "graphLineAlpha": 0.2,
                                "graphLineColor": "#c2c2c2",
                                "selectedGraphLineColor": "#b5b1b1",
                                "selectedGraphLineAlpha": 1
                            },
                            "categoryField": "year",
                            "categoryAxis": {
                                "dataDateFormat": "YYYY-MM",
                                "minorGridAlpha": 0.1,
                                "minorGridEnabled": false
                            },
                            //"export": {
                            //    "enabled": true
                            //},
                            "listeners": [{
                                "event": "rendered",
                                "method": function (e) {
                                    $('#curtain').hide();
                                }
                            }]
                        });
                    }
                }
                else if (y_min == null && y_max != null) {
                    if (is_percentage === "True") {
                        var chart = AmCharts.makeChart("chartdiv", {
                            "type": "serial",
                            "theme": "light",
                            "marginTop": 0,
                            "marginRight": 50,
                            "dataProvider": chartdata,
                            "valueAxes": [{
                                "axisAlpha": 0,
                                "position": "left",
                                "guides": guide_val,
                                "includeAllData": true,
                                "labelFunction": value_label_func,
                                "maximum": y_max
                            }],
                            "graphs": graph_val,
                            "chartScrollbar": {
                                "graph": institute_list[0],
                                "updateOnReleaseOnly": true,
                                "gridAlpha": 0,
                                "color": "#888888",
                                "scrollbarHeight": 55,
                                "backgroundAlpha": 0.01,
                                "selectedBackgroundAlpha": 0.05,
                                "selectedBackgroundColor": "#3d3333",
                                "graphFillAlpha": 0,
                                "autoGridCount": true,
                                "selectedGraphFillAlpha": 0,
                                "graphLineAlpha": 0.2,
                                "graphLineColor": "#c2c2c2",
                                "selectedGraphLineColor": "#b5b1b1",
                                "selectedGraphLineAlpha": 1
                            },
                            "categoryField": "year",
                            "categoryAxis": {
                                "dataDateFormat": "YYYY-MM",
                                "minorGridAlpha": 0.1,
                                "minorGridEnabled": false,
                                "labelFunction": category_label_func
                            },
                            //"export": {
                            //    "enabled": true
                            //},
                            "listeners": [{
                                "event": "rendered",
                                "method": function (e) {
                                    $('#curtain').hide();
                                }
                            }]
                        });
                    }
                    else {
                        var chart = AmCharts.makeChart("chartdiv", {
                            "type": "serial",
                            "theme": "light",
                            "marginTop": 0,
                            "marginRight": 50,
                            "dataProvider": chartdata,
                            "valueAxes": [{
                                "axisAlpha": 0,
                                "position": "left",
                                "guides": guide_val,
                                "includeAllData": true,
                                "maximum": y_max
                            }],
                            "graphs": graph_val,
                            "chartScrollbar": {
                                "graph": institute_list[0],
                                "updateOnReleaseOnly": true,
                                "gridAlpha": 0,
                                "color": "#888888",
                                "scrollbarHeight": 55,
                                "backgroundAlpha": 0.01,
                                "selectedBackgroundAlpha": 0.05,
                                "selectedBackgroundColor": "#3d3333",
                                "graphFillAlpha": 0,
                                "autoGridCount": true,
                                "selectedGraphFillAlpha": 0,
                                "graphLineAlpha": 0.2,
                                "graphLineColor": "#c2c2c2",
                                "selectedGraphLineColor": "#b5b1b1",
                                "selectedGraphLineAlpha": 1
                            },
                            "categoryField": "year",
                            "categoryAxis": {
                                "dataDateFormat": "YYYY-MM",
                                "minorGridAlpha": 0.1,
                                "minorGridEnabled": false
                            },
                            //"export": {
                            //    "enabled": true
                            //},
                            "listeners": [{
                                "event": "rendered",
                                "method": function (e) {
                                    $('#curtain').hide();
                                }
                            }]
                        });
                    }
                }
                else {
                    if (is_percentage === "True") {
                        var chart = AmCharts.makeChart("chartdiv", {
                            "type": "serial",
                            "theme": "light",
                            "marginTop": 0,
                            "marginRight": 50,
                            "dataProvider": chartdata,
                            "valueAxes": [{
                                "axisAlpha": 0,
                                "position": "left",
                                "guides": guide_val,
                                "includeAllData": true,
                                "includeGuidesInMinMax": true,
                                "maximum": y_max,
                                "minimum": y_min,
                                "labelFunction": value_label_func
                            }],
                            "graphs": graph_val,
                            "chartScrollbar": {
                                "graph": institute_list[0],
                                "updateOnReleaseOnly": true,
                                "gridAlpha": 0,
                                "color": "#888888",
                                "scrollbarHeight": 55,
                                "backgroundAlpha": 0.01,
                                "selectedBackgroundAlpha": 0.05,
                                "selectedBackgroundColor": "#3d3333",
                                "graphFillAlpha": 0,
                                "autoGridCount": true,
                                "selectedGraphFillAlpha": 0,
                                "graphLineAlpha": 0.2,
                                "graphLineColor": "#c2c2c2",
                                "selectedGraphLineColor": "#b5b1b1",
                                "selectedGraphLineAlpha": 1
                            },
                            "categoryField": "year",
                            "categoryAxis": {
                                "dataDateFormat": "YYYY-MM",
                                "minorGridAlpha": 0.1,
                                "minorGridEnabled": false,
                                "labelFunction": category_label_func
                            },
                            //"export": {
                            //    "enabled": true
                            //},
                            "listeners": [{
                                "event": "rendered",
                                "method": function (e) {
                                    $('#curtain').hide();
                                }
                            }]
                        });
                    }
                    else {
                        var chart = AmCharts.makeChart("chartdiv", {
                            "type": "serial",
                            "theme": "light",
                            "marginTop": 0,
                            "marginRight": 50,
                            "dataProvider": chartdata,
                            "valueAxes": [{
                                "axisAlpha": 0,
                                "position": "left",
                                "guides": guide_val,
                                "maximum": y_max,
                                "minimum": y_min,
                                "includeAllData": true
                            }],
                            "graphs": graph_val,
                            "chartScrollbar": {
                                "graph": institute_list[0],
                                "updateOnReleaseOnly": true,
                                "gridAlpha": 0,
                                "color": "#888888",
                                "scrollbarHeight": 55,
                                "backgroundAlpha": 0.01,
                                "selectedBackgroundAlpha": 0.05,
                                "selectedBackgroundColor": "#3d3333",
                                "graphFillAlpha": 0,
                                "autoGridCount": true,
                                "selectedGraphFillAlpha": 0,
                                "graphLineAlpha": 0.2,
                                "graphLineColor": "#c2c2c2",
                                "selectedGraphLineColor": "#b5b1b1",
                                "selectedGraphLineAlpha": 1
                            },
                            "categoryField": "year",
                            "categoryAxis": {
                                "dataDateFormat": "YYYY-MM",
                                "minorGridAlpha": 0.1,
                                "minorGridEnabled": false
                            },
                            //"export": {
                            //    "enabled": true
                            //},
                            "listeners": [{
                                "event": "rendered",
                                "method": function (e) {
                                    $('#curtain').hide();
                                }
                            }]
                        });
                    }
                }
                $('#module_select').prop('disabled', false);
                $('#line_chart_select').prop('disabled', false);
                chart.zoomToIndexes(cur_start_index, cur_end_index);
                function showAll() {
                    chart.zoomOut();
                }
            })
            .fail(function () {
                alert("Internal Server Error. Please try again later.");
                console.log("ajax load collation failed.");
            });
    }
}


//////////////////////////////////////////////////////// document.ready() /////////////////////////////////////////////////
$(document).ready(function () {
    document.getElementById("show_all_btn").style.background = "#686a6b";
    document.getElementById("original_btn").style.background = " #686a6b";
    $.when(
        $.ajax({
            url: 'Graph.aspx/getSelect',
            type: 'POST',
            data: JSON.stringify({ temp: '-1' }),
            contentType: "application/json; charset=utf-8",
            dataType: 'json'
        }))
        .done(function (response) {
            $('[data-toggle="tooltip"]').tooltip();
            var result = response.d;
            module_list = result["module_name"];
            line_chart_list = result["line_chart"];

            var line_chart_name = [];
            for (var i = 0; i < line_chart_list.length; i = i + 1) {
                line_chart_name.push(line_chart_list[i]["display_name"]);
            }
            line_chart_name = line_chart_name.sort();
            var temp = [];
            for (i = 0; i < line_chart_name.length; i = i + 1) {
                for (var j = 0; j < line_chart_name.length; j = j + 1) {
                    if (line_chart_list[j]["display_name"] === line_chart_name[i]) {
                        temp.push(line_chart_list[j]);
                        break;
                    }
                }
            }
            line_chart_list = temp;

            institute_list = result["institution_name"];
            $('#module_select').prop('disabled', false);
            $('#line_chart_select').prop('disabled', false);


            ///////////////////////////////////////// institution select /////////////////////////////////////
            var options0 = $("#institute_select");
            for (var i = 0; i < institute_list.length; i++) {
                options0.append('<option value="' + institute_list[i] + '" selected="selected">' + institute_list[i] + '</option>');
            }
            $('#institute_select').multiselect({
                buttonWidth: '400px',
                maxHeight: 300,
                enableFiltering: true,
                filterBehavior: 'value',
                enableCaseInsensitiveFiltering: true,
                includeSelectAllOption: true
            });

            //////////////////////////////////////// module select ////////////////////////////////////////////
            var options1 = $("#module_select");
            options1.append('<option value="any"  selected="selected">Any</option>');
            options1.append('<option value="' + module_list[0]["id"] + '">' + module_list[0]["name"] + '</option>');

            for (var j = 1; j < module_list.length; j++) {
                options1.append('<option value="' + module_list[j]["id"] + '">' + module_list[j]["name"] + '</option>');
            }

            ///////////////////////////////////// line chart select /////////////////////////////////////
            var id = module_list[0]["id"];
            var options2 = $("#line_chart_select");
            options2.append('<option value="empty"  selected="selected">...</option>');

            for (i = 0; i < line_chart_list.length; i++) {
                options2.append('<option value="' + line_chart_list[i]["module_id"] + '">' + line_chart_list[i]["display_name"] + '</option>');
            }
        })
        .fail(function () {
            alert("Internal Server Error. Please try again later.");
            console.log("ajax load collation failed.");
        });


});