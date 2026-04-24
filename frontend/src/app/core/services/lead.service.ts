// lead.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({ providedIn: 'root' })
export class LeadService {
  private API_URL = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}


  getLeads(params: any = {}) {
    return this.http.get(`${this.API_URL}/leads/getleads`, {
      withCredentials: true,
      params,
    });
  }
// getleadby Id
  getLeadById(id: string) {
  return this.http.get(`${this.API_URL}/leads/getLeadById/${id}`, {
    withCredentials: true,
    headers: { 'Cache-Control': 'no-cache' }
  });
}

  createLead(data: any) {
    return this.http.post(`${this.API_URL}/leads/createlead`, data, {
      withCredentials: true
        });
  }
  updateLead(id: string, data: any) {
    return this.http.put(`${this.API_URL}/leads/updatelead/${id}`, data, {
      withCredentials: true
        });
  }

  uploadCsv(formData: FormData): Observable<any> {
    return this.http.post(`${this.API_URL}/upload`, formData);
  }



}

