'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { decodeVietQR } from '@/lib/vietqr-parser';

interface BankTransferInfo {
  bankBeneficiary?: string;
  bankAccount?: string;
  bankCode?: string;
  accountName?: string;
  amount?: number;
  description?: string;
  transactionId?: string;
}

interface PaymentInfoDisplayProps {
  qrCodeUrl: string;
  amount: number;
  invoiceId: number | string;
  accountName?: string;
}

export default function PaymentInfoDisplay({
  qrCodeUrl,
  amount,
  invoiceId,
  accountName,
}: PaymentInfoDisplayProps) {
  const [bankInfo, setBankInfo] = useState<BankTransferInfo | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (!qrCodeUrl) return;

    try {
      // Use custom VietQR decoder
      const parsedData = decodeVietQR(qrCodeUrl);
      console.log('Decoded VietQR data:', parsedData);

      if (parsedData && Object.keys(parsedData).length > 0) {
        const info: BankTransferInfo = {};

        // Extract amount
        if (parsedData.amount) {
          info.amount = parsedData.amount;
        } else {
          info.amount = amount;
        }

        // Extract bank beneficiary name
        if (parsedData.bankBeneficiary) {
          info.bankBeneficiary = String(parsedData.bankBeneficiary);
        }

        // Extract account number
        if (parsedData.bankAccount) {
          info.bankAccount = String(parsedData.bankAccount);
        }

        // Extract bank code
        if (parsedData.bankCode) {
          info.bankCode = String(parsedData.bankCode);
        }

        // Extract description/purpose
        if (parsedData.description) {
          info.description = String(parsedData.description);
        } else {
          info.description = `Thanh toán hoá đơn #${invoiceId}`;
        }

        setBankInfo(info);
        console.log('Parsed bank info:', info);
      } else {
        // Fallback
        setBankInfo({
          amount,
          description: `Thanh toán hoá đơn #${invoiceId}`,
          accountName,
        });
      }
    } catch (error) {
      console.error('Lỗi parse QR code:', error);
      setBankInfo({
        amount,
        description: `Thanh toán hoá đơn #${invoiceId}`,
        accountName,
      });
    }
  }, [qrCodeUrl, amount, invoiceId, accountName]);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Thông tin chuyển khoản</CardTitle>
        <CardDescription>
          Sử dụng thông tin dưới đây để chuyển khoản nếu không thể quét QR code
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Amount */}
        <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-950/30">
          <p className="text-sm text-muted-foreground mb-1">Số tiền cần chuyển</p>
          <div className="flex items-center justify-between gap-2">
            <p className="text-3xl font-bold text-primary">
              {bankInfo?.amount ? bankInfo.amount.toLocaleString('vi-VN') : amount.toLocaleString('vi-VN')} ₫
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                copyToClipboard(
                  (bankInfo?.amount || amount).toString(),
                  'amount'
                )
              }
            >
              {copiedField === 'amount' ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Bank Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Bank Name */}
          {bankInfo?.bankBeneficiary && (
            <div className="border rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-2">Ngân hàng thụ hưởng</p>
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold">{bankInfo.bankBeneficiary}</p>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={() => copyToClipboard(bankInfo.bankBeneficiary!, 'bank')}
                >
                  {copiedField === 'bank' ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Account Name (Chủ tài khoản) */}
          {(bankInfo?.accountName || accountName) && (
            <div className="border rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-2">Chủ tài khoản</p>
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold">{bankInfo?.accountName || accountName}</p>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={() => copyToClipboard(bankInfo?.accountName || accountName!, 'accountName')}
                >
                  {copiedField === 'accountName' ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          )}
          {/* Bank Account */}
          {bankInfo?.bankAccount && (
            <div className="border rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-2">Số tài khoản</p>
              <div className="flex items-center justify-between gap-2">
                <p className="font-mono font-semibold">{bankInfo.bankAccount}</p>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={() => copyToClipboard(bankInfo.bankAccount!, 'account')}
                >
                  {copiedField === 'account' ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Description/Content */}
          {bankInfo?.description && (
            <div className="border rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-2">Nội dung chuyển khoản</p>
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold text-sm break-all">{bankInfo.description}</p>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 shrink-0"
                  onClick={() => copyToClipboard(bankInfo.description!, 'description')}
                >
                  {copiedField === 'description' ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
        {/* Note */}
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-sm text-blue-800 dark:text-blue-200">
          <p>
            <span className="font-semibold">Lưu ý:</span> Vui lòng nhập chính xác nội dung chuyển khoản để hệ thống
            tự động xác nhận thanh toán của bạn.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
