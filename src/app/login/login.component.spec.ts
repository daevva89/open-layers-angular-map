import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: AuthService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent, FormsModule, HttpClientTestingModule],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jasmine.createSpy('login').and.returnValue(of(true)),
          },
        },
        {
          provide: Router,
          useValue: {
            navigate: jasmine.createSpy('navigate'),
          },
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should authenticate and navigate on valid credentials', (done) => {
    authService.login = jasmine.createSpy('login').and.returnValue(of(true));

    component.username = 'johnny_boy';
    component.password = 'justMe32s2';

    component.onSubmit();

    fixture.whenStable().then(() => {
      expect(authService.login).toHaveBeenCalledWith(
        'johnny_boy',
        'justMe32s2'
      );
      expect(router.navigate).toHaveBeenCalledWith(['/map']);
      done();
    });
  });

  it('should alert on invalid credentials', (done) => {
    authService.login = jasmine.createSpy('login').and.returnValue(of(false));
    spyOn(window, 'alert');

    component.username = 'wrong_user';
    component.password = 'wrong_password';

    component.onSubmit();

    fixture.whenStable().then(() => {
      expect(authService.login).toHaveBeenCalledWith(
        'wrong_user',
        'wrong_password'
      );
      expect(window.alert).toHaveBeenCalledWith('Invalid credentials');
      done();
    });
  });
});
