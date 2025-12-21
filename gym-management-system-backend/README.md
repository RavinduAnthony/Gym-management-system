# Gym Management System - Backend (.NET 8)

## 🏗️ Architecture

This project follows **Clean Architecture** principles with clear separation of concerns:

```
GymManagement.Solution/
├── src/
│   ├── GymManagement.Api/                    # Presentation Layer
│   ├── GymManagement.Application/            # Business Logic Layer
│   ├── GymManagement.Domain/                 # Domain Entities & Business Rules
│   ├── GymManagement.Infrastructure/         # Data Access & External Services
│   └── GymManagement.Contracts/              # DTOs & API Contracts
```

## 📦 Technology Stack

- **.NET 8** - Latest LTS version
- **Entity Framework Core 10** - ORM for database access
- **SQL Server** - Primary database
- **Dapper** - For complex queries and reporting
- **MediatR** - CQRS pattern implementation
- **AutoMapper** - Object mapping
- **FluentValidation** - Input validation
- **JWT Authentication** - Secure authentication
- **Serilog** - Structured logging
- **Swagger** - API documentation

## 🚀 Getting Started

### Prerequisites

- .NET 8 SDK
- SQL Server (LocalDB or full instance)
- Visual Studio 2022 / VS Code / Rider

### Setup Instructions

1. **Update Connection String** (if needed)
   Edit `appsettings.json` in GymManagement.Api:
   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=GymManagementDb;Trusted_Connection=true;"
   }
   ```

2. **Apply Database Migrations**
   ```bash
   cd src/GymManagement.Api
   dotnet ef migrations add InitialCreate --project ../GymManagement.Infrastructure
   dotnet ef database update
   ```

3. **Run the Application**
   ```bash
   dotnet run
   ```

4. **Access Swagger UI**
   Navigate to: `https://localhost:7xxx/swagger`

## 📊 Database Schema

### Core Entities

- **Users** - Authentication and base user information
- **Members** - Gym member profiles with health metrics
- **Coaches** - Trainer profiles with specializations
- **Packages** - Membership packages with pricing
- **Memberships** - Active member subscriptions
- **Payments** - Payment records and history
- **Expenses** - Gym operational expenses

## 🔐 Authentication

The API uses **JWT Bearer** authentication:

1. Register/Login via `/api/auth/login`
2. Receive JWT token
3. Include token in subsequent requests: `Authorization: Bearer {token}`

### User Roles

- **Admin** - Full system access
- **Coach** - Manage assigned clients
- **Member** - View own profile and data

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token

### Members
- `GET /api/members` - Get all members
- `GET /api/members/{id}` - Get member by ID
- `POST /api/members` - Create new member
- `PUT /api/members/{id}` - Update member
- `DELETE /api/members/{id}` - Delete member

### Coaches
- `GET /api/coaches` - Get all coaches
- `POST /api/coaches` - Create new coach

### Packages
- `GET /api/packages` - Get all packages
- `POST /api/packages` - Create package
- `PUT /api/packages/{id}` - Update package

### Payments
- `GET /api/payments` - Get payments (with filters)
- `POST /api/payments` - Record payment

### Expenses
- `GET /api/expenses` - Get expenses (with filters)
- `POST /api/expenses` - Add expense

### Reports
- `GET /api/reports/revenue` - Get revenue report

## 🏗️ Project Status

✅ Solution structure created  
✅ Domain entities defined  
✅ Database context configured  
✅ NuGet packages installed  
⏳ Controllers and services (Next step)  
⏳ Authentication implementation  
⏳ MediatR commands and queries  
⏳ Database migrations  

## 🔄 Next Steps

1. Implement repository pattern
2. Create MediatR command/query handlers
3. Build API controllers
4. Implement JWT authentication service
5. Add data seeding
6. Create unit tests
7. Add API documentation

## 📚 Development Guidelines

- Follow Clean Architecture principles
- Use async/await for all I/O operations
- Implement proper error handling
- Write meaningful commit messages
- Keep controllers thin - business logic in handlers
- Use DTOs for all API contracts

## 🐛 Troubleshooting

### Database Connection Issues
- Verify SQL Server is running
- Check connection string in appsettings.json
- Ensure LocalDB is installed

### Migration Errors
```bash
dotnet ef database drop --force
dotnet ef migrations remove
dotnet ef migrations add InitialCreate
dotnet ef database update
```

## 📞 Support

For issues or questions, please create an issue in the repository.
