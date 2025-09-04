import { User } from './user.service';

describe('User', () => {
  let user: User;

  beforeEach(() => {
    // For an interface, just create a sample object
    user = { id: '1', name: 'Test', age: 30, contact: '1234567890' };
  });

  it('should be created', () => {
    expect(user).toBeTruthy();
  });
});
