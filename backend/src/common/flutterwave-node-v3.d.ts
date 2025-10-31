declare module "flutterwave-node-v3" {
  export default class Flutterwave {
    constructor(publicKey: string, secretKey: string);

    Payment: {
      create(payload: any): Promise<any>;
    };

    Refund: {
      refund(payload: any): Promise<any>;
    };

    Transaction: {
      verify(payload: { id: string | number }): Promise<any>;
    };
  }
}
