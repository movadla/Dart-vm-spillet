import type { ErrorsDict } from '../no/errors'

export const errors = {
  finn: {
    invalidEmail: 'Invalid email',
    dbNotSetUp: 'The database is not set up yet',
    tooManyAttempts: 'Too many attempts. Wait an hour and try again.',
    notFound: 'No participant found with that email',
  },
} satisfies ErrorsDict
