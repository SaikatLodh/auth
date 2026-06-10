import { AuthenticationGuard } from './authentication.guard';

describe('AuthenticationGuard', () => {
    it('should be defined', () => {
        expect(new AuthenticationGuard({} as any, {} as any)).toBeDefined();
    });
});