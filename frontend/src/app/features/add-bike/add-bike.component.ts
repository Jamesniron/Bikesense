import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SellerService } from '../../services/seller.service';
import { BikeMlService } from '../../services/bike-ml.service';
import { ToastService } from '../../services/toast.service';
import { Bike } from '../../models/models';

@Component({
  selector: 'app-add-bike',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './add-bike.component.html',
  styleUrl: './add-bike.component.css'
})
export class AddBikeComponent implements OnInit {
  private readonly fb     = inject(FormBuilder);
  private readonly seller = inject(SellerService);
  private readonly ml     = inject(BikeMlService);
  private readonly toast  = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route  = inject(ActivatedRoute);

  editMode = signal<boolean>(false);
  bikeId = signal<number | null>(null);
  currentStep = signal<number>(1);
  loading = signal<boolean>(false);

  // Forms definition
  step1Form!: FormGroup;
  step2Form!: FormGroup;
  step3Form!: FormGroup;
  step4Form!: FormGroup;
  step5Form!: FormGroup;

  // Options
  readonly brands = ['Honda', 'Yamaha', 'Bajaj', 'Suzuki', 'TVS', 'Hero', 'KTM', 'Vespa'];
  readonly conditions = ['Excellent', 'Good', 'Fair', 'Poor'];
  readonly fuelTypes = ['Petrol', 'Electric', 'Hybrid'];
  readonly transmissions = ['Manual', 'Auto'];
  readonly provinces = ['Western', 'Central', 'Southern', 'Northern', 'Eastern', 'North Western', 'North Central', 'Uva', 'Sabaragamuwa'];
  readonly districtsByProvince: Record<string, string[]> = {
    'Western': ['Colombo', 'Gampaha', 'Kalutara'],
    'Central': ['Kandy', 'Matale', 'Nuwara Eliya'],
    // Add others as needed, simplified for dummy
  };

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

  // Step 6 Uploads
  documents = signal<any>({ regBook: null, insuranceCert: null, serviceRecords: null });
  images = signal<string[]>([]);
  primaryImageIndex = signal<number>(0);
  imageDragOver = signal<boolean>(false);

  // Step 3 Pricing AI States
  predictedPrice = signal<number>(0);
  suggestedBargain = signal<number>(0);
  healthScore = signal<number>(85);
  resaleValue = signal<number>(0);
  valuationCalculated = signal<boolean>(false);

  // Step 4 Features
  featureTagInput = '';
  additionalFeatures = signal<string[]>([]);

  ngOnInit(): void {
    this.initForms();
    this.checkEditMode();
  }

  private initForms(): void {
    const currentYear = new Date().getFullYear();

    this.step1Form = this.fb.group({
      brand: ['', Validators.required],
      model: ['', Validators.required],
      variant: [''],
      year: [2020, [Validators.required, Validators.min(1990), Validators.max(currentYear)]],
      regYear: [2020, [Validators.min(1990), Validators.max(currentYear)]],
      engineCC: [150, [Validators.required, Validators.min(50), Validators.max(1500)]],
      fuelType: ['Petrol', Validators.required],
      transmission: ['Manual', Validators.required],
      color: ['', Validators.required]
    });

    this.step2Form = this.fb.group({
      mileage: [10000, [Validators.required, Validators.min(0)]],
      ownerCount: [1, [Validators.required, Validators.min(1)]],
      condition: ['Good', Validators.required],
      accidentHistory: ['None', Validators.required],
      serviceHistory: ['Full', Validators.required],
      insuranceStatus: ['Active', Validators.required],
      regBookAvailable: ['Yes', Validators.required],
      licenseExpiry: ['', Validators.required]
    });

    this.step3Form = this.fb.group({
      price: [0, [Validators.required, Validators.min(10000)]]
    });

    this.step4Form = this.fb.group({
      description: ['', Validators.required]
    });

    this.step5Form = this.fb.group({
      province: ['', Validators.required],
      district: ['', Validators.required],
      city: ['', Validators.required]
    });
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.queryParamMap.get('id');
    // Implement edit logic if needed, simplify for now
  }

  get models(): string[] {
    const brand = this.step1Form.get('brand')?.value;
    return this.modelsByBrand[brand] || [];
  }

  get districts(): string[] {
    const prov = this.step5Form.get('province')?.value;
    return this.districtsByProvince[prov] || ['Colombo', 'Gampaha', 'Kandy', 'Galle']; // Fallback
  }

  onBrandChange(): void { this.step1Form.get('model')?.setValue(''); }
  onProvinceChange(): void { this.step5Form.get('district')?.setValue(''); }

  nextStep(): void {
    if (this.currentStep() === 1 && this.step1Form.invalid) { this.step1Form.markAllAsTouched(); return; }
    if (this.currentStep() === 2 && this.step2Form.invalid) { this.step2Form.markAllAsTouched(); return; }
    
    if (this.currentStep() === 2) {
      this.calculateAiPrice(); // Trigger AI price logic when moving to Step 3
    }
    
    if (this.currentStep() === 3 && this.step3Form.invalid) { this.step3Form.markAllAsTouched(); return; }
    if (this.currentStep() === 4 && this.step4Form.invalid) { this.step4Form.markAllAsTouched(); return; }
    if (this.currentStep() === 5 && this.step5Form.invalid) { this.step5Form.markAllAsTouched(); return; }
    
    if (this.currentStep() < 6) {
      this.currentStep.update(s => s + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      this.publishListing();
    }
  }

  prevStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.update(s => s - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  onFileSelect(field: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const docs = this.documents();
      docs[field] = file.name;
      this.documents.set({ ...docs });
    }
  }
  removeDocument(field: string): void {
    const docs = this.documents();
    docs[field] = null;
    this.documents.set({ ...docs });
  }

  onImageDrop(event: DragEvent): void {
    event.preventDefault();
    this.imageDragOver.set(false);
    if (event.dataTransfer?.files) this.addSimulatedImages(event.dataTransfer.files);
  }
  onImageSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) this.addSimulatedImages(input.files);
  }
  private addSimulatedImages(files: FileList): void {
    const list = this.images();
    const brand = this.step1Form.get('brand')?.value || 'Honda';
    const fallbacks: Record<string, string[]> = {
      'Honda':  ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format'],
      'Yamaha': ['https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600&auto=format'],
      'Bajaj':  ['https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&auto=format'],
      'Suzuki': ['https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=600&auto=format']
    };
    const brandPics = fallbacks[brand] || ['https://images.unsplash.com/photo-1558981359-219d6364c9c8?w=600&auto=format'];
    
    for (let i = 0; i < files.length; i++) {
      list.push(brandPics[(list.length + i) % brandPics.length]);
    }
    this.images.set([...list]);
  }
  deleteImage(index: number): void {
    const list = this.images();
    list.splice(index, 1);
    this.images.set([...list]);
  }

  private calculateAiPrice(): void {
    this.valuationCalculated.set(false);
    const base = this.step1Form.get('brand')?.value === 'Honda' ? 450000 : 600000;
    const mileage = this.step2Form.get('mileage')?.value || 10000;
    this.predictedPrice.set(base - mileage * 2);
    this.suggestedBargain.set(this.predictedPrice() * 0.9);
    this.resaleValue.set(this.predictedPrice() * 0.85);
    this.healthScore.set(88);
    this.valuationCalculated.set(true);
    
    if (!this.step3Form.get('price')?.value) {
      this.step3Form.get('price')?.setValue(Math.round(this.predictedPrice()));
    }
  }

  get priceDiffPercentage(): number {
    const ask = this.step3Form.get('price')?.value || 0;
    const pred = this.predictedPrice();
    if (pred === 0) return 0;
    return Math.round(((ask - pred) / pred) * 100);
  }

  addFeatureTag(): void {
    if (this.featureTagInput.trim()) {
      const current = this.additionalFeatures();
      if (!current.includes(this.featureTagInput.trim())) {
        current.push(this.featureTagInput.trim());
        this.additionalFeatures.set([...current]);
      }
      this.featureTagInput = '';
    }
  }
  removeFeatureTag(index: number): void {
    const current = this.additionalFeatures();
    current.splice(index, 1);
    this.additionalFeatures.set([...current]);
  }

  publishListing(): void {
    this.loading.set(true);
    const s1 = this.step1Form.value;
    const s2 = this.step2Form.value;
    const s3 = this.step3Form.value;
    const s4 = this.step4Form.value;
    const s5 = this.step5Form.value;

    const bikeData = {
      title: `${s1.brand} ${s1.model} ${s1.year}`,
      brand: s1.brand, model: s1.model, variant: s1.variant,
      bikeType: s1.engineCC > 200 ? 'Superbikes' : 'Motorbikes',
      year: s1.year, regYear: s1.regYear, mileage: s2.mileage, engineCC: s1.engineCC,
      fuelType: s1.fuelType, transmission: s1.transmission, color: s1.color,
      price: s3.price, condition: s2.condition, ownerCount: s2.ownerCount,
      insurance: s2.insuranceStatus, registration: 'Registered', serviceHistory: s2.serviceHistory,
      accidentHistory: s2.accidentHistory, description: s4.description, location: `${s5.city}, ${s5.district}`,
      imageUrls: this.images().length ? this.images() : ['https://images.unsplash.com/photo-1558981359-219d6364c9c8?w=600&auto=format'],
      documents: this.documents(), additionalFeatures: this.additionalFeatures()
    };

    this.seller.createBike(bikeData).subscribe({
      next: () => {
        this.toast.success('Listing submitted successfully! Pending admin approval.');
        this.router.navigate(['/seller/listings']);
      },
      error: () => {
        this.toast.error('Failed to create listing.');
        this.loading.set(false);
      }
    });
  }

  formatPrice(p: number): string { return `Rs. ${p.toLocaleString()}`; }
  Math = Math;
}
