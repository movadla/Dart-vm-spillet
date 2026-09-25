import type { FinnDict } from '../no/finn'

export const finn = {
  eyebrow: 'Already signed up?',
  title: { prefix: 'Find', highlight: 'my page' },
  intro: 'Enter the email you registered with and we’ll find your team.',
  emailLabel: 'Email',
  notFound: {
    title: 'No participant found with that email',
    closedBody: 'Check the spelling and try again. Sign-up is closed.',
    openBodyBefore: 'Check the spelling, or',
    openBodyLink: 'sign up here',
  },
  genericError: 'Something went wrong. Try again.',
  submit: { loading: 'Searching …', idle: 'Find my page →' },
  notSignedUpBefore: 'Not signed up yet?',
  notSignedUpLink: 'Pick your team →',
  demoHint: (email) => `Try the demo participant (${email}) →`,
} satisfies FinnDict
