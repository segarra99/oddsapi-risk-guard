# Odds Feed Risk Guard

Node.js service that connects to the **OddsPapi** sports live feed and processes real-time odds data.

The goal is to prevent incorrect or inconsistent data from being used in trading decisions.

## Focus

- connect to the Oddspapi live sports feed  
- receive real-time odds updates  
- validate incoming data for obvious issues (wrong fixture, invalid odds, stale updates)  
- block suspicious data before it can be used
