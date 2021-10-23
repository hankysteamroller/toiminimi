import { pipe } from 'fp-ts/function';

import { BookkeepingRecord } from '../domain/types';

interface BookkeepingRecordDiskView {
  Päivämäärä: string;
  Selite: string;
  Tyyppi: string;
  Luokka: string;
  Veroton: string;
  Alv: string;
}

const serializeRecord = (
  record: BookkeepingRecord,
): BookkeepingRecordDiskView => ({
  Päivämäärä: record.date.toFormat('d.M.yyyy'), // '1.3.2021',
  Selite: record.description,
  Tyyppi: record.type === 'EXPENSE' ? 'Kulu' : 'Tulo',
  Luokka: `${record.account.group} ${record.account.name}`,
  Veroton: Math.abs(record.nonTaxAmount).toFixed(2).replace('.', ','),
  Alv: record.taxPercentage.toString(),
});

export const serialize = (input: BookkeepingRecord) =>
  pipe(input, serializeRecord, (r) => [
    r.Päivämäärä,
    r.Selite,
    r.Tyyppi,
    r.Tyyppi,
    r.Luokka,
    r.Veroton,
    r.Alv,
  ]);
