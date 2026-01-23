using System.Diagnostics;
using Investica.Models;
using Microsoft.AspNetCore.Mvc;

namespace Investica.Controllers
{
    public class HomeController : Controller
    {

        public IActionResult Dashboard()
        {
            return View();
        }
        public IActionResult Companies()
        {
            return View();
        }

        public IActionResult FonstsheetAndInvoice()
        {
            return View();
        }

        public IActionResult Summary()
        {
            return View();
        }

        public IActionResult Tickets()
        {
            return View();
        }

        public IActionResult Invoice()
        {
            return View();
        }

        public IActionResult Fontsheet()
        {
            return View();
        }

        public IActionResult Links()
        {
            return View();
        }

        public IActionResult Renewals()
        {
            return View();
        }

        public IActionResult MasterData()
        {
            return View();
        }


        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
