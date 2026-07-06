using System.Collections.Generic;

namespace BikeSense.Api.Core.Entities
{
    public class Role
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;

        // Navigation Properties
        public ICollection<User> Users { get; set; } = new List<User>();
    }
}
