import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { ChevronDown, ChevronRight, BookOpen, Shield, Users, Calendar, Package, Truck, CreditCard, MapPin, Mic2, PieChart, Users2 } from 'lucide-react'

// Collapsible section
function Section({ icon: Icon, title, color, children }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ marginBottom: 10, border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
      <button onClick={() => setOpen(v => !v)} style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 12,
        padding: '14px 18px', background: 'var(--bg-2)', border: 'none',
        cursor: 'pointer', textAlign: 'left',
      }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: `${color}22`, border: `1px solid ${color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={16} style={{ color }} />
        </div>
        <span style={{ flex: 1, fontFamily: 'Syne', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)' }}>{title}</span>
        {open ? <ChevronDown size={16} style={{ color: 'var(--text-3)' }} /> : <ChevronRight size={16} style={{ color: 'var(--text-3)' }} />}
      </button>
      {open && (
        <div style={{ padding: '16px 18px', background: 'var(--bg-1)', borderTop: '1px solid var(--border)' }}>
          {children}
        </div>
      )}
    </div>
  )
}

function Step({ num, text }) {
  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 10, alignItems: 'flex-start' }}>
      <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 800, flexShrink: 0, fontFamily: 'Syne' }}>{num}</div>
      <div style={{ fontSize: '0.85rem', color: 'var(--text-2)', lineHeight: 1.6, paddingTop: 2 }}>{text}</div>
    </div>
  )
}

function Tip({ text }) {
  return (
    <div style={{ background: 'rgba(108,99,255,0.08)', border: '1px solid rgba(108,99,255,0.2)', borderRadius: 8, padding: '8px 12px', marginBottom: 8, fontSize: '0.8rem', color: 'var(--accent-light)' }}>
      💡 {text}
    </div>
  )
}

function Note({ text }) {
  return (
    <div style={{ background: 'rgba(240,180,41,0.08)', border: '1px solid rgba(240,180,41,0.2)', borderRadius: 8, padding: '8px 12px', marginBottom: 8, fontSize: '0.8rem', color: 'var(--gold)' }}>
      ⚠️ {text}
    </div>
  )
}

function RoleBadge({ role }) {
  const colors = { admin: 'var(--gold)', supervisor: 'var(--orange)', staff: 'var(--blue)', driver: 'var(--green)' }
  const icons  = { admin: '👑', supervisor: '👷', staff: '👤', driver: '🚛' }
  return (
    <span style={{ background: `${colors[role]}22`, border: `1px solid ${colors[role]}44`, color: colors[role], borderRadius: 100, padding: '2px 10px', fontSize: '0.72rem', fontWeight: 700, marginRight: 4 }}>
      {icons[role]} {role.charAt(0).toUpperCase() + role.slice(1)}
    </span>
  )
}

const GUIDE_CONTENT = {
  admin: [
    {
      icon: BookOpen, title: 'Getting Started', color: '#6c63ff',
      content: (
        <div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-2)', marginBottom: 14, lineHeight: 1.7 }}>
            Welcome to All Solutions Event Manager. As an Admin you have full access to all features.
            Here's a quick overview of how to get started.
          </p>
          <Step num="1" text="Add your Clients first — go to Clients → Add Client with their name, phone and email." />
          <Step num="2" text="Add your Venues — go to Venues → Add Venue with address and Google Maps link." />
          <Step num="3" text="Add your People & Staff — supervisors, drivers, helpers with their pay rates." />
          <Step num="4" text="Add Machines & Items in your godown — name, category, quantity." />
          <Step num="5" text="Create an Event — assign client, venue, date and amount." />
          <Step num="6" text="Open the event and add items to it — staff, machines, transport." />
          <Step num="7" text="Track Payments from the Payments page — collect from clients and pay staff." />
          <Tip text="Use the Calendar view in Events to see all bookings at a glance." />
        </div>
      )
    },
    {
      icon: Calendar, title: 'Managing Events', color: '#f0b429',
      content: (
        <div>
          <Step num="1" text="Go to Events → click New Event." />
          <Step num="2" text="Fill in the title, type (Wedding/Birthday/Office), client, venue, date and amount." />
          <Step num="3" text="Click Create Event — it appears in the list and calendar." />
          <Step num="4" text="Click on the event row to open Event Detail." />
          <Step num="5" text="Inside Event Detail — add items: supervisors, machines, performers, transport." />
          <Step num="6" text="When event starts → click ▶ Start Event. When done → click ✅ Complete." />
          <Step num="7" text="Use Edit ✏️ in the table to change event details anytime." />
          <Step num="8" text="Switch to 📅 Calendar view to see events month-wise. Click any event dot to see details." />
          <Tip text="The profit/loss card at the bottom of Event Detail auto-calculates Revenue − All Costs." />
          <Note text="Deleting an event also deletes all items and payments linked to it." />
        </div>
      )
    },
    {
      icon: Users, title: 'People & Staff', color: '#10d4a0',
      content: (
        <div>
          <Step num="1" text="Go to People & Staff → click Add Person." />
          <Step num="2" text="Fill name, phone, role (admin/supervisor/staff/driver) and pay rate." />
          <Step num="3" text="Admin role: pay type is hidden — admins don't have a per-event rate." />
          <Step num="4" text="Staff added here can be assigned to events in Event Detail." />
          <Step num="5" text="Tap any phone number to call directly from the table." />
          <Tip text="Drivers should be added as role 'Driver' — they appear in Transport trip dropdowns." />
          <Note text="People added here are staff records only. To give someone login access, create them in Supabase Auth dashboard separately." />
        </div>
      )
    },
    {
      icon: Package, title: 'Machines & Items', color: '#ff8c42',
      content: (
        <div>
          <Step num="1" text="Go to Machines & Items → click Add Item." />
          <Step num="2" text="Enter name, quantity (how many you own), category and which godown it's in." />
          <Step num="3" text="Status: In Godown = stored, At Event = deployed, Returned = back from event." />
          <Step num="4" text="The summary cards at the top show total items and quantity per godown." />
          <Step num="5" text="Click View in the Notes column to see full notes for any item." />
          <Step num="6" text="When assigning to event, select the event in Current Event field." />
          <Tip text="Always update status back to 'Returned' after an event ends." />
        </div>
      )
    },
    {
      icon: Truck, title: 'Transport', color: '#ff5c7a',
      content: (
        <div>
          <Step num="1" text="Go to Transport → click Add Trip." />
          <Step num="2" text="Select the Event — date and venue location auto-fill automatically." />
          <Step num="3" text="Select the Driver separately from Staff (event handler)." />
          <Step num="4" text="Choose vehicle: Tata Ace, Tata 407, Auto, Van, Bike, Private Bike." />
          <Step num="5" text="Tick Round Trip if the vehicle goes and comes back." />
          <Step num="6" text="Pay method: Per KM (enter distance) or Fixed Amount." />
          <Step num="7" text="Click ✅ Pay → a confirmation box shows driver, date and amount → select who is paying → confirm." />
          <Step num="8" text="To pay all trips for the same driver at once — use the Bulk Pay Driver dropdown at the top." />
          <Step num="9" text="If a payment was made by mistake → click ↩ Revert → enter reason and who is reverting." />
          <Tip text="Filter by driver name to see all pending trips for one driver before bulk paying." />
        </div>
      )
    },
    {
      icon: CreditCard, title: 'Payments', color: '#6c63ff',
      content: (
        <div>
          <Step num="1" text="Go to Payments — see quarterly summary at the top: Total Billed, Collected, Pending, Staff Dues." />
          <Step num="2" text="Collect from Clients tab — shows all events with progress bars." />
          <Step num="3" text="Click Record Payment → enter amount received, method (Cash/UPI/Cheque), who collected it and who it was handed to." />
          <Step num="4" text="Events completed but payment still pending show a warning with number of days overdue." />
          <Step num="5" text="Pay Staff tab — shows all unpaid event items. Click ✅ Pay to mark as paid." />
          <Tip text="Red warning shows when client hasn't paid after event completion — follow up immediately." />
        </div>
      )
    },
    {
      icon: MapPin, title: 'Venues', color: '#10d4a0',
      content: (
        <div>
          <Step num="1" text="Go to Venues → Add Venue with name, full address and city." />
          <Step num="2" text="Paste a Google Maps share link in the Maps URL field for one-tap navigation." />
          <Step num="3" text="Click Navigate on any venue card → opens Google Maps with directions." />
          <Tip text="To get a Google Maps link: open venue in Google Maps → Share → Copy link → paste here." />
        </div>
      )
    },
    {
      icon: Mic2, title: 'Performers', color: '#f0b429',
      content: (
        <div>
          <Step num="1" text="Go to Performers → Add Performer with name, type and contact." />
          <Step num="2" text="Types: Actor, Dancer, Musician, Joker, Juggler, Casino Dealer, DJ, Other." />
          <Step num="3" text="Category: Payroll (permanent), Freelancer, Vendor/Agency." />
          <Step num="4" text="Set their rate per event/hour/day for easy reference." />
          <Step num="5" text="Filter by type to quickly find the right performer for an event." />
        </div>
      )
    },
    {
      icon: Users2, title: 'Co-Owners', color: '#6c63ff',
      content: (
        <div>
          <Step num="1" text="Go to Co-Owners → Add Co-owner with name, phone and email." />
          <Step num="2" text="After events are completed, go to Profit Split to divide profits." />
          <Step num="3" text="Each co-owner card shows Total Earned, Pending amount and their share % of the total pool." />
        </div>
      )
    },
    {
      icon: PieChart, title: 'Profit Split', color: '#ff8c42',
      content: (
        <div>
          <Step num="1" text="Go to Profit Split → select a completed event." />
          <Step num="2" text="Revenue, Costs and Net Profit are auto-calculated." />
          <Step num="3" text="Choose split method: Equal (divide equally), Fixed % (enter fixed percentages), Custom % (enter custom), Investment Based (proportional to money invested)." />
          <Step num="4" text="Click Save Split → each co-owner's share is saved." />
          <Step num="5" text="Click ✅ Pay next to each person when their share is paid out." />
          <Step num="6" text="Right panel shows Q1/Q2/Q3/Q4 earnings per co-owner." />
          <Tip text="Costs include all event items AND transport trips linked to the event." />
        </div>
      )
    },
  ],
  supervisor: [
    {
      icon: BookOpen, title: 'Getting Started', color: '#6c63ff',
      content: (
        <div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-2)', marginBottom: 14, lineHeight: 1.7 }}>
            As a Supervisor you can manage events, people, clients, venues, performers, machines, transport and payments.
          </p>
          <Step num="1" text="Check Dashboard for today's and upcoming events." />
          <Step num="2" text="Open Events to see all bookings and their status." />
          <Step num="3" text="Use Transport to log vehicle trips for each event." />
          <Step num="4" text="Use Payments to track what's collected and what's owed to staff." />
        </div>
      )
    },
    {
      icon: Calendar, title: 'Events', color: '#f0b429',
      content: (
        <div>
          <Step num="1" text="View all events in list or calendar view." />
          <Step num="2" text="Click any event to open full details — add items, mark paid, change status." />
          <Step num="3" text="Create new events using New Event button." />
          <Step num="4" text="Edit or delete events using ✏️ and 🗑️ buttons in the table." />
          <Tip text="Use the Calendar view to see which days have events this month." />
        </div>
      )
    },
    {
      icon: Truck, title: 'Transport', color: '#ff5c7a',
      content: (
        <div>
          <Step num="1" text="Add transport trips for each event — select event, driver, vehicle and route." />
          <Step num="2" text="Event date and venue auto-fill when you select the event." />
          <Step num="3" text="Mark trips as paid using the ✅ Pay button — confirm driver name, date and amount." />
          <Step num="4" text="Use Bulk Pay to pay all pending trips for the same driver at once." />
        </div>
      )
    },
    {
      icon: CreditCard, title: 'Payments', color: '#6c63ff',
      content: (
        <div>
          <Step num="1" text="Collect from Clients — record payment with method and who collected it." />
          <Step num="2" text="Pay Staff tab — mark individual staff payments as done." />
          <Step num="3" text="Check the quarterly summary cards at the top for financial overview." />
          <Note text="You cannot access Co-Owners or Profit Split — these are Admin only." />
        </div>
      )
    },
  ],
  staff: [
    {
      icon: BookOpen, title: 'Getting Started', color: '#6c63ff',
      content: (
        <div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-2)', marginBottom: 14, lineHeight: 1.7 }}>
            As Staff you can view events and machines, and log transport trips.
          </p>
          <Step num="1" text="Check Dashboard for upcoming events you're assigned to." />
          <Step num="2" text="Go to Events to see event details and items." />
          <Step num="3" text="Go to Transport to log trips you've done." />
        </div>
      )
    },
    {
      icon: Calendar, title: 'Events', color: '#f0b429',
      content: (
        <div>
          <Step num="1" text="View all events in list or calendar view." />
          <Step num="2" text="Click any event to see full details — which machines are assigned, who else is working." />
          <Note text="You can view events but editing and deleting require Supervisor or Admin access." />
        </div>
      )
    },
    {
      icon: Truck, title: 'Transport', color: '#ff5c7a',
      content: (
        <div>
          <Step num="1" text="Add a trip — select the event, enter vehicle details and route." />
          <Step num="2" text="Event date and venue address auto-fill when you pick the event." />
          <Step num="3" text="Enter the distance (km) or fixed amount for the trip." />
          <Tip text="Always log your trip on the same day for accurate records." />
        </div>
      )
    },
    {
      icon: Package, title: 'Machines & Items', color: '#ff8c42',
      content: (
        <div>
          <Step num="1" text="View all machines and their current status and location." />
          <Step num="2" text="Check godown summary cards to see how many items are available." />
          <Step num="3" text="Click View on Notes to see special handling instructions for any item." />
        </div>
      )
    },
  ],
  driver: [
    {
      icon: BookOpen, title: 'Getting Started', color: '#6c63ff',
      content: (
        <div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-2)', marginBottom: 14, lineHeight: 1.7 }}>
            As a Driver you can view the Dashboard and log your transport trips.
          </p>
          <Step num="1" text="Check Dashboard for today's trips." />
          <Step num="2" text="Go to Transport to see your assigned trips and log new ones." />
        </div>
      )
    },
    {
      icon: Truck, title: 'Transport', color: '#ff5c7a',
      content: (
        <div>
          <Step num="1" text="Add Trip — select the event you are transporting for." />
          <Step num="2" text="Date and venue auto-fill from the event." />
          <Step num="3" text="Enter pickup location (godown), drop location (venue) and distance." />
          <Step num="4" text="Tick Round Trip if you made a return journey." />
          <Step num="5" text="Your trip appears in the list with pending payment status." />
          <Tip text="Contact your supervisor if you need to edit or delete a trip." />
        </div>
      )
    },
  ]
}

export default function UserGuidePage() {
  const { profile } = useAuth()
  const role = profile?.role || 'staff'
  const guide = GUIDE_CONTENT[role] || GUIDE_CONTENT.staff

  const roleColors  = { admin: 'var(--gold)', supervisor: 'var(--orange)', staff: 'var(--blue)', driver: 'var(--green)' }
  const roleDescs   = {
    admin:      'You have full access to all features including Finance, Co-owners and Profit Split.',
    supervisor: 'You can manage events, people, transport and payments. Finance pages are Admin only.',
    staff:      'You can view events, machines and log transport trips.',
    driver:     'You can view the dashboard and log transport trips.',
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">User Guide</div>
          <div className="page-subtitle">How to use All Solutions — step by step</div>
        </div>
      </div>

      {/* Role info banner */}
      <div style={{
        background: `${roleColors[role]}11`, border: `1px solid ${roleColors[role]}33`,
        borderRadius: 14, padding: '14px 18px', marginBottom: 20,
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <div style={{ fontSize: '1.8rem' }}>
          {role === 'admin' ? '👑' : role === 'supervisor' ? '👷' : role === 'driver' ? '🚛' : '👤'}
        </div>
        <div>
          <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '0.9rem', marginBottom: 4 }}>
            You are logged in as <span style={{ color: roleColors[role] }}>{role.charAt(0).toUpperCase() + role.slice(1)}</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>{roleDescs[role]}</div>
        </div>
      </div>

      {/* Guide sections */}
      {guide.map((section, i) => (
        <Section key={i} icon={section.icon} title={section.title} color={section.color}>
          {section.content}
        </Section>
      ))}

      {/* Quick reference */}
      <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px', marginTop: 10 }}>
        <div style={{ fontFamily: 'Syne', fontWeight: 700, marginBottom: 14, fontSize: '0.9rem' }}>📋 Quick Reference</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8 }}>
          {[
            ['💍', 'Wedding', 'badge-gold'],
            ['🎂', 'Birthday', 'badge-orange'],
            ['🏢', 'Corporate', 'badge-blue'],
            ['📦', 'In Godown', 'badge-blue'],
            ['🎪', 'At Event', 'badge-orange'],
            ['✅', 'Returned', 'badge-green'],
            ['🔵', 'Upcoming', 'badge-blue'],
            ['🟢', 'Ongoing', 'badge-green'],
            ['⚫', 'Completed', 'badge-gray'],
            ['🔴', 'Cancelled', 'badge-red'],
          ].map(([icon, label, badge]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>{icon}</span>
              <span className={`badge ${badge}`} style={{ fontSize: '0.72rem' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
