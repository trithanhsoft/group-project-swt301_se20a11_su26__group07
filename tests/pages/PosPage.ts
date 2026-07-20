/**
 * POS Page Object
 * Đóng gói interactions với /staff/pos và /staff/session
 */
import { Page, Locator, expect } from '@playwright/test';

export class PosPage {
  readonly page: Page;

  // ── Session ────────────────────────────────────────────────────────
  readonly openSessionButton: Locator;
  readonly startingCashInput: Locator;
  readonly sessionNotesInput: Locator;
  readonly confirmOpenSessionButton: Locator;
  readonly closeSessionButton: Locator;
  readonly endingCashInput: Locator;
  readonly confirmCloseSessionButton: Locator;
  readonly sessionStatus: Locator;

  // ── POS Interface ──────────────────────────────────────────────────
  readonly productSearch: Locator;
  readonly cartItems: Locator;
  readonly totalAmount: Locator;
  readonly checkoutButton: Locator;
  readonly paymentMethodCash: Locator;
  readonly paymentMethodQR: Locator;
  readonly amountReceivedInput: Locator;
  readonly confirmOrderButton: Locator;
  readonly orderSuccessMessage: Locator;

  constructor(page: Page) {
    this.page = page;

    // Session panel
    this.openSessionButton = page.getByRole('button', { name: /mở ca|open session/i });
    this.startingCashInput = page.getByLabel(/tiền mặt đầu ca|starting cash/i);
    this.sessionNotesInput = page.getByLabel(/ghi chú|notes/i);
    this.confirmOpenSessionButton = page.getByRole('button', { name: /xác nhận mở ca|confirm/i });
    this.closeSessionButton = page.getByRole('button', { name: /kết ca|close session/i });
    this.endingCashInput = page.getByLabel(/tiền thực tế|ending cash/i);
    this.confirmCloseSessionButton = page.getByRole('button', { name: /xác nhận kết ca/i });
    this.sessionStatus = page.getByTestId('session-status');

    // POS interface
    this.productSearch = page.getByPlaceholder(/tìm sản phẩm|search product/i);
    this.cartItems = page.getByTestId('cart-item');
    this.totalAmount = page.getByTestId('cart-total');
    this.checkoutButton = page.getByRole('button', { name: /thanh toán|checkout/i });
    this.paymentMethodCash = page.getByLabel(/tiền mặt|cash/i);
    this.paymentMethodQR = page.getByLabel(/QR/i);
    this.amountReceivedInput = page.getByLabel(/tiền nhận|amount received/i);
    this.confirmOrderButton = page.getByRole('button', { name: /xác nhận đơn|confirm order/i });
    this.orderSuccessMessage = page.getByText(/đặt hàng thành công|order success/i);
  }

  async goto() {
    await this.page.goto('/staff/pos');
  }

  async gotoSession() {
    await this.page.goto('/staff/session');
  }

  /**
   * Thêm sản phẩm vào giỏ bằng cách click vào card sản phẩm
   */
  async addProductToCart(productName: string) {
    const productCard = this.page
      .getByTestId('product-card')
      .filter({ hasText: productName });
    await productCard.click();
  }

  /**
   * Thực hiện thanh toán bằng tiền mặt
   */
  async checkoutWithCash(amountReceived: number) {
    await this.checkoutButton.click();
    await this.paymentMethodCash.check();
    await this.amountReceivedInput.fill(String(amountReceived));
    await this.confirmOrderButton.click();
  }

  /**
   * Lấy tổng tiền từ giỏ hàng (parse số)
   */
  async getTotalAmount(): Promise<number> {
    const text = await this.totalAmount.innerText();
    // Loại bỏ ký tự không phải số
    return parseInt(text.replace(/\D/g, ''), 10);
  }
}
