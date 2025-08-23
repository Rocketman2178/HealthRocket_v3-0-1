export interface TestUser {
  email: string;
  password: string;
  name: string;
  role: 'user' | 'admin';
  id?: string;
}

export const TEST_USERS: TestUser[] = [
  { 
    email: 'test1@healthrocket.app', 
    password: 'TestUser123!', 
    name: 'Test User 1', 
    role: 'user' 
  },
  { 
    email: 'test2@healthrocket.app', 
    password: 'TestUser123!', 
    name: 'Test User 2', 
    role: 'user' 
  },
  { 
    email: 'test3@healthrocket.app', 
    password: 'TestUser123!', 
    name: 'Test User 3', 
    role: 'user' 
  },
  { 
    email: 'admin@healthrocket.app', 
    password: 'AdminTest123!', 
    name: 'Admin User', 
    role: 'admin' 
  },
  { 
    email: 'poweruser@healthrocket.app', 
    password: 'PowerUser123!', 
    name: 'Power User', 
    role: 'user' 
  },
];

export const getTestUserByEmail = (email: string): TestUser | undefined => {
  return TEST_USERS.find(user => user.email === email);
};

export const getTestUsersByRole = (role: 'user' | 'admin'): TestUser[] => {
  return TEST_USERS.filter(user => user.role === role);
};