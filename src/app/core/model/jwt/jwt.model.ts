export interface JWT{
    jti: string;
    sub: string;
    azp: string;
    roles: string[];
    company : {
        business_name: string;
        name: string;
        alias: string;
        logo: string;
        id: number;
        display_name: string;
        tax_id: string;
    };
    department : {
        department_id: number;
        department_name: string;
    };
    user : {
        name: string;
        preferred_username: string;
        email: string;
        picture: string;
        username: string;
    };
    iat: number;
}