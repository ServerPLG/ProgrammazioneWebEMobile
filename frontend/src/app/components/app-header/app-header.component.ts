import { AfterViewInit, Component, ElementRef, Input, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-page-header',
  standalone: true,
  template: `
    <header class="app-header">
      <h2>
        <span class="brand-font">DevCards</span>
        <span class="header-sub">{{ subtitle }}</span>
      </h2>
      <div class="header-actions">
        <ng-content></ng-content>
      </div>
    </header>
  `,
})
export class AppHeaderComponent implements AfterViewInit, OnDestroy {
  @Input() subtitle = '';

  private ro?: ResizeObserver;

  constructor(private el: ElementRef<HTMLElement>) {}

  ngAfterViewInit(): void {
    this.publishHeight();

    if (typeof ResizeObserver !== 'undefined') {
      this.ro = new ResizeObserver(() => this.publishHeight());
      this.ro.observe(this.el.nativeElement);
    }
    window.addEventListener('resize', this.onResize, { passive: true });
  }

  ngOnDestroy(): void {
    this.ro?.disconnect();
    window.removeEventListener('resize', this.onResize);
  }

  private onResize = (): void => this.publishHeight();

  private publishHeight(): void {
    const rect = this.el.nativeElement.getBoundingClientRect();

    if (rect.height > 0) {
      document.documentElement.style.setProperty(
        '--app-header-height',
        `${Math.round(rect.bottom)}px`
      );
    }
  }
}
