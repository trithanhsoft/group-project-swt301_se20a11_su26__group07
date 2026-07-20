/**
 * KDS Page Object
 * Đóng gói interactions với /staff/kds
 */
import { Page, Locator } from '@playwright/test';

export class KdsPage {
  readonly page: Page;

  readonly pageHeading: Locator;
  readonly newOrdersColumn: Locator;
  readonly completedOrdersColumn: Locator;
  readonly kdsCards: Locator;
  readonly completeButtons: Locator;

  constructor(page: Page) {
    this.page = page;

    this.pageHeading = page.getByRole('heading', { name: /bếp|kds|kitchen/i });
    this.newOrdersColumn = page.getByTestId('kds-new-column').or(page.getByText(/đơn mới|new orders/i).locator('..'));
    this.completedOrdersColumn = page.getByTestId('kds-completed-column').or(page.getByText(/hoàn thành|completed/i).locator('..'));
    this.kdsCards = page.getByTestId('kds-card');
    this.completeButtons = page.getByRole('button', { name: /hoàn thành|complete|xong/i });
  }

  async goto() {
    await this.page.goto('/staff/kds');
  }

  /**
   * Đếm đơn mới đang hiển thị
   */
  async getNewOrderCount(): Promise<number> {
    return await this.newOrdersColumn.getByTestId('kds-card').count();
  }

  /**
   * Click hoàn thành trên đơn đầu tiên
   */
  async completeFirstOrder() {
    await this.completeButtons.first().click();
  }

  /**
   * Lấy kds card theo order code
   */
  getCardByOrderCode(orderCode: string): Locator {
    return this.kdsCards.filter({ hasText: orderCode });
  }
}
