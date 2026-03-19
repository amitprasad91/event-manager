/**
 * ============================================================
 * ALL SOLUTIONS — ROLE-BASED PERMISSIONS
 * Defines what each role can see and do
 * ============================================================
 */

// Pages each role can access
export const ROLE_PAGES = {
  admin: [
    '/dashboard', '/events', '/people', '/clients', '/machines',
    '/payments', '/venues', '/performers', '/transport',
    '/co-owners', '/profit-split'
  ],
  supervisor: [
    '/dashboard', '/events', '/people', '/clients', '/machines',
    '/payments', '/venues', '/performers', '/transport'
  ],
  staff: [
    '/dashboard', '/events', '/machines', '/transport'
  ],
  driver: [
    '/dashboard', '/transport'
  ]
}

// Nav sections each role can see
export const ROLE_NAV = {
  admin: {
    Main:       ['Dashboard', 'Events'],
    Directory:  ['People & Staff', 'Clients', 'Performers', 'Venues'],
    Operations: ['Machines & Items', 'Transport', 'Payments'],
    Finance:    ['Co-Owners', 'Profit Split'],
  },
  supervisor: {
    Main:       ['Dashboard', 'Events'],
    Directory:  ['People & Staff', 'Clients', 'Performers', 'Venues'],
    Operations: ['Machines & Items', 'Transport', 'Payments'],
  },
  staff: {
    Main:       ['Dashboard', 'Events'],
    Operations: ['Machines & Items', 'Transport'],
  },
  driver: {
    Main:       ['Dashboard'],
    Operations: ['Transport'],
  }
}

// Action permissions
export const canDo = (role, action) => {
  const perms = {
    admin: ['add', 'edit', 'delete', 'view', 'pay', 'split', 'report'],
    supervisor: ['add', 'edit', 'view', 'pay'],
    staff: ['view', 'add'],
    driver: ['view'],
  }
  return perms[role]?.includes(action) || false
}

export function getNavForRole(role) {
  return ROLE_NAV[role] || ROLE_NAV['staff']
}

export function canAccessPage(role, path) {
  const pages = ROLE_PAGES[role] || ROLE_PAGES['staff']
  return pages.some(p => path.startsWith(p))
}
