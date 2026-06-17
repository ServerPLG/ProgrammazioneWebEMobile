import { AfterViewInit, Component, ElementRef, Input, OnDestroy } from '@angular/core';

/** Barra di intestazione applicativa con titolo e azioni (proiettate). */
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
    // Aggiorna la misura quando la barra cambia altezza (es. a capo su mobile).
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

  /**
   * Pubblica l'altezza reale della barra superiore in una variabile CSS globale,
   * così i pop-up possono posizionarsi esattamente sotto di essa.
   */
  private publishHeight(): void {
    const rect = this.el.nativeElement.getBoundingClientRect();
    // Aggiorna solo quando la barra e' effettivamente visibile (evita che una
    // pagina nascosta durante la navigazione azzeri il valore).
    if (rect.height > 0) {
      document.documentElement.style.setProperty(
        '--app-header-height',
        `${Math.round(rect.bottom)}px`
      );
    }
  }
}
