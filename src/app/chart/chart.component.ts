import { Component, OnInit, OnDestroy } from '@angular/core';
import { Record } from '../model/record';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { RecordService } from '../service/record.service';
import { SharedService } from '../service/shared.service';
import { Categorie } from '../model/categorie';

@Component({
    selector: 'app-chart',
    templateUrl: './chart.component.html',
    styleUrls: ['./chart.component.css'],
})
export class ChartComponent implements OnInit, OnDestroy {
    public options;
    public reloadChart: boolean = false;

    records: Record[] = [];
    categories: Categorie[] = [];

    months: String[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dez'];

    public totalReceita: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    public totalDespesa: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    public rendaMensal: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    public rendaAcumulativa: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    private unsubscribe$: Subject<any> = new Subject<any>();

    constructor(private recordService: RecordService, private sharedService: SharedService) {
        this.sharedService.changeEmitted$.subscribe((r) => {
            this.reloadChart = false;
            this.totalPerMonth();
        });
    }

    ngOnInit() {
        this.recordService
            .get()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(
                (recs) => {
                    this.records = recs;
                    this.reloadChart = true;
                },
                (err) => err,
                () => {
                    this.totalPerMonth();
                }
            );

        // for (let i = 0; i < 100; i++) {
        //   xAxisData.push('category' + i);
        //   this.despesa.push(((i * 5 - 10) + i + 6) * 50);
        //   this.renda.push((i  * 500)/6);
        // }
    }

    totalPerMonth() {
        this.totalReceita.map((res, i) => (this.totalReceita[i] = 0));
        this.totalDespesa.map((res, i) => (this.totalDespesa[i] = 0));
        this.rendaMensal.map((res, i) => (this.rendaMensal[i] = 0));
        this.rendaAcumulativa.map((res, i) => (this.rendaAcumulativa[i] = 0));

        const typeCharge = {
            receita: this.totalReceita,
            despesa: this.totalDespesa,
            unic(res, mes) {
                res.type === 'renda' ? (this.receita[mes] += res.value) : (this.despesa[mes] += res.value);
            },
            fix(res, mes) {
                if (res.type === 'renda') {
                    for (let i = mes; i < this.receita.length; i++) {
                        this.receita[i] += res.value;
                    }
                } else {
                    for (let i = mes; i < this.despesa.length; i++) {
                        this.despesa[i] += res.value;
                    }
                }
            },
            parcels(res, mes) {
                if (res.type === 'renda') {
                    for (let i = mes; i < mes + res.charge.parcels && i < 12; i++) {
                        this.receita[i] += res.value;
                    }
                } else {
                    for (let i = mes; i < mes + res.charge.parcels && i < 12; i++) {
                        this.despesa[i] += res.value;
                    }
                }
            },
        };

        this.records.map((res, i) => {
            typeCharge[res.charge.typeCharge as string](res, this.searchMonth(res.month));
        });

        this.totalReceita = typeCharge.receita;
        this.totalDespesa = typeCharge.despesa;

        this.totalReceita.map((res, i) => {
            this.rendaMensal[i] = this.totalReceita[i] - this.totalDespesa[i];
            i != 0
                ? (this.rendaAcumulativa[i] = this.rendaMensal[i] + this.rendaAcumulativa[i - 1])
                : (this.rendaAcumulativa[i] = this.rendaMensal[i]);
        });

        this.sharedService.emitIncome(this.rendaMensal, this.rendaAcumulativa);

        this.buildChart();
    }

    buildChart() {
        this.options = {
            legend: {
                data: ['Despesa', 'Receita', 'Renda Mensal', 'Renda Acumulativa'],
                align: 'left',
            },
            tooltip: {},
            xAxis: {
                data: this.months,
                silent: false,
                splitLine: {
                    show: false,
                },
            },
            yAxis: {},
            series: [
                {
                    name: 'Despesa',
                    type: 'bar',
                    data: this.totalDespesa,
                    animationDelay: function (idx) {
                        return idx * 10;
                    },
                },
                {
                    name: 'Receita',
                    type: 'bar',
                    data: this.totalReceita,
                    animationDelay: function (idx) {
                        return idx * 10 + 100;
                    },
                },
                {
                    name: 'Renda Mensal',
                    type: 'line',
                    color: 'green',
                    data: this.rendaMensal,
                    animationDelay: function (idx) {
                        return idx * 10 + 200;
                    },
                },
                {
                    name: 'Renda Acumulativa',
                    type: 'line',
                    color: '#8133ff',
                    data: this.rendaAcumulativa,
                    animationDelay: function (idx) {
                        return idx * 10 + 200;
                    },
                },
            ],
            animationEasing: 'elasticOut',
            animationDelayUpdate: function (idx) {
                return idx * 5;
            },
        };
        this.reloadChart = true;
    }

    searchMonth(rec: String): any {
        let mes: Number = 0;
        this.months.map((mon, i) => {
            if (mon === rec) {
                mes = i;
            }
        });
        return mes;
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
    }
}
