# Recovery Tracker (learning project)

A tiny web app to learn **Supabase** (database) and **GitHub** (code + hosting).
It lists bikes in recovery and lets you log calls to riders. **Sample data only.**

## How it works

- **Database:** Supabase project *Bounce Recovery Data*
  - `bikes`: one row per bike (reg number, city, hub, rider, phone, MFR since, location)
  - `call_logs`: one row per call (bike, outcome, agent, notes, time)
  - `bike_overview`: a view that adds `age_days`, the last call outcome and the number of calls
- **Security:** Row Level Security is on. Anyone with the page can **read** both tables and **add** call logs.
  Nobody can edit or delete through the page.
- **Website:** `index.html` connects with the project's public (anon) key, using the supabase-js library.

## Practice SQL (Supabase > SQL Editor)

```sql
-- Calls by outcome
select outcome, count(*) from call_logs group by outcome order by 2 desc;

-- Bikes never called
select reg_number, city, age_days from bike_overview where total_calls = 0 order by age_days desc;

-- Bikes older than 5 days by city
select city, count(*) from bike_overview where age_days > 5 group by city;

-- Calls per agent today
select agent, count(*) from call_logs where called_at >= current_date group by agent;
```

## Ideas to try next

1. Add a `hub` filter next to the city filter.
2. Show the call history for a bike when you click its row.
3. Turn on Supabase Auth so agents log in, and change the insert policy to `to authenticated`.
4. Add a map using the `latitude` / `longitude` columns.
