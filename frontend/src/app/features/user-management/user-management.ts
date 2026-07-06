import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { ToastService } from '../../services/toast.service';
import { DialogService } from '../../services/dialog.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-management.html',
  styleUrl: './user-management.css'
})
export class UserManagementComponent implements OnInit {
  private userService = inject(UserService);
  private toast = inject(ToastService);
  private dialog = inject(DialogService);

  users = signal<any[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.users.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  async toggleStatus(user: any): Promise<void> {
    const action = user.status === 'Active' ? 'suspend' : 'activate';
    const confirm = await this.dialog.confirm({
      title: `${action === 'suspend' ? 'Suspend' : 'Activate'} User`,
      message: `Are you sure you want to ${action} ${user.name}?`,
      confirmText: action === 'suspend' ? 'Suspend' : 'Activate',
      danger: action === 'suspend'
    });

    if (confirm) {
      this.userService.updateUserStatus(user.id, action === 'suspend').subscribe(() => {
        this.toast.success(`User ${action}ed successfully`);
        this.loadUsers();
      });
    }
  }

  getRoleClass(role: string): string {
    const map: Record<string,string> = {
      'Admin': 'badge-rose',
      'Dealer': 'badge-amber',
      'Seller': 'badge-cyan',
      'Buyer': 'badge-gray'
    };
    return map[role] ?? 'badge-gray';
  }
}
