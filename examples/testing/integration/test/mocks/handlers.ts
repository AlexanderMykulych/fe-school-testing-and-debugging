import { http, HttpResponse } from 'msw'

// Типи для API
export interface User {
  id: number
  name: string
  email: string
  active: boolean
}

export interface CreateUserRequest {
  name: string
  email: string
}

// Mock обробники для різних API ендпоінтів
export const handlers = [
  // GET /api/users - отримати список користувачів
  http.get('/api/users', () => {
    return HttpResponse.json([
      { id: 1, name: 'Іван Петренко', email: 'ivan@example.com', active: true },
      { id: 2, name: 'Марія Коваленко', email: 'maria@example.com', active: true },
      { id: 3, name: 'Олексій Сидоренко', email: 'oleksiy@example.com', active: false }
    ] as User[])
  }),

  // GET /api/users/:id - отримати конкретного користувача
  http.get('/api/users/:id', ({ params }) => {
    const id = parseInt(params.id as string)
    
    if (id === 999) {
      return new HttpResponse(null, { status: 404 })
    }
    
    return HttpResponse.json({
      id,
      name: `Користувач ${id}`,
      email: `user${id}@example.com`,
      active: true
    } as User)
  }),

  // POST /api/users - створити користувача
  http.post('/api/users', async ({ request }) => {
    const userData = await request.json() as CreateUserRequest
    
    // Імітуємо валідацію
    if (!userData.name || !userData.email) {
      return HttpResponse.json(
        { error: 'Name та email є обов\'язковими' },
        { status: 400 }
      )
    }
    
    return HttpResponse.json({
      id: Math.floor(Math.random() * 1000),
      ...userData,
      active: true
    } as User, { status: 201 })
  }),

  // PUT /api/users/:id - оновити користувача
  http.put('/api/users/:id', async ({ params, request }) => {
    const id = parseInt(params.id as string)
    const userData = await request.json() as Partial<User>
    
    return HttpResponse.json({
      id,
      ...userData
    } as User)
  }),

  // DELETE /api/users/:id - видалити користувача
  http.delete('/api/users/:id', ({ params }) => {
    const id = parseInt(params.id as string)
    
    if (id === 999) {
      return new HttpResponse(null, { status: 404 })
    }
    
    return new HttpResponse(null, { status: 204 })
  }),

  // Імітація повільного API
  http.get('/api/slow', async () => {
    await new Promise(resolve => setTimeout(resolve, 2000))
    return HttpResponse.json({ message: 'Повільна відповідь' })
  }),

  // Імітація серверної помилки
  http.get('/api/error', () => {
    return new HttpResponse(null, { status: 500 })
  })
] 