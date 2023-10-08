import { CheckPermissionsMiddleware } from './check-permissions.middleware';

describe('CheckPermissionsMiddleware', () => {
  it('should be defined', () => {
    expect(new CheckPermissionsMiddleware()).toBeDefined();
  });
});
