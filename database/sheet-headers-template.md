# Sheet Headers Template

Use these exact headers for each sheet in your Google Sheets database.

## Hives Sheet
```
ID	Apiary_ID	Name	Type	Install_Date	Status	QR_Code	Notes
```

## Inspections Sheet  
```
ID	Hive_ID	Inspector	Date	Duration	Queen_Present	Queen_Laying	Brood_Pattern	Honey_Stores	Weather	Notes
```

## Metrics Sheet
```
ID	Hive_ID	Date	Time	Temperature	Weight	Humidity	Source	Notes
```

## Tasks Sheet
```
ID	Hive_ID	Title	Description	Due_Date	Status	Priority	Created_Date	Completed_Date
```

## Treatments Sheet
```
ID	Hive_ID	Treatment_Type	Medicine	Dosage	Date_Applied	Date_Completed	Effectiveness	Notes
```

## Apiaries Sheet
```
ID	Name	Location	GPS_Lat	GPS_Lng	Owner_Email	Created_Date	Notes
```

## Copy-Paste Instructions

1. Open each sheet in your Google Sheets document
2. Click on cell A1
3. Copy the entire header row for that sheet from above
4. Paste using Ctrl+V (or Cmd+V on Mac)
5. Repeat for all 6 sheets

## Important Notes

- Headers are **tab-separated** - don't change the spacing
- Column names are **case-sensitive**
- Order matters - keep columns in exact sequence shown
- ID column will auto-increment via Google Apps Script
