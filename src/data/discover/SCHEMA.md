# Discover data (one JSON file per city: src/data/discover/<cityId>.json)

{
  "places": [ { "id": "lon-british-museum", "n": "British Museum", "a": "Bloomsbury", "lat": 51.5194, "lng": -0.1270,
               "k": "museum", "top": true, "free": true, "url": "https://www.britishmuseum.org",
               "en": "One or two factual sentences.", "pt": "Uma ou duas frases factuais (português europeu)." } ],
  "streets": [ { "id": "lon-oxford-st", "n": "Oxford Street", "a": "West End", "lat": 51.5152, "lng": -0.1419,
               "en": "...", "pt": "..." } ],
  "walks": [ { "id": "lon-southbank", "en_n": "South Bank: Westminster to Tower Bridge", "pt_n": "South Bank: de Westminster à Tower Bridge",
               "km": 4.0, "min": 60, "en": "...", "pt": "...",
               "pts": [ { "n": "Westminster Bridge", "lat": 51.5008, "lng": -0.1219 }, ... ] } ]
}

Rules
- k ∈ sight | museum | gallery | park | market | view | church | palace | district | landmark | food
- ~20 places, ~6 streets/districts, 3 walks (4–8 points each, real walkable order).
- Only well-established facts. NO prices, NO opening hours, NO ratings. "free": true only when entry to the main
  collection/site is free as a long-standing official policy; otherwise omit the field.
- "url" only for the place's own official website (or the city/state official page) that you are sure exists; otherwise omit.
- Coordinates: main entrance / centre, 4 decimals, must be accurate (±100 m).
- Do NOT repeat places that are already route stops for that city (list given).
- English: plain, friendly, factual. Portuguese: European Portuguese (pt-PT: "autocarro", "comboio", "elétrico").
- ids: "<cityId>-<slug>", unique.
