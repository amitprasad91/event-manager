/**
 * ============================================================
 * ALL SOLUTIONS — ROLE-BASED PERMISSIONS
 * ============================================================
 */

export const ROLE_PAGES = {
  admin: [
    '/dashboard', '/events', '/people', '/clients', '/machines',
    '/payments', '/venues', '/performers', '/transport',
    '/co-owners', '/profit-split', '/user-guide'
  ],
  supervisor: [
    '/dashboard', '/events', '/people', '/clients', '/machines',
    '/payments', '/venues', '/performers', '/transport', '/user-guide'
  ],
  staff: [
    '/dashboard', '/events', '/machines', '/transport', '/user-guide'
  ],
  driver: [
    '/dashboard', '/transport', '/user-guide'
  ]
}

export const ROLE_NAV = {
  admin: {
    Main:       ['Dashboard', 'Events'],
    Directory:  ['People & Staff', 'Clients', 'Performers', 'Venues'],
    Operations: ['Machines & Items', 'Transport', 'Payments'],
    Finance:    ['Co-Owners', 'Profit Split'],
    Help:       ['User Guide'],
  },
  supervisor: {
    Main:       ['Dashboard', 'Events'],
    Directory:  ['People & Staff', 'Clients', 'Performers', 'Venues'],
    Operations: ['Machines & Items', 'Transport', 'Payments'],
    Help:       ['User Guide'],
  },
  staff: {
    Main:       ['Dashboard', 'Events'],
    Operations: ['Machines & Items', 'Transport'],
    Help:       ['User Guide'],
  },
  driver: {
    Main:       ['Dashboard'],
    Operations: ['Transport'],
    Help:       ['User Guide'],
  }
}

export const canDo = (role, action) => {
  const perms = {
    admin:      ['add', 'edit', 'delete', 'view', 'pay', 'split', 'report'],
    supervisor: ['add', 'edit', 'view', 'pay'],
    staff:      ['view', 'add'],
    driver:     ['view'],
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
