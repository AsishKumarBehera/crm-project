import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NoteService {

  private API_URL = 'http://localhost:5000/api';    

  constructor(private http: HttpClient) {}

  //  ADD NOTE
  addNote(leadId: string, note: string): Observable<any> {
    return this.http.post(
      `${this.API_URL}/notes/addNote/${leadId}`,
      { note },
      { withCredentials: true }
    );
  }

  //  GET NOTES BY LEAD
  getNotes(leadId: string): Observable<any> {
    return this.http.get(
      `${this.API_URL}/notes/getNotesByLead/${leadId}`,
      { withCredentials: true }
    );
  }

  // Note Update

  updateNote(noteId: string, data: any) {
  return this.http.put(`${this.API_URL}/notes/updateNote/${noteId}`, data);
}
  


}