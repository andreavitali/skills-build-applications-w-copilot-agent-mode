# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

Record your plan here before editing code.

- Presentation tier decision: Keep the UI in React/Vite pages and components focused on rendering, route state, and API consumption; use fetch wrappers that call relative `/api` endpoints and surface loading, empty, and error states via accessible roles and text.
- Logic tier decision: Keep the Express API as the business-logic boundary. Route handlers should validate request data, call service or model logic, and return deliberate `4xx` responses instead of leaking Mongo cast errors as `500`s.
- Data tier decision: Define Mongo/Mongoose schemas for users, teams, activities, and workouts in the backend models, and keep seed data idempotent so repeated runs preserve seeded fixtures without duplicating unrelated records.
- Activity tracking approach: Accept `userId`, `teamId`, `type`, and `minutes`; validate both IDs and existence, compute `points` and `occurredAt`, and persist the nested user/team references along with the submitted activity values.
- Team management approach: Require a non-empty team name with `400`, default `members` to an empty array, and keep a team’s `name` and `mascot` values stable when returned from both create and list endpoints.
- Leaderboard approach: Aggregate each team’s activity points, sort by total descending, and assign a 1-based rank so the API surfaces consistent ordering and totals for the UI.
- Workout suggestions approach: Resolve a seeded user by email, analyze that user’s activity history or fitness goal, match the strongest activity pattern to a workout focus, and include a clear reason string in the first recommendation while returning a `4xx` for unknown emails.

## Test plan

Record the commands you run and what each failure means.

- Data-tier command: `npm run test:data --prefix octofit-tracker/backend` — failures here indicate schema validation, required fields, or idempotent seed logic are not matching the data contract.
- API command: `npm run test:api --prefix octofit-tracker/backend` — failures here indicate route validation, status codes, leaderboard aggregation, or workout suggestion logic are not honoring the API contract.
- Frontend command: `npm test --prefix octofit-tracker/frontend` — failures here indicate React pages are not fetching the correct endpoints, rendering the expected content, or exposing accessible loading/empty/error states.
- Backend build command: `npm run build --prefix octofit-tracker/backend` — failures here mean the TypeScript backend does not compile cleanly, usually due to typing, route signatures, or model/schema issues.
- Frontend build command: `npm run build --prefix octofit-tracker/frontend` — failures here mean the Vite/React app has build-time errors or incorrect component contracts that block bundling.
