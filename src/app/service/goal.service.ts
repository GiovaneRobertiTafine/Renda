import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Goal } from '../model/goal';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { tap, delay } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class GoalService {
    readonly url = 'http://localhost:3000/goals';

    public goalSubject$: BehaviorSubject<Goal[]> = new BehaviorSubject<Goal[]>(null);
    private loaded: boolean = false;

    constructor(private http: HttpClient) {}

    get(): Observable<Goal[]> {
        if (!this.loaded) {
            this.http
                .get<Goal[]>(this.url)
                .pipe(tap((goals) => console.log(goals)))
                .subscribe(this.goalSubject$);
            this.loaded = true;
        }
        return this.goalSubject$.asObservable();
    }

    add(g: Goal): Observable<Goal> {
        return this.http.post<Goal>(this.url, g).pipe(
            tap((cat: Goal) => {
                this.goalSubject$.getValue().push(cat);
            })
        );
    }

    del(goal: Goal): Observable<any> {
        return this.http.delete(`${this.url}/${goal._id}`).pipe(
            tap(() => {
                let goals = this.goalSubject$.getValue();
                let i = goals.findIndex((g) => g._id === goal._id);
                if (i >= 0) goals.splice(i, 1);
            })
        );
    }

    update(goal: Goal): Observable<Goal> {
        return this.http.patch<Goal>(`${this.url}/${goal._id}`, goal).pipe(
            tap((g) => {
                let goals = this.goalSubject$.getValue();
                let i = goals.findIndex((g) => g._id === goal._id);
                if (i >= 0) {
                    goals[i].name = g.name;
                    goals[i].value = g.value;
                }
            })
        );
    }

    priority(goal: Goal[]): Observable<Goal> {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            }),
        };

        return this.http.patch<any>(`${this.url}`, JSON.stringify(goal), httpOptions).pipe(
            tap(() => {
                // let goals = this.goalSubject$.getValue();
                // let i = goals.findIndex(g => g._id === g._id);
                // if (i >= 0)
                //   goals[i].name = g.name;
                // goals[i].value = g.value;
            })
        );
    }
}
