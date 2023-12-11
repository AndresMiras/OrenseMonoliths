import { MonolithsComponent } from './monoliths.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MonolithsRoutingModule } from './monoliths-routing.module';
import { OlMapComponent } from '../../../shared/components/ol-map/ol-map.component';
import { DescriptionComponent } from './description/description.component';
import { ConceptMapComponent } from './concept-map/concept-map.component';

@NgModule({
  declarations: [MonolithsComponent, ConceptMapComponent],
  imports: [CommonModule, MonolithsRoutingModule, OlMapComponent, DescriptionComponent],
})
export class MonolithsModule {}
