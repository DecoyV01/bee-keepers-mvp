# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# AI-Powered BEE Keepers System

**UI:** Clean, minimalistic, mobile-first design
**Functionality:**
- Let users add daily/weekly bee hive data
- Track
- Get feedback and personalized bee hive status & performance tips using AI
- Analyze which beehives performance are dropping and suggest optimizations
**Performance:** Responsive, fast loading, low-friction UX

## Project Overview

BEE Keepers MVP is a complete beekeeping management system with a JavaScript frontend and Google Apps Script backend. The system is **production-ready and fully deployed** with working API endpoints.

### Architecture
- **Frontend**: Vanilla JavaScript with Bootstrap 5, Chart.js for visualizations
- **Backend**: Google Apps Script REST API 
- **Database**: Google Sheets (6 sheets: Apiaries, Hives, Inspections, Metrics, Tasks, Treatments)
- **Deployment**: Static hosting (GitHub Pages, Netlify, etc.)

### Key Components
- `frontend/` - Complete web application (index.html, app.js, styles.css)
- `api/` - Google Apps Script REST API (setup.gs, setup-fixed.gs) 
- `database/` - Schema definitions and sample data

## Working API Endpoint

The system uses a fully functional Google Apps Script API:
```
https://script.google.com/macros/s/AKfycbz6K0wYCVgQl2FcLkyC78EXUc71UOzxHqikGi6k9ZBfL0ThaQQTeEYrLAefnGs9cAHC/exec
```

## Database

Google Sheets Database:
```
https://docs.google.com/spreadsheets/d/1PVN5lq6U0Joszq5W7TlVTUi72m615qXv7wSeZmePbwM/edit?gid=0#gid=0
```

## Development Commands

### Testing the Application
```bash
# Serve frontend locally (any HTTP server)
python -m http.server 8000
# OR
npx http-server frontend/

# Test API connectivity
curl "https://script.google.com/macros/s/AKfycbz6K0wYCVgQl2FcLkyC78EXUc71UOzxHqikGi6k9ZBfL0ThaQQTeEYrLAefnGs9cAHC/exec?action=health"
```

### Deployment
No build process required - static files can be deployed directly:
- GitHub Pages: Upload `frontend/` contents to repository
- Netlify: Drag and drop `frontend/` folder
- Any static hosting: Upload index.html, app.js, styles.css

## Database Schema

6 interconnected sheets with the following relationships:
- **Apiaries** (locations) → **Hives** (individual hives)
- **Hives** → **Inspections** (hive inspections)
- **Hives** → **Metrics** (temperature, weight, humidity)
- **Hives** → **Tasks** (management tasks)
- **Hives** → **Treatments** (medical treatments)

All sheets use auto-incrementing ID fields as primary keys.

## API Usage

### Core Operations
```javascript
// GET data
const response = await fetch(`${API_URL}?action=get&sheet=Hives`);

// POST data
const response = await fetch(API_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'add',
    sheet: 'Hives',
    record: { Name: 'New Hive', Type: 'Langstroth', Status: 'Active' }
  })
});
```

### Available Actions
- `health` - API status check
- `get` - Retrieve records
- `add` - Create new record
- `update` - Update existing record
- `delete` - Delete record
- `search` - Filter records
- `count` - Count records
- `bulk_add` - Add multiple records

## Frontend Architecture

### Main Application (app.js)
- `GOOGLE_SCRIPT_URL` - API endpoint constant
- `showSection()` - Navigation between app sections
- `loadData()` functions - Fetch data from API
- `renderData()` functions - Display data in UI
- `addRecord()` functions - Create new records
- Bootstrap modals for forms

### UI Sections
- **Dashboard** - Statistics and recent activity
- **Hives** - Hive management and overview
- **Inspections** - Detailed hive inspections
- **Metrics** - Temperature, weight, humidity tracking with charts
- **Tasks** - Task management with priorities

### Key Features
- Real-time data synchronization
- Mobile-responsive design
- Interactive charts using Chart.js
- Form validation and error handling
- Bootstrap 5 UI components

## Current Status

The system is **100% complete and production-ready**:
- ✅ All core features implemented
- ✅ API fully functional and tested
- ✅ Frontend application complete
- ✅ Database schema implemented
- ✅ Deployment package ready
- ✅ Cross-browser compatibility verified

## File Structure

```
bee/
├── frontend/           # Complete web application
│   ├── index.html     # Main app interface (622 lines)
│   ├── app.js         # Full functionality (496 lines)
│   ├── styles.css     # Bee-themed styling (344 lines)
│   └── README.md      # Deployment instructions
├── api/               # Google Apps Script backend
│   ├── setup.gs       # REST API implementation
│   └── setup-fixed.gs # Updated API version
├── database/          # Schema and documentation
│   ├── schema-reference.md
│   └── sample-data.md
└── PROJECT-COMPLETE.md # Full project documentation
```

## Working with This Codebase

- All functionality is implemented - focus on enhancements or bug fixes
- API is live and functional - no setup required for basic development
- Frontend requires no build process - edit and refresh
- Database schema is fixed - coordinate changes with API
- Deployment is simple - static file hosting only

## Testing

The system includes comprehensive testing capabilities:
- API health check endpoint
- Frontend test deployment page
- Complete CRUD operation testing
- Real-time data sync verification

## Key Memories
- Under no circumstances are you allowed to use fallback / mock data unless instructed explicitly.