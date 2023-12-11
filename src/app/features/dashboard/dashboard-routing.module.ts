import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { NgModule } from '@angular/core';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'monoliths', // Redirect by default
    pathMatch: 'full',
  },
  {
    path: '',
    component: DashboardComponent,
    children: [
      {
        path: 'monoliths',
        loadChildren: () => import('./monoliths/monoliths.module').then((m) => m.MonolithsModule),
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule {}


