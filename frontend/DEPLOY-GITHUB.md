# BEE Keepers MVP - GitHub Deployment Guide

## 🚀 Deploy to GitHub Pages in 5 Minutes

### Step 1: Create GitHub Repository

1. **Go to** [github.com](https://github.com) and sign in
2. **Click** "New repository" (green button)
3. **Repository name**: `bee-keepers-mvp`
4. **Description**: "AI-Powered Beekeeping Management System - MVP"
5. **Make it Public** (required for free GitHub Pages)
6. **Check** "Add a README file"
7. **Click** "Create repository"

### Step 2: Upload Your Files

**Option A: Web Interface (Easiest)**
1. **Click** "uploading an existing file" link
2. **Drag and drop** these 3 files from `C:\projects\bee\frontend\`:
   - `index.html`
   - `styles.css` 
   - `app.js`
3. **Commit message**: "Add BEE Keepers MVP frontend"
4. **Click** "Commit changes"

**Option B: Git Command Line**
```bash
git clone https://github.com/YOUR_USERNAME/bee-keepers-mvp.git
cd bee-keepers-mvp
# Copy your 3 files here
git add .
git commit -m "Add BEE Keepers MVP frontend"
git push origin main
```

### Step 3: Enable GitHub Pages

1. **Go to** your repository Settings tab
2. **Scroll down** to "Pages" section (left sidebar)
3. **Source**: Deploy from a branch
4. **Branch**: main
5. **Folder**: / (root)
6. **Click** "Save"

### Step 4: Access Your Live App

After 1-2 minutes, your app will be live at:
```
https://YOUR_USERNAME.github.io/bee-keepers-mvp
```

**Example**: If your GitHub username is "johnbeekeeper", your URL would be:
```
https://johnbeekeeper.github.io/bee-keepers-mvp
```

### Step 5: Test Your Deployment

1. **Open** your GitHub Pages URL
2. **Should see**: "Connected to BEE Keepers API!" message
3. **Test**: Add a hive, record inspection, add metrics
4. **Verify**: All data saves to your Google Sheets

## 🔧 Custom Domain (Optional)

Want a custom domain like `mybees.com`?

1. **Buy domain** from any registrar
2. **Add** `CNAME` file to repository with your domain
3. **Configure** DNS settings
4. **Enable** in GitHub Pages settings

## 📱 Mobile Testing

Your app is mobile-responsive! Test on:
- **iPhone Safari**
- **Android Chrome** 
- **iPad tablet view**

## 🎯 Sharing Your MVP

Share these links:
- **Live App**: `https://YOUR_USERNAME.github.io/bee-keepers-mvp`
- **Source Code**: `https://github.com/YOUR_USERNAME/bee-keepers-mvp`
- **Documentation**: Include README.md for users

## 🔄 Making Updates

To update your app:
1. **Edit files** locally
2. **Upload** to GitHub (or use git push)
3. **Changes go live** automatically in ~1 minute

## ✅ Deployment Checklist

- [ ] GitHub repository created
- [ ] 3 files uploaded (index.html, styles.css, app.js)
- [ ] GitHub Pages enabled
- [ ] App accessible via GitHub Pages URL
- [ ] API connection working
- [ ] Can add hives, inspections, metrics, tasks
- [ ] Mobile responsive design working

## 🆘 Troubleshooting

### App shows "Unable to connect to API"
- Check your Google Apps Script deployment is active
- Verify the API URL in `app.js` is correct

### GitHub Pages not working
- Ensure repository is public
- Check that files are in root directory (not subfolder)
- Wait 5-10 minutes for DNS propagation

### Styles look broken
- Verify all 3 files are uploaded
- Check browser console for 404 errors
- Clear browser cache and refresh

## 🎉 Success!

Once deployed, you have:
- ✅ **Free hosting** for your beekeeping app
- ✅ **Professional URL** to share with beekeepers
- ✅ **Automatic updates** when you make changes
- ✅ **Mobile-ready** interface for field use
- ✅ **Real database** with Google Sheets backend

Your BEE Keepers MVP is now live and ready for user testing! 🐝