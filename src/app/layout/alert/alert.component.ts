import { Component } from "@angular/core";
import {
  AlertPayload,
  AlertService,
  AlertType,
} from "../../core/service/alert/alert.service";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-alert",
  imports: [CommonModule],
  standalone: true,
  templateUrl: "./alert.component.html",
  styleUrl: "./alert.component.scss",
})
export class AlertLayoutComponent {
  payload: AlertPayload | null = null;
  visible = false;

  constructor(private alertService: AlertService) {}

  ngOnInit(): void {
    this.alertService.getAlert().subscribe((p) => {
      this.payload = p;

      if (p) {
        this.visible = true;
        setTimeout(() => {
          this.visible = false;
        }, 4000); // fade inicia após 4s
      }
    });
  }

  getDefaultMessage(type: AlertType | undefined): string {
    switch (type) {
      case "SUCCESS":
        return "Operação realizada com sucesso.";
      case "WARNING":
        return "Atenção: algo pode requerer sua verificação.";
      case "ERROR":
        return "Erro: não foi possível concluir a operação.";
      default:
        return "";
    }
  }
}
