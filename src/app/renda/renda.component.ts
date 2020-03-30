import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, Validators, NgForm, FormBuilder, FormControl } from '@angular/forms';
import { Record } from '../record';
import { Categorie } from '../categorie';
import { Subject } from 'rxjs';
import { RecordService } from '../record.service';
import { CategorieService } from '../categorie.service';
import { MatSnackBar } from '@angular/material';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-renda',
  templateUrl: './renda.component.html',
  styleUrls: ['./renda.component.css']
})
export class RendaComponent implements OnInit {

  recordForm: FormGroup = this.fb.group({
    _id: [null],
    name: ['', [Validators.required]],
    value: ['', [Validators.required, Validators.min(0)]],
    type: ['', [Validators.required]],
    charge: this.fb.group({
      typeCharge: ['', [Validators.required]],
      parcels: [{ value: '', disabled: true }, [Validators.required]]
    }),
    month: ['', [Validators.required]],
    categorie: ['', [Validators.required]]
  })

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
  ) { }

  ngOnInit() {
    this.recordService.get()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((recs) => {
        this.records = recs
        console.log(this.records)
      });
    this.categorieService.get()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((cats) => {
        // console.log(cats);
        this.categories = cats
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
  }

  onChange(e) {
    console.log(e.value)
    if (e.value === "parcels") {
      this.recordForm.controls['charge'].get('parcels').enable()
    } else {
      this.recordForm.controls['charge'].get('parcels').disable();
    }
  }

  save() {
    if (this.recordForm.invalid) {
      this.recordForm.touched
    }
    else {
      let data = this.recordForm.value;
      if (data._id != null) {
        console.log(data);
        this.recordService.update(data)
          .subscribe(
            (r) => this.notify("Updated!")
          )
      }
      else {
        console.log(data)
        this.recordService.add(data)
          .subscribe(
            (r) => {
              this.notify("Inserted!!")
              console.log(r);
              console.log(this.records)
            }
          );
      }
      this.form.resetForm();
    }


  }

  delete(r: Record) {
    this.recordService.del(r)
      .subscribe(
        () => this.notify("Deleted!"),
        (err) => console.log(err)
      )
  }

  edit(r: Record) {
    if (!r.charge.parcels) {
      r.charge.parcels = null
      this.recordForm.controls.charge.get('parcels').disable()
    } else {
      this.recordForm.controls.charge.get('parcels').enable()
    }
    this.recordForm.setValue(r);
  }

  notify(msg: string) {
    this.snackbar.open(msg, "OK", { duration: 3000 });
  }

}
