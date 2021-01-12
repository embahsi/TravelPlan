using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using WebAPI.Constants;
using WebAPI.Models;
using WebAPI.Utilities;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ApplicationUserController : ControllerBase
    {
        private UserManager<ApplicationUser> _userManager;
        private SignInManager<ApplicationUser> _signInManager;
        private readonly ApplicationSettings _applicationSettings;
        private readonly TravelPlanDbContext _context;

        public ApplicationUserController(UserManager<ApplicationUser> userManager, SignInManager<ApplicationUser> signInManager, IOptions<ApplicationSettings> applicationSettings, TravelPlanDbContext context)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _applicationSettings = applicationSettings.Value;
            _context = context;
        }

        [HttpPost]
        //POST : /api/ApplicationUser
        public async Task<Object> CreateUser(ApplicationUserModel model)
        {
            model.Role = Roles.User;
            return await createUserInner(model);
        }

        [HttpPost]
        [Authorize(Roles = "UserManager, Admin")]
        [Route("createUserByAdmin")]
        //POST : /api/ApplicationUser/CreateByAdmin
        public async Task<Object> CreateUserByAdmin(ApplicationUserModel model)
        {
            return await createUserInner(model);
        }

        [HttpGet]
        [Route("getAllUsers")]
        [Authorize(Roles = "UserManager, Admin")]
        //GET : /api/ApplicationUser/getAllUsers
        public async Task<Object> GetAllUsers()
        {
            try
            {
                var result = new List<Object>();
                string userRole = User.Claims.First(c => c.Type == new IdentityOptions().ClaimsIdentity.RoleClaimType).Value;

                bool hasTrips;
                foreach (var user in _userManager.Users)
                {
                    hasTrips = false;
                    if (_context.Trips.Include(x => x.ApplicationUser).Any(x => x.ApplicationUser == user))
                        hasTrips = true;

                    var curRole = (await _userManager.GetRolesAsync(user)).FirstOrDefault();
                    if (userRole == Roles.Admin || curRole != Roles.Admin)
                        result.Add(new { user.Id, user.UserName, user.Email, user.FirstName, user.LastName, Role = curRole, HasTrips = hasTrips });
                }

                return result;
            }
            catch(Exception e)
            {
                LogHelper.WriteLog(e.ToString());
                return BadRequest(new { message = GenericErrorMessages.GettingUsers });
            }
            
        }

        [HttpPost]
        [Route("Login")]
        //POST : /api/ApplicationUser/Login
        public async Task<IActionResult> Login(LoginModel model)
        {
            try
            {
                var user = await _userManager.FindByNameAsync(model.UserName);
                if (user != null && await _userManager.CheckPasswordAsync(user, model.Password))
                {
                    //Get role assigned to the user
                    var role = await _userManager.GetRolesAsync(user);
                    IdentityOptions options = new IdentityOptions();

                    var tokenDescriptor = new SecurityTokenDescriptor
                    {
                        Subject = new ClaimsIdentity(new Claim[]
                        {
                        new Claim("UserID", user.Id.ToString()),
                        new Claim("FirstName", user.FirstName),
                        new Claim("LastName", user.LastName),
                        new Claim("Email", user.Email),
                        new Claim("Id", user.Id),
                        new Claim(options.ClaimsIdentity.RoleClaimType, role.FirstOrDefault())
                        }),
                        Expires = DateTime.UtcNow.AddDays(1),
                        SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_applicationSettings.JWT_Secret)), SecurityAlgorithms.HmacSha256)
                    };
                    var tokenHandler = new JwtSecurityTokenHandler();
                    var securityToken = tokenHandler.CreateToken(tokenDescriptor);
                    var token = tokenHandler.WriteToken(securityToken);
                    return Ok(new { token });
                }
                else
                    return BadRequest(new { message = "Username or password is incorrect." });
            }
            catch (Exception e)
            {
                LogHelper.WriteLog(e.ToString());
                return BadRequest(new { message = GenericErrorMessages.Login });
            }

        }

        [HttpPut("{id}")]
        [Authorize(Roles = "UserManager,Admin")]
        public async Task<IActionResult> PutApplicationUser(string id, ApplicationUserModel model)
        {
            try
            {
                if (id != model.Id)
                {
                    return BadRequest(new { message = "Parameter id and model.id do not match." });
                }

                ApplicationUser user = _userManager.Users.First(x => x.Id == id);

                if (user == null)
                {
                    return NotFound();
                }

                var roles = await _userManager.GetRolesAsync(user); //No need to null-check for roles since user will be deleted anyhow.
                var result = await _userManager.RemoveFromRolesAsync(user, roles);
                if (result.Succeeded)
                {
                    result = await _userManager.AddToRoleAsync(user, model.Role);
                    if (result.Succeeded)
                    {
                        user.FirstName = model.FirstName;
                        user.LastName = model.LastName;
                        user.Email = model.Email;
                        user.UserName = model.UserName;

                        result = await _userManager.UpdateAsync(user);

                        if (result.Succeeded)
                            return NoContent();
                    }
                }

                LogHelper.WriteLog(result.ToString());
                return BadRequest(new { message = result.Errors.ToList()[0].Description });
            }
            catch (Exception e)
            {
                LogHelper.WriteLog(e.ToString());
                return BadRequest(new { message = GenericErrorMessages.UserEdit });
            }
        }

        // DELETE: api/ApplicationUser/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "UserManager,Admin")]
        public async Task<ActionResult<ApplicationUserModel>> DeleteUser(string id)
        {
            try
            {
                ApplicationUser user = _userManager.Users.First(x => x.Id == id);
                if (user == null)
                {
                    return NotFound();
                }

                if (_context.Trips.Include(x => x.ApplicationUser).Any(x => x.ApplicationUser == user))
                {
                    return BadRequest(new { message = "Users who have trips can not be deleted." });
                }

                var roles = await _userManager.GetRolesAsync(user); //No need to null-check for roles since user will be deleted anyhow.
                var result = await _userManager.RemoveFromRolesAsync(user, roles);
                if (result.Succeeded)
                {
                    result = await _userManager.DeleteAsync(user);
                    if (result.Succeeded)
                    {
                        ApplicationUserModel applicationUserModel = new ApplicationUserModel()
                        {
                            Id = user.Id,
                            Email = user.Email,
                            FirstName = user.FirstName,
                            LastName = user.LastName,
                            UserName = user.UserName,
                            Role = roles.FirstOrDefault()
                        };

                        return applicationUserModel;
                    }
                }
                LogHelper.WriteLog(result.ToString());
                return BadRequest(new { message = result.Errors.ToList()[0].Description });
            }
            catch (Exception e)
            {
                LogHelper.WriteLog(e.ToString());
                return BadRequest(new { message = GenericErrorMessages.UserDelete });
            }

        }

        private async Task<Object> createUserInner(ApplicationUserModel model)
        {
            try
            {
                var applicationUser = new ApplicationUser()
                {
                    UserName = model.UserName,
                    Email = model.Email,
                    FirstName = model.FirstName,
                    LastName = model.LastName
                };

                var result = await _userManager.CreateAsync(applicationUser, model.Password);
                if (result.Succeeded)
                {
                    result = await _userManager.AddToRoleAsync(applicationUser, model.Role);
                    if (result.Succeeded)
                        return Ok(result);
                }

                LogHelper.WriteLog(result.ToString());
                return BadRequest(new { message = result.Errors.ToList()[0].Description });
            }
            catch (Exception e)
            {
                LogHelper.WriteLog(e.ToString());
                return BadRequest(new { message = GenericErrorMessages.UserCreation });
            }

        }

    }
}