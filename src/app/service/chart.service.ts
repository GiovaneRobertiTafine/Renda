import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Record } from '../model/record';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class ChartService {
    readonly url = 'http://localhost:3000/records';
    private resourcesSubject$: BehaviorSubject<Record[]> = new BehaviorSubject<Record[]>(null);
    private loaded: boolean = false;

    constructor(private http: HttpClient) {}

    get(): Observable<Record[]> {
        if (!this.loaded) {
            this.http
                .get<Record[]>(this.url)
                .pipe(tap((rec) => console.log(rec)))
                .subscribe(this.resourcesSubject$);
            this.loaded = true;
        }
        return this.resourcesSubject$.asObservable();
    }
}
