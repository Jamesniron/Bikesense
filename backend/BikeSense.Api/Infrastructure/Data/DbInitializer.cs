using System;
using System.Linq;
using BikeSense.Api.Core.Entities;
using Microsoft.AspNetCore.Identity;

namespace BikeSense.Api.Infrastructure.Data
{
    public static class DbInitializer
    {
        public static void SeedData(BikeSenseDbContext context)
        {
            // If already seeded
            if (context.Users.Any())
            {
                return;
            }

            var hasher = new PasswordHasher<User>();

            // Get Roles
            var adminRole = context.Roles.FirstOrDefault(r => r.Name == "Administrator");
            var buyerRole = context.Roles.FirstOrDefault(r => r.Name == "Buyer");
            var sellerRole = context.Roles.FirstOrDefault(r => r.Name == "Seller");
            var dealerRole = context.Roles.FirstOrDefault(r => r.Name == "Dealer");

            // 1. Seed admin
            var admin = new User
            {
                FullName = "Admin BikeSense",
                Email = "admin@bikesense.lk",
                PhoneNumber = "+94771234567",
                IsVerified = true,
                CreatedDate = DateTime.UtcNow
            };
            admin.PasswordHash = hasher.HashPassword(admin, "AdminPass123!");
            if (adminRole != null) admin.Roles.Add(adminRole);
            context.Users.Add(admin);

            // 2. Seed Seller
            var seller = new User
            {
                FullName = "Rushan Perera",
                Email = "seller@bikesense.lk",
                PhoneNumber = "+94719876543",
                IsVerified = true,
                CreatedDate = DateTime.UtcNow
            };
            seller.PasswordHash = hasher.HashPassword(seller, "SellerPass123!");
            if (sellerRole != null) seller.Roles.Add(sellerRole);
            context.Users.Add(seller);

            // 3. Seed Dealer
            var dealer = new User
            {
                FullName = "Apex Auto Dealers",
                Email = "dealer@bikesense.lk",
                PhoneNumber = "+94112998877",
                IsVerified = true,
                CreatedDate = DateTime.UtcNow
            };
            dealer.PasswordHash = hasher.HashPassword(dealer, "DealerPass123!");
            if (dealerRole != null) dealer.Roles.Add(dealerRole);

            // Seed dealer metrics
            dealer.DealerMetric = new DealerMetric
            {
                ViewsCount = 4920,
                SalesCount = 18,
                TotalRevenue = 8400000.00m
            };
            context.Users.Add(dealer);

            context.SaveChanges();

            // 4. Seed initial Bike listings
            var bike1 = new Bike
            {
                Title = "Honda Dio 2018 Blue Excellent Condition",
                Brand = "Honda",
                Model = "Dio",
                BikeType = "Scooters",
                Year = 2018,
                Mileage = 24000,
                EngineCC = 110,
                Color = "Blue",
                Price = 420000m,
                Condition = "Excellent",
                OwnerCount = 1,
                Insurance = "Full Option",
                Registration = "Registered",
                ServiceHistory = "Full",
                AccidentHistory = "None",
                Description = "A highly reliable Honda Dio scooter. Used by a school teacher, well maintained with full service records from Stafford Motors. Tires are brand new. Fuel economy is amazing (55km/liter).",
                Location = "Gampaha",
                SellerId = seller.Id,
                IsSuspicious = false,
                CreatedDate = DateTime.UtcNow.AddDays(-5)
            };
            bike1.BikeImages.Add(new BikeImage
            {
                ImageUrl = "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&q=80&w=800",
                IsPrimary = true
            });
            context.Bikes.Add(bike1);

            var bike2 = new Bike
            {
                Title = "Bajaj Pulsar 150 Neon Edition 2020",
                Brand = "Bajaj",
                Model = "Pulsar",
                BikeType = "Motorbikes",
                Year = 2020,
                Mileage = 18000,
                EngineCC = 150,
                Color = "Red",
                Price = 580000m,
                Condition = "Good",
                OwnerCount = 2,
                Insurance = "Third Party",
                Registration = "Registered",
                ServiceHistory = "Partial",
                AccidentHistory = "None",
                Description = "Smooth riding Pulsar 150, Neon edition. Engine is in perfect running condition. Rear tire changes are due in 4000km. Front tire replaced recently. All lights and sensors are working.",
                Location = "Colombo",
                SellerId = seller.Id,
                IsSuspicious = false,
                CreatedDate = DateTime.UtcNow.AddDays(-2)
            };
            bike2.BikeImages.Add(new BikeImage
            {
                ImageUrl = "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=800",
                IsPrimary = true
            });
            context.Bikes.Add(bike2);

            var bike3 = new Bike
            {
                Title = "Yamaha FZ Version 3.0 (ABS) 2021",
                Brand = "Yamaha",
                Model = "FZ",
                BikeType = "Motorbikes",
                Year = 2021,
                Mileage = 12000,
                EngineCC = 149,
                Color = "Matt Black",
                Price = 790000m,
                Condition = "Excellent",
                OwnerCount = 1,
                Insurance = "Full Option",
                Registration = "Registered",
                ServiceHistory = "Full",
                AccidentHistory = "None",
                Description = "Beautiful matt black Yamaha FZ V3. Very low mileage (mostly used for short weekend rides). ABS works perfectly. Fuel economy is around 48 km/l. Carefully ridden, stored indoors.",
                Location = "Kandy",
                SellerId = dealer.Id,
                IsSuspicious = false,
                CreatedDate = DateTime.UtcNow.AddDays(-1)
            };
            bike3.BikeImages.Add(new BikeImage
            {
                ImageUrl = "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80&w=800",
                IsPrimary = true
            });
            context.Bikes.Add(bike3);

            context.SaveChanges();
        }
    }
}
