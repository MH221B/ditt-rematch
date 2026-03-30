import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PluginViewportComponent } from './plugin-viewport.component';

describe('PluginViewportComponent', () => {
  let component: PluginViewportComponent;
  let fixture: ComponentFixture<PluginViewportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PluginViewportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PluginViewportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
