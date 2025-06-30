import { Injectable, Inject, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { JWT } from "../../model/jwt/jwt.model";
import { JwtService } from "../jwt/jwt.service";

@Injectable({
  providedIn: "root",
})
export class SessionService {
  private isBrowser: boolean;

  constructor(
    private jwtService: JwtService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  private safeSetItem(key: string, value: string) {
    if (this.isBrowser) {
      sessionStorage.setItem(key, value);
    }
  }

  private safeGetItem(key: string): string | null {
    return this.isBrowser ? sessionStorage.getItem(key) : null;
  }

  saveSessionData(
    tokenType: string,
    accessToken: string,
    refreshToken: string,
    expirationTime: number
  ) {
    this.safeSetItem("Authorization", tokenType.concat(accessToken));
    this.safeSetItem("refreshToken", refreshToken);
    this.safeSetItem(
      "expiresAt",
      new Date(new Date().getTime() + (expirationTime - 3600) * 1000).toString()
    );

    const jwtPayload: JWT = this.jwtService.decode(accessToken);

    this.safeSetItem("userId", jwtPayload.sub);
    this.safeSetItem("clientKey", jwtPayload.azp);
    this.safeSetItem("userRoles", jwtPayload.roles.toString());
    this.safeSetItem("companyBusinessName", jwtPayload.company.business_name);
    this.safeSetItem("companyName", jwtPayload.company.name);
    this.safeSetItem("companyAlias", jwtPayload.company.alias);
    this.safeSetItem("companyLogoUrl", jwtPayload.company.logo);
    this.safeSetItem("companyId", jwtPayload.company.id.toString());
    this.safeSetItem("companyDisplayName", jwtPayload.company.display_name);
    this.safeSetItem("companyDocument", jwtPayload.company.tax_id);
    this.safeSetItem(
      "departmentId",
      jwtPayload.department.department_id.toString()
    );
    this.safeSetItem("departmentName", jwtPayload.department.department_name);
    this.safeSetItem("username", jwtPayload.user.username);
    this.safeSetItem("nickname", jwtPayload.user.preferred_username);
    this.safeSetItem("email", jwtPayload.user.email);
    this.safeSetItem("name", jwtPayload.user.name);
    this.safeSetItem("userAvatar", jwtPayload.user.picture);
  }

  getItem(key: string): string | null {
    return this.safeGetItem(key);
  }

  hasRole(role: string): boolean {
    const rawRoles = this.safeGetItem("userRoles");
    const roles = rawRoles ? rawRoles.split(",").map((r) => r.trim()) : [];
    if (roles.includes(role)) {
      return true;
    }else{
      return false;
    }
  }
}
