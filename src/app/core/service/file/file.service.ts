import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { SessionService } from '../session/session.service';
import { Observable } from 'rxjs';
import { CreatedFileResponse } from '../../model/file/file-create-response.model';
import { FilesResponse } from '../../model/file/files-response.model';
import { FileResponse } from '../../model/file/file-response.model';
import { FileAccessRequest, FileAccessResponse } from '../../model/file/file-access.model';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  private http = inject(HttpClient);

  private readonly endpoint = `${environment.api.core}/files`;

  constructor(private session: SessionService) { }

  getFiles(
    subjectId: string,
    subjectType: 'OCCUR' | 'RNC',
    page?: number,
    size?: number
  ): Observable<FilesResponse> {
    const headers = this.getDefaultHeaders(subjectType, subjectId);

    let params = new HttpParams();
    if (page !== undefined) params = params.set('page', page.toString());
    if (size !== undefined) params = params.set('size', size.toString());

    return this.http.get<FilesResponse>(this.endpoint, {
      headers,
      params
    });
  }

  createFile(
    subjectId: string,
    subjectType: 'OCCUR' | 'RNC',
    blob: Blob,
    blobName: string
  ): Observable<CreatedFileResponse> {
    const headers = this.getDefaultHeaders(subjectType, subjectId);

    const formData = new FormData();
    formData.append('file', blob, blobName);

    return this.http.post<CreatedFileResponse>(
      this.endpoint,
      formData,
      { headers }
    );
  }

  deleteFiles(
    subjectId: string,
    subjectType: 'OCCUR' | 'RNC'
  ): Observable<void> {
    const headers = this.getDefaultHeaders(subjectType, subjectId);

    return this.http.delete<void>(this.endpoint, { headers });
  }

  getFile(
    fileId: number,
    subjectId: string,
    subjectType: 'OCCUR' | 'RNC'
  ): Observable<FileResponse> {
    const headers = this.getDefaultHeaders(subjectType, subjectId);
    const url = `${this.endpoint}/${fileId}`;

    return this.http.get<FileResponse>(url, { headers });
  }

  getFileAccess(
    fileId: number,
    subjectId: string,
    subjectType: 'OCCUR' | 'RNC',
    hash: string
  ): Observable<FileAccessResponse> {
    const headers = this.getDefaultHeaders(subjectType, subjectId);
    const url = `${this.endpoint}/${fileId}/access`;

    const body: FileAccessRequest = { hash };

    return this.http.post<FileAccessResponse>(url, body, { headers });
  }

  private getDefaultHeaders(
    subjectType: 'OCCUR' | 'RNC',
    subjectId: string
  ): HttpHeaders {
    return new HttpHeaders({
      'X-Application-Key': this.session.getItem('clientKey')!,
      'Authorization': this.session.getItem('Authorization')!,
      'x-equaly-subject-type': subjectType,
      'x-equaly-subject-id': subjectId
    });
  }


}
