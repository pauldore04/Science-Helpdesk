import { TestBed } from '@angular/core/testing';
import { Login } from './login';

describe('Login', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Login],
    }).compileComponents();
  });

  it('should show errors when submitted empty', async () => {
    const fixture = TestBed.createComponent(Login);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    compiled.querySelector('form')!.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
    expect(compiled.querySelectorAll('.field__error').length).toBe(2);
    expect(compiled.querySelector('.notice')).toBeNull();
  });

  it('should show notice when form is filled', async () => {
    const fixture = TestBed.createComponent(Login);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    for (const input of Array.from(compiled.querySelectorAll('input'))) {
      input.value = 'test';
      input.dispatchEvent(new Event('input'));
    }
    compiled.querySelector('form')!.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
    expect(compiled.querySelector('.notice')?.textContent).toContain('noch nicht angebunden');
  });
});
