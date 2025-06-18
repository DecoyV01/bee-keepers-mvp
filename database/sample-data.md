# Sample Data for Testing

This file contains sample data you can add to your Google Sheets database for testing purposes.

## Apiaries Sheet Sample Data
Copy and paste this into row 2 of the Apiaries sheet:

```
1	Main Apiary	123 Farm Road, Bee Valley, State 12345	40.7128	-74.0060	beekeeper@email.com	2024-01-01	Primary beekeeping location with 5 hives
```

## Hives Sheet Sample Data
Copy and paste these into rows 2-4 of the Hives sheet:

```
1	1	Hive Alpha	Langstroth	2024-03-01	Active	QR001	Strong colony, excellent production
2	1	Hive Beta	Langstroth	2024-03-15	Active	QR002	New colony, monitoring development
3	1	Hive Gamma	Top Bar	2024-04-01	Inactive	QR003	Swarmed - need to replace queen
```

## Inspections Sheet Sample Data
Copy and paste these into rows 2-3 of the Inspections sheet:

```
1	1	John Beekeeper	2024-06-15	45	Yes	Yes	5	4	Sunny	Colony looking very strong, lots of brood
2	2	John Beekeeper	2024-06-15	30	Yes	Yes	3	2	Sunny	Young colony progressing well, may need feeding
```

## Metrics Sheet Sample Data
Copy and paste these into rows 2-5 of the Metrics sheet:

```
1	1	2024-06-15	14:30	95.5	87.3	65	Manual	Temperature stable, weight increasing
2	1	2024-06-14	09:15	92.1	86.8	68	Manual	Morning inspection readings
3	2	2024-06-15	14:45	94.8	52.1	67	Manual	Lighter hive, newer colony
4	2	2024-06-14	09:30	91.5	51.6	70	Manual	Steady progress on weight gain
```

## Tasks Sheet Sample Data
Copy and paste these into rows 2-4 of the Tasks sheet:

```
1	1	Varroa Treatment	Apply mite treatment strips to all frames	2024-06-20	Pending	High	2024-06-15	
2		Equipment Maintenance	Clean and repair spare hive boxes	2024-06-25	Pending	Medium	2024-06-15	
3	2	Feed Sugar Syrup	Provide 1:1 sugar syrup to support colony growth	2024-06-18	Pending	High	2024-06-15	
```

## Treatments Sheet Sample Data
Copy and paste this into row 2 of the Treatments sheet:

```
1	1	Varroa Mites	Apiguard Gel	50g per hive	2024-05-01	2024-05-15	4	Effective treatment, mite drop observed
```

## Data Entry Tips

### For Dates
- Use YYYY-MM-DD format (e.g., 2024-06-15)
- Google Sheets will auto-format as dates

### For Times  
- Use HH:MM format (e.g., 14:30 for 2:30 PM)
- 24-hour format recommended

### For GPS Coordinates
- Use decimal degrees format
- Latitude: positive for North, negative for South
- Longitude: positive for East, negative for West

### For Ratings/Scales
- Brood Pattern: 1 (poor) to 5 (excellent)
- Honey Stores: 1 (very low) to 5 (excellent/full)
- Treatment Effectiveness: 1 (ineffective) to 5 (very effective)

### For Status Fields
**Hive Status Options:**
- Active
- Inactive  
- Swarmed
- Dead
- Queenless

**Task Status Options:**
- Pending
- In Progress
- Completed
- Cancelled

**Priority Options:**
- Low
- Medium  
- High
- Critical

## Verification Steps

After adding sample data:

1. **Check Data Display**: Verify all data appears correctly in each sheet
2. **Test Sorting**: Click column headers to sort data
3. **Test Filtering**: Use Data > Create a filter to test filtering
4. **Check Formulas**: Ensure no cells show formula errors
5. **Verify Sharing**: Open the sheet link in incognito mode to test access

## Next Steps

Once sample data is added and verified:
1. Test the Google Apps Script API (Task 2)
2. Use this data for frontend development and testing
3. Validate the complete workflow from data entry to display
