using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WebAPI
{
    public class ErrorMessages
    {
        
    }

    public class GenericErrorMessages
    {
        public const string UserCreation = "Error in user creation.";
        public const string UserEdit = "Error in user edit.";
        public const string UserDelete = "Error in user delete.";
        public const string Login = "Error in login.";
        public const string GettingUsers = "Error while getting users.";

        public const string TripCreation = "Error in trip creation.";
        public const string TripEdit = "Error in trip edit.";
        public const string TripDelete = "Error in trip delete.";
        public const string GettingTrips = "Error while getting trips.";
    }
}
