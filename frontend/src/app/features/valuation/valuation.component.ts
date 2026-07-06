import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BikeMlService } from '../../services/bike-ml.service';
import { ValuationRequest, ValuationResult } from '../../models/models';

@Component({
  selector: 'app-valuation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './valuation.component.html',
  styleUrl: './valuation.component.css'
})
export class ValuationComponent {
  private ml = inject(BikeMlService);

  loading  = signal(false);
  result   = signal<ValuationResult | null>(null);
  error    = signal('');

  readonly brands     = ['Honda', 'Yamaha', 'Bajaj', 'Suzuki', 'TVS', 'Hero', 'KTM', 'Vespa'];
  readonly conditions = ['Excellent', 'Good', 'Fair', 'Poor'];
  readonly serviceOptions  = ['Full', 'Partial', 'None'];
  readonly accidentOptions = ['None', 'Minor', 'Major'];

  req: ValuationRequest = {
    brand: '', model: '', year: 2020, mileage: 15000,
    engineCC: 150, condition: 'Good', ownerCount: 1,
    serviceHistory: 'Partial', accidentHistory: 'None'
  };
  listPrice = 0;

  modelsByBrand: Record<string, string[]> = {
    'Honda':  ['Dio', 'CB Shine', 'CB Unicorn', 'Hornet', 'CB150R'],
    'Yamaha': ['FZ', 'R15', 'MT15', 'FZS', 'Saluto'],
    'Bajaj':  ['Pulsar', 'Avenger', 'CT100', 'Platina'],
    'Suzuki': ['Gixxer', 'GSX', 'Burgman', 'Bandit'],
    'TVS':    ['Apache', 'Jupiter', 'Ntorq', 'Star City'],
    'Hero':   ['Splendor', 'Passion', 'Glamour', 'Xtreme'],
    'KTM':    ['Duke 200', 'Duke 390', 'RC 125'],
    'Vespa':  ['SXL', 'VXL', 'Notte'],
  };

  get models(): string[] {
    return this.modelsByBrand[this.req.brand] ?? [];
  }

  onBrandChange(): void {
    this.req.model = '';
  }

  get currentYear(): number { return new Date().getFullYear(); }

  valuate(): void {
    if (!this.req.brand || !this.req.model || !this.req.year || !this.req.mileage || !this.req.engineCC) {
      this.error.set('Please fill in all required fields (Brand, Model, Year, Mileage, Engine CC).');
      return;
    }
    this.error.set('');
    this.loading.set(true);
    this.result.set(null);

    this.ml.valuate(this.req, this.listPrice > 0 ? this.listPrice : undefined).subscribe({
      next: res => {
        this.result.set(res);
        this.loading.set(false);
        setTimeout(() => {
          document.getElementById('valuation-result')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      },
      error: () => {
        this.error.set('Unable to connect to the valuation service. Please try again.');
        this.loading.set(false);
      }
    });
  }

  formatPrice(p: number): string {
    if (p >= 100000) return `L ${(p / 100000).toFixed(2)}`;
    return `Rs. ${p.toLocaleString()}`;
  }

  get totalOwnershipCost(): number {
    const r = this.result();
    if (!r) return 0;
    return (r.annualFuelCost + r.annualMaintenanceCost + r.annualInsuranceCost + r.annualLicenseCost) * 3;
  }

  getDealClass(rating: string): string {
    if (rating === 'Excellent Deal') return 'deal-excellent';
    if (rating === 'Overpriced')     return 'deal-overpriced';
    return 'deal-fair';
  }

  getDealIcon(rating: string): string {
    if (rating === 'Excellent Deal') return '🟢';
    if (rating === 'Overpriced')     return '🔴';
    return '🟡';
  }

  getHealthColor(score: number): string {
    if (score >= 75) return '#10B981';
    if (score >= 50) return '#F59E0B';
    return '#F43F5E';
  }

  getHealthLabel(score: number): string {
    if (score >= 80) return 'Excellent';
    if (score >= 65) return 'Good';
    if (score >= 50) return 'Fair';
    if (score >= 35) return 'Poor';
    return 'Critical';
  }

  getDepreciationPct(basePrice: number, projectedValue: number): number {
    return Math.round(((basePrice - projectedValue) / basePrice) * 100);
  }
}
