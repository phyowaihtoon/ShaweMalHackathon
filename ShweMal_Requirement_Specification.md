# ShweMal Web Application Requirement Specification

## 1. Document Information
- **Project Name**: ShweMal
- **Document Type**: Software Requirement Specification (SRS)
- **Platform**: Web Application
- **Version**: 1.5
- **Date**: 2026-08-17
- **Prepared For**: Product, Design, Development, QA, and Operations Teams
- **Revision 1.1**: House booking workflow rewritten (confirmation page, confirmed-on-submit, duplicate prevention, agent booking list/cancel, cancellation actor tracking, dedicated admin house booking report). Application implementation of this workflow is pending a separate build confirmation.
- **Revision 1.2**: Moving request lifecycle statuses finalized (Booked plus operational delivery steps). Moving Status screen specified for tracking one or more bookings (FR-MOVE-007).
- **Revision 1.3**: Ratings moved out of Profile. Users rate agents after a confirmed booking and drivers after a completed move using 1–5 stars; one rating per job with upsert.
- **Revision 1.4**: Dedicated admin Moving service request report (FR-ADMIN-008) with date/status filters and a full request details view.
- **Revision 1.5**: Admin **Moving Assign** renamed to **Jobs Assign** (FR-MOVE-005). Admin assigns booked unassigned jobs and jobs cancelled by the assigned driver, searching by order number and choosing a verified driver (name, phone, vehicle, plate) without internal IDs. Reassignment sets status to **Assigned**.

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
- Can view the booking list for own posted houses, including details of the user who booked.
- Can cancel bookings on own posted houses.
- Can update house availability manually when a house is actually rented (booking does not change availability automatically).

4. **Driver**
- Registered user with driver registration.
- Must be admin-verified to accept assigned moving jobs.
- Can update delivery statuses and process ETAs.

5. **Admin**
- Uses admin portal only.
- Verifies agents and drivers.
- Creates users, assigns roles, manages master data, and views reports (including dedicated house booking and moving service request reports).

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
- Moving Status
- Finding Roommates
- Post Housing Information (visible only to users with the agent role; opens agent housing manage/post flow)
- Driver Jobs (visible only to users with the driver role; available jobs to accept/reject, plus assigned in-progress jobs to update until completed)

## 5.2 Admin Portal
- Accessible only by admin role.
- Contains all administrative modules, including **Jobs Assign**.
- **Jobs Assign** lets admin assign a verified driver to booked unassigned moving jobs and to jobs cancelled by the assigned driver (FR-MOVE-005).

---

## 6. In Scope and Out of Scope

### In Scope
- House listing discovery, details, and booking flow
- Agent registration and verification
- Driver registration and verification
- Moving service request and driver job workflow
- Roommate browsing and posting
- User profile, wishlist, notifications, and history
- Ratings and reviews for listing agents (after a confirmed house booking) and assigned drivers (after a completed moving request)
- Admin management and reporting

### Out of Scope (Initial Release)
- Native mobile applications
- Online payment gateway integration (if needed, handled in later phase)
- Real-time chat system between users/agents/drivers (future enhancement)
- Communication between the listing agent and the booking user after a house booking (phone, chat, or other contact is outside system control)
- Automatic change of house availability when a booking is created or cancelled; if the house is actually rented, the agent shall change availability manually in the system

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
  - Location (optional street address, optional latitude/longitude, and a map on the details page)
  - Pricing
  - Agent details
- After the signed-in user has a **Confirmed** booking for that house, the details page shall let the user rate the listing agent with a 1 to 5 star control (FR-PROFILE-003). Guests, users with no booking, and cancelled bookings shall not see this prompt.

### FR-HOUSE-004 Booking
- Logged-in users shall be able to book a house.
- Visitors attempting to book shall be redirected to sign up/sign in first.

### FR-HOUSE-005 Booking Confirmation Page
- After a successful house booking, the system shall navigate to a dedicated **booking confirmation page** (not a popup or dialog).
- The confirmation page shall display a thank-you statement that includes that the **agent will contact the user soon**.
- The same confirmation page shall offer **Hire a moving service**.
- If the user accepts, the system shall redirect to the **Hire Moving Service** page (preserving booking and house context).
- If the user declines, the user shall remain on the confirmation page and shall still be able to hire moving service later from the **Hire Moving Service** navigation link.

### FR-HOUSE-006 Booking Status on Submit
- Once a booking is submitted successfully, booking status shall be **Confirmed**.
- Status **Pending** is retained in the data model and admin report filters for historical or legacy records; it is not used on the new booking happy path.

### FR-HOUSE-007 Duplicate Booking Rule
- The same user shall not be able to book the same house twice while an existing booking for that user and house is not yet **Cancelled**.
- After a booking is cancelled, the same user may book that house again.

### FR-HOUSE-008 User Cancel Booking
- The booking user shall be able to cancel a non-cancelled booking via **Profile → History → Booking history → house details → Cancel Booking**.
- Only bookings that are not already **Cancelled** can be cancelled.

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
  - Change house availability (Available / Not Available) manually, including when a booked house is actually rented

### FR-AGENT-004 House Bookings
- The listing agent shall receive an in-app notification whenever a user books one of the agent’s posted houses.
- The agent shall be able to view a booking list for own posted houses.
- The booking list and booking details shall include the details of the user who booked (name, email, and phone as stored on the user account).
- The agent shall be able to cancel a booking on own posted houses from that list or detail view.

## 7.5 Driver Module
### FR-DRIVER-001 Driver Registration
- System shall provide driver registration form with required fields.

### FR-DRIVER-002 Verification Workflow
- Driver must be verified by admin before participating in moving jobs.

### FR-DRIVER-003 Moving Request Response
- Users with the driver role shall access **Driver Jobs** from the public portal sub-header.
- Driver Jobs shall show **Available jobs** (new requests to accept or reject) separately from **My jobs** (assigned in-progress work).
- Driver shall receive notifications for new moving requests.
- Driver shall be able to accept or reject notified moving requests.
- For each moving request, only the first accepted response shall be confirmed.
- If a request is already accepted by another driver, it shall no longer be available for acceptance.

### FR-DRIVER-004 Process ETA Entry
- Driver shall be able to enter estimated time for each moving process stage.
- ETA time shall not be earlier than the job move-in date.

### FR-DRIVER-005 Job Details Visibility
- Driver shall see assigned in-progress jobs in Driver Jobs **My jobs**. Completed, cancelled, and rejected jobs shall not appear in that list.
- Driver shall view for assigned job:
  - Pick up address
  - Drop off address
  - Estimated earnings
  - Customer name
  - Customer contact phone
  - Pre-move cargo photos
  - Damage checklist

### FR-DRIVER-006 Delivery Status Update
- Driver Jobs **Update status** shall show delivery status update and job details in side-by-side panels (status update first on the left).
- Delivery status update and Process ETA shall be separate sections; delivery status update comes first.
- Driver shall advance delivery status one step at a time via the next operational step action (Driver Coming → Driver Arrived → Loading → On the Way → Unloading → Completed).
- After a successful status update, the confirmation message shall include the updated status label (for example Driver Coming, On the Way).
- Driver may cancel an assigned in-progress job from **My jobs** without opening **Update status**; cancellation requires a mandatory reason note.
- Driver may cancel a request that is not yet Completed or Cancelled.

## 7.6 Hire Moving Service Module
### FR-MOVE-001 Moving Request Form
- User shall complete a four-stage Hire Moving wizard and confirm a moving service request.
- User shall be able to access this wizard directly from the **Hire Moving Service** link at any later time.
- Stage 1 collects Yangon township, optional street/landmark, and map pins for pickup and drop-off.
- Stage 2 collects remaining request details except vehicle type (move-in date, floors, photos, damage checklist, remarks, inventory counts). Total inventory items must be greater than zero.
- Stage 3 shows a suggested vehicle type and estimated price; the user may change vehicle type and then confirm booking.
- Stage 4 shows booking confirmation with order number and the booker's name and contact details.

### FR-MOVE-002 Inventory-Based Request
- Form shall include detailed item counts by room/category from moving inventory master data.
- Vehicle type shall be suggested from total inventory points (`count * points per item`) using Vehicle Type Point From / Point To ranges.

### FR-MOVE-006 Estimated Price Quote
- System shall calculate estimated price as pickup floor surcharge + drop-off floor surcharge + (PricePerKM × distance in kilometers).
- Distance shall be calculated from pickup and drop-off map coordinates when provided; otherwise from geocoded addresses biased to Yangon, Myanmar.
- Floor surcharges come from Floor Level master data. PricePerKM comes from the selected vehicle type.
- The confirmed request shall store a unique order number for user, driver, and admin tracking.

### FR-MOVE-003 Driver Notification Broadcast
- When a moving request is submitted, system shall notify all users with driver role.

### FR-MOVE-004 First-Accept Assignment Rule
- When the first driver accepts a moving request, the request status shall change to **Accepted**.
- After status changes to **Accepted**, other drivers shall not be able to accept that request.

### FR-MOVE-005 Admin Fallback Assignment
- Admin shall assign a moving request to a specific verified driver from **Jobs Assign**, without entering internal request or user IDs.
- Jobs Assign shall list:
  - booked jobs with no assigned driver, and
  - jobs **cancelled by the assigned driver**.
- Admin shall be able to search that queue by **order number**, preview the job, and choose a verified driver from a list (name, phone, vehicle, plate).
- After assignment or reassignment, status shall change to **Assigned**.

### FR-MOVE-007 Moving Status
- Authenticated users shall open **Moving Status** to track their moving requests.
- A user may have more than one moving request at the same time; the screen shall list all of the user’s requests and show full status for the selected request.
- Active requests (Booked through Unloading) shall be listed above past requests (Completed and Cancelled).
- For the selected request the user shall see current step, eight-step move progress, booking details (vehicle, inventory points, estimated price, assigned driver name/phone/license plate when assigned), and a link to request details.
- Contact Driver shall open the assigned driver’s phone number. In-app chat is out of scope.
- When the selected request is **Completed** and a driver is assigned, Moving Status shall let the user rate that driver with a 1 to 5 star control (FR-PROFILE-003).

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
- From booking history, the user shall open house details for a booking.
- For a non-cancelled booking, house details shall provide **Cancel Booking**.
- History shall offer **Rate** (or **Update rating**) for a confirmed house booking and for a completed moving request that has an assigned driver (FR-PROFILE-003).

### FR-PROFILE-004 Logout
- User shall be able to logout securely.

## 7.9 Ratings and Reviews
### FR-PROFILE-003 Ratings and Reviews
- User shall be able to submit reviews and ratings for agents and drivers.
- Ratings shall use a 1 to 5 star control (not a dropdown).
- The user shall rate the listing agent after a confirmed house booking (house details, with History as a fallback).
- The user shall rate the assigned driver after a moving request is completed (Moving Status, with History as a fallback).
- One rating is stored per confirmed booking and per completed moving request. Submitting again updates that rating.
- Profile is for personal account data only; ratings are not collected on the profile page.

## 7.10 Notifications
### FR-NOTI-001 Notification Types
- System shall notify users for:
  - Confirmed account registration
  - House booking confirmation to the booking user
  - New house booking on an agent’s posted house (to the listing agent)
  - House booking cancellation to the booking user (and to the listing agent when cancelled by the booking user)
  - New moving request notifications to drivers
  - Moving booking completion
  - Driver status updates
  - System notifications

## 7.11 Admin Portal
### FR-ADMIN-001 Agent Verification
- Admin shall verify/reject housing agent registrations.
- Admin shall browse an agent verification queue (default: pending), review registration details and documents, then approve or reject. A rejection reason is optional.
- Agent verification status is stored on the agent profile and is independent of driver verification on the same account.
- Admins shall not need to know the user’s internal primary key to complete this workflow.

### FR-ADMIN-002 Driver Verification
- Admin shall verify/reject driver registrations.
- Admin shall browse a driver verification queue (default: pending), review registration details and documents, then approve or reject. A rejection reason is optional.
- Driver verification status is stored on the driver profile and is independent of agent verification on the same account.
- Admins shall not need to know the user’s internal primary key to complete this workflow.

### FR-ADMIN-003 User Account Creation
- Admin shall create user accounts.

### FR-ADMIN-004 User Roles Management
- Admin shall assign/manage roles:
  - normal
  - agent
  - driver
  - admin

### FR-ADMIN-005 Master Data Management
- Admin shall manage required master data (examples: property type, cities/states, contract types, amenities set, vehicle types, floor levels, moving inventory items, status codes).

### FR-ADMIN-006 Reports
- Admin shall view reports for operational and business metrics.

### FR-ADMIN-007 House Booking Report
- Admin shall have a **House booking report**, separate from the overview dashboard, that lists all booking records with statuses **Pending**, **Confirmed**, and **Cancelled**.
- Admin shall be able to filter the report by at least:
  - Booking date (from / to)
  - Booking status
- Additional filter criteria (house, listing agent, booking user) are should-have.
- Each record shall include: booking id, booking date, status, house, listing agent, booker identity, and cancelled-by (booking user or agent) when the booking is cancelled.

### FR-ADMIN-008 Moving Service Request Report
- Admin shall have a **Moving service request report**, separate from the overview dashboard, that lists all moving service requests.
- Admin shall be able to filter the report by at least:
  - Request created date (from / to)
  - Request status (Booked, Accepted, Assigned, Driver Coming, Driver Arrived, Loading, On the Way, Unloading, Completed, Cancelled)
- Each record shall include: order number, request date, status, pickup and drop-off, move-in date, requester identity, assigned driver when present, and estimated price.
- Admin shall be able to open **View details** from the list to see the full moving service request information (addresses, floors, quote, inventory, photos, remarks, damage checklist, requester, assigned driver, status history, and ETA entries).

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
  - Street address (optional)
  - Coordinates (optional latitude and longitude; when omitted the details map may show an approximate township or street search)
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
- Availability is maintained by the listing agent. Booking create or cancel shall not automatically change availability.

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
### Stage 1 — Addresses
- Pick up address
- Drop off address

### Stage 2 — Move details
- Pick up address and drop off address (read-only from stage 1)
- Pickup floor level (from master data)
- Drop-off floor level (from master data)
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

### Stage 3 — Estimated price
- Suggested Vehicle Type for Moving (from master data using inventory points)
- Estimated price (MMK)
- Confirm Booking

### Stage 4 — Booking confirmation
- Order number
- Booker name, phone, and email
- Notice that the driver may contact the user using those details

- Vehicle Type for Moving is selected on stage 3 (not on stage 2)


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

## 8.8 House Booking Record
- id (UUID/string, unique, required)
- userId (reference to booking user, required)
- houseId (reference to House, required)
- status (required, enum: PENDING, CONFIRMED, CANCELLED)
  - New successful bookings shall be created as CONFIRMED
  - PENDING is retained for historical or legacy records and admin filtering
- createdAt (datetime, required)
- updatedAt (datetime, required)
- cancelledAt (datetime, optional; set when status becomes CANCELLED)
- cancelledByUserId (reference to User, optional; the user who performed the cancellation)
- cancelledByRole (optional, enum: USER, AGENT, ADMIN)
  - USER = booking user
  - AGENT = listing agent
  - ADMIN = operational cancel if used; primary UI paths are USER and AGENT
- The same user shall have at most one non-cancelled booking per house.
- A confirmed booking shall have at most one agent rating (see §8.10).

## 8.9 Admin Master Data Objects
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
  - pointFrom (number, optional, inclusive inventory-point range start)
  - pointTo (number, optional, inclusive inventory-point range end)
  - pricePerKm (number, optional, MMK per kilometer)
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
  - surchargeAmount (number, required for moving quotes, MMK; Ground Floor = 0, 1st Floor = 5000, 2nd Floor = 10000, …)
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

### MD-012 Moving Inventory Item
- Fields:
  - id (UUID/string, unique, required)
  - code (string, unique, required)
  - category (string, required, e.g. bedroom, living, kitchen, office, other)
  - itemName (string, required)
  - points (number, required)
  - sortOrder (number, optional)
  - isActive (boolean, default true)
- Purpose: Catalog of hire-moving inventory items with points used to suggest a vehicle type (`count * points`).

## 8.10 Rating Review Record
- id (UUID/string, unique, required)
- reviewerUserId (reference to the signed-in user who submits the rating, required)
- targetType (required, enum: AGENT, DRIVER)
- targetUserId (reference to the rated agent or driver user, required; derived by the server)
- rating (integer, required, 1 to 5)
- comment (string, optional, max 1000 characters)
- bookingId (optional, unique; required when rating an agent; must be the reviewer’s **Confirmed** house booking)
- movingRequestId (optional, unique; required when rating a driver; must be the reviewer’s **Completed** moving request with an assigned driver)
- Exactly one of bookingId or movingRequestId shall be set.
- The server shall set targetType and targetUserId from the booking’s listing agent or the moving request’s assigned driver. Clients shall not paste a target user id.
- One rating per confirmed booking and per completed moving request. Submitting again updates that record.

---

## 9. Business Rules
1. Visitors can search and view houses without registration.
2. Booking a house requires authenticated user account.
3. Posting housing listings requires agent role and agent profile verification status = Verified.
4. Participating in moving jobs requires driver role and driver profile verification status = Verified.
5. Only admin can access admin portal modules.
6. Role assignment is controlled by admin.
7. After a successful house booking, the user is shown a dedicated confirmation page (not a popup) with a thank-you statement that includes that the agent will contact the user soon, and is offered hire moving service from that page.
8. If the user declines moving service at booking time, the user can still submit a moving request later from the **Hire Moving Service** link.
9. Successful house booking submit sets booking status to **Confirmed**.
10. The same user cannot book the same house again while a non-cancelled booking for that pair exists.
11. The listing agent is notified in-app when a booking is created for one of the agent’s posted houses.
12. The listing agent can list bookings for own houses, view booker details, and cancel those bookings.
13. The booking user can cancel via Profile → History → Booking history → house details → Cancel Booking.
14. Cancellation shall record who cancelled (booking user or listing agent).
15. Agent and booking-user communication after booking is outside system control.
16. House availability is not changed automatically by booking; if the house is actually rented, the agent changes availability manually.
17. Roommate post requires authenticated user.
18. Wishlist requires authenticated user.
19. On moving request submission, system sends notification to all verified drivers. The request status is **Booked**.
20. The first driver who accepts a moving request is assigned to that request and status changes to **Accepted**.
21. Once a moving request is **Accepted**, other drivers cannot accept the same request.
22. If no driver accepts a request, admin can assign it from **Jobs Assign** to a specific verified driver (by order number search or from the assignable jobs list) and status changes to **Assigned**.
23. If the assigned driver cancels, admin can reassign that cancelled job from Jobs Assign.
24. Hire Moving Service uses a four-stage wizard. The moving request is persisted only when the user confirms booking.
25. Estimated moving price = pickup floor surcharge + drop-off floor surcharge + (selected vehicle PricePerKM × distance in kilometers). Floor surcharges and PricePerKM come from master data. Distance is calculated from geocoded pickup and drop-off addresses.
26. Each confirmed moving request receives a unique order number for tracking by the user, driver, and admin.
27. A user may confirm more than one moving request. Moving Status lists all of that user’s requests and tracks the selected request through the §10.5 statuses.
28. Ratings use a 1 to 5 star control. The booking user may rate the listing agent after a **Confirmed** house booking, and the requester may rate the assigned driver after a **Completed** moving request. One rating per booking or moving request; submitting again updates it. Ratings are not collected on the Profile page.

---

## 10. Workflow Requirements

## 10.1 Agent Verification Flow
1. Agent submits registration (agent profile verification status = Pending).
2. Admin opens the **Agent verification** queue (default filter: Pending) and selects a registration. The admin does not enter a user id.
3. Admin reviews details and documents.
4. Admin approves or rejects (optional rejection reason). The applicant receives an in-app notification.
5. If approved, agent can post housing listings.

## 10.2 Driver Verification Flow
1. Driver submits registration with vehicle/legal documents (driver profile verification status = Pending).
2. Admin opens the **Driver verification** queue (default filter: Pending) and selects a registration. The admin does not enter a user id.
3. Admin reviews details and documents, then approves or rejects (optional rejection reason). The applicant receives an in-app notification.
4. Verified driver becomes eligible for assigned moving jobs.

## 10.3 House Booking Workflow
1. User selects a house and books (authenticated; visitors are redirected to sign in).
2. System creates the booking with status **Confirmed**.
3. System notifies the listing agent that a booking occurred on the posted house.
4. System navigates the booking user to a dedicated **booking confirmation page** (not a popup).
5. The confirmation page shows a thank-you statement that includes that the agent will contact the user soon, and offers **Hire a moving service**.
6. If the user accepts, the system redirects to the **Hire Moving Service** page.
7. If the user declines, the user remains on the confirmation page and can still open **Hire Moving Service** later from navigation.
8. The listing agent can view the booking list for own posted houses and the details of the user who booked.
9. The listing agent can cancel the booking.
10. The booking user can cancel via Profile → History → Booking history → house details → Cancel Booking.
11. The system records whether cancellation was performed by the listing agent or the booking user.
12. Further communication between agent and booking user is outside the system.
13. If the house is actually rented, the agent changes that house’s availability manually in the system.
14. After the booking is **Confirmed**, the booking user may rate the listing agent with 1 to 5 stars on house details (History is a fallback). The confirmation page does not collect the rating.

### 10.3.1 House Booking Status Definitions
1. **Confirmed**
- Set immediately when a booking is submitted successfully.
2. **Cancelled**
- Set when the listing agent or the booking user cancels the booking.
- `cancelledByRole` records AGENT or USER (or ADMIN if an operational cancel is used).
3. **Pending**
- Retained for historical or legacy records and admin report filtering.
- Not used when creating a booking on the current workflow.

## 10.4 Moving Job Lifecycle
1. User opens Hire Moving Service and completes the four-stage wizard (addresses → details/inventory → estimated price → confirmation).
2. System quotes estimated price and suggested vehicle type, then persists the request with an order number when the user confirms booking. Status is **Booked**.
3. System notifies all verified drivers.
4. Drivers review request and accept/reject.
5. First accepting driver is assigned automatically and request status changes to **Accepted**.
6. Other drivers can no longer accept that request.
7. If no driver accepts, admin assigns the request from **Jobs Assign** to a specific verified driver (search by order number or pick from the unassigned/driver-cancelled queue) and status changes to **Assigned**.
8. If an assigned driver cancels, the job remains available for admin reassignment from Jobs Assign.
9. Assigned driver enters stage ETAs for the operational steps.
10. Assigned driver updates delivery status in order: Driver Coming, Driver Arrived, Loading, On the Way, Unloading, Completed.
11. The requester tracks each booking on **Moving Status** and can switch among multiple requests.
12. Completion notification is sent to user.
13. After status is **Completed**, the requester may rate the assigned driver with 1 to 5 stars on Moving Status (History is a fallback).

## 10.5 Moving Request Status Definitions
1. **Booked**
- Initial status immediately after the user confirms a moving booking.
- Request is open and visible to all verified drivers.

2. **Accepted**
- Set automatically when the first verified driver accepts the request.
- Request is locked from acceptance by other drivers.
- On Moving Status, Accepted and Assigned share the **Driver Assigned** timeline step.

3. **Assigned**
- Set when admin manually assigns a booked unassigned request, or reassigns a job cancelled by the assigned driver, to a specific verified driver.
- On Moving Status, Assigned uses the same **Driver Assigned** timeline step as Accepted.

4. **Driver Coming**
- Set when the assigned driver starts traveling to the pickup location.

5. **Driver Arrived**
- Set when the assigned driver has arrived at the pickup location.

6. **Loading**
- Set when belongings are being loaded onto the vehicle.

7. **On the Way**
- Set when belongings are being transported to the drop-off location.

8. **Unloading**
- Set when belongings are being unloaded at the destination.

9. **Completed**
- Set when moving and delivery are finished successfully.
- Driver may set Completed only from Unloading.
- The requester may then rate the assigned driver (FR-PROFILE-003).

10. **Cancelled**
- Set when the request is cancelled by admin, requester, or assigned driver before completion.
- Cancelled is not a step on the eight-step progress timeline.
- Jobs cancelled by the assigned driver remain eligible for admin reassignment from **Jobs Assign**.

---

## 11. Reporting Requirements (Admin)
Minimum reports should include:
1. User registrations by role and period
2. Agent verification status summary
3. Driver verification status summary
4. Housing listings counts by city/type/availability
5. House booking report: list of all booking records (Pending, Confirmed, Cancelled) with filters for booking date (from/to), booking status, and optional house/agent/user criteria
6. Moving service request report: list of all moving requests with filters for request date (from/to) and status, plus a details view of the selected request
7. Moving service request and completion summary
8. Top-performing agents/drivers by ratings

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
3. Authenticated users can book houses (confirmation page, confirmed status, no duplicate active booking) and submit moving requests.
4. Verified agents can manage housing listings, view bookings on own houses, and cancel those bookings.
5. Booking users and agents can cancel bookings; the system records who cancelled.
6. Admin can open a dedicated house booking report with date and status filters.
7. Admin can open a dedicated moving service request report with date and status filters and view full request details.
8. Verified drivers can process assigned moving jobs and update statuses.
9. Roommate browse/post workflows are functional.
10. Profile, wishlist, notifications, and histories are functional.
11. Users can rate listing agents after a confirmed house booking and assigned drivers after a completed move, using 1 to 5 stars (not on Profile).
12. Admin can verify users, manage roles/master data, and view reports.
13. Required data fields and validation rules are implemented according to this specification.

---

## 16. Items to Confirm (Optional Next Revision)
1. Final list of admin master data objects and each field definition.
2. Exact report layouts and export formats (PDF/Excel/CSV).
3. Whether payment collection is in-scope for first release.
4. Whether agent-driver direct communication is required (agent–booking-user communication is out of scope).
5. Moving lifecycle statuses are defined in §10.5 (Booked, Accepted, Assigned, Driver Coming, Driver Arrived, Loading, On the Way, Unloading, Completed, Cancelled).
6. House booking statuses for the current workflow are **Confirmed** on submit and **Cancelled** on cancel; **Pending** remains for legacy/admin filter only.

---

## 17. Backend Implementation Notes (2026-08-12)

The `backend-api/` project implements the server-side scope of this specification as a standalone Express + Prisma application.

### Implemented backend surfaces
- Versioned API under `/api/v1`
- Public home feed: featured listings, popular houses, verified agents, partner drivers, service reviews
- Public master-data reads for dropdown/filter values (active records only)
- Prisma seed includes §8.3 / MD-009 amenities (`AIR CONDITIONER` … `EV CHARGER`) with General/Building/Utility categories, MD-007 floor levels (Ground Floor / `0` through 20th Floor / `20` with surchargeAmount), MD-012 moving inventory items with placeholder points, vehicle types with point ranges and PricePerKM, plus roles, status codes, Yangon locations, property types, and admin user
- Self-service agent and driver registration via `/registrations/*` (assigns role, creates profile, sets that role’s verification status to pending)
- Booking lifecycle with confirm/cancel status updates (current code still creates bookings as PENDING and uses a moving upsell dialog; SRS v1.1 house booking workflow is specified ahead of implementation)
- Moving requests include `estimatedPrice` (customer quote) and `estimatedEarnings` (driver job visibility, FR-DRIVER-005), plus `orderNumber`. Create status is `BOOKED`. Requesters list their bookings with `GET /moving/requests` and track them on Moving Status (FR-MOVE-007).
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
- Public portal shell with header + sub-nav routes: Home, About Us, Agent Register, Sign Up, Sign In, Finding House, Hire Moving Service, Moving Status, Finding Roommates
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
- **FR-HOUSE-001..005 (partial vs SRS v1.1)**: `/finding-house` filters (city, type, min/max budget) via `GET /houses` and `GET /master-data/:entity`. Details at `/houses/:id` via `GET /houses/:id`. Booking via `POST /houses/:id/bookings` (guests redirected to sign-in). After success, moving upsell **dialog** (not yet the dedicated confirmation page required by FR-HOUSE-005). SRS v1.1 (confirmation page, confirmed-on-submit, duplicate rule, agent notify/list/cancel, cancel-actor tracking, FR-ADMIN-007) is specified ahead of implementation.
- **FR-AGENT-001**: Agent Register form matches §8.6 fields and posts to `POST /registrations/agent` (auth required; unauthenticated users redirected to sign-in). NRC photo fields accept path/file-name placeholders (no binary upload in this increment).

### Increment B implemented (moving, driver, roommates, profile, driver jobs)
- **FR-MOVE-001..002 / FR-MOVE-006 / FR-HOUSE-005**: `/hire-moving` is an auth-gated four-stage wizard. Stage 1 Yangon township + street/landmark + map pins; stage 2 remaining §8.4 fields except vehicle type plus pickup/drop-off floors; `POST /moving/quote` (uses pin coordinates when present) then stage 3 estimated price; Confirm Booking `POST /moving/requests` (server recomputes quote, stores `orderNumber`, status `BOOKED`); stage 4 confirmation. Detail via `GET /moving/requests/:id`. Booking upsell query context (`bookingId`/`houseId`) is displayed when present (not part of the create body).
- **FR-MOVE-007**: `/moving-status` lists the requester’s moving requests (`GET /moving/requests`) and shows the eight-step timeline for the selected booking (`GET /moving/requests/:id`, deep link `/moving-status/:id`). Multiple concurrent bookings are allowed.
- **FR-DRIVER-001**: `/driver-register` posts §8.5 fields to `POST /registrations/driver` (auth required; document/image path placeholders). Linked from the profile menu.
- **FR-ROOM-001..002**: `/finding-roommates` browses `GET /roommates` with gender/occupation/city/state filters. Authenticated users can post via `POST /roommates` using occupations from master data and houses from `GET /houses` as the housing select source.
- **FR-PROFILE-001 / FR-PROFILE-004 / FR-NOTI-001 UI**: `/profile` supports `GET/PATCH /profile` and `PATCH /profile/change-password`. `/profile/wishlist` uses `GET /wishlist`. `/profile/history` uses `GET /profile/history`. Header notifications continue to mark read with `PATCH /notifications/:id/read`.
- **FR-PROFILE-003**: Ratings use 1–5 stars on Moving Status (completed driver jobs), House details (confirmed bookings), and History. `POST /reviews` upserts by `bookingId` or `movingRequestId`. Profile no longer collects reviews.
- **FR-DRIVER-003..006**: Driver-role users get a public sub-header **Driver Jobs** link with **Available jobs** (`GET /driver/requests/available`) and **My jobs** (`GET /driver/requests/assigned`). Available jobs support accept/reject. Assigned in-progress jobs (Accepted through Unloading, including admin assignment) stay in My jobs for ETA (`POST .../eta`) and sequential status (`POST .../status` with `driver_coming|driver_arrived|loading|on_the_way|unloading|completed|cancelled`). Completed, cancelled, and rejected jobs leave the inbox. Job detail also uses `GET /moving/requests/:id` for full FR-DRIVER-005 fields.

### Increment C implemented (admin portal)
- **FR-ADMIN-001..002**: Separate queues at `/admin/verifications/agents` and `/admin/verifications/drivers` list pending (default) registrations (`GET /admin/agents`, `GET /admin/drivers`) with search and status filters. Detail pages review profile fields and documents (`GET /admin/agents/:userId`, `GET /admin/drivers/:userId`) then approve or reject (`PATCH .../verification` with optional `rejectionReason`). Verification status lives on `AgentProfile` / `DriverProfile`. Applicants receive an in-app notification. `/admin/verifications` redirects to the agent queue. Pending/verified/rejected counts remain on `GET /admin/reports/overview`.
- **FR-ADMIN-003..004**: `/admin/users` supports create-user (`POST /admin/users`) and role assignment (`PATCH /admin/users/:id/roles`) for `normal|agent|driver|admin`.
- **FR-MOVE-005 / admin assign**: `/admin/jobs-assign` lists booked unassigned jobs and jobs cancelled by the assigned driver (`GET /admin/moving/assignable-requests`, optional `orderNumber`). Admin chooses a verified driver (`GET /admin/moving/assignable-drivers`) then posts `POST /admin/moving/requests/:id/assign`. `/admin/moving-assign` redirects to `/admin/jobs-assign`.
- **FR-ADMIN-005 / MD-001..012**: `/admin/master-data` indexes all entities; `/admin/master-data/:entity` provides list/create/edit and DELETE soft-deactivate against `/admin/master-data/*`.
- **FR-ADMIN-006**: `/admin/dashboard` summary cards and `/admin/reports` period filters (`from`/`to`) consume `GET /admin/reports/overview` (registrations, verification, housing, bookings, moving, top performers).
- **FR-ADMIN-007**: `/admin/reports/bookings` lists house bookings with date and status filters (`GET /admin/reports/bookings`).
- **FR-ADMIN-008**: `/admin/reports/moving` lists all moving service requests with date and status filters (`GET /admin/reports/moving`). **View details** opens `/admin/reports/moving/:id` using `GET /moving/requests/:id` (admin-allowed) for full request information.
- Admin layout nav: Dashboard, Agent verification, Driver verification, Users, Jobs Assign, Master Data, Reports, House bookings, Moving requests. `AdminAuthGuard` continues to require `admin` role.

### Increment D implemented (agent housing CRUD + polish)
- **FR-AGENT-002..003**: Agent-role public sub-header link **Post Housing Information** and UserMenu link to `/agent/houses`. List own houses via `GET /agent/houses`. Create/edit forms cover §8.3 fields aligned with `agentHouseCreateValidator` (`POST/PATCH /agent/houses`, `DELETE /agent/houses/:id`). Master-data dropdowns: property-types, cities, states, contract-types, floor-levels, amenities. Image fields initially used path strings (binary upload added in Increment E). Unverified agents see a clear banner; create/edit/delete stay disabled while backend enforces `AGENT_NOT_VERIFIED`.
- About Us page copy polished; UserMenu also links Agent Register for discoverability.

### Increment E implemented (local-disk file upload)
- Shared upload API: `POST /api/v1/uploads?category=houses|moving|docs|profile` stores files under `backend-api/uploads/` (no cloud).
- Public static serving for `houses` / `moving` / `profile`; docs blocked from static and served via `GET /api/v1/files/docs/:filename` (owner/admin).
- Domain validators require `uploads/{category}/...` path format.
- Frontend file pickers wired for: agent house images, hire-moving cargo photos, profile picture, agent NRC docs, driver registration docs/vehicle/profile photos.
- Display: house cards/details, moving request detail, driver job cargo photos, profile/roommate avatars resolve public upload URLs.
- Admin verifications: queues at `/admin/verifications/agents` and `/admin/verifications/drivers`; detail pages load docs via `GET /admin/agents/:userId` and `GET /admin/drivers/:userId`; protected docs preview via gated file API.
- Spec: `FileUploadSpecification.md` / `.html`.

### Intentional choices / deferred
- Moving create body does not send `bookingId`/`houseId` because the backend create contract does not accept them; deep-link context is UI-only.
- Roommate housing select uses public `GET /houses` list (practical substitute until a dedicated “my houses / bookable houses” endpoint exists).
- **Intentional backend limitation (Increment C):** There is no admin list/queue endpoint for users. The users screen still uses userId entry forms. Agent and driver verification queues are implemented (`GET /admin/agents`, `GET /admin/drivers` with detail and approve/reject). Moving requests can be listed from the dedicated report (`GET /admin/reports/moving`). Jobs Assign lists booked unassigned jobs and driver-cancelled jobs for fallback assignment.
- **Intentional gaps retained after Increment E:** no admin user selectable list queue; no report export (PDF/Excel/CSV); email/SMS notification channels remain future scope; cloud object storage remains future scope.
- **SRS v1.1 house booking workflow (specified, not yet implemented):** dedicated confirmation page; status Confirmed on submit; duplicate active-booking prevention; agent notification and booking list with booker details; user/agent cancel with cancelled-by tracking; dedicated admin house booking report (FR-ADMIN-007). Current app still uses PENDING on create and a moving upsell dialog.
- No mock feature flags; UI adapts to real backend contracts.

### Implementation status
- Starter blueprint complete (shells, auth wiring, i18n, theme, baseline Vitest suite)
- Increment A business features wired against live `backend-api` endpoints with Vitest coverage for home render, house filters, and authenticated header/logout
- Increment B public-portal modules wired with Vitest coverage for moving form validation, roommate browse (mocked), and profile page render; `npm test` + `npm run build` expected green
- Increment C admin portal wired with Vitest coverage for admin guard, reports render (mocked fetch), and master-data list (mocked fetch); `npm test` + `npm run build` expected green
- Increment D agent housing CRUD wired with Vitest coverage for houses list render (mocked) and form validation; `npm test` + `npm run build` expected green
- Increment E local upload foundation + house/moving/profile/registration upload UI + public image display; upload integration tests + Vitest coverage; `npm test` expected green
