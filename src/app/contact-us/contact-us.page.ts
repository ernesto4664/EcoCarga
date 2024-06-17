import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.page.html',
  styleUrls: ['./contact-us.page.scss'],
})
export class ContactUsPage implements OnInit {
  contactForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.contactForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      message: ['', Validators.required],
    });
  }

  ngOnInit() {}

  composeEmail() {
    if (this.contactForm.valid) {
      const formData = this.contactForm.value;
      const email = 'admin@example.com'; // Reemplaza con el correo del administrador
      const subject = encodeURIComponent('Nuevo mensaje de contacto');
      const body = encodeURIComponent(
        `Nombre: ${formData.firstName} ${formData.lastName}\n` +
        `Email: ${formData.email}\n` +
        `Teléfono: ${formData.phone}\n` +
        `Mensaje: ${formData.message}`
      );
      const mailtoLink = `mailto:${email}?subject=${subject}&body=${body}`;

      window.location.href = mailtoLink;
    }
  }
}
