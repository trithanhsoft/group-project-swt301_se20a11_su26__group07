import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ClipboardCheck,
  Download,
  Eraser,
  History,
  PackagePlus,
  RefreshCw,
  Upload,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  PackageOpen,
  RotateCcw,
} from 'lucide-react';
import { stockApi } from '../api/stockApi.js';
import { ingredientApi } from '../../ingredients/api/ingredientApi.js';
import { PageHeader } from '../../../components/layout/PageHeader.jsx';
import { Button } from '../../../components/common/Button.jsx';
import { Alert } from '../../../components/feedback/Alert.jsx';
import { Toast } from '../../../components/feedback/Toast.jsx';
import { TextInput } from '../../../components/forms/TextInput.jsx';
import { TextareaInput } from '../../../components/forms/TextareaInput.jsx';
import { CompactCode, buildCompactCode } from '../../../components/common/CompactCode.jsx';
import { DataTable } from '../../../components/common/DataTable.jsx';
import { StatusBadge } from '../../../components/common/StatusBadge.jsx';
import { validateNonNegativeNumber, validatePositiveNumber, handleNumberKeyDownBlock } from '../../../utils/validators.js';
import {
  downloadStockTemplate,
  parseStockTemplateFile,
  STOCK_TEMPLATE_MODES,
} from '../utils/stockSpreadsheet.js';
import { formatDateTime } from '../../../utils/date.js';
import { STOCK_TRANSACTION_TYPES } from '../../../constants/stockTransactionTypes.js';

const STOCK_MODES = Object.freeze({
  IMPORT: 'IMPORT',
  DAILY_COUNT: 'DAILY_COUNT',
});

function getTodayDateString() {
  return new Date().toISOString().slice(0, 10);
}

function createImportDraft(ingredients) {
  return Object.fromEntries(
    ingredients.map((ingredient) => [
      ingredient.id,
      {
        quantity: '',
        note: '',
      },
    ]),
  );
}

function createCountDraft(ingredients) {
  return Object.fromEntries(
    ingredients.map((ingredient) => [
      ingredient.id,
      {
        actualStock: String(ingredient.currentStock ?? 0),
        note: '',
      },
    ]),
  );
}

function normalizeNumericInput(value) {
  return String(value ?? '').replace(',', '.');
}

function formatDisplayNumber(value) {
  const numericValue = Number(value || 0);

  if (Number.isNaN(numericValue)) {
    return '0';
  }

  return numericValue % 1 === 0 ? String(numericValue) : numericValue.toFixed(2);
}

function buildInputStyle(hasError) {
  return hasError
    ? {
        borderColor: 'var(--color-error)',
        boxShadow: '0 0 0 1px var(--color-error)',
      }
    : undefined;
}

function getTransactionBadge(row) {
  if (row.type === STOCK_TRANSACTION_TYPES.ORDER_DEDUCT) {
    return {
      status: 'ERROR',
      label: 'Khấu trừ đơn',
    };
  }

  if (row.context === 'DAILY_COUNT') {
    return {
      status: 'WARNING',
      label: 'Kiểm kê ngày',
    };
  }

  if (row.type === STOCK_TRANSACTION_TYPES.IMPORT) {
    return {
      status: 'SUCCESS',
      label: 'Nhập kho',
    };
  }

  return {
    status: 'WARNING',
    label: 'Điều chỉnh',
  };
}

function formatStockDelta(value) {
  const numericValue = Number(value || 0);
  return `${numericValue > 0 ? '+' : ''}${numericValue}`;
}

export function StockPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'adjust';

  const setActiveTab = (tab) => {
    setSearchParams({ tab });
  };

  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');
  const [submitError, setSubmitError] = useState('');

  // ------------------ TAB 1: STOCK ADJUST (KIỂM KÊ & ĐIỀU CHỈNH) ------------------
  const importFileInputRef = useRef(null);
  const countFileInputRef = useRef(null);

  const [ingredients, setIngredients] = useState([]);
  const [activeMode, setActiveMode] = useState(STOCK_MODES.IMPORT);
  const [searchQuery, setSearchQuery] = useState('');
  const [importRows, setImportRows] = useState({});
  const [countRows, setCountRows] = useState({});
  const [importErrors, setImportErrors] = useState({});
  const [countErrors, setCountErrors] = useState({});
  const [importBatchNote, setImportBatchNote] = useState('');
  const [countBatchNote, setCountBatchNote] = useState('');
  const [countDate, setCountDate] = useState(getTodayDateString());
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImportingFile, setIsImportingFile] = useState(false);

  const applyFreshIngredientData = (nextIngredients) => {
    const sortedIngredients = [...nextIngredients].sort((left, right) =>
      left.name.localeCompare(right.name, 'vi'),
    );

    setIngredients(sortedIngredients);
    setImportRows(createImportDraft(sortedIngredients));
    setCountRows(createCountDraft(sortedIngredients));
    setImportErrors({});
    setCountErrors({});
  };

  const loadIngredients = async () => {
    setIsLoading(true);
    setSubmitError('');

    try {
      const response = await ingredientApi.getIngredients();
      applyFreshIngredientData(response.data.ingredients || []);
    } catch (loadError) {
      setIngredients([]);
      setImportRows({});
      setCountRows({});
      setSubmitError(loadError.message || 'Không tải được danh sách nguyên liệu.');
    } finally {
      setIsLoading(false);
    }
  };

  const visibleIngredients = ingredients.filter((ingredient) => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return true;
    }

    return [
      ingredient.name,
      ingredient.unit,
      ingredient.id,
      buildCompactCode(ingredient.id, 'NL'),
    ]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(normalizedQuery));
  });

  const readyImportRows = ingredients.filter((ingredient) => {
    const quantity = Number(importRows[ingredient.id]?.quantity || 0);
    return Number.isFinite(quantity) && quantity > 0;
  });

  const totalImportQuantity = readyImportRows.reduce(
    (sum, ingredient) => sum + Number(importRows[ingredient.id]?.quantity || 0),
    0,
  );

  const countPreviewRows = ingredients.map((ingredient) => {
    const actualStock = Number(countRows[ingredient.id]?.actualStock ?? ingredient.currentStock ?? 0);
    const differenceQuantity = actualStock - Number(ingredient.currentStock || 0);

    return {
      ingredientId: ingredient.id,
      differenceQuantity,
    };
  });

  const changedCountRows = countPreviewRows.filter((row) => row.differenceQuantity !== 0);
  const totalCountDifference = countPreviewRows.reduce(
    (sum, row) => sum + row.differenceQuantity,
    0,
  );

  const handleImportRowChange = (ingredientId, fieldName, value) => {
    setImportRows((current) => ({
      ...current,
      [ingredientId]: {
        ...current[ingredientId],
        [fieldName]: fieldName === 'quantity' ? normalizeNumericInput(value) : value,
      },
    }));

    if (importErrors[ingredientId]) {
      setImportErrors((current) => ({ ...current, [ingredientId]: '' }));
    }
  };

  const handleCountRowChange = (ingredientId, fieldName, value) => {
    setCountRows((current) => ({
      ...current,
      [ingredientId]: {
        ...current[ingredientId],
        [fieldName]: fieldName === 'actualStock' ? normalizeNumericInput(value) : value,
      },
    }));

    if (countErrors[ingredientId]) {
      setCountErrors((current) => ({ ...current, [ingredientId]: '' }));
    }
  };

  const clearImportInputs = () => {
    if (window.confirm('Bạn có chắc muốn xóa tất cả số lượng nhập đang soạn thảo?')) {
      setImportRows(createImportDraft(ingredients));
      setImportErrors({});
    }
  };

  const resetCountInputs = () => {
    if (window.confirm('Đặt lại tất cả số lượng tồn thực tế bằng số lượng tồn lý thuyết hiện tại?')) {
      setCountRows(createCountDraft(ingredients));
      setCountErrors({});
    }
  };

  const handleImportSubmit = async (event) => {
    event.preventDefault();
    setSubmitError('');

    if (readyImportRows.length === 0) {
      setSubmitError('Bạn chưa nhập số lượng nhập cho bất kỳ nguyên liệu nào.');
      return;
    }

    const nextErrors = {};
    readyImportRows.forEach((ingredient) => {
      const quantityStr = importRows[ingredient.id]?.quantity;
      const quantityNum = Number(quantityStr);
      const validationError = validatePositiveNumber(quantityNum);

      if (validationError) {
        nextErrors[ingredient.id] = validationError;
      }
    });

    if (Object.keys(nextErrors).length > 0) {
      setImportErrors(nextErrors);
      setSubmitError('Vui lòng kiểm tra lại số liệu nhập kho. Số lượng phải là số dương hợp lệ.');
      return;
    }

    if (
      !window.confirm(
        `Xác nhận ghi nhận nhập ${readyImportRows.length} nguyên liệu với tổng số lượng là ${formatDisplayNumber(totalImportQuantity)}?`
      )
    ) {
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        note: importBatchNote.trim() || undefined,
        items: readyImportRows.map((ingredient) => {
          const row = importRows[ingredient.id];
          return {
            ingredientId: ingredient.id,
            quantity: Number(row.quantity),
            note: row.note.trim() || undefined,
          };
        }),
      };

      await stockApi.submitImportBatch(payload);

      setToastType('success');
      setToastMsg('Ghi nhận lô nhập hàng thành công.');
      setImportBatchNote('');
      await loadIngredients();
    } catch (apiError) {
      setSubmitError(apiError.message || 'Lỗi hệ thống khi gửi lô nhập hàng.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDailyCountSubmit = async (event) => {
    event.preventDefault();
    setSubmitError('');

    if (!countDate) {
      setSubmitError('Vui lòng chọn ngày kiểm kê kho.');
      return;
    }

    const nextErrors = {};
    ingredients.forEach((ingredient) => {
      const draft = countRows[ingredient.id];
      const quantityNum = Number(draft?.actualStock);
      const validationError = validateNonNegativeNumber(quantityNum);

      if (validationError) {
        nextErrors[ingredient.id] = validationError;
      }
    });

    if (Object.keys(nextErrors).length > 0) {
      setCountErrors(nextErrors);
      setSubmitError('Vui lòng kiểm tra lại số liệu thực tế. Số lượng không được âm.');
      return;
    }

    if (changedCountRows.length === 0) {
      if (
        !window.confirm(
          'Tất cả số lượng thực tế khớp hoàn hảo với lý thuyết. Không có chênh lệch nào được ghi nhận. Bạn vẫn muốn lưu chứ?'
        )
      ) {
        return;
      }
    } else {
      const differenceDetails = changedCountRows
        .map((row) => {
          const ing = ingredients.find((i) => i.id === row.ingredientId);
          return `  - ${ing?.name}: chênh lệch ${formatStockDelta(row.differenceQuantity)} ${ing?.unit}`;
        })
        .slice(0, 5)
        .join('\n');

      const differenceSummaryText =
        changedCountRows.length > 5
          ? `${differenceDetails}\n  ... và ${changedCountRows.length - 5} nguyên liệu khác.`
          : differenceDetails;

      if (
        !window.confirm(
          `Ghi nhận báo cáo kiểm kê ngày ${countDate}?\nDanh sách chênh lệch phát hiện:\n${differenceSummaryText}\n\nTổng chênh lệch là ${formatStockDelta(totalCountDifference)} sản phẩm.`
        )
      ) {
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const payload = {
        countDate,
        note: countBatchNote.trim() || undefined,
        items: ingredients.map((ingredient) => {
          const row = countRows[ingredient.id];
          return {
            ingredientId: ingredient.id,
            actualStock: Number(row.actualStock),
            note: row.note.trim() || undefined,
          };
        }),
      };

      await stockApi.submitDailyCount(payload);

      setToastType('success');
      setToastMsg('Lưu kết quả kiểm kê kho thành công.');
      setCountBatchNote('');
      await loadIngredients();
    } catch (apiError) {
      setSubmitError(apiError.message || 'Lỗi hệ thống khi gửi phiếu kiểm kê.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTemplateDownload = (mode) => {
    try {
      downloadStockTemplate(ingredients, mode);
      setToastType('success');
      setToastMsg('Tải file mẫu Excel thành công. Hãy mở file chỉnh sửa và nạp lại.');
    } catch (err) {
      setSubmitError(err.message || 'Không tạo được file mẫu tải về.');
    }
  };

  const handleTemplateUpload = async (mode, file) => {
    if (!file) {
      return;
    }

    setSubmitError('');
    setIsImportingFile(true);

    try {
      const templateMode =
        mode === STOCK_MODES.IMPORT ? STOCK_TEMPLATE_MODES.IMPORT : STOCK_TEMPLATE_MODES.DAILY_COUNT;

      const parsedItems = await parseStockTemplateFile(file, templateMode);

      if (mode === STOCK_MODES.IMPORT) {
        const nextImportRows = { ...importRows };
        const nextImportErrors = { ...importErrors };

        parsedItems.forEach((item) => {
          if (nextImportRows[item.ingredientId]) {
            nextImportRows[item.ingredientId] = {
              quantity: String(item.quantity ?? ''),
              note: item.note ?? '',
            };
            nextImportErrors[item.ingredientId] = '';
          }
        });

        setImportRows(nextImportRows);
        setImportErrors(nextImportErrors);
        setToastType('success');
        setToastMsg(`Đã điền ${parsedItems.length} dòng số liệu nhập hàng từ Excel.`);
      } else {
        const nextCountRows = { ...countRows };
        const nextCountErrors = { ...countErrors };

        parsedItems.forEach((item) => {
          if (nextCountRows[item.ingredientId]) {
            nextCountRows[item.ingredientId] = {
              actualStock: String(item.actualStock ?? ''),
              note: item.note ?? '',
            };
            nextCountErrors[item.ingredientId] = '';
          }
        });

        setCountRows(nextCountRows);
        setCountErrors(nextCountErrors);
        setToastType('success');
        setToastMsg(`Đã điền ${parsedItems.length} dòng số liệu kiểm kê thực tế từ Excel.`);
      }
    } catch (err) {
      setSubmitError(`Lỗi đọc file: ${err.message || 'Vui lòng kiểm tra lại cấu trúc file nạp.'}`);
    } finally {
      setIsImportingFile(false);
    }
  };

  // ------------------ TAB 2: SMART FORECAST (DỰ BÁO TỒN KHO) ------------------
  const [forecasts, setForecasts] = useState([]);
  const [isForecastLoading, setIsForecastLoading] = useState(false);
  const [forecastError, setForecastError] = useState('');
  const [forecastSearch, setForecastSearch] = useState('');

  const fetchForecast = async () => {
    try {
      setIsForecastLoading(true);
      setForecastError('');
      const response = await stockApi.getForecast();
      setForecasts(response.data || []);
    } catch (err) {
      setForecastError(err.message || 'Không thể tải báo cáo dự báo tồn kho.');
    } finally {
      setIsForecastLoading(false);
    }
  };

  const filteredForecasts = forecasts.filter((f) =>
    f.name.toLowerCase().includes(forecastSearch.toLowerCase())
  );

  const criticalItems = forecasts.filter(
    (f) => f.days_remaining !== null && f.days_remaining <= 5
  );
  const reorderList = forecasts.filter((f) => f.suggested_reorder > 0);

  const handleCopyReorders = () => {
    if (reorderList.length === 0) return;
    const text = reorderList
      .map((item) => `- ${item.name}: đề xuất nhập ${item.suggested_reorder} ${item.unit}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setToastType('success');
    setToastMsg('Đã sao chép danh sách đề xuất nhập hàng vào clipboard!');
  };

  const forecastHeaders = [
    {
      key: 'name',
      label: 'Nguyên liệu',
      render: (row) => <strong style={{ color: 'var(--color-primary)' }}>{row.name}</strong>,
    },
    {
      key: 'current_stock',
      label: 'Tồn kho hiện tại',
      render: (row) => (
        <span style={{ fontWeight: '600' }}>
          {row.current_stock} {row.unit}
        </span>
      ),
    },
    {
      key: 'low_stock_threshold',
      label: 'Ngưỡng định mức',
      render: (row) => (
        <span style={{ color: 'var(--color-secondary)' }}>
          {row.low_stock_threshold} {row.unit}
        </span>
      ),
    },
    {
      key: 'average_daily_usage',
      label: 'Tiêu thụ/ngày (30 ngày)',
      render: (row) => (
        <span style={{ fontWeight: '500' }}>
          {row.average_daily_usage} {row.unit}
        </span>
      ),
    },
    {
      key: 'days_remaining',
      label: 'Thời gian còn lại',
      render: (row) => {
        if (row.days_remaining === null) {
          return <StatusBadge status="ACTIVE" customLabel="Chưa có dữ liệu" />;
        }
        if (row.days_remaining <= 3) {
          return <StatusBadge status="ERROR" customLabel={`~${row.days_remaining} ngày (Nguy cấp)`} />;
        }
        if (row.days_remaining <= 5) {
          return <StatusBadge status="WARNING" customLabel={`~${row.days_remaining} ngày (Cảnh báo)`} />;
        }
        return <StatusBadge status="SUCCESS" customLabel={`~${row.days_remaining} ngày (An toàn)`} />;
      },
    },
    {
      key: 'suggested_reorder',
      label: 'Đề xuất nhập thêm',
      style: { textAlign: 'right' },
      render: (row) =>
        row.suggested_reorder > 0 ? (
          <span
            style={{
              color: 'var(--color-error)',
              fontWeight: '700',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <AlertTriangle size={14} />
            +{row.suggested_reorder} {row.unit}
          </span>
        ) : (
          <span style={{ color: 'var(--color-status-success-text)', fontWeight: '600' }}>Đủ dùng</span>
        ),
    },
  ];

  // ------------------ TAB 3: TRANSACTIONS (LỊCH SỬ NHẬP XUẤT) ------------------
  const [transactions, setTransactions] = useState([]);
  const [isTxLoading, setIsTxLoading] = useState(true);
  const [txError, setTxError] = useState('');

  const fetchTransactions = async () => {
    try {
      setIsTxLoading(true);
      setTxError('');
      const response = await stockApi.getTransactions();
      setTransactions(response.data.transactions || []);
    } catch (err) {
      setTransactions([]);
      setTxError(err.message || 'Không tải được lịch sử giao dịch kho.');
    } finally {
      setIsTxLoading(false);
    }
  };

  const txHeaders = [
    {
      key: 'ingredientCode',
      label: 'Mã NL',
      style: { width: '120px', whiteSpace: 'nowrap' },
      render: (row) => <CompactCode value={row.ingredientId} prefix="NL" />,
    },
    {
      key: 'ingredientName',
      label: 'Nguyên liệu',
      style: { minWidth: '220px' },
      render: (row) => <strong style={{ color: 'var(--color-primary)' }}>{row.ingredientName}</strong>,
    },
    {
      key: 'context',
      label: 'Nguồn',
      style: { width: '150px', textAlign: 'center', whiteSpace: 'nowrap' },
      render: (row) => {
        const badge = getTransactionBadge(row);
        return (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <StatusBadge status={badge.status} customLabel={badge.label} />
          </div>
        );
      },
    },
    {
      key: 'quantity',
      label: 'Chênh lệch',
      style: { width: '130px', textAlign: 'right', whiteSpace: 'nowrap' },
      render: (row) => {
        const delta = Number(row.quantity || 0);
        return (
          <span
            style={{
              fontWeight: '700',
              color: delta > 0 ? 'var(--color-status-success-text)' : 'var(--color-error)',
            }}
          >
            {formatStockDelta(row.quantity)}
          </span>
        );
      },
    },
    {
      key: 'createdAt',
      label: 'Thời gian',
      style: { width: '180px', whiteSpace: 'nowrap' },
      render: (row) => formatDateTime(row.createdAt),
    },
    {
      key: 'note',
      label: 'Ghi chú',
      render: (row) => row.note || '-',
    },
  ];

  // ------------------ MAIN SWITCH LOAD LOGIC ------------------
  useEffect(() => {
    /* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */
    if (activeTab === 'forecast') {
      void fetchForecast();
    } else if (activeTab === 'transactions') {
      void fetchTransactions();
    } else if (activeTab === 'adjust') {
      void loadIngredients();
    }
    /* eslint-enable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */
  }, [activeTab]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
      <PageHeader
        title="Quản lý kho & Dự báo"
        description="Theo dõi số lượng hàng tồn, thống kê lượng nhập xuất, dự báo thời điểm hết nguyên liệu thông minh."
        actions={
          activeTab === 'adjust' ? (
            <>
              <Button variant="secondary" onClick={loadIngredients} disabled={isLoading} icon={<RefreshCw size={16} />}>
                Làm mới danh sách
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleTemplateDownload(activeMode)}
                disabled={isLoading}
                icon={<Download size={16} />}
              >
                Tải file mẫu Excel
              </Button>
              <Button
                variant="primary"
                onClick={() =>
                  activeMode === STOCK_MODES.IMPORT
                    ? importFileInputRef.current?.click()
                    : countFileInputRef.current?.click()
                }
                disabled={isLoading || isImportingFile}
                icon={<Upload size={16} />}
              >
                Nạp số liệu từ file Excel
              </Button>
            </>
          ) : activeTab === 'forecast' ? (
            <Button variant="secondary" onClick={fetchForecast} disabled={isForecastLoading} icon={<RotateCcw size={16} />}>
              Tải lại dự báo
            </Button>
          ) : (
            <Button variant="secondary" onClick={fetchTransactions} disabled={isTxLoading} icon={<RotateCcw size={16} />}>
              Tải lại lịch sử
            </Button>
          )
        }
      />

      {submitError && <Alert type="error" message={submitError} onClose={() => setSubmitError('')} />}
      {forecastError && <Alert type="error" message={forecastError} onClose={() => setForecastError('')} />}
      {txError && <Alert type="error" message={txError} onClose={() => setTxError('')} />}

      {/* Tab Navigation */}
      <div
        className="tab-container"
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: 'var(--spacing-md)',
          borderBottom: '1px solid var(--color-surface-container-high)',
          paddingBottom: '8px',
        }}
      >
        <button
          onClick={() => setActiveTab('adjust')}
          className={`btn ${activeTab === 'adjust' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <PackageOpen size={18} />
          Kiểm kê & Điều chỉnh kho
        </button>
        <button
          onClick={() => setActiveTab('forecast')}
          className={`btn ${activeTab === 'forecast' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <TrendingUp size={18} />
          Dự báo & Đề xuất nhập
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`btn ${activeTab === 'transactions' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <History size={18} />
          Lịch sử nhập xuất
        </button>
      </div>

      {/* ------------------ TAB 1: STOCK ADJUST (KIỂM KÊ & ĐIỀU CHỈNH) ------------------ */}
      {activeTab === 'adjust' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
          {/* Sub-mode selections (Import vs Daily count) */}
          <div className="card" style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className={`btn ${activeMode === STOCK_MODES.IMPORT ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveMode(STOCK_MODES.IMPORT)}
              >
                Nhập kho hàng loạt
              </button>
              <button
                type="button"
                className={`btn ${activeMode === STOCK_MODES.DAILY_COUNT ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveMode(STOCK_MODES.DAILY_COUNT)}
              >
                Kiểm kê tồn thực tế hàng ngày
              </button>
            </div>

            <div style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'center', flexWrap: 'wrap' }}>
              {activeMode === STOCK_MODES.DAILY_COUNT && (
                <div style={{ width: '160px' }}>
                  <TextInput
                    type="date"
                    label=""
                    name="countDate"
                    value={countDate}
                    onChange={(e) => setCountDate(e.target.value)}
                    required
                  />
                </div>
              )}
              <div style={{ width: '260px' }}>
                <TextInput
                  placeholder="Tìm kiếm nguyên liệu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Excel spreadsheet templates file input tags */}
          <input
            type="file"
            ref={importFileInputRef}
            accept=".xlsx,.xls,.csv"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              void handleTemplateUpload(STOCK_MODES.IMPORT, file);
              e.target.value = '';
            }}
          />
          <input
            type="file"
            ref={countFileInputRef}
            accept=".xlsx,.xls,.csv"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              void handleTemplateUpload(STOCK_MODES.DAILY_COUNT, file);
              e.target.value = '';
            }}
          />

          {/* Tab 1 content mode forms */}
          {activeMode === STOCK_MODES.IMPORT ? (
            <form onSubmit={handleImportSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
              <div className="responsive-split-layout">
                <TextareaInput
                  label="Ghi chú chung cho đợt nhập"
                  name="importBatchNote"
                  value={importBatchNote}
                  onChange={(e) => setImportBatchNote(e.target.value)}
                  placeholder="Ví dụ: nhập hàng đầu ngày, nhập theo phiếu NCC số 25..."
                  rows={3}
                  disabled={isLoading || isSubmitting}
                />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ fontSize: '14px', color: 'var(--color-secondary)' }}>
                    Mẫu Excel đã có sẵn toàn bộ nguyên liệu. Bạn chỉ cần sửa cột số lượng nhập rồi nạp lại file để điền hàng loạt.
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button variant="secondary" onClick={clearImportInputs} disabled={isLoading || isSubmitting} icon={<Eraser size={16} />}>
                      Xóa các ô đã nhập
                    </Button>
                  </div>
                </div>
              </div>

              <div className="table-container">
                <table className="data-table" style={{ minWidth: '1100px' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '124px' }}>Mã NL</th>
                      <th style={{ minWidth: '240px' }}>Tên nguyên liệu</th>
                      <th style={{ width: '90px', textAlign: 'center' }}>Đơn vị</th>
                      <th style={{ width: '130px', textAlign: 'right' }}>Tồn hiện tại</th>
                      <th style={{ width: '180px' }}>Số lượng nhập</th>
                      <th style={{ minWidth: '240px' }}>Ghi chú theo dòng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
                          <div className="spinner" style={{ margin: '0 auto 12px' }}></div>
                          <span style={{ color: 'var(--color-secondary)' }}>Đang tải danh sách nguyên liệu...</span>
                        </td>
                      </tr>
                    ) : visibleIngredients.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: 'var(--color-secondary)' }}>
                          Không có nguyên liệu nào phù hợp với bộ lọc hiện tại.
                        </td>
                      </tr>
                    ) : (
                      visibleIngredients.map((ingredient) => {
                        const row = importRows[ingredient.id] || { quantity: '', note: '' };
                        const rowError = importErrors[ingredient.id];

                        return (
                          <tr key={ingredient.id}>
                            <td>
                              <CompactCode value={ingredient.id} prefix="NL" />
                            </td>
                            <td>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <strong style={{ color: 'var(--color-primary)' }}>{ingredient.name}</strong>
                                <span style={{ fontSize: '12px', color: 'var(--color-secondary)' }}>
                                  ID: {ingredient.id}
                                </span>
                              </div>
                            </td>
                            <td style={{ textAlign: 'center', fontWeight: '600' }}>{ingredient.unit}</td>
                            <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                              {formatDisplayNumber(ingredient.currentStock)} {ingredient.unit}
                            </td>
                            <td>
                              <input
                                type="text"
                                inputMode="decimal"
                                value={row.quantity}
                                onChange={(e) => handleImportRowChange(ingredient.id, 'quantity', e.target.value)}
                                onKeyDown={handleNumberKeyDownBlock}
                                placeholder="Ví dụ: 500"
                                disabled={isSubmitting}
                                className="form-control"
                                style={buildInputStyle(Boolean(rowError))}
                              />
                              {rowError && (
                                <div style={{ color: 'var(--color-error)', fontSize: '12px', marginTop: '6px' }}>
                                  {rowError}
                                </div>
                              )}
                            </td>
                            <td>
                              <input
                                type="text"
                                value={row.note}
                                onChange={(e) => handleImportRowChange(ingredient.id, 'note', e.target.value)}
                                placeholder="Ghi chú tùy chọn"
                                disabled={isSubmitting}
                                className="form-control"
                              />
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button type="submit" variant="primary" loading={isSubmitting} icon={<PackagePlus size={16} />} disabled={isLoading || isImportingFile}>
                  Xác nhận nhập kho hàng loạt
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleDailyCountSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
              <div className="responsive-split-layout">
                <TextareaInput
                  label="Ghi chú chung cho phiên kiểm kê"
                  name="countBatchNote"
                  value={countBatchNote}
                  onChange={(e) => setCountBatchNote(e.target.value)}
                  placeholder="Ví dụ: kiểm kê cuối ngày, đối chiếu ca tối..."
                  rows={3}
                  disabled={isLoading || isSubmitting}
                />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ fontSize: '14px', color: 'var(--color-secondary)' }}>
                    Mỗi dòng sẽ so sánh tồn lý thuyết hiện có với tồn thực tế bạn nhập. Những dòng có chênh lệch sẽ được ghi thành điều chỉnh kho để đưa vào báo cáo sau này.
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button variant="secondary" onClick={resetCountInputs} disabled={isLoading || isSubmitting} icon={<Eraser size={16} />}>
                      Đặt lại theo tồn lý thuyết
                    </Button>
                  </div>
                </div>
              </div>

              <div className="table-container">
                <table className="data-table" style={{ minWidth: '1180px' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '124px' }}>Mã NL</th>
                      <th style={{ minWidth: '240px' }}>Tên nguyên liệu</th>
                      <th style={{ width: '90px', textAlign: 'center' }}>Đơn vị</th>
                      <th style={{ width: '140px', textAlign: 'right' }}>Tồn lý thuyết</th>
                      <th style={{ width: '180px' }}>Tồn thực tế</th>
                      <th style={{ width: '140px', textAlign: 'right' }}>Chênh lệch</th>
                      <th style={{ minWidth: '240px' }}>Ghi chú theo dòng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
                          <div className="spinner" style={{ margin: '0 auto 12px' }}></div>
                          <span style={{ color: 'var(--color-secondary)' }}>Đang tải danh sách nguyên liệu...</span>
                        </td>
                      </tr>
                    ) : visibleIngredients.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: 'var(--color-secondary)' }}>
                          Không có nguyên liệu nào phù hợp với bộ lọc hiện tại.
                        </td>
                      </tr>
                    ) : (
                      visibleIngredients.map((ingredient) => {
                        const row = countRows[ingredient.id] || {
                          actualStock: String(ingredient.currentStock ?? 0),
                          note: '',
                        };
                        const rowError = countErrors[ingredient.id];
                        const actualStock = Number(row.actualStock ?? ingredient.currentStock ?? 0);
                        const differenceQuantity = actualStock - Number(ingredient.currentStock || 0);

                        return (
                          <tr key={ingredient.id}>
                            <td>
                              <CompactCode value={ingredient.id} prefix="NL" />
                            </td>
                            <td>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <strong style={{ color: 'var(--color-primary)' }}>{ingredient.name}</strong>
                                <span style={{ fontSize: '12px', color: 'var(--color-secondary)' }}>
                                  ID: {ingredient.id}
                                </span>
                              </div>
                            </td>
                            <td style={{ textAlign: 'center', fontWeight: '600' }}>{ingredient.unit}</td>
                            <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                              {formatDisplayNumber(ingredient.currentStock)} {ingredient.unit}
                            </td>
                            <td>
                              <input
                                type="text"
                                inputMode="decimal"
                                value={row.actualStock}
                                onChange={(e) => handleCountRowChange(ingredient.id, 'actualStock', e.target.value)}
                                onKeyDown={handleNumberKeyDownBlock}
                                disabled={isSubmitting}
                                className="form-control"
                                style={buildInputStyle(Boolean(rowError))}
                              />
                              {rowError && (
                                <div style={{ color: 'var(--color-error)', fontSize: '12px', marginTop: '6px' }}>
                                  {rowError}
                                </div>
                              )}
                            </td>
                            <td
                              style={{
                                textAlign: 'right',
                                fontWeight: '700',
                                color:
                                  differenceQuantity > 0
                                    ? 'var(--color-tertiary-container)'
                                    : differenceQuantity < 0
                                    ? 'var(--color-error)'
                                    : 'var(--color-secondary)',
                                fontVariantNumeric: 'tabular-nums',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {differenceQuantity > 0 ? '+' : ''}
                              {formatDisplayNumber(differenceQuantity)} {ingredient.unit}
                            </td>
                            <td>
                              <input
                                type="text"
                                value={row.note}
                                onChange={(e) => handleCountRowChange(ingredient.id, 'note', e.target.value)}
                                placeholder="Ví dụ: đổ vỡ, thất thoát, kiểm kê thừa..."
                                disabled={isSubmitting}
                                className="form-control"
                              />
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button type="submit" variant="primary" loading={isSubmitting} icon={<ClipboardCheck size={16} />} disabled={isLoading || isImportingFile}>
                  Ghi nhận kiểm kê ngày
                </Button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* ------------------ TAB 2: SMART FORECAST (DỰ BÁO TỒN KHO) ------------------ */}
      {activeTab === 'forecast' && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-lg)', alignItems: 'flex-start' }}>
          {/* Main Forecast table (left) */}
          <div style={{ flex: '2 1 600px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="card" style={{ padding: 'var(--spacing-sm)' }}>
              <TextInput
                placeholder="Tìm kiếm nguyên liệu dự báo..."
                value={forecastSearch}
                onChange={(e) => setForecastSearch(e.target.value)}
              />
            </div>

            <DataTable
              headers={forecastHeaders}
              data={filteredForecasts}
              loading={isForecastLoading}
              emptyMessage="Không tìm thấy nguyên liệu nào trong báo cáo dự báo."
            />
          </div>

          {/* Warnings & Suggestions panel (right) */}
          <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Warning block */}
            <div className="card" style={{ borderLeft: criticalItems.length > 0 ? '4px solid var(--color-error)' : '4px solid var(--color-status-success-text)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--color-primary)', marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                {criticalItems.length > 0 ? <AlertTriangle size={18} style={{ color: 'var(--color-error)' }} /> : <CheckCircle2 size={18} style={{ color: 'var(--color-status-success-text)' }} />}
                Mức độ an toàn tồn kho
              </h3>
              {criticalItems.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <p style={{ margin: 0, fontSize: '14px', color: 'var(--color-on-surface)' }}>
                    Phát hiện <strong>{criticalItems.length} nguyên liệu</strong> sắp hết hàng trong vòng 5 ngày tới:
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                    {criticalItems.map((item) => (
                      <span
                        key={item.ingredient_id}
                        style={{
                          fontSize: '11px',
                          padding: '4px 8px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'rgba(239, 68, 68, 0.08)',
                          color: 'var(--color-error)',
                          border: '1px solid rgba(239, 68, 68, 0.2)',
                          fontWeight: '600',
                        }}
                      >
                        {item.name}: còn ~{item.days_remaining} ngày
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <p style={{ margin: 0, fontSize: '14px', color: 'var(--color-secondary)' }}>
                  Tất cả nguyên liệu hiện đang ở mức an toàn ổn định trên 5 ngày sử dụng.
                </p>
              )}
            </div>

            {/* Reorder Recommendation sheet */}
            <div className="card">
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--color-primary)', marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={18} />
                Phiếu đề xuất mua hàng
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--color-secondary)', margin: '0 0 12px 0' }}>
                Danh sách đề xuất số lượng nhập thêm nhằm đảm bảo hoạt động pha chế ổn định trong 14 ngày tới.
              </p>

              {reorderList.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '220px', overflowY: 'auto', border: '1px dashed var(--color-outline-variant)', borderRadius: 'var(--radius-sm)', padding: '10px', backgroundColor: 'var(--color-surface-container-low)' }}>
                    {reorderList.map((item) => (
                      <div key={item.ingredient_id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                        <span>{item.name}</span>
                        <strong style={{ color: 'var(--color-error)' }}>
                          +{item.suggested_reorder} {item.unit}
                        </strong>
                      </div>
                    ))}
                  </div>
                  <Button variant="primary" onClick={handleCopyReorders} icon={<Download size={14} />}>
                    Sao chép đề xuất
                  </Button>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--color-secondary)' }}>
                  <CheckCircle2 size={32} style={{ color: 'var(--color-status-success-text)', margin: '0 auto 8px', display: 'block' }} />
                  <span style={{ fontSize: '13px', fontWeight: '600' }}>Tồn kho đã được đảm bảo đầy đủ!</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ------------------ TAB 3: TRANSACTIONS (LỊCH SỬ NHẬP XUẤT) ------------------ */}
      {activeTab === 'transactions' && (
        <DataTable
          headers={txHeaders}
          data={transactions}
          loading={isTxLoading}
          emptyMessage="Không tìm thấy lịch sử giao dịch kho nào."
        />
      )}

      <Toast message={toastMsg} type={toastType} onClose={() => setToastMsg('')} />
    </div>
  );
}

export default StockPage;
