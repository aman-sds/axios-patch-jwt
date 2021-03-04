import { IAsyncStorage } from 'universal-storage';
import { AxiosResponse, AxiosStatic } from 'axios';
interface IConfig {
    storage: IAsyncStorage;
    axios: AxiosStatic;
    refreshTokenEndpoint: string;
    convertToCamelCase?: boolean;
    getCredsFromRefreshResponse?: (res: AxiosResponse) => ICreds;
    onSaveCreds?(creds: any): void | Promise<void>;
    onGetCreds?(creds: any): void | Promise<void>;
    onClearCreds?(): void | Promise<void>;
}
interface ICreds {
    access: {
        token?: '';
    };
    refresh: {
        token?: '';
    };
}
export declare function configureAxiosJWTInterseptors(config: IConfig): void;
export declare function refreshToken(config: IConfig): Promise<any>;
export declare function saveCreds(creds: ICreds): Promise<string | void | null>;
export declare function clearCreds(): Promise<string | void | null>;
export declare function getCreds(): Promise<any>;
export {};
