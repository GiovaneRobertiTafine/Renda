import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Categorie } from './categorie';
import { HttpClient } from '@angular/common/http';
import { tap, delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CategorieService {

  readonly url = 'http://localhost:3000/categories';

  private categorieSubject$: BehaviorSubject<Categorie[]> = new BehaviorSubject<Categorie[]>(null);
  private loaded: boolean = false;

  constructor(private http: HttpClient) { }

  get(): Observable<Categorie[]> {
    if(!this.loaded) {
      this.http.get<Categorie[]>(this.url)
        .pipe(
          tap((cats) => console.log(cats)),
          delay(1000)
        )
        .subscribe(this.categorieSubject$);
      this.loaded = true;
    }
    return this.categorieSubject$.asObservable();
  }

  add(c: Categorie): Observable<Categorie> {
    console.log(c);
    return this.http.post<Categorie>(this.url, c)
      .pipe(
        tap((cat: Categorie) => {
          console.log(cat);
          this.categorieSubject$.getValue().push(cat)
          
        })
      )
  }

  del(cat: Categorie): Observable<any> {
    return this.http.delete(`${this.url}/${cat._id}`)
      .pipe(
        tap(() => {
          let categories = this.categorieSubject$.getValue();
          let i = categories.findIndex(c => c._id === cat._id);
          if (i >= 0)
            categories.splice(i, 1);
        })
      )
  }

  update(cat: Categorie): Observable<Categorie> {
    return this.http.patch<Categorie>(`${this.url}/${cat._id}`, cat)
      .pipe(
        tap((c) => {
          let categories = this.categorieSubject$.getValue();
          let i = categories.findIndex(c => c._id === cat._id);
          if (i >= 0)
            categories[i].name = c.name;
        })
      )
  }
}
