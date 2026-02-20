import { HttpBackend, HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { ViaCepAddress } from '../../model/address/ViaCepAddress.model';

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  private http = inject(HttpClient);
  private httpBackend = inject(HttpBackend);
  
  constructor() { 
    this.http = new HttpClient(this.httpBackend);
  }

  getAddressByCep(cep: string): Observable<ViaCepAddress> {    
    return this.http.get<ViaCepAddress>(
      `https://viacep.com.br/ws/${cep}/json`
    );
  }
}