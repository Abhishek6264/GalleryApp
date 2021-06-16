import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EditOffersPage } from './edit-offers.page';

const routes: Routes = [
  {
    path: '',
    component: EditOffersPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditOffersPageRoutingModule {}
