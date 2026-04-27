import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { RateOccur } from '../../../../core/model/occur/occur-rate-request.model';
import { OccurService } from '../../../../core/service/occur/occur.service';

@Component({
  selector: 'app-occur-feedback',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './occur-feedback.component.html',
  styleUrl: './occur-feedback.component.scss'
})
export class OccurFeedbackComponent implements OnInit {

  token: string = '';
  companyLogo: string = '';
  occurId: number = 0;

  rating: number = 0;
  feedbackText: string = '';

  isSubmitting: boolean = false;
  isSuccess: boolean = false;
  message: string = '';
  messageType: string = 'success';

  constructor(
    private route: ActivatedRoute,
    private occurService: OccurService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
      this.occurId = params['occurId'] ? parseInt(params['occurId']) : 0;

      const rawLogo = params['companyLogo'] || '';
      this.companyLogo = this.decodeLogoParam(rawLogo);

      if (!this.token || !this.occurId) {
        this.message = 'Token ou ID da ocorrência não fornecido.';
        this.messageType = 'error';
      }
    });
  }

  decodeLogoParam(logoParam: string): string {
    if (!logoParam) return '';

    try {
      const decoded = atob(logoParam);
      if (decoded.startsWith('http://') || decoded.startsWith('https://')) {
        return decoded;
      }
      return logoParam;
    } catch (e) {
      return logoParam;
    }
  }

  sanitizeLogoUrl(logoUrl: string): SafeUrl {
    if (!logoUrl) return '';

    if (logoUrl.startsWith('http://') || logoUrl.startsWith('https://')) {
      return this.sanitizer.bypassSecurityTrustUrl(logoUrl);
    }

    if (logoUrl.startsWith('blob:') || logoUrl.startsWith('data:')) {
      return this.sanitizer.bypassSecurityTrustUrl(logoUrl);
    }

    return this.sanitizer.bypassSecurityTrustUrl(logoUrl);
  }

  setRating(value: number): void {
    this.rating = value;
  }

  getRatingDescription(rating: number): string {
    if (rating === 0) return 'Clique nas estrelas para avaliar';
    if (rating <= 1) return 'Muito ruim';
    if (rating <= 2) return 'Ruim';
    if (rating <= 3) return 'Regular';
    if (rating <= 4) return 'Bom';
    return 'Excelente! Obrigado!';
  }

  submitFeedback(): void {
    if (this.rating === 0) {
      this.message = 'Por favor, selecione uma nota.';
      this.messageType = 'error';
      return;
    }

    this.isSubmitting = true;
    this.message = '';

    const rateRequest: RateOccur = {
      score: this.rating,
      comment: this.feedbackText || ''
    };

    this.occurService.rateOccur(this.occurId, this.token, rateRequest).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.isSuccess = true;

        setTimeout(() => {
          window.close();
        }, 2000);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.message = error.error?.message || 'Erro ao enviar feedback. Tente novamente.';
        this.messageType = 'error';
        console.error('Erro ao enviar feedback:', error);
      }
    });
  }
}