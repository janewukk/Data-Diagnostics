<%@ Page Title="Graph" Language="C#" MasterPageFile="~/Site.Master" AutoEventWireup="true" CodeBehind="Graph.aspx.cs" Inherits="MpogDiagnostic.Graph" %>

<asp:Content ID="BodyContent" ContentPlaceHolderID="MainContent" runat="server">
    <style>
        .select-style {
            border: 1px solid #ccc;
            width: 120px;
            border-radius: 3px;
            overflow: hidden;
            background: #fafafa no-repeat 90% 50%;
        }

            .select-style select {
                padding: 5px 8px;
                width: 130%;
                border: none;
                box-shadow: none;
                background: transparent;
                background-image: none;
                -webkit-appearance: none;
            }

                .select-style select:focus {
                    outline: none;
                }

        .btnnormal {
            background: #76bff0;
            background-image: -webkit-linear-gradient(top, #76bff0, #bfd7e6);
            background-image: -moz-linear-gradient(top, #76bff0, #bfd7e6);
            background-image: -o-linear-gradient(top, #76bff0, #bfd7e6);
            background-image: linear-gradient(to bottom, #76bff0, #bfd7e6);
            -webkit-border-radius: 28;
            -moz-border-radius: 28;
            border-radius: 28px;
            font-family: Arial;
            color: #ffffff;
            font-size: 14px;
            padding: 8px 16px 8px 16px;
            text-decoration: none;
        }

        .btnpress {
            background: #686a6b;
            -webkit-border-radius: 28;
            -moz-border-radius: 28;
            border-radius: 28px;
            font-family: Arial;
            color: #ffffff;
            font-size: 14px;
            padding: 8px 16px 8px 16px;
            text-decoration: none;
        }

        .btnnormal:hover {
            background: #686a6b;
            text-decoration: none;
        }

        .no-js #loader {
            display: none;
        }

        .js #loader {
            display: block;
            position: absolute;
            left: 100px;
            top: 0;
        }

        .btnstable {
            -webkit-border-radius: 15;
            -moz-border-radius: 15;
            border-radius: 15px;
            text-shadow: 1px 1px 3px #a194a1;
            font-family: Georgia;
            color: #ffffff;
            font-size: 14px;
            background: #f4b942;
            padding: 10px 20px 10px 20px;
            border: solid #ffffff 0px;
            text-decoration: none;
        }

            .btnstable:hover {
                background: #f46b41;
                text-decoration: none;
            }

        .w3-sidebar a {
            font-family: "Roboto", sans-serif
        }

        #nograph {
            background: rgba(0, 0, 0, 0.8);
            color: #fff;
            font-size: 25px;
            width: 95%;
            height: 800px;
            position: absolute;
            margin-left: 30px;
        }

            #nograph span {
                display: block;
                position: absolute;
                top: 49%;
                width: 100%;
                text-align: center;
            }

        #chartcontainer {
            width: 100%;
            height: 800px;
            position: relative;
        }

        #chartdiv {
            width: 100%;
            height: 800px;
            position: absolute;
        }

        #curtain {
            width: 95%;
            height: 800px;
            margin-left: 30px;
            position: absolute;
            background: rgba(0, 0, 0, 0.8);
            color: #fff;
            font-size: 25px;
        }

            #curtain span {
                display: block;
                margin-top: 100px;
                width: 100%;
                text-align: center;
            }

        #curtain_stats {
            width: 95%;
            height: 800px;
            margin-left: 30px;
            position: absolute;
            background: rgba(0, 0, 0, 0.8);
            color: #fff;
            font-size: 25px;
        }

            #curtain_stats span {
                display: block;
                margin-top: 100px;
                width: 100%;
                text-align: center;
            }

        #chartcontainer:hover #hover-content {
            display: block;
        }
    </style>

    <!-- Latest compiled and minified CSS -->
    <link rel="stylesheet" href="https://www.amcharts.com/lib/3/plugins/export/export.css" type="text/css" media="all" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-multiselect/0.9.13/css/bootstrap-multiselect.css">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Montserrat">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
    <link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/1.10.12/css/jquery.dataTables.min.css">
    <link rel="stylesheet" href="https://cdn.datatables.net/buttons/1.4.0/css/buttons.dataTables.min.css">

    <script src="https://code.jquery.com/jquery-2.2.0.min.js"></script>
    <script src="http://cdnjs.cloudflare.com/ajax/libs/modernizr/2.8.2/modernizr.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-multiselect/0.9.13/js/bootstrap-multiselect.js"></script>
    <script src="https://www.amcharts.com/lib/3/amcharts.js"></script>
    <script src="https://www.amcharts.com/lib/3/serial.js"></script>
    <script src="https://www.amcharts.com/lib/3/plugins/export/export.min.js"></script>
    <script src="https://www.amcharts.com/lib/3/themes/light.js"></script>
    <script type="text/javascript" src="Scripts/jquery.dataTables.min.js"></script>
    <script src="https://cdn.datatables.net/1.10.15/js/dataTables.bootstrap.min.js"></script>
    <script src="https://cdn.datatables.net/buttons/1.4.0/js/dataTables.buttons.min.js"></script>
    <script src="https://cdn.datatables.net/buttons/1.4.0/js/buttons.flash.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.1.3/jszip.min.js"></script>
    <script src="https://cdn.rawgit.com/bpampuch/pdfmake/0.1.27/build/pdfmake.min.js"></script>
    <script src="https://cdn.rawgit.com/bpampuch/pdfmake/0.1.27/build/vfs_fonts.js"></script>
    <script src="https://cdn.datatables.net/buttons/1.4.0/js/buttons.html5.min.js"></script>
    <script src="https://cdn.datatables.net/buttons/1.4.0/js/buttons.print.min.js"></script>
    <script type="text/javascript" src="Scripts/home.js" async></script>


    <div style="height: 100%; width: 98%; padding-left: 30px; padding-right: 20px; background-color: aliceblue">
        <div class="row">
            <div style="width: 450px; margin-top: 20px; float: left" id="left">
                <h4 class="text-primary">
                    <bold>Control Bar</bold>
                    <input type="button" class="btnnormal" value="logout" style="width: 100px; margin-left: 200px" onclick="logout()">
                </h4>
                <hr />
                <div>
                    <h5 style="display: inline" class="text-info">Module: &nbsp;&nbsp;&nbsp;</h5>
                    <select id="module_select" disabled style="overflow: scroll; width: 300px; height: 30px; display: inline" class="select-style" onchange="module_select_change()"></select>
                </div>
                <br />
                <div>
                    <h5 style="display: inline" class="text-info">Line Chart: </h5>
                    <select id="line_chart_select" disabled style="overflow: scroll; width: 300px; height: 30px; display: inline" class="select-style" onchange="line_chart_select_change()"></select>
                </div>
                <br />
                <hr />
                <div>
                    <h5 class="text-info">Choose Institutes:</h5>
                    <br />
                    <select id="institute_select" multiple size="7" style="overflow: scroll"></select><br />
                </div>
                <br />
                <hr />
                <div id="year_div" data-toggle="tooltip" title="Please select a line chart before updating time range.">
                    <div>
                        <h5 style="display: inline" class="text-info">From:&nbsp;&nbsp;</h5>
                        <input type="text" id="start_year" placeholder="YYYY-MM" style="width: 80px" value="2000-01" disabled />&nbsp;
                        <h5 style="display: inline" class="text-info">To:&nbsp;&nbsp;</h5>
                        <input type="text" id="end_year" placeholder="YYYY-MM" style="width: 80px" value="2000-01" disabled />&nbsp;
                        <h5 style="display: inline">
                            <input type="button" id="update_btn" value="show" style="width: 100px; align-self: auto" class="btnnormal" onclick="update_year()" disabled />
                        </h5>
                    </div>
                    <br />
                    <div id="time_pick">
                        <h5 class="text-info" style="display: inline">Zoom:&nbsp;&nbsp;&nbsp;&nbsp;</h5>
                        <input type="button" id="1_year_btn" value="1 year" class="btnnormal" onclick="show_1_year()" disabled />
                        <input type="button" id="5_year_btn" value="5 year" class="btnnormal" onclick="show_5_year()" disabled />
                        <input type="button" id="10_year_btn" value="10 year" class="btnnormal" onclick="show_10_year()" disabled />
                        <input type="button" id="show_all_btn" value="show all" class="btnnormal" onclick="show_all()" disabled />
                    </div>
                </div>
                <br />
                <hr />
                <div id="filter_div" data-toggle="tooltip" title="Please select a line chart before choosing filters and stats.">
                    <div>
                        <h5 class="text-info" style="display: inline">Filter:&nbsp;&nbsp;</h5>
                        <input type="button" class="btnnormal" id="anomly_btn" style="display: inline" value="Failing" onclick="anomly_detection()" disabled />
                        <input type="button" class="btnnormal" id="border_btn" value="Border" style="display: inline" onclick="border_detection()" disabled />
                        <input type="button" class="btnnormal" id="passing_btn" value="Passing" style="display: inline" onclick="passing_detection()" disabled />
                        <input type="button" class="btnnormal" id="original_btn" value="Original" onclick="return_all()" disabled />
                        <br />
                        <br />
                        <h5 class="text-info" style="display: inline">Discontinuous:&nbsp;&nbsp;</h5>
                        <input type="button" class="btnnormal" id="discont_btn" value="Discontinuous" onclick="discont_detection()" disabled />
                        <br />
                    </div>
                    <hr />
                    <div>
                        <h5 style="display: inline" class="text-info">Reset:&nbsp;&nbsp;&nbsp;&nbsp;</h5>
                        <input type="button" id="reset_btn" value="Reset" class="btnnormal" style="width: 250px" onclick="reset_click()" disabled/>&nbsp;&nbsp;&nbsp;
                    </div>
                    <hr />
                    <h5 class="text-info" style="display: inline" id="section_part">Stats: &nbsp;&nbsp;&nbsp;</h5>
                    <input value="Statistics (All)" class="btnstable" id="stats_btn" type="button" onclick="show_stats()" />
                    <input value="Statistics (Selected)" class="btnstable" id="selected_stats_btn" type="button" onclick="show_current_stats()" /><br />
                    <br />

                    <h5 class="text-info" style="display: inline" id="raw_data">Data: &nbsp;&nbsp;&nbsp;</h5>
                    <input value="Raw Data (All)" class="btnstable" id="download_all_btn" type="button" onclick="download_all_data()" />
                    <input value="Raw Data (Selected)" class="btnstable" id="download_selected_btn" type="button" onclick="download_selected_data()" />
                    <%--<input value="Raw Summary" class="btnstable" id="raw_data_btn" type="button" onclick="show_raw_data()" />--%>
                </div>
            </div>

            <div style="margin-top: 20px; float: right; width: -webkit-calc(100% - 450px);" id="right">
                <div id="graphdiv" style="align-self: center; text-align: center;">
                    <div id="chartcontainer">
                        <div id="chartdiv" style="margin-left: 20px; display: none">
                        </div>
                        <div id="hover-content" style="display: none">
                            <h2 style="color: crimson">No Data Available.</h2>
                        </div>
                        <div id="nograph" style="display: block">
                            <span>Please Select A Chart...</span>
                        </div>
                        <div id="curtain" style="display: none">
                            <div><span>Chart is loading...</span></div>
                            <div>
                                <img src="img/Spinner.gif">
                            </div>
                        </div>
                    </div>
                </div>
                <br />
                <div id="name_div">
                    <h3 style="text-align:center" id="long_display_name"></h3>
                </div>
            </div>

        </div>
        <hr />
        <br />
        <div class="row">
            <div id="statsdiv" style="display: none; margin-left: 30px">
                <h3 class="text-info" style="text-align: center">View All Anomly Detection Result </h3>
                <hr />
                <div id="curtain_stats" style="display: block; text-align: center; align-self: center">
                    <div><span>Stats is calculating...</span></div>
                    <div>
                        <img src="img/Spinner.gif">
                    </div>
                </div>
                <div class="table" id="stats_tb_div" style="overflow-x: auto; white-space: nowrap; display: none">
                    <br />
                    <table id='stats_tb' class="row-border hover order-column" data-page-length='15'>
                        <thead>
                            <tr>
                                <th>Institution</th>
                                <th>Fail Month</th>
                                <th>Border Month</th>
                                <th>Pass Month</th>
                                <th>Total Month</th>
                                <th>Quantity</th>
                                <th>Discontinuous?</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
                <div class="table" id="raw_data_tb_div" style="overflow-x: auto; white-space: nowrap; display: none">
                    <br />
                    <table id='raw_data_tb' class="row-border hover order-column" data-page-length='15'>
                        <thead>
                            <tr>
                                <th></th>
                                <th>Institution</th>
                                <th>Percentage</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</asp:Content>
