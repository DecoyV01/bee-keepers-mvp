# Database Schema Reference

This document defines the complete database schema for the BEE Keepers MVP system.

## Schema Overview

The database consists of 6 related tables (Google Sheets) that manage all aspects of beekeeping operations.

## Table Relationships

```
Apiaries (1) -> (many) Hives
Hives (1) -> (many) Inspections
Hives (1) -> (many) Metrics  
Hives (1) -> (many) Tasks
Hives (1) -> (many) Treatments
```

## Detailed Schema Definitions

### 1. Apiaries Table

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| ID | Number | Primary key, auto-increment | Required, Unique |
| Name | Text | Apiary name | Required, Max 100 chars |
| Location | Text | Physical address | Optional, Max 200 chars |
| GPS_Lat | Number | Latitude coordinate | Optional, -90 to 90 |
| GPS_Lng | Number | Longitude coordinate | Optional, -180 to 180 |
| Owner_Email | Text | Email of owner/manager | Optional, Valid email format |
| Created_Date | Date | Creation timestamp | Auto-generated |
| Notes | Text | Additional notes | Optional, Max 500 chars |

### 2. Hives Table

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| ID | Number | Primary key, auto-increment | Required, Unique |
| Apiary_ID | Number | Foreign key to Apiaries | Required |
| Name | Text | Hive identifier | Required, Max 50 chars |
| Type | Text | Hive type | Required, Values: Langstroth, Top Bar, Warre, Other |
| Install_Date | Date | Installation date | Optional |
| Status | Text | Current status | Required, Values: Active, Inactive, Swarmed, Dead |
| QR_Code | Text | Unique QR code | Auto-generated, Unique |
| Notes | Text | Hive-specific notes | Optional, Max 500 chars |

### 3. Inspections Table

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| ID | Number | Primary key, auto-increment | Required, Unique |
| Hive_ID | Number | Foreign key to Hives | Required |
| Inspector | Text | Name of inspector | Required, Max 100 chars |
| Date | Date | Inspection date | Required |
| Duration | Number | Inspection duration (minutes) | Optional, Min 1 |
| Queen_Present | Text | Queen presence status | Values: Yes, No, Unknown |
| Queen_Laying | Text | Queen laying status | Values: Yes, No, Unknown |
| Brood_Pattern | Number | Pattern quality rating | Optional, 1-5 scale |
| Honey_Stores | Number | Honey store level | Optional, 1-5 scale |
| Weather | Text | Weather conditions | Optional, Max 50 chars |
| Notes | Text | Inspection notes | Optional, Max 1000 chars |

### 4. Metrics Table

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| ID | Number | Primary key, auto-increment | Required, Unique |
| Hive_ID | Number | Foreign key to Hives | Required |
| Date | Date | Measurement date | Required |
| Time | Text | Measurement time (HH:MM) | Optional |
| Temperature | Number | Temperature (°F) | Optional, 0-150 range |
| Weight | Number | Total weight (lbs) | Optional, Min 0 |
| Humidity | Number | Humidity percentage | Optional, 0-100 range |
| Source | Text | Data source | Values: Manual, Digital, Estimated |
| Notes | Text | Measurement notes | Optional, Max 200 chars |

### 5. Tasks Table

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| ID | Number | Primary key, auto-increment | Required, Unique |
| Hive_ID | Number | Foreign key to Hives | Optional (general tasks) |
| Title | Text | Task title | Required, Max 100 chars |
| Description | Text | Detailed description | Optional, Max 500 chars |
| Due_Date | Date | Due date | Optional |
| Status | Text | Current status | Values: Pending, In Progress, Completed |
| Priority | Text | Priority level | Values: Low, Medium, High, Critical |
| Created_Date | Date | Creation timestamp | Auto-generated |
| Completed_Date | Date | Completion timestamp | Auto-set when completed |

### 6. Treatments Table

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| ID | Number | Primary key, auto-increment | Required, Unique |
| Hive_ID | Number | Foreign key to Hives | Required |
| Treatment_Type | Text | Type of treatment | Required, Max 50 chars |
| Medicine | Text | Medicine/product name | Optional, Max 100 chars |
| Dosage | Text | Dosage information | Optional, Max 100 chars |
| Date_Applied | Date | Application date | Required |
| Date_Completed | Date | Completion date | Optional |
| Effectiveness | Number | Treatment effectiveness | Optional, 1-5 scale |
| Notes | Text | Treatment notes | Optional, Max 500 chars |

## Data Validation Rules

### Required Fields
- All ID fields (auto-generated)
- All foreign key relationships
- Core entity names (Apiary Name, Hive Name, etc.)
- Inspection dates and inspector names
- Task titles and status

### Format Validation
- **Dates**: YYYY-MM-DD format
- **Times**: HH:MM 24-hour format  
- **GPS**: Decimal degrees (-90 to 90 lat, -180 to 180 lng)
- **Email**: Valid email format
- **Numbers**: Positive values where applicable

### Enum Values
- **Hive Type**: Langstroth, Top Bar, Warre, Other
- **Hive Status**: Active, Inactive, Swarmed, Dead
- **Queen Status**: Yes, No, Unknown
- **Task Status**: Pending, In Progress, Completed
- **Priority**: Low, Medium, High, Critical
- **Data Source**: Manual, Digital, Estimated

## API Considerations

### Auto-Generated Fields
- ID fields: Auto-increment starting from 1
- QR_Code: Generated as "QR" + timestamp
- Created_Date: Current date when record created
- Completed_Date: Set when task status changes to "Completed"

### Search/Filter Fields
- Hive searches: Name, Status, Type
- Inspection searches: Date range, Inspector, Queen status
- Task searches: Status, Priority, Due date
- Metric searches: Date range, Hive

### Performance Optimization
- Index on foreign key fields (Hive_ID, Apiary_ID)
- Date range queries optimized for recent data
- Limit large result sets with pagination

## Usage Examples

### Typical Data Flow
1. Create Apiary → Create Hives → Conduct Inspections → Record Metrics
2. Create Tasks → Complete Tasks
3. Apply Treatments → Track Effectiveness

### Common Queries
- Get all active hives in an apiary
- Find recent inspections for a specific hive
- List overdue tasks by priority
- Track weight trends for a hive over time
- View treatment history and effectiveness

This schema supports the complete beekeeping management workflow while remaining simple enough for Google Sheets implementation.
