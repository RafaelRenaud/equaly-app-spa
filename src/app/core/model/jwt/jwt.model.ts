export interface JWT{
    jti: string;
    iss: string;
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
        active: boolean;
    };
    department : {
        id: number;
        name: string;
        active: boolean;
    };
    user : {
        name: string;
        preferred_username: string;
        email: string;
        picture: string;
        username: string;
        active: boolean;
    };
    dalton : {
        enabled: boolean;
    };
    iat: number;
    exp: number;
}