import { Injectable } from "@angular/core";
import { JwtService } from "./jwt.service";
import { JWT } from "../model/jwt.model";

@Injectable({
  providedIn: "root",
})
export class SessionService {
  constructor(private jwtService: JwtService) {}

  saveSessionData(
    tokenType: string,
    accessToken: string,
    refreshToken: string,
    expirationTime: number
  ) {
    sessionStorage.setItem("Auhtorization", tokenType.concat(accessToken));
    sessionStorage.setItem("refreshToken", refreshToken);
    sessionStorage.setItem(
      "expiresAt",
      new Date(new Date().getTime() + (expirationTime - 3600) * 1000).toString()
    );
    

    const jwtPayload: JWT = this.jwtService.decode(accessToken);

    sessionStorage.setItem("userId", jwtPayload.sub);
    sessionStorage.setItem("clientKey", jwtPayload.azp);
    sessionStorage.setItem("userRoles", jwtPayload.roles.toString());
    sessionStorage.setItem(
      "companyBusinessName",
      jwtPayload.company.business_name
    );
    sessionStorage.setItem("companyName", jwtPayload.company.name);
    sessionStorage.setItem("companyAlias", jwtPayload.company.alias);
    sessionStorage.setItem("companyLogoUrl", jwtPayload.company.logo);
    sessionStorage.setItem("companyId", jwtPayload.company.id.toString());
    sessionStorage.setItem(
      "companyDisplayName",
      jwtPayload.company.display_name
    );
    sessionStorage.setItem("companyDocument", jwtPayload.company.tax_id);
    sessionStorage.setItem(
      "departmentId",
      jwtPayload.department.department_id.toString()
    );
    sessionStorage.setItem(
      "departmentName",
      jwtPayload.department.department_name
    );
    sessionStorage.setItem("username", jwtPayload.user.username);
    sessionStorage.setItem("nickname", jwtPayload.user.preferred_username);
    sessionStorage.setItem("email", jwtPayload.user.email);
    sessionStorage.setItem("name", jwtPayload.user.name);
    sessionStorage.setItem("userAvatar", jwtPayload.user.picture);
  }
}
