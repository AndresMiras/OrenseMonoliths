import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { MonolithsComponent } from './monoliths.component';

const routes: Routes = [
  {
    path: '',
    component: MonolithsComponent,
    children: [
      {
        path: 'description/:id',
        loadComponent: () => import('./description/description.component').then((m) => m.DescriptionComponent),
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MonolithsRoutingModule {}
