# MongoDB to PostgreSQL Migration Guide

## Migration Status

### ✅ Completed
1. Database configuration (database.js) - PostgreSQL/Sequelize connection
2. Environment setup (.env) - DATABASE_URL configured  
3. All models converted to Sequelize:
   - User.js
   - OTP.js
   - Package.js
   - Payment.js
   - Expense.js
   - Trainer.js
4. models/index.js - Model associations initialized
5. authService.js - Updated to Sequelize
6. userService.js - Updated to Sequelize
7. server.js - Updated database connection

### ⏳ Pending Service Updates

The following service files still need MongoDB → Sequelize conversion:

#### packageService.js
Replace MongoDB methods with Sequelize:
- `Package.find(query)` → `Package.findAll({ where })`
- `Package.countDocuments(query)` → `Package.count({ where })`
- `Package.findById(id)` → `Package.findByPk(id)`
- `Package.findByIdAndUpdate()` → `pkg.update()`
- `Package.findByIdAndDelete()` → `pkg.destroy()`

#### paymentService.js
- Add `const { Op } = require('sequelize');`
- Replace `Payment.findById()` → `Payment.findByPk()`
- Replace MongoDB aggregations with Sequelize:
  ```js
  // Old MongoDB aggregate
  await Payment.aggregate([
    { $match: { ... } },
    { $group: { _id: '$field', total: { $sum: '$amount' } } }
  ]);
  
  // New Sequelize
  await Payment.findAll({
    attributes: [
      'field',
      [sequelize.fn('SUM', sequelize.col('amount')), 'total']
    ],
    where: { ... },
    group: ['field'],
    raw: true
  });
  ```
- Replace `Payment.populate('userId')` with `include: [{ model: User }]`
- Replace `userId` references with integer IDs instead of ObjectId

#### expenseService.js
- Add `const { Op } = require('sequelize');`
- Replace MongoDB queries with Sequelize equivalents
- Update aggregations to Sequelize syntax
- Replace date range queries:
  ```js
  // Old
  { date: { $gte: startDate, $lte: endDate } }
  
  // New
  { date: { [Op.between]: [startDate, endDate] } }
  ```

#### trainerService.js
- Similar to packageService updates
- Replace `Trainer.find()` → `Trainer.findAll()`
- Update validators and query syntax

#### reportService.js (Most Complex)
This file has heavy MongoDB aggregation pipelines. Key changes:

1. Replace Payment aggregation with JOIN:
```js
// Old MongoDB with $lookup
await Payment.aggregate([
  {
    $lookup: {
      from: 'users',
      localField: 'userId',
      foreignField: '_id',
      as: 'user'
    }
  },
  {
    $group: {
      _id: '$user.packageType',
      total: { $sum: '$amount' }
    }
  }
]);

// New Sequelize
await Payment.findAll({
  attributes: [
    [sequelize.col('user.packageType'), 'packageType'],
    [sequelize.fn('SUM', sequelize.col('amount')), 'total']
  ],
  include: [{
    model: User,
    as: 'user',
    attributes: []
  }],
  where: dateFilters,
  group: ['user.packageType'],
  raw: true
});
```

2. Update Expense aggregation similarly
3. Replace `User.countDocuments()` with `User.count()`
4. Update date filtering to use `Op.between`

## Key Sequelize Patterns

### Finding Records
```js
// By ID
const user = await User.findByPk(id);

// With conditions
const users = await User.findAll({ where: { status: 'active' } });

// One record
const user = await User.findOne({ where: { email } });
```

### Filtering
```js
const { Op } = require('sequelize');

// OR condition
{ where: { [Op.or]: [{ email }, { username }] } }

// LIKE (case-insensitive)
{ where: { name: { [Op.iLike]: `%${search}%` } } }

// Date range
{ where: { date: { [Op.between]: [startDate, endDate] } } }

// Greater than
{ where: { amount: { [Op.gt]: 0 } } }
```

### Pagination
```js
const { count, rows } = await Model.findAndCountAll({
  where,
  limit: parseInt(limit),
  offset: (page - 1) * limit,
  order: [['createdAt', 'DESC']]
});
```

### Aggregations
```js
const { sequelize } = require('../config/database');

// COUNT
await Model.count({ where });

// SUM with GROUP BY
await Model.findAll({
  attributes: [
    'category',
    [sequelize.fn('SUM', sequelize.col('amount')), 'total']
  ],
  where,
  group: ['category'],
  raw: true
});
```

### Relationships/Joins
```js
// belongsTo relationship
await Payment.findAll({
  include: [{
    model: User,
    as: 'user',
    attributes: ['firstName', 'lastName', 'packageType']
  }]
});
```

### Updates
```js
// Instance method
const user = await User.findByPk(id);
await user.update({ status: 'inactive' });

// Bulk update
await User.update(
  { status: 'inactive' },
  { where: { lastLogin: { [Op.lt]: oldDate } } }
);
```

### Deletes
```js
// Instance method
const record = await Model.findByPk(id);
await record.destroy();

// Bulk delete
await Model.destroy({ where: { status: 'deleted' } });
```

## Testing Checklist

After completing all service updates:

1. ✅ Install PostgreSQL locally or create cloud instance
2. ✅ Update .env with valid DATABASE_URL
3. ⏳ Start backend server (`npm run dev`)
4. ⏳ Verify tables are created (check PostgreSQL)
5. ⏳ Test registration endpoint
6. ⏳ Test login endpoint
7. ⏳ Test OTP forgot password flow
8. ⏳ Test package management
9. ⏳ Test payment management
10. ⏳ Test expense management
11. ⏳ Test revenue reports

## PostgreSQL Setup

### Option 1: Local Installation
```bash
# Windows (download from postgresql.org)
# After installation, create database:
psql -U postgres
CREATE DATABASE gym_management;
\q
```

### Option 2: Docker
```bash
docker run --name postgres-gym \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=gym_management \
  -p 5432:5432 \
  -d postgres:15
```

### Option 3: Cloud (Free Tier)
- Render.com: Free PostgreSQL instance
- Supabase: Free PostgreSQL with 500MB
- Neon.tech: Free serverless PostgreSQL

## Environment Variables

Update `.env`:
```env
DATABASE_URL=postgres://username:password@localhost:5432/gym_management

# For cloud providers, use their connection string:
# DATABASE_URL=postgres://user:pass@host.region.provider.com:5432/dbname?sslmode=require
```

## Next Steps

1. You can manually update the remaining service files using the patterns above
2. Or I can continue updating them one by one
3. Or we can test what we have so far and update services as needed

The core authentication and user management is ready to test!
