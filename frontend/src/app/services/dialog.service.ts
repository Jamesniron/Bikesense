import { Injectable, signal } from '@angular/core';

export interface DialogConfig {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

@Injectable({ providedIn: 'root' })
export class DialogService {
  readonly active = signal<boolean>(false);
  readonly config = signal<DialogConfig | null>(null);
  private resolveFn: ((value: boolean) => void) | null = null;

  confirm(config: DialogConfig): Promise<boolean> {
    this.config.set({
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      danger: false,
      ...config
    });
    this.active.set(true);

    return new Promise<boolean>(resolve => {
      this.resolveFn = resolve;
    });
  }

  approve(): void {
    if (this.resolveFn) {
      this.resolveFn(true);
    }
    this.close();
  }

  cancel(): void {
    if (this.resolveFn) {
      this.resolveFn(false);
    }
    this.close();
  }

  private close(): void {
    this.active.set(false);
    this.config.set(null);
    this.resolveFn = null;
  }
}
