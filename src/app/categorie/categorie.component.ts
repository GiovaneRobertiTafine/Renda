import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, NgForm } from '@angular/forms';
import { Categorie } from '../model/categorie';
import { Subject } from 'rxjs';
import { CategorieService } from '../service/categorie.service';
import { MatSnackBar } from '@angular/material';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-categorie',
    templateUrl: './categorie.component.html',
    styleUrls: ['./categorie.component.css'],
})
export class CategorieComponent implements OnInit {
    categoriaForm: FormGroup = this.fb.group({
        _id: [null],
        name: ['', [Validators.required]],
    });

    categories: Categorie[] = [];
    private unsubscribe$: Subject<any> = new Subject();
    catEdit: Categorie = null;

    @ViewChild('form', { static: false }) form: NgForm;

    constructor(private fb: FormBuilder, private categorieService: CategorieService, private snackBar: MatSnackBar) {}

    ngOnInit() {
        this.categorieService
            .get()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((cats) => {
                this.categories = cats;
            });
    }

    save() {
        if (this.categoriaForm.invalid) {
            this.categoriaForm.touched;
        } else {
            if (this.catEdit) {
                this.categorieService.update({ name: this.categoriaForm.value.name, _id: this.catEdit._id }).subscribe(
                    (cat) => {
                        this.notify('Update!');
                        this.form.resetForm();
                        this.catEdit = null;
                    },
                    (err) => {
                        this.notify('Error');
                        console.log(err);
                        this.form.resetForm();
                        this.catEdit = null;
                    }
                );
            } else {
                this.categorieService.add({ name: this.categoriaForm.value.name }).subscribe(
                    (cat) => {
                        this.notify('Saved');
                        this.form.resetForm();
                    },
                    (err) => console.error(err)
                );
            }
        }
    }

    delete(cat: Categorie) {
        this.categorieService.del(cat).subscribe(
            () => this.notify('Removed!'),
            (err) => this.notify(err.error.msg)
        );
    }

    edit(cat: Categorie) {
        this.categoriaForm.setValue(cat);
        this.catEdit = cat;
    }

    cancel() {
        this.form.resetForm();
        this.catEdit = null;
    }

    notify(msg: string) {
        this.snackBar.open(msg, 'OK', { duration: 3000 });
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
    }
}
