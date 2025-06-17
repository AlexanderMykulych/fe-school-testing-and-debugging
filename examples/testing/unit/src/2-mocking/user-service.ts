import axios from 'axios';

export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
}

export interface CreateUserRequest {
  name: string;
  email: string;
}

export class ApiClient {
  constructor(public baseUrl: string) { }

  async get<T>(endpoint: string): Promise<T> {
    const response = await axios.get(`${this.baseUrl}${endpoint}`);
    return response.data;
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    const response = await axios.post(`${this.baseUrl}${endpoint}`, data);
    return response.data;
  }
}

export class UserService {
  constructor(private apiClient: ApiClient) {}

  async getUser(id: number): Promise<User> {
    return this.apiClient.get<User>(`/users/${id}`);
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    if (!userData.name || !userData.email) {
      throw new Error('Name and email are required');
    }

    if (!this.isValidEmail(userData.email)) {
      throw new Error('Invalid email format');
    }

    const newUser = await this.apiClient.post<User>('/users', userData);
    return {
      ...newUser,
      createdAt: new Date()
    };
  }

  async getAllUsers(): Promise<User[]> {
    return this.apiClient.get<User[]>('/users');
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
} 