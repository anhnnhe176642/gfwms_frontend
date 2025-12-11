declare module 'vietqr' {
  export interface VietQRData {
    amount?: number;
    purpose?: string;
    beneficiaryName?: string;
    beneficiaryAccountNumber?: string;
    serviceCode?: string;
    [key: string]: any;
  }

  export class VietQRParser {
    parse(qrCode: string): VietQRData | null;
  }
}
