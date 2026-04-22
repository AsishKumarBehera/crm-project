import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private API_URL = 'http://localhost:5000/api/user';

  constructor(private http: HttpClient) {}

  getProfile() {
    return this.http.get(`${this.API_URL}/getProfile`, { withCredentials: true });
  }

  updateProfile(data: any) {
    return this.http.put(`${this.API_URL}/updateProfile`, data, { withCredentials: true });
  }

  getUsers(){
     return this.http.get(`${this.API_URL}/getUsers`,{ withCredentials: true });
  }


}
