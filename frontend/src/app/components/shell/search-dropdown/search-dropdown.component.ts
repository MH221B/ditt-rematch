import {
  Component,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
  Input,
  HostListener,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { SearchService } from '../../../services/search.service';
import { Tool } from '../../../models/tool.model';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-search-dropdown',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="search-dropdown-wrapper" #dropdownWrapper>
      <div class="search-input-group">
        <input
          type="text"
          class="form-control search-input"
          placeholder="Search for a tool"
          [formControl]="searchControl"
          (keydown.escape)="closeDropdown()"
          aria-label="Search tools"
        />
        <i class="bi bi-search search-icon"></i>
      </div>

      @if (showResults && searchControl.value) {
        <div class="dropdown-menu show search-results">
          @if (filteredTools.length > 0) {
            <ul class="list-unstyled mb-0">
              @for (tool of filteredTools; track tool.id) {
                <li>
                  <a
                    href="#"
                    class="dropdown-item tool-item"
                    (click)="selectTool($event, tool)"
                  >
                    <div class="tool-item__content">
                      <div class="tool-item__name">{{ tool.name }}</div>
                      <div class="tool-item__description">
                        {{ tool.description }}
                      </div>
                    </div>
                    @if (tool.isPremium) {
                      <i
                        class="bi bi-star-fill tool-item__premium"
                        title="Premium"
                      ></i>
                    }
                  </a>
                </li>
              }
            </ul>
          } @else {
            <div class="dropdown-item text-muted text-center py-3">
              No tools found
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      .search-dropdown-wrapper {
        position: relative;
        width: 100%;
      }

      .search-input-group {
        position: relative;
        display: flex;
        align-items: center;
      }

      .search-input {
        padding-right: 2.5rem;
        background-color: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: white;
        min-width: 400px;
      }

      .search-input::placeholder {
        color: rgba(255, 255, 255, 0.65);
      }

      .search-input:focus {
        background-color: rgba(255, 255, 255, 0.15);
        border-color: rgba(255, 255, 255, 0.4);
        color: white;
        box-shadow: 0 0 0 0.2rem rgba(255, 255, 255, 0.1);
      }

      .search-icon {
        position: absolute;
        right: 0.75rem;
        color: rgba(255, 255, 255, 0.65);
        pointer-events: none;
      }

      .search-results {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        z-index: 1000;
        max-height: 400px;
        overflow-y: auto;
        margin-top: 0.25rem;
        background-color: #2d3748;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 0.25rem;
        box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.3);
      }

      .tool-item {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        padding: 0.75rem 1rem !important;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        cursor: pointer;
        transition: background-color 0.2s ease;
        gap: 1rem;
      }

      .tool-item:hover {
        background-color: rgba(255, 255, 255, 0.1);
      }

      .tool-item:last-child {
        border-bottom: none;
      }

      .tool-item__content {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        flex: 1;
      }

      .tool-item__name {
        font-weight: 500;
        color: #ffffff;
        font-size: 0.95rem;
      }

      .tool-item__description {
        font-size: 0.8rem;
        color: #a0aec0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .tool-item__premium {
        color: #ffc107;
        font-size: 0.9rem;
        flex-shrink: 0;
        margin-top: 0.125rem;
      }

      @media (max-width: 768px) {
        .search-input {
          min-width: 200px;
        }
      }
    `,
  ],
})
export class SearchDropdownComponent implements OnInit, OnDestroy {
  @Input() isAdmin = false;
  @Output() toolSelected = new EventEmitter<Tool>();

  @ViewChild('dropdownWrapper', { read: ElementRef })
  dropdownWrapper!: ElementRef;

  searchControl = new FormControl('');
  filteredTools: Tool[] = [];
  showResults = false;

  private destroy$ = new Subject<void>();

  constructor(private searchService: SearchService) {}

  ngOnInit(): void {
    // Pre-load tools in background
    this.searchService.ensureToolsLoaded().pipe(takeUntil(this.destroy$)).subscribe();

    // Subscribe to search input changes with debouncing
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        takeUntil(this.destroy$)
      )
      .subscribe((query) => {
        if (query && query.trim()) {
          this.showResults = true;
          this.searchService
            .searchTools(query)
            .pipe(takeUntil(this.destroy$))
            .subscribe((results) => {
              this.filteredTools = results.slice(0, 5); // Max 5 results
            });
        } else {
          this.filteredTools = [];
          this.showResults = false;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  selectTool(event: Event, tool: Tool): void {
    event.preventDefault();
    this.toolSelected.emit(tool);
    this.closeDropdown();
  }

  closeDropdown(): void {
    this.showResults = false;
    this.searchControl.reset();
    this.filteredTools = [];
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (
      this.dropdownWrapper &&
      !this.dropdownWrapper.nativeElement.contains(event.target as Node)
    ) {
      this.closeDropdown();
    }
  }
}
