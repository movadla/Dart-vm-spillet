import type { LegalDict } from '../no/legal'

export const legal = {
  error: {
    title1: 'Something ',
    title2: 'went wrong',
    body: 'An unexpected error occurred. Try again, or go back to the homepage.',
    retry: 'Try again',
    home: 'To the homepage',
  },
  notFound: {
    metaTitle: 'Page not found',
    eyebrow: '404',
    title1: 'Page ',
    title2: 'not found',
    body: 'The link is invalid or the page has been removed.',
    home: 'To the homepage →',
  },
  ogImage: {
    brandLine: 'DART-VM 2026',
    tagline: 'Pick 6 dart players. Follow the tournament. Play against friends.',
  },
  privacy: {
    metaTitle: 'Privacy',
    title: 'Privacy',
    back: '← To the homepage',
    whatWeStore: {
      h: 'What we store',
      p: 'When you sign up for Dart-VM-spillet we store your name, email address, phone number if you provide one, and which dart players you’ve picked.',
    },
    whatWeUseItFor: {
      h: 'What we use it for',
      p: 'Your email address is used to send you a welcome message, daily status updates during the tournament, and a sign-in link (valid for 1 hour) when you ask to change your picks. Your name is shown on the leaderboard and in any private leagues you’re part of. We never sell or share your information with anyone else.',
    },
    cookies: {
      h: 'Cookies',
      intro: 'We only use strictly necessary cookies — no tracking, advertising or analytics cookies, so you don’t need to consent to them:',
      vmAuth: 'vm_auth — confirms who you are when you change your picks or create/join a league. Lasts 2 hours.',
      adminSession: 'admin_session — for the game’s administrator only, grants access to enter match results.',
      vmDemo: 'vm_demo — remembers which phase you’re viewing the demo participant in (only relevant if you’re exploring the demo version of "My page").',
      localStorageNote: 'Your browser also stores the id for your own "My page" locally (localStorage, not a cookie) so you don’t have to sign in again every time — this is never sent to us and stays only in your own browser.',
    },
    howLong: {
      h: 'How long',
      p: 'Your information is stored for as long as the game is running and a reasonable period afterward, unless you ask for it to be deleted sooner.',
    },
    controller: {
      h: 'Data controller',
      placeholder: '[Name/company and address — to be filled in before launch]',
      complaintBefore: 'You have the right to complain to a data protection authority if you believe the handling of your information violates the rules — in Norway to',
      complaintLink: 'Datatilsynet',
      complaintAfter: ', or to the supervisory authority in the country you live in if you reside elsewhere in the EU/EEA.',
    },
    rights: {
      h: 'Your rights',
      p1: 'You can at any time ask to see what information we’ve stored about you, ask for it to be corrected, or ask to be deleted entirely from the game (sign-up, picks and all history). You can also unsubscribe from the daily emails at any time via the unsubscribe link at the bottom of each email.',
      p2Before: 'Send an email to',
      email: 'kontakt@dart-vm-spillet.no',
      p2After: 'to request access, correction or deletion.',
    },
  },
} satisfies LegalDict
