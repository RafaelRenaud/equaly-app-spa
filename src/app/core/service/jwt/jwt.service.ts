import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { JWT } from '../../model/jwt/jwt.model';

@Injectable({
  providedIn: 'root'
})
export class JwtService {

  decode(token: string): JWT{
    const jwtPayload: JWT = jwtDecode(token);
    return jwtPayload;
  }
}
