import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-login',
  styleUrl: './login.scss',
  templateUrl: './login.html',
})
export class Login {
  private readonly fb = inject(FormBuilder);

  protected readonly form = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  protected readonly submitted = signal(false);
  protected readonly notice = signal('');

  protected onSubmit(): void {
    this.submitted.set(true);
    if (this.form.invalid) {
      return;
    }
    // TODO: an Backend-Authentifizierung anbinden
    this.notice.set('Der Login ist noch nicht angebunden.');
  }

  protected showError(field: 'username' | 'password'): boolean {
    const control = this.form.controls[field];
    return control.invalid && (control.touched || this.submitted());
  }
}
