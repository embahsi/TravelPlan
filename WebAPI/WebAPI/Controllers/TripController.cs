using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebAPI.Constants;
using WebAPI.Models;
using WebAPI.Utilities;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "User, Admin")]
    public class TripController : ControllerBase
    {
        private readonly TravelPlanDbContext _context;
        private UserManager<ApplicationUser> _userManager;

        public TripController(TravelPlanDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        // GET: api/Trips
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Trip>>> GetTrips()
        {
            try
            {
                string userId = User.Claims.First(c => c.Type == "UserID").Value;
                string role = User.Claims.First(c => c.Type == new IdentityOptions().ClaimsIdentity.RoleClaimType).Value;

                if (role == Roles.Admin)
                    return await _context.Trips.Include(x => x.ApplicationUser).ToListAsync();
                else
                    return await _context.Trips.Where(x => x.ApplicationUser.Id == userId).Include(x => x.ApplicationUser).ToListAsync();
            }
            catch(Exception e)
            {
                LogHelper.WriteLog(e.ToString());
                return BadRequest(new { message = GenericErrorMessages.GettingTrips });
            }
            
        }

        // GET: api/Trips/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Trip>> GetTrip(int id)
        {
            Trip trip;

            string role = User.Claims.First(c => c.Type == new IdentityOptions().ClaimsIdentity.RoleClaimType).Value;

            if (role == Roles.Admin)
                trip = await _context.Trips.FindAsync(id);
            else
            {
                string userId = User.Claims.First(c => c.Type == "UserID").Value;
                trip = await _context.Trips.FirstOrDefaultAsync(x => x.ApplicationUser.Id == userId && x.Id == id);
            }

            if (trip == null)
            {
                return NotFound();
            }

            return trip;
        }

        // PUT: api/Trips/5
        // To protect from overposting attacks, please enable the specific properties you want to bind to, for
        // more details see https://aka.ms/RazorPagesCRUD.
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTrip(int id, Trip trip)
        {
            try
            {
                if (id != trip.Id)
                {
                    return BadRequest(new { message = "Parameter id and model.id do not match." });
                }

                if (!_context.Trips.Any(x => x.Id == id))
                {
                    return NotFound();
                }

                //Prevent if user role sent other than its own userid
                string userId = User.Claims.First(c => c.Type == "UserID").Value;
                string role = User.Claims.First(c => c.Type == new IdentityOptions().ClaimsIdentity.RoleClaimType).Value;
                if (role == Roles.User && !_context.Trips.Any(t => t.Id == id && t.ApplicationUser.Id == userId))
                {
                    return NotFound();
                }

                trip.ApplicationUser = await _userManager.Users.FirstOrDefaultAsync(x => x.Id == trip.ApplicationUser.Id);
                if (trip.ApplicationUser == null)
                {
                    return BadRequest(new { message = "Wrong user information" });
                }

                var tripUserRole = (await _userManager.GetRolesAsync(trip.ApplicationUser)).FirstOrDefault();
                if(tripUserRole != Roles.User)
                {
                    return BadRequest(new { message = "Trips can be created only for 'User' roles" });
                }

                _context.Entry(trip).State = EntityState.Modified;

                try
                {
                    await _context.SaveChangesAsync();
                }
                catch (DbUpdateConcurrencyException)
                {
                    throw;
                }

                return NoContent();
            }
            catch(Exception e)
            {
                LogHelper.WriteLog(e.ToString());
                return BadRequest(new { message = GenericErrorMessages.TripEdit });
            }
        }

        // POST: api/Trips
        // To protect from overposting attacks, please enable the specific properties you want to bind to, for
        // more details see https://aka.ms/RazorPagesCRUD.
        [HttpPost]
        public async Task<ActionResult<Trip>> PostTrip(Trip trip)
        {
            try
            {
                //Prevent if user role sent other than its own userid
                string userId = User.Claims.First(c => c.Type == "UserID").Value;
                string role = User.Claims.First(c => c.Type == new IdentityOptions().ClaimsIdentity.RoleClaimType).Value;
                if (role == Roles.User && trip.ApplicationUser.Id != userId)
                {
                    return BadRequest(new { message = "Wrong input" });
                }

                _context.Trips.Add(trip);
                ApplicationUser appUser = await _userManager.Users.FirstOrDefaultAsync(x => x.Id == trip.ApplicationUser.Id);
                if (appUser == null)
                {
                    return BadRequest(new { message = "Wrong user information" });
                }

                var tripUserRole = (await _userManager.GetRolesAsync(appUser)).FirstOrDefault();
                if (tripUserRole != Roles.User)
                {
                    return BadRequest(new { message = "Trips can be created only for 'User' roles" });
                }

                _context.Entry(appUser).State = EntityState.Unchanged;
                var result = await _context.SaveChangesAsync();

                if (result>0)
                    return CreatedAtAction("GetTrip", new { id = trip.Id }, trip);
                else
                    return BadRequest(new { message = GenericErrorMessages.TripCreation });
            }
            catch(Exception e)
            {
                LogHelper.WriteLog(e.ToString());
                return BadRequest(new { message = GenericErrorMessages.TripCreation });
            }
            
        }

        // DELETE: api/Trips/5
        [HttpDelete("{id}")]
        public async Task<ActionResult<Trip>> DeleteTrip(int id)
        {
            try
            {
                var trip = await _context.Trips.FindAsync(id);
                if (trip == null)
                {
                    return NotFound();
                }

                //Prevent if user role sent other than its own userid
                string userId = User.Claims.First(c => c.Type == "UserID").Value;
                string role = User.Claims.First(c => c.Type == new IdentityOptions().ClaimsIdentity.RoleClaimType).Value;
                if (role == Roles.User && !_context.Trips.Any(t => t.Id == id && t.ApplicationUser.Id == userId))
                {
                    return NotFound();
                }

                _context.Trips.Remove(trip);
                await _context.SaveChangesAsync();

                return trip;
            }
            catch(Exception e)
            {
                LogHelper.WriteLog(e.ToString());
                return BadRequest(new { message = GenericErrorMessages.TripDelete });
            }
            
        }

    }
}
