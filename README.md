# odds feed risk guard

node.js service that connects to the **OddsPapi** sports live feed and processes real-time odds data.

the goal is to prevent incorrect or inconsistent data from reaching consumers or being used in trading decisions.

## setup

Create an `.env` file at the project root containing the required OddsPapi credentials.

```env
ODDSPAPI_BASE_URL=your_api_url
ODDSPAPI_API_KEY=your_api_key
```

### using docker

run:

```bash
docker compose up --build
```

### using npm

run:

```bash
npm install
npm run build
npm run start
```

## running the test

a simple replay test is included to demonstrate that the validation logic accepts valid odds updates and rejects an intentionally invalid one.

run it with:

```bash
npm run test
```

the test replays two websocket messages:

- `tests/odds.json` – a valid odds update that should be accepted.
- `tests/bad-odds.json` – an intentionally invalid odds update that should be rejected.

you can edit either file to change the outcome of the test. For example, changing the `fixtureId` in `bad-odds.json` to match the fixture in `fixture.json` will cause the test to accept the update instead.

this demonstration only validates one protection rule: an odds update whose `fixtureId` does not match a known fixture is rejected before it can enter the application state.

## how it works

- bootstrap initial state using the OddsPapi HTTP snapshot
- receive live updates through the websocket feed
- keep normalized in-memory state for fixtures, bookmakers, and odds
- track websocket positions using server epoch and channel entry ids to support reconnects
- apply updates only when they can move the current state forward

## validation

incoming data is checked before being stored:

- websocket messages are validated against expected schemas
- odds updates are ignored when the fixture does not exist
- bookmaker updates are ignored when the fixture is missing
- stale fixture and bookmaker updates are ignored
- stale odds updates are ignored using market timestamps
- inactive or unavailable odds are removed from state
- snapshot data is treated as the source of truth and removes missing entities

## focus

- connect to the Oddspapi live sports feed
- process real-time odds updates
- detect and block invalid data before it enters the state
- recover safely after websocket interruptions
