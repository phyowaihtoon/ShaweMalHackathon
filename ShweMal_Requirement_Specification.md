# ShweMal Web Application Requirement Specification

## 1. Document Information
- **Project Name**: ShweMal
- **Document Type**: Software Requirement Specification (SRS)
- **Platform**: Web Application
- **Version**: 1.0
- **Date**: 2026-08-11
- **Prepared For**: Product, Design, Development, QA, and Operations Teams

---

## 2. Purpose and Overview
ShweMal is a web application that provides services for:
- Renting houses
- Hiring moving services
- Finding roommates
- Connecting users with verified housing agents and verified drivers

The application contains:
- **Public Portal** (default portal for visitors, normal users, agents, and drivers)
- **Admin Portal** (only for admin users)

---

## 3. Business Goals
1. Enable users to quickly discover and book suitable houses.
2. Provide an end-to-end moving service flow linked with house booking.
3. Help users find compatible roommates.
4. Build trust through verification workflows for agents and drivers.
5. Provide admin controls for user/role management, master data, and reporting.

---

## 4. User Roles
1. **Visitor**
- Unauthenticated public user.
- Can browse and search houses.
- Must sign up/sign in for booking, posting roommate requests, and profile-specific actions.

2. **Normal User**
- Registered and authenticated user.
- Can book houses, hire moving services, maintain wishlist, reviews/ratings, and manage profile.

3. **Agent**
- Registered user with agent registration.
- Must be admin-verified to publish housing listings.
- Can post/edit/delete/view own housing information.

4. **Driver**
- Registered user with driver registration.
- Must be admin-verified to accept assigned moving jobs.
- Can update delivery statuses and process ETAs.

5. **Admin**
- Uses admin portal only.
- Verifies agents and drivers.
- Creates users, assigns roles, manages master data, and views reports.

---

## 5. Portals and Navigation

## 5.1 Public Portal (Default)
### Header Navigation (Top)
- Left side:
  - Logo
  - App Name (ShweMal)
- Right side (before login):
  - Home
  - About Us
  - Agent Register
  - Sign Up
  - Sign In
- Right side (after login):
  - User Profile icon/menu
  - Notification icon

### Sub Header (Sub Navigation)
- Finding House
- Hire Moving Service
- Finding Roommates
- Post Housing Information (visible only to users with the agent role; opens agent housing manage/post flow)

## 5.2 Admin Portal
- Accessible only by admin role.
- Contains all administrative modules.

---

## 6. In Scope and Out of Scope

### In Scope
- House listing discovery, details, and booking flow
- Agent registration and verification
- Driver registration and verification
- Moving service request and driver job workflow
- Roommate browsing and posting
- User profile, wishlist, notifications, and history
- Admin management and reporting

### Out of Scope (Initial Release)
- Native mobile applications
- Online payment gateway integration (if needed, handled in later phase)
- Real-time chat system between users/agents/drivers (future enhancement)

---

## 7. Functional Requirements

## 7.1 Authentication and Account
### FR-AUTH-001 Login
- System shall allow login using:
  - Email
  - Password
  - Remember Me option

### FR-AUTH-002 Sign Up
- System shall allow sign-up using:
  - Name
  - Email
  - Phone Number
  - Password
  - Confirm Password

### FR-AUTH-003 Access Control
- System shall enforce role-based access for normal, agent, driver, and admin users.
- Admin portal access shall be restricted to admin role only.

### FR-AUTH-004 Registration Notification
- System shall notify users when account registration is confirmed.

## 7.2 Home Page and Public Browsing
### FR-HOME-001 Global Search
- Home page shall display a global search box for house search.

### FR-HOME-002 Featured Listings
- Home page shall display featured houses.

### FR-HOME-003 Additional Content
- Home page shall include:
  - Popular recommended listings
  - News updates
  - Verified housing agents
  - Partner moving services
  - User reviews of services

### FR-HOME-004 Wishlist from Cards
- Users shall be able to add favorite house posts to wishlist using a heart icon.
- If not logged in, system shall request login/sign-up before adding to wishlist.

### FR-HOME-005 Public House Discovery
- Visitors without sign-up shall be able to find houses.

## 7.3 Find Housing Module
### FR-HOUSE-001 Search Filters
- Finding House page shall provide filters for:
  - City
  - Type (Property Type)
  - Minimum Budget
  - Maximum Budget

### FR-HOUSE-002 Listing Results
- System shall display house cards with photos and primary information.

### FR-HOUSE-003 Details Page
- Clicking a house card shall open a details page with:
  - Full description
  - Amenities list
  - Location
  - Pricing
  - Agent details

### FR-HOUSE-004 Booking
- Logged-in users shall be able to book a house.
- Visitors attempting to book shall be redirected to sign up/sign in first.

### FR-HOUSE-005 Moving Upsell After Booking
- After successful house booking, system shall ask whether to hire moving service.
- If user selects Yes, Hire Moving Service page/modal shall open.
- If user selects No, user shall still be able to hire moving service later from the **Hire Moving Service** link.

## 7.4 Housing Agent Module
### FR-AGENT-001 Agent Registration
- System shall provide agent registration form with required fields.

### FR-AGENT-002 Verification Workflow
- Agent must be verified by admin before posting housing info.

### FR-AGENT-003 Housing CRUD
- Users with the agent role shall access **Post Housing Information** from the public portal sub-header (and may also open the same flow from the profile menu).
- Verified agent shall be able to:
  - Post housing info
  - Edit housing info
  - Delete housing info
  - View own housing info

## 7.5 Driver Module
### FR-DRIVER-001 Driver Registration
- System shall provide driver registration form with required fields.

### FR-DRIVER-002 Verification Workflow
- Driver must be verified by admin before participating in moving jobs.

### FR-DRIVER-003 Moving Request Response
- Driver shall receive notifications for new moving requests.
- Driver shall be able to accept or reject notified moving requests.
- For each moving request, only the first accepted response shall be confirmed.
- If a request is already accepted by another driver, it shall no longer be available for acceptance.

### FR-DRIVER-004 Process ETA Entry
- Driver shall be able to enter estimated time for each moving process stage.

### FR-DRIVER-005 Job Details Visibility
- Driver shall view for assigned job:
  - Pick up address
  - Drop off address
  - Estimated earnings
  - Customer name
  - Customer contact phone
  - Pre-move cargo photos
  - Damage checklist

### FR-DRIVER-006 Delivery Status Update
- Driver shall update delivery status throughout moving lifecycle.

## 7.6 Hire Moving Service Module
### FR-MOVE-001 Moving Request Form
- User shall fill moving information form and submit a moving service request.
- User shall be able to access this form directly from the **Hire Moving Service** link at any later time.

### FR-MOVE-002 Inventory-Based Request
- Form shall include detailed item counts by room/category and vehicle type selection.

### FR-MOVE-003 Driver Notification Broadcast
- When a moving request is submitted, system shall notify all users with driver role.

### FR-MOVE-004 First-Accept Assignment Rule
- When the first driver accepts a moving request, the request status shall change to **Accepted**.
- After status changes to **Accepted**, other drivers shall not be able to accept that request.

### FR-MOVE-005 Admin Fallback Assignment
- If no driver accepts a moving request, admin shall be able to assign the request to a specific verified driver.

## 7.7 Roommate Module
### FR-ROOM-001 Browse Roommates
- Users shall browse roommate profile cards with preferences and details.

### FR-ROOM-002 Post Roommate Requirement
- Logged-in users shall be able to post finding roommate details with required fields.

## 7.8 User Profile Module
### FR-PROFILE-001 Personal Account Management
- User shall be able to:
  - Edit personal information
  - Change password
  - Update profile picture

### FR-PROFILE-002 Saved and History Data
- User shall be able to view:
  - Wishlist houses
  - Booking history
  - Moving history
  - Notifications

### FR-PROFILE-003 Ratings and Reviews
- User shall be able to submit reviews and ratings for agents and drivers.

### FR-PROFILE-004 Logout
- User shall be able to logout securely.

## 7.9 Notifications
### FR-NOTI-001 Notification Types
- System shall notify users for:
  - Confirmed account registration
  - House booking status
  - New moving request notifications to drivers
  - Moving booking completion
  - Driver status updates
  - System notifications

## 7.10 Admin Portal
### FR-ADMIN-001 Agent Verification
- Admin shall verify/reject housing agent registrations.

### FR-ADMIN-002 Driver Verification
- Admin shall verify/reject driver registrations.

### FR-ADMIN-003 User Account Creation
- Admin shall create user accounts.

### FR-ADMIN-004 User Roles Management
- Admin shall assign/manage roles:
  - normal
  - agent
  - driver
  - admin

### FR-ADMIN-005 Master Data Management
- Admin shall manage required master data (examples: property type, cities/states, contract types, amenities set, vehicle types, status codes).

### FR-ADMIN-006 Reports
- Admin shall view reports for operational and business metrics.

---

## 8. Detailed Data Requirements

## 8.1 Login Information
- Email
- Password
- Remember Me

## 8.2 Sign Up Information
- Name
- Email
- Phone Number
- Password
- Confirm Password

## 8.3 Housing Information
- Title (text)
- post_channel (string, required, enum: Agent, Roommate)
- Upload House Images (multiple file upload)
  - House Image 1
  - House Image 2
  - House Image 3
  - House Image 4
  - House Image 5
- Property Type (example: Apartment, Condominium)
- Monthly Fees (amount)
- Deposit Amount
- Contract Type (example: 3 months, 6 months)
- Area Size (text)
- Floor Level (dropdown: Ground Floor, 1st Floor to 20th Floor)
- Bedrooms (number)
- Bathrooms (number)
- House Rules (text)
- Contact Info:
  - Telegram
  - Viber
  - Phone Number
- Location:
  - City
  - State
- Nearby Places (text and/or tagged values):
  - School
  - University
  - Bus Stop
  - Shopping Mall
  - Market
  - Hospital & Clinic
  - Others
- Availability:
  - Available
  - Not Available

### Amenities & Facilities
- AIR CONDITIONER
- PARKING
- FURNISHED
- WATER HEATER
- FAN
- TELEVISION
- REFRIGERATOR
- SOFA
- DESK
- KITCHEN STOVE
- WIFI
- PETS
- SMOKING
- LIFT
- POOL
- FITNESS
- SECURITY GUARD
- KEYCARD
- FINGERPRINT
- CCTV
- LAUNDRY
- EV CHARGER

## 8.4 Moving Request Information
- Pick up address
- Drop off address
- Move in Date
- Upload Pre-move cargo photos
  - Photo 1
  - Photo 2
  - Photo 3
  - Photo 4
  - Photo 5
- Damage checklist (e.g text input)

### Bedroom Items (counts)
- Single bed
- Couple bed
- King bed
- Mattress
- Wardrobe
- Dressing table
- Bedside table
- Chair
- Study table
- Bookshelf

### Living Room Items (counts)
- Sofa (2 seats)
- Sofa (1 seat)
- Coffee table
- TV
- TV Stand
- Shelf
- Fan
- Air conditioner

### Kitchen Items (counts)
- Refrigerator
- Microwave
- Rice cooker
- Washing Machine
- Water Dispenser
- Stove
- Dining table
- Dining chair

### Office & Study Items (counts)
- Desktop Computers
- Laptop
- Printer
- Office chair
- Office Desk

### Other Items (counts)
- Bicycles
- Motorcycle
- Plants
- Boxes

- Remarks (text input)
- Vehicle Type for Moving (from master data)


## 8.5 Driver Registration Information
- Name
- Company Name
- NRC (text, length 15 characters)
- NRC Front Photo
- NRC Back Photo
- Driving License
- Profile Picture
- Phone Number
- Current Address
- Vehicle Type (from master data)
- Vehicle License Plate Number
- Vehicle Photo
- Wheel Tax

## 8.6 Agent Registration Information
- Name
- NRC (text, length 15 characters)
- NRC Front Photo
- NRC Back Photo
- Email
- Phone Number
- Telegram
- Viber
- Address 1
- Address 2
- City (from master data)
- State (from master data)
- Service Region (from master data)
- Experience in renting houses? (Yes/No)

## 8.7 Post for Finding Roommate
- Housing Details (select from existing Housing Information entity)
- Quick summary title
- Budget & cost sharing (e.g text input)
- Gender (Male/Female/Any)
- Occupation (from master data)

### Interests (Yes/No flags)
- LGBTQ+ friendly
- Cannabis friendly
- Smoking friendly
- No smoking
- Cat friendly
- Dog friendly
- Alcohol friendly
- Night out
- Hangout everyday

### Hobbies (Yes/No flags)
- Playing game
- Watching movies
- Singing
- Playing football
- Running
- Cooking
- Reading
- Foodie
- Chill with others
- Relax silent
- Playing gym

## 8.8 Admin Master Data Objects
The following reference data objects are identified as likely admin-managed master data based on the specification. These objects should support CRUD operations from the admin portal and be reusable across houses, moving requests, users, and reports.

### MD-001 Property Type
- Fields:
  - id (UUID/string, unique, required)
  - name (string, required)
  - description (text, optional)
  - isActive (boolean, default true)

### MD-002 City
- Fields:
  - id (UUID/string, unique, required)
  - name (string, required)
  - stateId (reference to State, required)
  - countryCode (string, required)
  - postalCodePrefix (string, optional)
  - isActive (boolean, default true)

### MD-003 State
- Fields:
  - id (UUID/string, unique, required)
  - name (string, required)
  - countryCode (string, required)
  - isActive (boolean, default true)

### MD-004 Contract Type
- Fields:
  - id (UUID/string, unique, required)
  - name (string, required)
  - durationMonths (number, required)
  - description (text, optional)
  - isActive (boolean, default true)

### MD-005 Vehicle Type
- Fields:
  - id (UUID/string, unique, required)
  - name (string, required, e.g. 10 ft, 12 ft, 14 ft, 16 ft)
  - capacityLabel (string, optional)
  - maxLoadKg (number, optional)
  - description (text, optional)
  - isActive (boolean, default true)

### MD-006 Service Region
- Fields:
  - id (UUID/string, unique, required)
  - name (string, required)
  - code (string, unique, required)
  - description (text, optional)
  - isActive (boolean, default true)
- Purpose: Pre-defined service areas that admin can assign to housing agents for coverage and search filtering.

### MD-007 Floor Level
- Fields:
  - id (UUID/string, unique, required)
  - name (string, required, e.g. Ground Floor, 1st Floor, 2nd Floor, Rooftop)
  - levelNumber (number, optional, e.g. 0 for Ground Floor through 20 for 20th Floor)
  - description (text, optional)
  - isActive (boolean, default true)

### MD-008 Occupation
- Fields:
  - id (UUID/string, unique, required)
  - name (string, required)
  - description (text, optional)
  - isActive (boolean, default true)

### MD-009 Amenities & Facilities
- Fields:
  - id (UUID/string, unique, required)
  - name (string, required, e.g. AIR CONDITIONER, PARKING, FURNISHED, WIFI)
  - category (string, optional, e.g. General, Building, Utility)
  - description (text, optional)
  - isActive (boolean, default true)

### MD-010 Role
- Fields:
  - id (UUID/string, unique, required)
  - name (string, required, e.g. normal, agent, driver, admin)
  - code (string, unique, required)
  - description (text, optional)
  - isActive (boolean, default true)

### MD-011 Status Code
- Fields:
  - id (UUID/string, unique, required)
  - entityType (string, required, e.g. House, MovingRequest, Booking, Driver)
  - code (string, required)
  - label (string, required)
  - color (string, optional)
  - isActive (boolean, default true)

---

## 9. Business Rules
1. Visitors can search and view houses without registration.
2. Booking a house requires authenticated user account.
3. Posting housing listings requires agent role and admin verification status = Verified.
4. Participating in moving jobs requires driver role and admin verification status = Verified.
5. Only admin can access admin portal modules.
6. Role assignment is controlled by admin.
7. After house booking, user is prompted to hire moving service.
8. If user declines moving service at booking time, user can still submit a moving request later from the **Hire Moving Service** link.
9. Roommate post requires authenticated user.
10. Wishlist requires authenticated user.
11. On moving request submission, system sends notification to all verified drivers.
12. The first driver who accepts a moving request is assigned to that request and status changes to **Accepted**.
13. Once a moving request is **Accepted**, other drivers cannot accept the same request.
14. If no driver accepts a request, admin can manually assign it to a specific verified driver.

---

## 10. Workflow Requirements

## 10.1 Agent Verification Flow
1. Agent submits registration.
2. Admin reviews details/documents.
3. Admin approves or rejects.
4. If approved, agent can post housing listings.

## 10.2 Driver Verification Flow
1. Driver submits registration with vehicle/legal documents.
2. Admin reviews and verifies.
3. Verified driver becomes eligible for assigned moving jobs.

## 10.3 House Booking with Moving Prompt
1. User selects house and books.
2. Booking confirmation shown.
3. System asks: Hire moving service?
4. If Yes, moving form opens and user submits request.
5. If No, user can still open **Hire Moving Service** later from navigation and submit a request.

## 10.4 Moving Job Lifecycle
1. User submits moving request.
2. System notifies all verified drivers.
3. Drivers review request and accept/reject.
4. First accepting driver is assigned automatically and request status changes to **Accepted**.
5. Other drivers can no longer accept that request.
6. If no driver accepts, admin assigns request to a specific verified driver.
7. Assigned driver enters stage ETAs.
8. Assigned driver updates delivery status.
9. Completion notification is sent to user.

## 10.5 Moving Request Status Definitions
1. **Pending**
- Initial status after user submits moving request.
- Request is open and visible to all verified drivers.

2. **Accepted**
- Set automatically when the first verified driver accepts the request.
- Request is locked from acceptance by other drivers.

3. **Assigned**
- Set when admin manually assigns a request to a specific verified driver because no driver accepted.

4. **In Progress**
- Set when assigned driver starts the moving operation.

5. **Completed**
- Set when moving and delivery are finished successfully.

6. **Cancelled**
- Set when request is cancelled by admin or requester before completion.

---

## 11. Reporting Requirements (Admin)
Minimum reports should include:
1. User registrations by role and period
2. Agent verification status summary
3. Driver verification status summary
4. Housing listings counts by city/type/availability
5. House booking trends and status summary
6. Moving service request and completion summary
7. Top-performing agents/drivers by ratings

---

## 12. Non-Functional Requirements

## 12.1 Usability
- Responsive web design for desktop, tablet, and mobile.
- Simple navigation with clear primary and secondary menus.

## 12.2 Performance
- Search and filter actions should return results within acceptable response time under normal load.
- Listing pages should support pagination or lazy loading.

## 12.3 Security
- Secure authentication and session handling.
- Passwords must be stored securely (hashed).
- Role-based authorization must be enforced server-side.
- Sensitive document uploads (NRC/license) must be protected with proper access control.

## 12.4 Availability and Reliability
- System should maintain stable uptime as per deployment target.
- Error handling should provide user-friendly messages.

## 12.5 Auditability
- Admin actions (verification, role changes, status updates) should be logged.

## 12.6 Maintainability
- Modular architecture for housing, moving, roommate, and admin domains.

---

## 13. Validation and Data Quality Rules
1. Email format validation for all email fields.
2. Phone number format validation for contact fields.
3. Password and confirm password must match at sign-up.
4. Numeric fields (fees, deposit, item counts) must be numeric and non-negative.
5. NRC should enforce 15-character rule.
6. Required media upload fields should validate file type and size.
7. Min budget must be less than or equal to max budget.

---

## 14. Assumptions and Dependencies
1. Admin team is available to review and verify agent/driver registrations.
2. Legal and policy requirements for personal document storage are defined by business.
3. Master data values are configurable via admin portal.
4. Notification delivery channel for web is in-app notification (email/SMS can be future extension).

---

## 15. Acceptance Criteria Summary
The first release is accepted when:
1. Public portal navigation and core pages work as specified.
2. Visitors can search/view houses without login.
3. Authenticated users can book houses and submit moving requests.
4. Verified agents can manage housing listings.
5. Verified drivers can process assigned moving jobs and update statuses.
6. Roommate browse/post workflows are functional.
7. Profile, wishlist, notifications, and histories are functional.
8. Admin can verify users, manage roles/master data, and view reports.
9. Required data fields and validation rules are implemented according to this specification.

---

## 16. Items to Confirm (Optional Next Revision)
1. Final list of admin master data objects and each field definition.
2. Exact report layouts and export formats (PDF/Excel/CSV).
3. Whether payment collection is in-scope for first release.
4. Whether agent-driver direct communication is required.
5. Final status values for booking and moving lifecycle states.

---

## 17. Backend Implementation Notes (2026-08-12)

The `backend-api/` project implements the server-side scope of this specification as a standalone Express + Prisma application.

### Implemented backend surfaces
- Versioned API under `/api/v1`
- Public home feed: featured listings, popular houses, verified agents, partner drivers, service reviews
- Public master-data reads for dropdown/filter values (active records only)
- Prisma seed includes §8.3 / MD-009 amenities (`AIR CONDITIONER` … `EV CHARGER`) with General/Building/Utility categories, MD-007 floor levels (Ground Floor / `0` through 20th Floor / `20`), plus roles, status codes, Yangon locations, property types, vehicle types, and admin user
- Self-service agent and driver registration via `/registrations/*` (assigns role, creates profile, sets verification to pending)
- Booking lifecycle with confirm/cancel status updates
- Moving requests include `estimatedEarnings` for driver job visibility (FR-DRIVER-005)
- Admin reports support optional `from` and `to` query parameters for period filtering
- MD-010 Role master data managed at `/admin/master-data/roles`

### Intentional implementation choices
- Document and image fields are stored as server-side path strings after binary upload to local disk (`POST /api/v1/uploads`); see `FileUploadSpecification.md`. Cloud object storage remains future scope.
- Email/SMS notification channels remain future scope; in-app notifications are implemented (FR-NOTI-001 partial).
- Home-page news content returns a static starter item until CMS/content module is added.

### Backend project location
- Repository path: `backend-api/`
- Requirement traceability and API catalog: `backend-api/README.md`

---

## 18. Frontend Implementation Notes (2026-08-12)

The `frontend-app/` project is an independent Vite + React + TypeScript application that consumes `backend-api` over `/api/v1`.

### Scaffold baseline (frontend-api-starter)
- Public portal shell with header + sub-nav routes: Home, About Us, Agent Register, Sign Up, Sign In, Finding House, Hire Moving Service, Finding Roommates
- Admin portal shell with JWT register/login and `/auth/verify` guarded routes under `/admin`
- Providers: Theme → I18n → React Query → Auth → Router
- English/Myanmar locale files and light/dark/system theme toggle
- JWT access/refresh tokens stored in localStorage (Remember Me) or sessionStorage; 401 interceptor clears session
- Auth user model uses `roles: string[]` to match backend `toSafeUser`

### API contract assumptions
- Base URL: `http://localhost:4000/api/v1` (`VITE_API_BASE_URL`)
- CORS origin expected: `http://localhost:5173`
- Auth endpoints: `/auth/register`, `/auth/login`, `/auth/verify`, `/auth/me`, `/auth/refresh`, `/auth/logout`
- Response envelope: `{ success, message, data }` via shared `apiRequest`

### Frontend project location
- Repository path: `frontend-app/`
- Architecture and scripts: `frontend-app/README.md`

### Increment A implemented (public auth, home, finding house, agent register)
- **FR-AUTH-001..003 / FR-PROFILE-004**: Public header switches to profile menu + notifications after login; Sign Up/Sign In hidden; logout wired; Remember Me kept; admin destinations require `admin` role, normal users remain on the public portal.
- **FR-HOME-001..005**: Home consumes `GET /home` (featured, popular, news, verified agents, partner movers, reviews). Global search navigates to `/finding-house?city=…`. House cards support wishlist hearts; guests are prompted to sign in. Wishlist uses `GET /wishlist`, `POST/DELETE /wishlist/:houseId` (list is not path-scoped on the backend).
- **FR-HOUSE-001..005**: `/finding-house` filters (city, type, min/max budget) via `GET /houses` and `GET /master-data/:entity`. Details at `/houses/:id` via `GET /houses/:id`. Booking via `POST /houses/:id/bookings` (guests redirected to sign-in). After success, moving upsell dialog: Yes → `/hire-moving?bookingId&houseId`; No stays on details.
- **FR-AGENT-001**: Agent Register form matches §8.6 fields and posts to `POST /registrations/agent` (auth required; unauthenticated users redirected to sign-in). NRC photo fields accept path/file-name placeholders (no binary upload in this increment).

### Increment B implemented (moving, driver, roommates, profile, driver jobs)
- **FR-MOVE-001..002 / FR-HOUSE-005**: `/hire-moving` is a full auth-gated moving request form (§8.4 inventory categories, vehicle types from `GET /master-data/vehicle-types`, photo path strings). Submits `POST /moving/requests`; success links to `/hire-moving/:id` via `GET /moving/requests/:id`. Booking upsell query context (`bookingId`/`houseId`) is displayed when present (not part of the create body).
- **FR-DRIVER-001**: `/driver-register` posts §8.5 fields to `POST /registrations/driver` (auth required; document/image path placeholders). Linked from the profile menu.
- **FR-ROOM-001..002**: `/finding-roommates` browses `GET /roommates` with gender/occupation/city/state filters. Authenticated users can post via `POST /roommates` using occupations from master data and houses from `GET /houses` as the housing select source.
- **FR-PROFILE-001..003 / FR-NOTI-001 UI**: `/profile` supports `GET/PATCH /profile` and `PATCH /profile/change-password`; reviews via `POST /reviews` (target user id + AGENT/DRIVER). `/profile/wishlist` uses `GET /wishlist`. `/profile/history` uses `GET /profile/history`. Header notifications continue to mark read with `PATCH /notifications/:id/read`.
- **FR-DRIVER-003..006**: Driver-role users get `/driver/jobs` against `GET /driver/requests/available`, accept/reject, and job detail actions for ETA (`POST .../eta`) and status (`POST .../status` with `in_progress|completed|cancelled`). Job detail also uses `GET /moving/requests/:id` for full FR-DRIVER-005 fields.

### Increment C implemented (admin portal)
- **FR-ADMIN-001..002**: `/admin/verifications` provides agent and driver verification forms (`PATCH /admin/agents/:userId/verification`, `PATCH /admin/drivers/:userId/verification`) with status actions `pending|approve|reject`. Pending/verified/rejected counts are surfaced from `GET /admin/reports/overview`.
- **FR-ADMIN-003..004**: `/admin/users` supports create-user (`POST /admin/users`) and role assignment (`PATCH /admin/users/:id/roles`) for `normal|agent|driver|admin`.
- **FR-MOVE-005 / admin assign**: `/admin/moving-assign` posts `POST /admin/moving/requests/:id/assign` with `driverUserId`.
- **FR-ADMIN-005 / MD-001..011**: `/admin/master-data` indexes all entities; `/admin/master-data/:entity` provides list/create/edit and DELETE soft-deactivate against `/admin/master-data/*`.
- **FR-ADMIN-006**: `/admin/dashboard` summary cards and `/admin/reports` period filters (`from`/`to`) consume `GET /admin/reports/overview` (registrations, verification, housing, bookings, moving, top performers).
- Admin layout nav: Dashboard, Verifications, Users, Moving Assign, Master Data, Reports. `AdminAuthGuard` continues to require `admin` role.

### Increment D implemented (agent housing CRUD + polish)
- **FR-AGENT-002..003**: Agent-role public sub-header link **Post Housing Information** and UserMenu link to `/agent/houses`. List own houses via `GET /agent/houses`. Create/edit forms cover §8.3 fields aligned with `agentHouseCreateValidator` (`POST/PATCH /agent/houses`, `DELETE /agent/houses/:id`). Master-data dropdowns: property-types, cities, states, contract-types, floor-levels, amenities. Image fields initially used path strings (binary upload added in Increment E). Unverified agents see a clear banner; create/edit/delete stay disabled while backend enforces `AGENT_NOT_VERIFIED`.
- About Us page copy polished; UserMenu also links Agent Register for discoverability.

### Increment E implemented (local-disk file upload)
- Shared upload API: `POST /api/v1/uploads?category=houses|moving|docs|profile` stores files under `backend-api/uploads/` (no cloud).
- Public static serving for `houses` / `moving` / `profile`; docs blocked from static and served via `GET /api/v1/files/docs/:filename` (owner/admin).
- Domain validators require `uploads/{category}/...` path format.
- Frontend file pickers wired for: agent house images, hire-moving cargo photos, profile picture, agent NRC docs, driver registration docs/vehicle/profile photos.
- Display: house cards/details, moving request detail, driver job cargo photos, profile/roommate avatars resolve public upload URLs.
- Admin verifications: `GET /admin/agents/:userId` and `GET /admin/drivers/:userId` load registration docs; protected docs preview via gated file API.
- Spec: `FileUploadSpecification.md` / `.html`.

### Intentional choices / deferred
- Moving create body does not send `bookingId`/`houseId` because the backend create contract does not accept them; deep-link context is UI-only.
- Roommate housing select uses public `GET /houses` list (practical substitute until a dedicated “my houses / bookable houses” endpoint exists).
- Driver assigned-job listing is not exposed by the backend; workspace focuses on available PENDING requests plus detail-by-id after accept. Gap: no `GET /driver/requests/assigned` (or equivalent) for post-accept job inbox.
- **Intentional backend limitation (Increment C):** There is no admin list/queue endpoint for pending agents, pending drivers, users, or unassigned moving requests. Admin UX uses userId/requestId entry forms and reports overview counts instead of selectable queues. A future backend increment can add list endpoints without changing the action APIs already wired.
- **Intentional gaps retained after Increment E:** no admin selectable list queues; no report export (PDF/Excel/CSV); email/SMS notification channels remain future scope; cloud object storage remains future scope.
- No mock feature flags; UI adapts to real backend contracts.

### Implementation status
- Starter blueprint complete (shells, auth wiring, i18n, theme, baseline Vitest suite)
- Increment A business features wired against live `backend-api` endpoints with Vitest coverage for home render, house filters, and authenticated header/logout
- Increment B public-portal modules wired with Vitest coverage for moving form validation, roommate browse (mocked), and profile page render; `npm test` + `npm run build` expected green
- Increment C admin portal wired with Vitest coverage for admin guard, reports render (mocked fetch), and master-data list (mocked fetch); `npm test` + `npm run build` expected green
- Increment D agent housing CRUD wired with Vitest coverage for houses list render (mocked) and form validation; `npm test` + `npm run build` expected green
- Increment E local upload foundation + house/moving/profile/registration upload UI + public image display; upload integration tests + Vitest coverage; `npm test` expected green
