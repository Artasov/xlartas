// core/services/base/jwt.ts
import {jwtDecode} from 'jwt-decode';

export const isTokenExpiringSoon = (token: string | null): boolean => {
    if (!token) return true;
    const decoded: { exp?: number } = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    if (!decoded.exp) return true;
    return decoded.exp < currentTime + 300;
};
