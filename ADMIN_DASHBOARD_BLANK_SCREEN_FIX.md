# Admin Dashboard Blank Screen - Diagnosis & Fix

## 🔍 Problem Analysis

**Issue**: When logging in as admin at http://localhost:3000/login, the admin dashboard appears blank/collapsed.

**Root Cause**: The AdminDashboard component had insufficient error handling in the `fetchData()` function. When any of the four API calls failed (`getAllMentors`, `getAll departments`, `getPendingMentors`, `getAllUsers`), the entire Promise.all would reject, causing the component to fail silently without proper error feedback.

---

## ✅ Fixes Applied

### 1. Enhanced Error Handling in `fetchData()`

**Before**:

```javascript
const [mentorsRes, deptsRes, pendingRes, usersRes] = await Promise.all([
  adminAPI.getAllMentors(),
  departmentAPI.getAll(),
  authAPI.getPendingMentors(),
  adminAPI.getAllUsers(),
]);
```

**After**:

```javascript
const [mentorsRes, deptsRes, pendingRes, usersRes] = await Promise.all([
  adminAPI.getAllMentors().catch((err) => {
    console.error("Error fetching mentors:", err);
    return { data: [] };
  }),
  departmentAPI.getAll().catch((err) => {
    console.error("Error fetching departments:", err);
    return { data: [] };
  }),
  authAPI.getPendingMentors().catch((err) => {
    console.error("Error fetching pending mentors:", err);
    return { data: [] };
  }),
  adminAPI.getAllUsers().catch((err) => {
    console.error("Error fetching users:", err);
    return { data: [] };
  }),
]);
```

**Benefit**: Now if one API call fails, the others still complete. The component renders with empty data for the failed endpoint instead of crashing entirely.

---

### 2. Added Comprehensive Console Logging

**Added logging at key points**:

- Component mount: "AdminDashboard mounted, checking authentication..."
- Auth check: Logs userRole and adminUser status
- Data fetch start: "User is authorized, fetching dashboard data..."
- Data fetch complete: Logs count of each data type fetched
- Individual API errors: Logs which specific API call failed

**How to use**: Open browser console (F12) when accessing admin dashboard to see exactly what's happening.

---

### 3. Improved Loading State UI

**Before**:

```javascript
if (loading) {
  return <div className="loading">Loading...</div>;
}
```

**After**:

```javascript
if (loading) {
  return (
    <div className="admin-dashboard">
      <div className="loading">
        <div className="loader"></div>
        <p>Loading admin dashboard...</p>
      </div>
    </div>
  );
}
```

**Benefit**: Better visual feedback during data loading, maintains consistent page structure.

---

### 4. Added Auth Status Logging

```javascript
const userRole = localStorage.getItem("userRole");
const adminUser = localStorage.getItem("adminUser");

console.log("Auth status:", { userRole, hasAdminUser: !!adminUser });
```

**Benefit**: Immediately see if authentication is properly set in localStorage.

---

## 🧪 How to Test

### Step 1: Open Browser Console

1. Open http://localhost:3000
2. Press **F12** to open Developer Tools
3. Go to **Console** tab

### Step 2: Login as Admin

1. Click "Sign In" or go to http://localhost:3000/login
2. Enter credentials:
   - Email: `harshavardhinin6@gmail.com`
   - Password: `admin123`
3. Click "Sign In"

### Step 3: Check Console Output

You should see logs like this:

```
AdminDashboard mounted, checking authentication...
Auth status: { userRole: 'ADMIN', hasAdminUser: true }
User is authorized, fetching dashboard data...
Fetching admin dashboard data...
Fetched data: { mentors: X, departments: Y, pendingMentors: Z, users: W }
```

If you see errors:

```
Error fetching mentors: [error details]
```

This tells you exactly which API call is failing and why.

---

## 🐛 Common Issues & Solutions

### Issue 1: "Failed to load dashboard data" toast appears

**Possible Causes**:

- Backend not running on port 8080
- MongoDB not running
- CORS issues
- API endpoints returning errors

**Solution**:

1. Check backend is running: http://localhost:8080
2. Check backend console for errors
3. Look at browser console for specific API error messages
4. Verify MongoDB service is running:
   ```powershell
   Get-Service -Name MongoDB
   ```

---

### Issue 2: "Unauthorized access" and redirect to /admin-login

**Cause**: userRole is not set to "ADMIN" in localStorage

**Solution**:

1. Open browser console
2. Run: `localStorage.getItem("userRole")`
3. Should return `"ADMIN"`
4. If not, login again or manually set:
   ```javascript
   localStorage.setItem("userRole", "ADMIN");
   localStorage.setItem("adminUser", '{"email":"harshavardhinin6@gmail.com"}');
   ```

---

### Issue 3: Dashboard shows but with 0 mentors/users/departments

**Possible Causes**:

- API calls succeeding but returning empty arrays
- Database is empty
- API endpoints returning wrong data structure

**Solution**:

1. Check console logs: "Fetched data: { mentors: 0, departments: 0... }"
2. Check MongoDB directly:
   ```javascript
   // In MongoDB shell or Compass
   use placementTracker
   db.mentors.countDocuments()
   db.users.countDocuments()
   db.departments.countDocuments()
   ```
3. If database is empty, the DataInitializer should have created 9 departments on startup
4. Check backend logs for "DataInitializer" messages

---

### Issue 4: Specific API call failing

**Example console error**:

```
Error fetching mentors: AxiosError: Request failed with status code 404
```

**Solution**:

1. Check if backend endpoint exists:

   - `/api/admin/mentors` for getAllMentors
   - `/api/departments` for getAll departments
   - `/api/auth/mentors/pending` for getPendingMentors
   - `/api/admin/users` for getAllUsers

2. Test endpoint directly:

   ```bash
   # In browser or Postman
   GET http://localhost:8080/api/departments
   GET http://localhost:8080/api/admin/mentors
   GET http://localhost:8080/api/auth/mentors/pending
   GET http://localhost:8080/api/admin/users
   ```

3. Check backend AdminController.java and AuthController.java for these endpoints

---

## 📋 Quick Diagnosis Checklist

Run through this checklist:

- [ ] Backend running on port 8080? (Check terminal)
- [ ] Frontend running on port 3000? (Check terminal)
- [ ] MongoDB service running? (`Get-Service -Name MongoDB`)
- [ ] Browser console shows authentication logs?
- [ ] localStorage has userRole = "ADMIN"?
- [ ] Any red errors in browser console?
- [ ] Any errors in backend terminal?
- [ ] Can access http://localhost:8080/api/departments directly?

---

## 🔧 Manual Testing Commands

### Test Backend Endpoints (in browser or Postman):

```bash
# Test departments (should work without auth)
GET http://localhost:8080/api/departments

# Test admin endpoints (may need auth)
GET http://localhost:8080/api/admin/mentors
GET http://localhost:8080/api/admin/users

# Test auth endpoints
GET http://localhost:8080/api/auth/mentors/pending
```

### Check LocalStorage (in browser console):

```javascript
// Check if admin is logged in
console.log("UserRole:", localStorage.getItem("userRole"));
console.log("AdminUser:", localStorage.getItem("adminUser"));
console.log("User:", localStorage.getItem("user"));

// Clear and re-login if needed
localStorage.clear();
// Then login again
```

---

## 🎯 Expected Behavior After Fixes

### On Successful Login:

1. **Console logs**:

   ```
   AdminDashboard mounted, checking authentication...
   Auth status: { userRole: 'ADMIN', hasAdminUser: true }
   User is authorized, fetching dashboard data...
   Fetching admin dashboard data...
   Fetched data: { mentors: 0, departments: 9, pendingMentors: 0, users: 1 }
   ```

2. **Dashboard displays**:

   - Header with "Admin Dashboard" title
   - 4 stat cards: Total Mentors, Total Users, Total Departments, Pending Approvals
   - Tabs: "Manage Mentors" and "Manage Users"
   - If pending mentors exist: "Pending Mentor Approvals" section
   - List of mentors in "Manage Mentors" tab
   - List of users in "Manage Users" tab

3. **No errors** in browser console (except maybe 404s if no data exists yet)

---

## 🚀 Next Steps

### If Dashboard Still Blank:

1. **Check browser console** - Look for any JavaScript errors or API failures
2. **Check network tab** - See if API calls are being made and what responses they get
3. **Verify backend logs** - Look for any errors when APIs are called
4. **Test API endpoints directly** - Use browser or Postman to test each endpoint
5. **Check MongoDB** - Ensure data exists in collections

### If Data Not Loading:

1. **Run DataInitializer** - Restart backend to trigger initialization
2. **Check MongoDB collections** - Verify departments, users exist
3. **Create test data** - Use admin dashboard to create mentors/users manually
4. **Check API responses** - Verify they return correct data structure

---

## 📊 System Status

**After fixes, you should see**:

✅ **Backend**: http://localhost:8080 (Running)
✅ **Frontend**: http://localhost:3000 (Running)
✅ **MongoDB**: localhost:27017 (Connected)
✅ **Admin Dashboard**: Loads with error handling
✅ **Console Logging**: Shows detailed debugging info
✅ **API Failures**: Handled gracefully without crashing

---

## 🆘 Still Having Issues?

### Collect This Information:

1. **Browser console output** (entire log from F12 console)
2. **Backend terminal output** (last 50 lines)
3. **Network tab** (F12 → Network, filter by "api", show failed requests)
4. **localStorage contents**:

   ```javascript
   console.log(JSON.stringify(localStorage));
   ```

5. **MongoDB status**:
   ```powershell
   Get-Service -Name MongoDB
   ```

### Nuclear Option - Complete Reset:

```powershell
# Stop everything
Get-Process | Where-Object { $_.ProcessName -eq 'java' -or $_.ProcessName -eq 'node' } | Stop-Process -Force

# Clear browser data
# In browser: Clear all site data for localhost

# Restart MongoDB
Restart-Service -Name MongoDB

# Start backend
cd "c:\Users\harsh\OneDrive\Desktop\fnl_project\demo\Placement_Tracker"
mvn clean spring-boot:run

# Start frontend (new terminal)
cd "c:\Users\harsh\OneDrive\Desktop\fnl_project\demo\placement-tracker-frontend"
npm run dev

# Login again and check console
```

---

**Last Updated**: January 13, 2026
**Status**: ✅ Error handling improved, debugging enabled
