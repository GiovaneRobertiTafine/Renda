import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, NgForm } from '@angular/forms';
import { Goal } from '../model/goal';
import { GoalService } from '../service/goal.service';
import { MatSnackBar } from '@angular/material';
import { Subject, Observable } from 'rxjs';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { SharedService } from '../service/shared.service';

@Component({
    selector: 'app-goal',
    templateUrl: './goal.component.html',
    styleUrls: ['./goal.component.css'],
})
export class GoalComponent implements OnInit {
    goalForm: FormGroup = this.fb.group({
        _id: [null],
        name: ['', [Validators.required, Validators.minLength(4)]],
        value: ['', [Validators.required]],
        priority: [null],
        parcelOption: [{ value: '', disabled: true }, [Validators.pattern('[0-9]{1,2}')]],
    });

    checked = false;

    goalEdit: Goal = null;
    alterPriority: boolean = true;

    goals: Goal[] = [];
    goalsRef: Goal[] = [];

    incomeMonth: Array<Goal> = Array();

    months: String[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dez'];

    private unsubscribe$: Subject<any> = new Subject();

    @ViewChild('form', { static: false }) form: NgForm;

    constructor(
        private fb: FormBuilder,
        private goalService: GoalService,
        private snackBar: MatSnackBar,
        private sharedService: SharedService
    ) {}

    ngOnInit() {
        this.goalService.get().subscribe(
            (goal) => (this.goalsRef = this.goals = goal),
            (err) => console.log(err),
            () => {
                this.sharedService.incomeEmitted$.subscribe((income) => {
                    this.incomeMonth = income;
                    this.possibilityBuy(this.goalsRef);
                });
            }
        );
    }

    save() {
        if (this.goalForm.invalid) {
            this.goalForm.touched;
        } else {
            if (this.goalEdit) {
                this.goalService
                    .update({
                        name: this.goalForm.value.name,
                        value: this.goalForm.value.value,
                        _id: this.goalEdit._id,
                    })
                    .subscribe(
                        (cat) => {
                            this.notify('Update!');
                            this.form.resetForm();
                            this.goalEdit = null;
                        },
                        (err) => {
                            this.notify('Error');
                            this.form.resetForm();
                            this.goalEdit = null;
                        },
                        () => this.possibilityBuy(this.goalsRef)
                    );
            } else {
                var length = this.goalsRef.length + 1;
                this.goalService
                    .add({ name: this.goalForm.value.name, value: this.goalForm.value.value, priority: length })
                    .subscribe(
                        (goal) => {
                            this.notify('Saved');
                            this.form.resetForm();
                        },
                        (err) => {
                            this.notify('Error');
                            this.form.resetForm();
                        },
                        () => this.possibilityBuy(this.goalsRef)
                    );
            }
        }
    }

    delete(goal: Goal) {
        this.goalService.del(goal).subscribe(
            () => this.notify('Removed!'),
            (err) => this.notify(err.error.msg),
            () => this.deletePriority()
        );
    }

    edit(goal: Goal) {
        this.goalForm.setValue(goal);
        this.goalEdit = goal;
    }

    notify(msg: string) {
        this.snackBar.open(msg, 'OK', { duration: 3000 });
    }

    drop(event: CdkDragDrop<string[]>) {
        if (!(event.previousIndex === event.currentIndex)) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);

            this.goalsRef = this.goalsRef.map((g, i) => {
                return { ...g, priority: i + 1 };
            });

            this.alterPriority = false;
        }
    }

    alterPrioritySave() {
        this.goalService.priority(this.goalsRef).subscribe(
            (res) => console.log(res),
            (err) => console.log(err),
            () => {
                this.alterPriority = true;
                this.possibilityBuy(this.goalsRef);
            }
        );
    }

    cancelPrioritySave() {
        this.goalsRef = this.goals;
        this.goalsRef.sort((a, b) => a.priority - b.priority);
        this.alterPriority = true;
    }

    deletePriority() {
        this.goalsRef.map((value, i, goal) => {
            this.goalsRef[i].priority = goal[i].priority = i + 1;
        });

        this.alterPrioritySave();
    }

    possibilityBuy(goalsRef: Goal[]) {
        let incomeRef = this.incomeMonth;
        let indexMonth = 0;
        let totalGoals = 0;
        goalsRef.map((goals, i) => {
            goals['possibilityBuy'] = 0;
            for (indexMonth; indexMonth <= incomeRef['incomeMonthly'].length; indexMonth++) {
                if (goals.value <= incomeRef['incomeMonthly'][indexMonth]) {
                    goals['possibilityBuy'] = this.months[indexMonth];
                    indexMonth++;
                    break;
                } else {
                    if (goals.value <= incomeRef['incomeAcumulative'][indexMonth] - totalGoals) {
                        goals['possibilityBuy'] = this.months[indexMonth];
                        totalGoals += goals.value;
                        indexMonth++;
                        break;
                    }
                }
            }
        });
    }

    checkedParcel() {
        if (this.checked) {
            this.goalForm.controls.parcelOption.enable();
        } else {
            this.goalForm.controls.parcelOption.disable();
        }
    }

    log() {
        console.warn(this.incomeMonth);
    }

    get name() {
        return this.goalForm.get('name');
    }
    get value() {
        return this.goalForm.get('value');
    }

    get parcelOption() {
        return this.goalForm.get('parcelOption');
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
    }
}
