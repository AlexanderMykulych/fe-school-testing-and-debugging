import { setupServer } from 'msw/node'
import { handlers } from './handlers'

// Налаштування MSW сервера з усіма обробниками
export const server = setupServer(...handlers) 