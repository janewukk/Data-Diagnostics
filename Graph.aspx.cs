using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Web;
using System.Web.Services;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace MpogDiagnostic
{
    public partial class Graph : Page
    {
        public class Chart
        {
            public string display_name { get; set; }
            public int module_id { get; set; }
            public int line_chart_id { get; set; }
        }

        public class Module
        {
            public string name { get; set; }
            public int id { get; set; }
        }

        public class HomeModels
        {
            public List<string> date { get; set; }
            public List<List<double?>> value { get; set; }
            public string is_percentage { get; set; }
            public string y_min { get; set; }
            public string y_max { get; set; }
            public string failing_theshold { get; set; }
            public string passing_theshold { get; set; }
            public string display_name { get; set; }
        }

        public class SelectChoice
        {
            public List<string> institution_name { get; set; }
            public List<Module> module_name { get; set; }
            public List<Chart> line_chart { get; set; }
        }

        public static List<int> institution_id_list = new List<int>();

        [WebMethod(EnableSession = true)]
        public static SelectChoice getSelect(string temp)
        {
            string connectionString = ConfigurationManager.ConnectionStrings["myConnectionString"].ConnectionString;
            SelectChoice model = new SelectChoice();
            model.institution_name = new List<string>();
            model.module_name = new List<Module>();
            model.line_chart = new List<Chart>();
            institution_id_list = new List<int>();
            using (SqlConnection cn = new SqlConnection(connectionString))
            {
                SqlDataReader dr = null;
                SqlCommand cmd = new SqlCommand();
                cmd.Connection = cn;
                cmd.CommandType = CommandType.Text;
                cmd.CommandText = "EXEC Eval.Diagnostics_LoadModules;";
                cn.Open();
                dr = cmd.ExecuteReader();
                while (dr.Read())
                {
                    Module mod = new Module();
                    mod.name = (dr["Diagnostic_Module_Name"].ToString());
                    mod.id = dr.GetInt32(0);
                    model.module_name.Add(mod);
                }
                dr.Close();

                SqlDataReader dr1 = null;
                cmd.CommandText = "EXEC Eval.GetInstitutions;";
                dr1 = cmd.ExecuteReader();
                while (dr1.Read())
                {
                    model.institution_name.Add(dr1["Institution_Name"].ToString());
                    institution_id_list.Add(Convert.ToInt32(dr1["MPOG_Institution_ID"].ToString()));
                }
                dr1.Close();

                SqlDataReader dr2 = null;
                cmd.CommandText = "EXEC Eval.Diagnostics_LoadLineCharts;";
                dr2 = cmd.ExecuteReader();
                int id = model.module_name[0].id;
                while (dr2.Read())
                {
                    Chart chart_var = new Chart();
                    int mod_id = Convert.ToInt32(dr2["Diagnostic_Module_ID"].ToString());
                    chart_var.display_name = dr2["Short_Display_Name"].ToString();
                    chart_var.module_id = mod_id;
                    chart_var.line_chart_id = dr2.GetInt32(0);
                    model.line_chart.Add(chart_var);
                }
                dr2.Close();
                cn.Close();
            }
            return model;
        }

        [WebMethod(EnableSession = true)]
        public static HomeModels getImage(int line_chart_id)
        {
            string connectionString = ConfigurationManager.ConnectionStrings["myConnectionString"].ConnectionString;
            HomeModels model = new HomeModels();
            model.value = new List<List<double?>>();
            model.date = new List<string>();
            List<string> year = new List<string>();

            using (SqlConnection cn = new SqlConnection(connectionString))
            {
                SqlCommand cmd = new SqlCommand();
                cmd.Connection = cn;
                cmd.CommandType = CommandType.Text;
                cn.Open();

                SqlDataReader dr2 = null;
                cmd.CommandText = "EXEC Eval.Diagnostics_LoadLineCharts;";
                dr2 = cmd.ExecuteReader();
                while (dr2.Read())
                {
                    if (dr2.GetInt32(0) == line_chart_id)
                    {
                        model.display_name = dr2["Long_Display_Name"].ToString();
                        if (!dr2.IsDBNull(11))
                        {
                            model.failing_theshold = dr2["Failure_Theshold"].ToString();
                        }
                        else
                        {
                            model.failing_theshold = null;
                        }
                        if (!dr2.IsDBNull(12))
                        {
                            model.passing_theshold = dr2["Passing_Theshold"].ToString();
                        }
                        else
                        {
                            model.passing_theshold = null;
                        }
                        if (!dr2.IsDBNull(9))
                        {
                            model.y_min = dr2["Y_Min"].ToString();
                        }
                        else
                        {
                            model.y_min = null;
                        }
                        if (!dr2.IsDBNull(10))
                        {
                            model.y_max = dr2["Y_Max"].ToString();
                        }
                        else
                        {
                            model.y_max = null;
                        }
                        if (!dr2.IsDBNull(6))
                        {
                            model.is_percentage = dr2["Is_Percentage"].ToString();
                        }
                        else
                        {
                            model.is_percentage = null;
                        }
                    }
                }
                dr2.Close();

                SqlDataReader dr3 = null;
                cmd.CommandText = "EXEC Eval.Diagnostics_LoadLineChartLatestBuild @Diagnostic_LineChart_ID = @id;";
                cmd.Parameters.AddWithValue("@id", line_chart_id);
                dr3 = cmd.ExecuteReader();
                string build_event_id = "";
                while (dr3.Read())
                {
                    build_event_id = dr3["Build_Event_ID"].ToString();
                }
                dr3.Close();

                for (int j = 0; j < institution_id_list.Count; j = j + 1)
                {
                    SqlDataReader dr4 = null;
                    cmd.CommandText = "Eval.Diagnostics_LoadLineChartResults @Build_Event_ID = @event_id, @MPOG_Institution_ID = @in_id";
                    cmd.Parameters.AddWithValue("@event_id", build_event_id);
                    cmd.Parameters.AddWithValue("@in_id", institution_id_list[j]);
                    dr4 = cmd.ExecuteReader();
                    List<double?> y_value = new List<double?>();
                    while (dr4.Read())
                    {
                        if (j == 0)
                        {
                            DateTime date = dr4.GetDateTime(0);
                            model.date.Add(date.ToString("yyyy-MM-dd"));
                        }
                        if (!dr4.IsDBNull(1))
                        {
                            y_value.Add(dr4.GetDouble(1));
                        }
                        else
                        {
                            y_value.Add(null);
                        }
                    }
                    model.value.Add(y_value);
                    dr4.Close();
                    cmd.Parameters.Clear();
                }
                cn.Close();
            }
            return model;
        }

        protected void Page_Load(object sender, EventArgs e)
        {
            if(Session["token"] == null)
            {
                Response.Redirect("Default.aspx");
            }
        }
    }
}