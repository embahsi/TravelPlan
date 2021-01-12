using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WebAPI.Utilities
{
    public static class LogHelper
    {
        public static void WriteLog(string message)
        {
            //TODO
            Console.WriteLine();
        }

        public static void WriteLog(IEnumerable<string> messages)
        {
            string errors = string.Join(",", messages);
            WriteLog(errors.ToString());
        }
    }
}
