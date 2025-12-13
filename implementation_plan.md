# Integrate Hospital ML Model into Search

The user wants the "Delhi" search to return results from their ML Model (Port 8001), which currently supports `hospitals-by-city`. The current implementation only queries the main Mongo API (Port 5000), which returns no results for "Delhi".

I will implement a **Hybrid Search** strategy in the frontend:
1.  **Search Input**: When user types, query potentially two endpoints.
2.  **ML Endpoint**: `http://localhost:8001/hospitals-by-city?city=<query>` (Great for "Delhi", "Mumbai").
3.  **Backend Endpoint**: `http://localhost:5000/api/hospitals?search=<query>` (Great for "Apollo", "Cardiology").
4.  **Merge Logic**: Combine results, deduplicate by ID/Name, and display in Dropdown and Grid.

## User Review Required
> [!IMPORTANT]
> This changes the data source logic. If the ML server (Port 8001) is down, it will gracefully fallback to just the Backend search, so the site won't break.

## Proposed Changes

### Frontend
#### [MODIFY] [Hospitals.jsx](file:///c:/Project/HealTrip/frontend/src/pages/Hospitals.jsx)
- Update `fetchSuggestions` (for dropdown) and `fetchHospitals` (for grid).
- Add functionality to call `localhost:8001`.
- Map the ML response format (snake_case properties like `match_score`) to the Frontend format (`_id`, `name`, `address`).

## Verification Plan

### Manual Verification
1.  **Start Services**: Ensure Backend (5000) and ML (8001) are running.
2.  **Search "Delhi"**:
    - Verify Dropdown shows hospitals like "AIIMS", "Apollo Delhi".
    - Verify Grid updates to show these hospitals.
3.  **Search "Apollo"**:
    - Verify it still works (finding by name via Mongo).
4.  **Click Result**: Verify clicking a result takes to `/package` and data (like `address`) is passed correctly so Hotel Search works.
