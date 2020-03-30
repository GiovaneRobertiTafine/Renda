import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, Subject } from 'rxjs';
import { Record } from './record';
import { HttpClient } from '@angular/common/http';
import { CategorieService } from './categorie.service';
import { map, tap, filter } from 'rxjs/operators';
import { Categorie } from './categorie';
import { SharedService } from './shared.service';

@Injectable({
  providedIn: 'root'
})
export class RecordService {

  readonly url = 'http://localhost:3000/records';
  private resourcesSubject$: BehaviorSubject<Record[]> = new BehaviorSubject<Record[]>(null);
  private loaded: boolean = false;

  constructor(private http: HttpClient, private categorieService: CategorieService, private sharedService: SharedService) { }

  get(): Observable<Record[]> {
    if (!this.loaded) {
      combineLatest(
        this.http.get<Record[]>(this.url),
        this.categorieService.get()
      )
        .pipe(
          tap(([records, categories]) => console.log(records, categories)),
          filter(([records, categories]) => records != null && categories != null),
          map(([records, categories]) => {
            for (let r of records) {
              let ids = r.categorie as string;
              r.categorie = categories.find(cat => cat._id == ids);
              // console.log(r.categorie);
            }
            console.log(records);

            return records;

          })
        )
        .subscribe(this.resourcesSubject$);

      this.loaded = true;
    }
    console.log(this.resourcesSubject$)

    return this.resourcesSubject$.asObservable();
  }

  add(rec: Record): Observable<Record> {
    console.log(rec);
    let categorie = rec.categorie as Categorie
    return this.http.post<Record>(this.url, { ...rec, categorie })
      .pipe(
        tap((r) => {
          console.log(r)
          this.resourcesSubject$.getValue()
            .push({ ...rec, _id: r._id })
          console.log(this.resourcesSubject$)
          this.sharedService.emitChange(r)
        })

      )

  }

  del(rec: Record): Observable<any> {
    return this.http.delete(`${this.url}/${rec._id}`)
      .pipe(
        tap(() => {
          let records = this.resourcesSubject$.getValue();
          let i = records.findIndex(r => r._id === rec._id);
          if (i >= 0)
            records.splice(i, 1);
          this.sharedService.emitChange('delete')
          this.sharedService.emitChange('')
        })

      )
  }

  update(rec: Record): Observable<any> {
    console.log(rec);
    let categorie = rec.categorie as Categorie
    return this.http.patch<Record>(`${this.url}/${rec._id}`, { ...rec, categorie })
      .pipe(
        tap(() => {
          let records = this.resourcesSubject$.getValue();
          let i = records.findIndex(r => r._id === rec._id);
          if (i >= 0) {
            records[i] = rec;
          }
          this.sharedService.emitChange('')
        })
      )

  }
}
