# BEE Keepers MVP

AI-Powered Beekeeping Management System - Complete MVP with frontend and backend.

## 🚀 Live Demo

**Frontend App**: [https://YOUR_USERNAME.github.io/bee-keepers-mvp](https://YOUR_USERNAME.github.io/bee-keepers-mvp)

## 📱 Features

- **Dashboard**: Live statistics and recent activity
- **Hive Management**: Add and track beehive status  
- **Inspections**: Record detailed hive inspections
- **Metrics**: Track temperature, weight, humidity with charts
- **Tasks**: Manage beekeeping tasks with priorities

## 🔧 Tech Stack

- **Frontend**: Vanilla JavaScript + Bootstrap 5 + Chart.js
- **Backend**: Google Apps Script REST API
- **Database**: Google Sheets (6 interconnected sheets)
- **Hosting**: GitHub Pages (free)

## 🌐 Deployment

This repository contains the complete frontend application ready for GitHub Pages deployment.

### Quick Deploy to GitHub Pages:

1. Fork or clone this repository
2. Go to repository Settings > Pages
3. Set source to "Deploy from a branch"
4. Select branch: `main`, folder: `/frontend`
5. Your app will be live at: `https://YOUR_USERNAME.github.io/bee-keepers-mvp`

## 📁 File Structure

```
frontend/
├── index.html    # Main application (622 lines)
├── app.js        # Complete functionality (496 lines)  
└── styles.css    # Bee-themed styling (344 lines)
```

## 🐝 API Integration

The app connects to a live Google Apps Script API that manages data in Google Sheets:

- **API Endpoint**: Pre-configured and working
- **Database**: 6 sheets (Apiaries, Hives, Inspections, Metrics, Tasks, Treatments)
- **Operations**: Full CRUD operations supported

## 📊 Status

✅ **Production Ready** - Fully functional MVP ready for user testing

## 📧 Support

For deployment help, see `frontend/DEPLOY-GITHUB.md`