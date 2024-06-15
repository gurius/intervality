import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'playable',
    loadChildren: () =>
      import('./playable/playable.module').then((m) => m.PlayableModule),
  },
  {
    path: 'edit',
    loadChildren: () =>
      import('./editor/editor.module').then((m) => m.EditorModule),
  },
  {
    path: 'create',
    loadChildren: () =>
      import('./editor/editor.module').then((m) => m.EditorModule),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
