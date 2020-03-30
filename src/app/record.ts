import { Categorie } from './categorie';

export interface Record {
    name: String;
    categorie: Categorie | string;
    value: number;
    type: string;
    month: string;
    charge: { typeCharge: String, parcels: number };
    _id?: string;
}