using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Services;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace MpogDiagnostic
{
    public partial class _Default : Page
    {
        [WebMethod(EnableSession = true)]
        public static string setSession(string token)
        {
            HttpContext.Current.Session["token"] = token;
            return "success";
        }

        [WebMethod(EnableSession = true)]
        public static string logout()
        {
            string token = HttpContext.Current.Session["token"].ToString();
            HttpContext.Current.Session.Abandon();
            return token;
        }

        protected void Page_Load(object sender, EventArgs e)
        {

        }
    }
}