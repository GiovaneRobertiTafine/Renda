import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, Validators, NgForm, FormBuilder } from '@angular/forms';
import { Record } from '../model/record';
import { Categorie } from '../model/categorie';
import { Subject } from 'rxjs';
import { RecordService } from '../service/record.service';
import { CategorieService } from '../service/categorie.service';
import { MatSnackBar } from '@angular/material';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-record',
    templateUrl: './record.component.html',
    styleUrls: ['./record.component.css'],
})
export class RecordComponent implements OnInit {
    recordForm: FormGroup = this.fb.group({
        _id: [null],
        name: ['', [Validators.required]],
        value: ['', [Validators.required, Validators.min(0)]],
        type: ['', [Validators.required]],
        charge: this.fb.group({
            typeCharge: ['', [Validators.required]],
            parcels: [{ value: '', disabled: true }, [Validators.required]],
        }),
        month: ['', [Validators.required]],
        categorie: ['', [Validators.required]],
    });

    @ViewChild('form', { static: false }) form: NgForm;

    records: Record[] = [];
    categories: Categorie[] = [];

    months: String[] = ['Jan', 'Feb', 'May', 'Apr', 'Mar', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dez'];

    private unsubscribe$: Subject<any> = new Subject<any>();

    constructor(
        private recordService: RecordService,
        private fb: FormBuilder,
        private categorieService: CategorieService,
        private snackbar: MatSnackBar
    ) {}

    ngOnInit() {
        this.recordService
            .get()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((recs) => {
                this.records = recs;
            });
        this.categorieService
            .get()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((cats) => {
                this.categories = cats;
            });
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
    }

    onChange(e) {
        if (e.value === 'parcels') {
            this.recordForm.controls['charge'].get('parcels').enable();
        } else {
            this.recordForm.controls['charge'].get('parcels').disable();
        }
    }

    save() {
        if (this.recordForm.invalid) {
            this.recordForm.touched;
        } else {
            let data = this.recordForm.value;
            if (data._id != null) {
                this.recordService.update(data).subscribe((r) => this.notify('Updated!'));
            } else {
                this.recordService.add(data).subscribe((r) => {
                    this.notify('Inserted!!');
                });
            }
            this.form.resetForm();
        }
    }

    delete(r: Record) {
        this.recordService.del(r).subscribe(
            () => this.notify('Deleted!'),
            (err) => console.log(err)
        );
    }

    edit(r: Record) {
        if (!r.charge.parcels) {
            r.charge.parcels = null;
            this.recordForm.controls.charge.get('parcels').disable();
        } else {
            this.recordForm.controls.charge.get('parcels').enable();
        }
        this.recordForm.setValue(r);
    }

    notify(msg: string) {
        this.snackbar.open(msg, 'OK', { duration: 3000 });
    }
}
