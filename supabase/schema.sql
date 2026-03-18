-- ============================================================
-- EVENT MANAGER - SUPABASE SCHEMA
-- Paste this entire file into Supabase SQL Editor and run it
-- ============================================================

create extension if not exists "uuid-ossp";

-- PROFILES
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  phone text,
  role text not null default 'staff' check (role in ('admin', 'supervisor', 'staff', 'driver')),
  is_admin boolean default false,
  pay_type text check (pay_type in ('daily', 'hourly', 'per_km', 'fixed_per_event', 'monthly')),
  pay_rate numeric(10,2) default 0,
  created_at timestamptz default now()
);

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- CO-OWNERS
create table co_owners (
  id uuid primary key default uuid_generate_v4(),
  full_name text not null,
  phone text,
  email text,
  created_at timestamptz default now()
);

-- CLIENTS
create table clients (
  id uuid primary key default uuid_generate_v4(),
  full_name text not null,
  phone text,
  email text,
  address text,
  created_at timestamptz default now()
);

-- VENUES
create table venues (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  address text not null,
  city text default 'Kolkata',
  lat numeric(10,7),
  lng numeric(10,7),
  google_maps_url text,
  created_at timestamptz default now()
);

-- MACHINES / ITEMS
create table machines (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  category text check (category in ('game', 'machine', 'costume', 'prop', 'other')),
  godown text,
  status text default 'in_godown' check (status in ('in_godown', 'at_event', 'returned')),
  current_event_id uuid,
  notes text,
  created_at timestamptz default now()
);

-- PERFORMERS
create table performers (
  id uuid primary key default uuid_generate_v4(),
  full_name text not null,
  phone text,
  type text check (type in ('actor', 'dancer', 'musician', 'joker', 'juggler', 'casino', 'dj', 'other')),
  vendor_type text default 'freelancer' check (vendor_type in ('payroll', 'freelancer', 'vendor_agency')),
  rate numeric(10,2) default 0,
  rate_type text check (rate_type in ('per_event', 'per_hour', 'per_day')),
  created_at timestamptz default now()
);

-- EVENTS
create table events (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  event_type text check (event_type in ('wedding', 'birthday', 'office', 'other')),
  client_id uuid references clients(id),
  venue_id uuid references venues(id),
  event_date date not null,
  start_time time,
  end_time time,
  status text default 'upcoming' check (status in ('upcoming', 'ongoing', 'completed', 'cancelled')),
  client_amount numeric(10,2) default 0,
  amount_received numeric(10,2) default 0,
  notes text,
  created_at timestamptz default now()
);

alter table machines add constraint fk_machine_event
  foreign key (current_event_id) references events(id) on delete set null;

-- EVENT ITEMS
create table event_items (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references events(id) on delete cascade,
  item_type text not null check (item_type in ('machine', 'performer', 'transport', 'supervisor', 'helper', 'other')),
  description text not null,
  machine_id uuid references machines(id),
  performer_id uuid references performers(id),
  assigned_profile_id uuid references profiles(id),
  cost numeric(10,2) default 0,
  pay_type text check (pay_type in ('daily', 'hourly', 'per_km', 'fixed', 'monthly')),
  hours numeric(5,2),
  km numeric(7,2),
  days numeric(5,1) default 1,
  amount_paid numeric(10,2) default 0,
  payment_status text default 'pending' check (payment_status in ('pending', 'partial', 'paid')),
  notes text,
  created_at timestamptz default now()
);

-- TRANSPORT TRIPS
create table transport_trips (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references events(id) on delete cascade,
  vehicle_type text default 'Tata Ace',
  driver_profile_id uuid references profiles(id),
  pickup_location text,
  drop_location text,
  km numeric(7,2),
  amount numeric(10,2) default 0,
  pay_method text default 'per_km' check (pay_method in ('per_km', 'fixed')),
  amount_paid numeric(10,2) default 0,
  payment_status text default 'pending' check (payment_status in ('pending', 'paid')),
  trip_date date,
  notes text,
  created_at timestamptz default now()
);

-- PROFIT SPLITS
create table profit_splits (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references events(id) on delete cascade,
  co_owner_id uuid references co_owners(id),
  split_method text check (split_method in ('equal', 'fixed_percent', 'custom_percent', 'investment_based')),
  percent numeric(5,2),
  investment_amount numeric(10,2),
  calculated_amount numeric(10,2),
  paid boolean default false,
  created_at timestamptz default now()
);

-- ROW LEVEL SECURITY
alter table profiles enable row level security;
alter table clients enable row level security;
alter table venues enable row level security;
alter table machines enable row level security;
alter table performers enable row level security;
alter table events enable row level security;
alter table event_items enable row level security;
alter table transport_trips enable row level security;
alter table co_owners enable row level security;
alter table profit_splits enable row level security;

create policy "auth_all" on profiles for all using (auth.role() = 'authenticated');
create policy "auth_all" on clients for all using (auth.role() = 'authenticated');
create policy "auth_all" on venues for all using (auth.role() = 'authenticated');
create policy "auth_all" on machines for all using (auth.role() = 'authenticated');
create policy "auth_all" on performers for all using (auth.role() = 'authenticated');
create policy "auth_all" on events for all using (auth.role() = 'authenticated');
create policy "auth_all" on event_items for all using (auth.role() = 'authenticated');
create policy "auth_all" on transport_trips for all using (auth.role() = 'authenticated');
create policy "auth_all" on co_owners for all using (auth.role() = 'authenticated');
create policy "auth_all" on profit_splits for all using (auth.role() = 'authenticated');

-- SAMPLE VENUES
insert into venues (name, address, city, google_maps_url) values
  ('ITC Royal Bengal', '1, JBS Haldane Ave, Kolkata 700105', 'Kolkata', 'https://maps.google.com/?q=ITC+Royal+Bengal+Kolkata'),
  ('JW Marriott Kolkata', '4A, JBS Haldane Ave, Kolkata 700105', 'Kolkata', 'https://maps.google.com/?q=JW+Marriott+Kolkata'),
  ('Taj Bengal', '34B, Belvedere Rd, Kolkata 700027', 'Kolkata', 'https://maps.google.com/?q=Taj+Bengal+Kolkata');

insert into machines (name, category, godown, status) values
  ('Selfie Bhoot Booth', 'machine', 'Godown A', 'in_godown'),
  ('Walky Talky Set', 'machine', 'Godown A', 'in_godown'),
  ('Casino Table Set', 'machine', 'Godown B', 'in_godown'),
  ('Joker Costume Set', 'costume', 'Godown A', 'in_godown'),
  ('Photo Booth Frame', 'prop', 'Godown B', 'in_godown');
