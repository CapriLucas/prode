Important data:

League:

```
{
    "name": "International - FIFA World Cup",
    "slug": "international-fifa-world-cup",
    "eventsCount": 104
}
```

Sport: "football"

## requests:

- `GET https://api.odds-api.io/v3/events\?apiKey\={api_key}\&sport\=football\&league\=international-fifa-world-cup`
  response:

```
[
  {
    "id": 66456904,
    "home": "Mexico",
    "away": "South Africa",
    "homeId": 4781,
    "awayId": 4736,
    "date": "2026-06-11T19:00:00Z",
    "sport": { "name": "Football", "slug": "football" },
    "league": {
      "name": "International - FIFA World Cup",
      "slug": "international-fifa-world-cup"
    },
    "status": "pending",
    "scores": { "home": 0, "away": 0 }
  },
  {
    "id": 66456906,
    "home": "Korea Republic",
    "away": "Czechia",
    "homeId": 4735,
    "awayId": 4714,
    "date": "2026-06-12T02:00:00Z",
    "sport": { "name": "Football", "slug": "football" },
    "league": {
      "name": "International - FIFA World Cup",
      "slug": "international-fifa-world-cup"
    },
    "status": "pending",
    "scores": { "home": 0, "away": 0 }
  },...]
```

- `curl https://api.odds-api.io/v3/odds/multi\?apiKey\={api_key}\&eventIds\={eventId1},{eventId2}\&bookmakers\=Bet365`
  response: './odds-multi-response.json'
