/**
 * Products Page Object
 * Đóng gói interactions với /admin/products và /admin/products/new, /:id/edit
 */
import { Page, Locator } from '@playwright/test';

export class ProductsPage {
  readonly page: Page;

  // ── List ────────────────────────────────────────────────────────────
  readonly pageHeading: Locator;
  readonly addProductButton: Locator;
  readonly productTable: Locator;
  readonly productRows: Locator;
  readonly searchInput: Locator;
  readonly statusFilter: Locator;
  readonly tagFilter: Locator;

  // ── Form (Create / Edit) ───────────────────────────────────────────
  readonly nameInput: Locator;
  readonly priceInput: Locator;
  readonly statusSelect: Locator;
  readonly tagSelect: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;
  readonly formTitle: Locator;

  // ── Feedback ────────────────────────────────────────────────────────
  readonly successToast: Locator;
  readonly errorToast: Locator;
  readonly nameError: Locator;
  readonly priceError: Locator;

  constructor(page: Page) {
    this.page = page;

    // List
    this.pageHeading = page.getByRole('heading', { name: /sản phẩm|products/i });
    this.addProductButton = page.getByRole('button', { name: /thêm sản phẩm|add product|tạo mới/i });
    this.productTable = page.getByRole('table').or(page.getByTestId('product-table'));
    this.productRows = page.getByTestId('product-row');
    this.searchInput = page.getByPlaceholder(/tìm sản phẩm|search/i).or(page.getByLabel(/tìm kiếm/i));
    this.statusFilter = page.getByLabel(/trạng thái|status/i);
    this.tagFilter = page.getByLabel(/nhóm|tag/i);

    // Form
    this.nameInput = page.getByLabel(/tên sản phẩm|product name/i);
    this.priceInput = page.getByLabel(/giá|price/i);
    this.statusSelect = page.getByLabel(/trạng thái|status/i);
    this.tagSelect = page.getByLabel(/nhóm|tag/i);
    this.saveButton = page.getByRole('button', { name: /lưu|save|tạo|create/i });
    this.cancelButton = page.getByRole('button', { name: /hủy|cancel|quay lại/i });
    this.formTitle = page.getByRole('heading', { name: /thêm sản phẩm|sửa sản phẩm|tạo sản phẩm/i });

    // Feedback
    this.successToast = page.getByTestId('toast-success').or(page.getByRole('alert').filter({ hasText: /thành công/i }));
    this.errorToast = page.getByTestId('toast-error').or(page.getByRole('alert').filter({ hasText: /lỗi|thất bại/i }));
    this.nameError = page.getByTestId('name-error').or(page.locator('[data-field="name"] .error'));
    this.priceError = page.getByTestId('price-error').or(page.locator('[data-field="price"] .error'));
  }

  async gotoList() {
    await this.page.goto('/admin/products');
  }

  async gotoCreate() {
    await this.page.goto('/admin/products/new');
  }

  async gotoEdit(productId: string) {
    await this.page.goto(`/admin/products/${productId}/edit`);
  }

  async fillForm(data: { name?: string; price?: number; status?: string; tag?: string }) {
    if (data.name !== undefined) await this.nameInput.fill(String(data.name));
    if (data.price !== undefined) await this.priceInput.fill(String(data.price));
    if (data.status !== undefined) await this.statusSelect.selectOption(data.status);
    if (data.tag !== undefined) await this.tagSelect.selectOption(data.tag);
  }

  async save() {
    await this.saveButton.click();
  }

  /**
   * Đếm số dòng trong bảng sản phẩm
   */
  async getProductCount(): Promise<number> {
    return await this.productRows.count();
  }

  /**
   * Tìm product row theo tên
   */
  getProductRowByName(name: string): Locator {
    return this.productTable.getByRole('row').filter({ hasText: name });
  }
}
