// VietQR/EMV-QR decoder
// Properly parses TLV (Tag-Length-Value) format

export interface QRPaymentInfo {
  amount?: number;
  description?: string;
  bankBeneficiary?: string;
  bankAccount?: string;
  bankCode?: string;
  [key: string]: any;
}

/**
 * Parse TLV data and return as object
 */
function parseTLV(data: string): { [key: string]: string } {
  const result: { [key: string]: string } = {};
  let i = 0;

  while (i < data.length) {
    const tag = data.substring(i, i + 2);
    i += 2;

    const len = parseInt(data.substring(i, i + 2), 10);
    i += 2;

    if (i + len > data.length) break;

    const value = data.substring(i, i + len);
    i += len;

    result[tag] = value;
  }

  return result;
}

/**
 * Decode VietQR/EMV-QR string to extract payment information
 * Format: TLV (Tag-Length-Value) encoded string
 */
export function decodeVietQR(qrString: string): QRPaymentInfo {
  const info: QRPaymentInfo = {};

  if (!qrString) return info;

  try {
    // Parse top-level TLV
    const topLevel = parseTLV(qrString);

    // Tag 38: Merchant Account Information (contains bank data)
    if (topLevel['38']) {
      const merchantData = parseTLV(topLevel['38']);
      
      // Merchant Tag 00: Bank/Service Code (A000000727 = Vietcombank, etc)
      if (merchantData['00']) {
        const bankCode = merchantData['00'];
        info.bankCode = bankCode;

        // Map common Vietnamese bank codes
        const bankMap: { [key: string]: string } = {
          A000000727: 'Ngân hàng TMCP Quân đội (MB)',
          A000000729: 'Ngân hàng Nông nghiệp (Agribank)',
          A000000747: 'Ngân hàng Đầu tư và Phát triển (BIDV)',
          A000000748: 'Ngân hàng Kỹ thương (Techcombank)',
          A000000753: 'Ngân hàng Quân Đội (MB Bank)',
          A000000794: 'Ngân hàng Á Châu (ACB)',
          A000000787: 'Ngân hàng Việt Nam Thịnh Vượng (VPBank)',
          A000000858: 'Ngân hàng Đại Dương (OceanBank)',
          A000000873: 'Ngân hàng Tiến Phong (TPBank)',
        };
        info.bankBeneficiary = bankMap[bankCode] || bankCode;
      }

      // Merchant Tag 01: Account number/reference
      // This contains the actual account identifier (alphanumeric)
      if (merchantData['01']) {
        const accountRef = merchantData['01'];
        // Extract alphanumeric part (VietQR account IDs are alphanumeric like VQRQAFVJG3386)
        // Look for uppercase letters with numbers - this is the actual account
        const alphanumericMatch = accountRef.match(/[A-Z]{1,}[A-Z0-9]{7,}/);
        if (alphanumericMatch) {
          info.bankAccount = alphanumericMatch[0];
        } else {
          // Fallback: try numeric only
          const numMatch = accountRef.match(/(\d{8,20})/);
          if (numMatch) {
            info.bankAccount = numMatch[1];
          }
        }
      }

      // Merchant Tag 02: Additional merchant data (may contain reference)
      if (merchantData['02']) {
        const additionalData = merchantData['02'];
        // Try to extract account from this field too if not found
        if (!info.bankAccount) {
          const accountMatch = additionalData.match(/([A-Z0-9]{8,})/);
          if (accountMatch) {
            info.bankAccount = accountMatch[0];
          }
        }
      }
    }

    // Tag 54: Transaction Amount (in format: 6 digits = amount in VND)
    if (topLevel['54']) {
      const amountStr = topLevel['54'];
      const amount = parseInt(amountStr, 10);
      if (!isNaN(amount)) {
        info.amount = amount;
      }
    }

    // Tag 62: Additional Data (contains invoice/description info)
    if (topLevel['62']) {
      const additionalData = parseTLV(topLevel['62']);

      // Look for DH pattern (Hoá đơn = Invoice in Vietnamese)
      // Usually in sub-tag or raw data
      if (additionalData['05']) {
        const dhMatch = additionalData['05'].match(/DH(\d+)/);
        if (dhMatch) {
          info.description = `Hoá đơn #${dhMatch[1]}`;
        }
      }

      // If no DH found in structured data, try raw tag 62 content
      if (!info.description) {
        const rawMatch = topLevel['62'].match(/DH(\d+)/);
        if (rawMatch) {
          info.description = `Hoá đơn #${rawMatch[1]}`;
        }
      }
    }

    // Fallback: Try to extract DH pattern from entire QR string
    if (!info.description) {
      const dhMatch = qrString.match(/DH(\d+)/);
      if (dhMatch) {
        info.description = `Hoá đơn #${dhMatch[1]}`;
      }
    }

    console.log('Decoded VietQR info:', info);
    return info;
  } catch (error) {
    console.error('Error decoding VietQR:', error);
    return info;
  }
}
