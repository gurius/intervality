import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RouterLinkActive } from '@angular/router';
import { ServiceWorkerModule } from '@angular/service-worker';
import { SharedModule } from './shared/shared.module';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import {
  faCoffee,
  faMugHot,
  faCircleStop,
  faStopwatch,
  faChevronCircleLeft,
  faChevronCircleRight,
  faCirclePause,
  faCirclePlay,
  faRobot,
  faFilter,
  faXmark,
  faSearch,
  faHourglass,
  faBars,
  faEllipsisVertical,
  faPlay,
  faListUl,
  faGear,
  faHourglassStart,
  faPlus,
  faRectangleXmark,
  faCheck,
} from '@fortawesome/free-solid-svg-icons';
import { faWebAwesome } from '@fortawesome/free-brands-svg-icons';
import { faPenToSquare, faTrashCan } from '@fortawesome/free-regular-svg-icons';
import { superSet } from './icons';
@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RouterLinkActive,
    SharedModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(private library: FaIconLibrary) {
    library.addIcons(
      faCoffee,
      faMugHot,
      faCircleStop,
      faStopwatch,
      faChevronCircleLeft,
      faChevronCircleRight,
      faCirclePause,
      faCirclePlay,
      faRobot,
      faFilter,
      faXmark,
      faSearch,
      faHourglass,
      faBars,
      faWebAwesome,
      faEllipsisVertical,
      faPlay,
      faListUl,
      faGear,
      faBars,
      faHourglassStart,
      faPlus,
      faRectangleXmark,
      faCheck,
      faPenToSquare,
      faTrashCan,
      superSet,
    );
  }
}
