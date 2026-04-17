import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LeadService {
  private API_URL = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  getLeads(filters: any = {}) {
    return this.http.get(`${this.API_URL}/leads/getleads`, { withCredentials: true, params: filters });
  }

  createLead(data: any) {
    return this.http.post(`${this.API_URL}/leads/createlead`, data, { withCredentials: true });
  }
}