import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'playable',
    pathMatch: 'full',
  },
  {
    path: 'playable',
    loadChildren: () =>
      import('./playable/playable.module').then((m) => m.PlayableModule),
  },
  {
    path: 'edit/:playableType/:id',
    loadChildren: () =>
      import('./editor/editor.module').then((m) => m.EditorModule),
  },
  {
    path: 'create/:playableType',
    loadChildren: () =>
      import('./editor/editor.module').then((m) => m.EditorModule),
    pathMatch: 'full',
  },
  {
    path: 'settings',
    loadChildren: () =>
      import('./settings/settings.module').then((m) => m.SettingsModule),
  },
  {
    path: 'player/:id',
    loadChildren: () =>
      import('./player/player.module').then((m) => m.PlayerModule),
  },
  {
    path: 'report/:playableId',
    loadChildren: () =>
      import('./reports/reports.module').then((m) => m.ReportsModule),
  },
  {
    path: '**',
    redirectTo: 'playable',
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
