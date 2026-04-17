import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private API_URL = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  getDashboard() {
    return this.http.get(`${this.API_URL}/dashboard`, { withCredentials: true });
  }

  getDashboardData() {
    return this.http.get(`${this.API_URL}/dashboard/dashboard-data`, { withCredentials: true });
  }
}