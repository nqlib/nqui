/**
 * nqui peer dependencies. Required + optional (for full library usage).
 * Used by install-peers.js and init-cursor.js.
 */

// Required by the main entry ("@nqlib/nqui"). cmdk is pulled by Combobox, a
// core form input, so it is not optional.
export const REQUIRED_PEERS = [
  'cmdk',
];

// Only needed if you import the matching subpath entry. The main entry never
// pulls these, so a consumer who does not use the component pays nothing.
//   sonner                 -> @nqlib/nqui/sonner
//   vaul                   -> @nqlib/nqui/drawer
//   embla-carousel-react   -> @nqlib/nqui/carousel
//   date-fns, react-day-picker -> @nqlib/nqui/calendar
//   @dnd-kit/*             -> @nqlib/nqui/sortable
//   @tanstack/react-table  -> data table components
//   react-resizable-panels -> resizable panels
export const OPTIONAL_PEERS = [
  '@dnd-kit/core',
  '@dnd-kit/modifiers',
  '@dnd-kit/sortable',
  '@dnd-kit/utilities',
  'embla-carousel-react',
  '@tanstack/react-table',
  'react-day-picker',
  'date-fns',
  'sonner',
  'vaul',
  'react-resizable-panels',
];

export const FULL_PEER_LIST = [...REQUIRED_PEERS, ...OPTIONAL_PEERS];
