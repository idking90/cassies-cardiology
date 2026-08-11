## prompt to create prototype

Read every file in the /docs directory before making changes.

Build the Version 1 prototype described in those documents.

Requirements:

Use React and TypeScript.
Use mock data only.
Do not add a database.
Do not add authentication.
Create a mobile-first responsive UI.
Use fake placeholder topics and placeholder educational content.
The home page should display topic cards with completed/not completed status.
Selecting a topic opens a topic page containing:
The question
Four answer choices
A QR code that points back to that topic's URL
A simulated anonymous response summary (hardcoded values)
Buttons for Mark Topic Complete, Learn More, and Back
Selecting Learn More opens a static teaching page for that topic.
Selecting Mark Topic Complete returns to the dashboard and marks the topic complete.
Include a Reset Rotation button on the dashboard that clears all completed topics.
Keep the code modular with reusable components.
Explain your implementation decisions before making large structural changes.

##### makes back end logic
Read the existing /docs files and inspect the current prototype before making changes.

I want to build out the quiz interaction workflow using mock/local data only. Do not implement the real database or authentication yet.

Implement two distinct experiences:

Educator

Selecting a topic opens an educator question screen.
Display the question and answer choices.
Display a QR code linking to the student-facing route for that topic.
Display a simulated anonymous response distribution.
Show the total number of responses.
Provide a "Reveal Answer" control.
Before reveal, do not expose the correct answer on the student-facing screen.
Provide "Mark Topic Complete", "Learn More", and "Back" controls.
Marking the topic complete returns to the dashboard and marks the topic completed.

Student

The QR code should open a dedicated student-facing route.
Display the question and answer choices.
Allow the student to select one answer and submit it.
After submission, show a neutral confirmation such as "Answer recorded — waiting for discussion."
Do not reveal whether the answer was correct until the educator chooses "Reveal Answer."
Once revealed, show the correct answer.

Prototype behavior

Use mock question data.
Use local/in-memory state for responses.
It is acceptable for responses to reset on page refresh.
Do not add authentication.
Do not add a database.
Do not modify the content model based on assumptions about Cassie's unfinished Google Docs.
Keep the implementation modular so the mock response layer can later be replaced by a server/API.

Before making changes, explain the current application structure and the implementation approach you intend to use.

####
Build back end prompt
###
The proposed architecture looks good. Proceed with Cloudflare Pages Functions + D1.

Before implementing, make these two adjustments:

Preserve the requirement that each topic has a permanent QR code. The QR should point to a stable topic-specific student URL, such as /topics/heart-failure/respond, rather than embedding a unique session token. The backend should determine the currently active session for that topic.
Separate educator/admin API endpoints from student endpoints so authentication can be added later without redesigning the API. Do not implement authentication yet.

Implement the D1 schema and Pages Functions described in your proposal.

Requirements:

Keep the existing React UI and local content model.
Do not modify the content model based on Cassie's unfinished Google Docs.
Do not store student identity, IP addresses, device identifiers, or other identifying information.
Store only the anonymous response necessary to calculate aggregate results.
A student must never receive the correct answer before the educator reveals it.
Multiple students must be able to submit answers concurrently.
The educator results page should poll for updated response counts.
The existing local mock response implementation should be replaced by the API.
Keep the API layer modular so it can be changed later without coupling database logic directly to React components.

Use prepared statements for all D1 queries.

Create the D1 migrations and local development configuration needed to run this with Wrangler.

Before making changes, inspect the existing project and then implement the backend incrementally. After implementation, explain exactly how I should run the D1 database locally and test the multi-device workflow.

### switch to copilot to finish d1 integration
udflare Pages Functions + D1 backend has already been implemented under functions/ with a migration under migrations/. The React frontend is still using src/data/mockResponses.ts.

I need you to migrate the frontend from the mock/localStorage quiz state to the existing serverless API.

Do not redesign the application or change the UI unnececessarily

First inspect:

functions/
migrations/
src/App.tsx
src/components/StudentPage.tsx
src/components/TopicPage.tsx
src/components/ResponseSummary.tsx
src/data/topics.ts

Determine the API contracts implemented by the existing backend and then connect the React frontend to those APIs.

Requirements:

Remove the production dependency on src/data/mockResponses.ts.
Student responses must be stored in D1 through the existing API.
Educator response counts must come from D1.
Educator reveal must use the existing server API.
Reset must use the existing server-side behavior.
Preserve the current UI and routing as much as possible.
Permanent student QR URLs must remain /topics/:topicId/respond.
Do not introduce authentication yet.
Do not change the future Learn More/content architecture.
Do not modify the D1 schema or backend unless there is an actual incompatibility that prevents the frontend from working.
Do not commit changes.

After implementation, run the project's typecheck/build and report any errors rather than guessing at fixes.

