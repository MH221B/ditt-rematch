import { TestBed } from '@angular/core/testing';

import { PluginElementLoaderService } from './plugin-element-loader.service';

describe('PluginElementLoaderService', () => {
  let service: PluginElementLoaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PluginElementLoaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
