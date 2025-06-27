import { Injectable } from '@angular/core';
import { JWT } from '../model/jwt.model';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class JwtService {

  decode(token: string): JWT{
    const jwtPayload: JWT = jwtDecode(token);
    return jwtPayload;
  }
}
