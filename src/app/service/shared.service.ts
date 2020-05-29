import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class SharedService {
    // Observable string sources
    private emitChangeSource = new Subject<any>();
    // Observable string streams
    changeEmitted$ = this.emitChangeSource.asObservable();

    private emitIncomeSource = new Subject<any>();
    incomeEmitted$ = this.emitIncomeSource.asObservable();

    constructor() {}

    // Service message commands
    emitChange(change: any) {
        this.emitChangeSource.next(change);
    }

    emitIncome(incomeMonthly: any, incomeAcumulative: any) {
        this.emitIncomeSource.next({ incomeMonthly, incomeAcumulative });
    }
}
