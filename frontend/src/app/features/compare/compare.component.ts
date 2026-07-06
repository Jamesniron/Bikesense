import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BikeService } from '../../services/bike.service';
import { BikeMlService } from '../../services/bike-ml.service';
import { ComparisonService } from '../../services/comparison.service';
import { Bike, ValuationResult } from '../../models/models';

interface CompareSlot {
  bike: Bike | null;
  valuation: ValuationResult | null;
  loading: boolean;
}

@Component({
  selector: 'app-compare',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './compare.component.html',
  styleUrl: './compare.component.css'
})
export class CompareComponent implements OnInit {
  private bikeService = inject(BikeService);
  private ml = inject(BikeMlService);
  private comparisonService = inject(ComparisonService);
  private route = inject(ActivatedRoute);

  slots = signal<CompareSlot[]>([
    { bike: null, valuation: null, loading: false },
    { bike: null, valuation: null, loading: false },
    { bike: null, valuation: null, loading: false },
  ]);

  searchIds = ['', '', ''];
  availableBikes = signal<Bike[]>([]);
  analytics = signal<any>(null);

  readonly specKeys: { label: string; key: keyof Bike; unit?: string }[] = [
    { label: 'Brand',       key: 'brand' },
    { label: 'Model',       key: 'model' },
    { label: 'Year',        key: 'year' },
    { label: 'Engine CC',   key: 'engineCC', unit: 'cc' },
    { label: 'Mileage',     key: 'mileage',  unit: 'km' },
    { label: 'Condition',   key: 'condition' },
    { label: 'Owners',      key: 'ownerCount' },
    { label: 'Service',     key: 'serviceHistory' },
    { label: 'Accidents',   key: 'accidentHistory' },
    { label: 'Location',    key: 'location' },
    { label: 'Listed Price',key: 'price' },
  ];

  onSlotSelectChange(slotIdx: number, event: Event): void {
    const id = Number((event.target as HTMLSelectElement).value);
    if (id) this.loadBike(slotIdx, id);
  }

  ngOnInit(): void {
    this.bikeService.getBikes({ limit: 100, status: 'Active' }).subscribe({
      next: (r: any) => {
        const items = r?.items ?? r ?? [];
        this.availableBikes.set(Array.isArray(items) ? items : []);
        
        // Check for ?add= query param
        this.route.queryParams.subscribe(params => {
          if (params['add']) {
            const addId = Number(params['add']);
            this.loadBike(0, addId);
          }
        });
      },
      error: () => this.availableBikes.set([])
    });

    this.comparisonService.getComparisonAnalytics().subscribe({
      next: res => this.analytics.set(res)
    });
  }

  loadBike(slotIdx: number, bikeId: number): void {
    if (!bikeId) return;
    const s = this.slots();
    s[slotIdx].loading = true;
    this.slots.set([...s]);

    this.bikeService.getBikeById(bikeId).subscribe({
      next: bike => {
        const updated = this.slots();
        if (bike) {
          updated[slotIdx].bike    = bike;
          this.searchIds[slotIdx] = String(bike.id);
        }
        updated[slotIdx].loading = false;
        this.slots.set([...updated]);
        if (bike) this.fetchValuation(slotIdx, bike);
      },
      error: () => {
        const updated = this.slots();
        updated[slotIdx].loading = false;
        this.slots.set([...updated]);
      }
    });
  }

  private fetchValuation(slotIdx: number, bike: Bike): void {
    this.ml.valuate({
      brand: bike.brand, model: bike.model, year: bike.year,
      mileage: bike.mileage, engineCC: bike.engineCC,
      condition: bike.condition, ownerCount: bike.ownerCount,
      serviceHistory: bike.serviceHistory, accidentHistory: bike.accidentHistory
    }, bike.price).subscribe({
      next: val => {
        const updated = this.slots();
        updated[slotIdx].valuation = val;
        this.slots.set([...updated]);
      },
      error: () => {}
    });
  }

  clearSlot(idx: number): void {
    const updated = this.slots();
    updated[idx] = { bike: null, valuation: null, loading: false };
    this.searchIds[idx] = '';
    this.slots.set([...updated]);
  }

  formatPrice(p: number): string {
    return `L ${(p / 100000).toFixed(2)}`;
  }

  getSpecValue(bike: Bike, key: keyof Bike, unit?: string): string {
    const val = bike[key];
    if (val === undefined || val === null) return '—';
    const str = String(val);
    return unit ? `${Number(val).toLocaleString()} ${unit}` : str;
  }

  isBest(slotIdx: number, key: keyof Bike): boolean {
    const bikes = this.slots().map(s => s.bike).filter(Boolean) as Bike[];
    if (bikes.length < 2) return false;
    const val = bikes[slotIdx]?.[key];
    if (typeof val !== 'number') return false;
    // Lower is better for price and mileage; higher for year
    const vals = bikes.map(b => b[key] as number);
    if (key === 'price' || key === 'mileage') return val === Math.min(...vals);
    if (key === 'year')                        return val === Math.max(...vals);
    return false;
  }

  get filledCount(): number {
    return this.slots().filter(s => s.bike).length;
  }
}
