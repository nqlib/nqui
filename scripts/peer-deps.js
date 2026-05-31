/**
 * nqui peer dependencies. Required + optional (for full library usage).
 * Used by install-peers.js and init-cursor.js.
 */

export const REQUIRED_PEERS = [
  '@hugeicons/react',
  '@hugeicons/core-free-icons',
];

export const OPTIONAL_PEERS = [
  'cmdk',
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
