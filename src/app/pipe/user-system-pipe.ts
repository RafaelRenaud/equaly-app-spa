import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: "systemName" })
export class UserSystemPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return value;
    if (value === "SYSTEM") {
      return "Usuário Sistêmico";
    }else if (value === "DALTON") {
      return "Dalton Assistant";
    }else if (value === "WHATSAPP") {
      return "Dalton Assistant via WhatsApp";
    }else if (value === "EQUALY") {
      return "Sistema Interno";
    }else{
      return value;
    }
  }
}
