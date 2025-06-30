import { Component, inject } from "@angular/core";
import { SessionService } from "../../core/service/session/session.service";
import { UserService } from "../../core/service/user/user.service";
import { HttpClient } from "@angular/common/http";
import { LoadingService } from "../../core/service/loading/loading.service";
import { UserResponse } from "../../core/model/user/user-response.model";
import { RolesResponse } from "../../core/model/role/roles-response.model";
import { forkJoin } from "rxjs";

@Component({
  selector: "app-my-account",
  imports: [],
  templateUrl: "./my-account.component.html",
  styleUrl: "./my-account.component.scss",
})
export class MyAccountComponent {
  myUser: UserResponse | null = null;
  myRoles: RolesResponse | null = null;

  constructor(
    public sessionService: SessionService,
    private userService: UserService,
    private loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    this.loadingService.show();

    const userId = this.sessionService.getItem("userId")!;

    forkJoin({
      user: this.userService.getUser(userId),
      roles: this.userService.getUserRoles(userId),
    }).subscribe({
      next: ({ user, roles }) => {
        this.myUser = user as UserResponse;
        this.myRoles = roles as RolesResponse;
        this.loadingService.hide();
      },
      error: (err) => {
        console.error("Erro ao carregar dados do usuário ou roles:", err);
        this.loadingService.hide();
      },
    });
  }

  getRolesAsText() {
    return this.myRoles?.roles.map((role) => role.name).join(", ") ?? "";
  }
}
