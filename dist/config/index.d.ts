export declare const config: {
    readonly env: string;
    readonly port: number;
    readonly database: {
        readonly url: string;
    };
    readonly jwt: {
        readonly secret: string;
        readonly expiresIn: string;
        readonly refreshExpiresIn: string;
    };
    readonly cors: {
        readonly origin: string[];
    };
    readonly rateLimit: {
        readonly windowMs: number;
        readonly maxRequests: number;
    };
    readonly app: {
        readonly name: string;
        readonly collegeName: string;
        readonly gstNumber: string;
        readonly defaultTaxRate: number;
    };
    readonly cashfree: {
        readonly appId: string;
        readonly secretKey: string;
        readonly environment: "sandbox" | "production";
        readonly webhookSecret: string;
        readonly returnUrl: string;
    };
};
//# sourceMappingURL=index.d.ts.map