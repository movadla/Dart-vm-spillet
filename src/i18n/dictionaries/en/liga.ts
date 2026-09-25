import type { LigaDict } from '../no/liga'

export const liga = {
  metaFallback: 'League',
  sectionLabel: 'League',
  participants: (n) => `${n} ${n === 1 ? 'participant' : 'participants'}`,
  inviteCode: { label: 'League code' },
  hidden: {
    title: 'The participant list is hidden until the Worlds start',
    body: 'The league owner has chosen to keep teams secret until the first match.',
  },
  empty: {
    title: 'No participants yet',
    bodyBefore: 'Share the league code ',
    bodyAfter: ' with friends so they can join.',
  },
  pointsComingWhenStarts: (date) => `Points and ranking arrive once the Worlds start ${date}.`,
  rankChip: { ofTotal: (total) => `of ${total}` },
  kick: {
    button: 'Kick',
    confirm: (name) => `Remove ${name} from the league?`,
    sessionExpired: 'Your session has expired — go to "My page" and request a new sign-in link.',
    fallbackError: 'Could not remove the member',
    genericError: 'Something went wrong',
  },
  shareLeague: {
    label: 'Invite',
    ariaLabel: (name) => `Share the league ${name}`,
    inviteText: (name, code) => `Join ${name}! Code: ${code}`,
  },
  section: {
    heading: 'Leagues',
    newLeagueViewCta: 'View league →',
    newLeagueCreatedCta: 'Created · View league for code →',
    codeLabel: 'Code:',
    wholeLeaderboard: 'Full leaderboard',
    joinBtn: 'Join a league',
    createBtn: 'Start a league',
    lockedAfterStart: 'Leagues are locked once the Worlds start.',
    genericError: 'Something went wrong',
    createForm: {
      heading: 'Start a league',
      nameLabel: 'League name',
      namePlaceholder: 'e.g. The Office Team',
      cancel: 'Cancel',
      submitting: 'Creating …',
      submit: 'Start league →',
    },
    joinForm: {
      heading: 'Join a league',
      codeLabel: 'League code (6 characters)',
      codePlaceholder: 'WOLF42',
      cancel: 'Cancel',
      submitting: 'Checking …',
      submit: 'Join →',
    },
  },
} satisfies LigaDict
