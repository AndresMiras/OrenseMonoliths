import { Point } from 'ol/geom';
import { MonolithFeature } from './monoliths.interfaces';
import { Subject } from 'rxjs';

// Create point models
export const monolithFeatures: MonolithFeature[] = [
  new MonolithFeature(
    new Point([-7.758292, 42.197549]),
    {
      author: 'Agustín Ibarrola',
      name: 'Pedras e árbores',
      n: 24,
      technique: 'Pintura acrílica sobre granito',
      dimension: [228, 190, 100],
      units: 'cm',
      vulnerability: 'Fráxil',
      material: 'Granito',
      rockPrintType: 'Capa pictórica',
      modelType: 'glb'
    },
    24
  ),
  new MonolithFeature(
    new Point([-7.75814, 42.19803]),
    {
      author: 'Agustín Ibarrola',
      name: 'Pedras e árbores',
      n: 34,
      technique: 'Pintura acrílica sobre pedra (pizarra)',
      dimension: [193, 141, 123],
      units: 'cm',
      vulnerability: 'Regular',
      material: 'Pizarra',
      rockPrintType: 'Soporte y policromía',
      modelType: 'glb'
    },
    34
  ),
  new MonolithFeature(
    new Point([-7.7581048, 42.1980679]),
    {
      author: 'Agustín Ibarrola',
      name: 'Pedras e árbores',
      n: 35,
      technique: 'Pintura sintética sobre pizarra',
      dimension: [140, 162, 89],
      units: 'cm',
      vulnerability: 'Regular',
      material: 'Granito',
      rockPrintType: 'Soporte e capa de cor',
      modelType: 'glb',
    },
    35
  ),
];

export const monolithId$ = new Subject<number>();
