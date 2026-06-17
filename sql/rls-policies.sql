-- RLS policies for Supabase

-- Enable row level security on all tables
alter table tournaments enable row level security;
alter table participants enable row level security;
alter table teams enable row level security;
alter table matches enable row level security;
alter table predictions enable row level security;
alter table scoring_rules enable row level security;
alter table participant_points enable row level security;
alter table special_questions enable row level security;
alter table special_answers enable row level security;

-- Public reading policies for active tournament and related lookup tables
create policy "public select tournaments" on tournaments
  for select using (is_active = true);

create policy "public select participants" on participants
  for select using (is_active = true);

create policy "public select teams" on teams
  for select using (true);

create policy "public select matches" on matches
  for select using (true);

create policy "public select scoring rules" on scoring_rules
  for select using (true);

create policy "public select questions" on special_questions
  for select using (is_active = true);

create policy "public select answers" on special_answers
  for select using (true);

-- Prediction insert/update policy based on participant identity and match time
create policy "participant can insert prediction" on predictions
  for insert with check (
    auth.uid() = participant_id
    and now() < (select match_date from matches where matches.id = predictions.match_id)
  );

create policy "participant can update prediction" on predictions
  for update using (
    auth.uid() = participant_id
  ) with check (
    auth.uid() = participant_id
    and now() < (select match_date from matches where matches.id = predictions.match_id)
  );

create policy "participant can delete prediction" on predictions
  for delete using (
    auth.uid() = participant_id
    and now() < (select match_date from matches where matches.id = predictions.match_id)
  );

