import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Receipt, 
  Plus, 
  Edit2, 
  Trash2, 
  Image as ImageIcon, 
  Calendar, 
  FileText, 
  X, 
  Eye,
  LayoutGrid,
  List as ListIcon,
  User,
  ArrowDownRight
} from 'lucide-react';
import { ExpenseItem } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';

interface ExpenseListProps {
  expenses: ExpenseItem[];
  onEditExpense: (expense: ExpenseItem) => void;
  onDeleteExpense: (id: string) => void;
  onAddNewExpense: () => void;
  onViewImage: (url: string, title: string) => void;
}

type ViewMode = 'cards' | 'table';

const CATEGORY_NAMES: Record<ExpenseItem['category'], { label: string; color: string }> = {
  buy_uniform: { label: 'Áo đồng phục', color: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800' },
  buy_helmet: { label: 'Mũ bảo hiểm', color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800' },
  buy_delivery_box: { label: 'Thùng đựng hàng', color: 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-300 dark:border-amber-700' },
  print_logo: { label: 'In ấn logo', color: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800' },
  refund_driver: { label: 'Hoàn tiền tài xế', color: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800' },
  warehouse_shipping: { label: 'Kho bãi / Ship', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700' },
  other: { label: 'Chi phí khác', color: 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200 dark:border-purple-800' },
};

export const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  onEditExpense,
  onDeleteExpense,
  onAddNewExpense,
  onViewImage,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [hasReceiptOnly, setHasReceiptOnly] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('cards');

  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      const term = searchTerm.toLowerCase().trim();
      const matchSearch =
        !term ||
        exp.title.toLowerCase().includes(term) ||
        (exp.recipient && exp.recipient.toLowerCase().includes(term)) ||
        (exp.internalNote && exp.internalNote.toLowerCase().includes(term));

      if (!matchSearch) return false;

      if (selectedCategory !== 'all' && exp.category !== selectedCategory) {
        return false;
      }

      if (hasReceiptOnly && !exp.receiptImageUrl) {
        return false;
      }

      return true;
    });
  }, [expenses, searchTerm, selectedCategory, hasReceiptOnly]);

  const totalFilteredAmount = useMemo(() => {
    return filteredExpenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  }, [filteredExpenses]);

  return (
    <div className="space-y-4">
      
      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
          
          {/* Input search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="search-expense-input"
              type="text"
              placeholder="Tìm kiếm khoản chi, người nhận, ghi chú nội bộ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Controls: Stats & View Switcher */}
          <div className="flex items-center justify-between sm:justify-end gap-3 text-xs">
            <label className="flex items-center space-x-1.5 cursor-pointer text-slate-600 dark:text-slate-400 select-none">
              <input
                type="checkbox"
                checked={hasReceiptOnly}
                onChange={(e) => setHasReceiptOnly(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>Có Bill ảnh</span>
            </label>

            <div className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg text-xs flex items-center transition ${
                  viewMode === 'cards'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs font-semibold'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title="Dạng thẻ"
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden md:inline ml-1.5 text-xs">Thẻ</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`hidden sm:flex p-1.5 rounded-lg text-xs items-center transition ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs font-semibold'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title="Dạng bảng"
              >
                <ListIcon className="w-4 h-4" />
                <span className="hidden md:inline ml-1.5 text-xs">Bảng</span>
              </button>
            </div>
          </div>
        </div>

        {/* Category filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Tất cả ({expenses.length})
          </button>

          {Object.entries(CATEGORY_NAMES).map(([key, info]) => {
            const count = expenses.filter(e => e.category === key).length;
            return (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition shrink-0 ${
                  selectedCategory === key
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {info.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Tổng tiền theo bộ lọc */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
          <span>Đang hiển thị {filteredExpenses.length} khoản chi</span>
          <span>
            Tổng chi: <strong className="text-rose-600 dark:text-rose-400 font-mono text-sm font-bold">{formatCurrency(totalFilteredAmount)}</strong>
          </span>
        </div>
      </div>

      {/* Expenses Content */}
      {filteredExpenses.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 text-center border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Receipt className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Chưa có khoản chi nào
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Bạn có thể note các khoản chi may áo, mũ, hoàn cọc và tải ảnh bill chuyển khoản để đối soát.
          </p>
          <button
            onClick={onAddNewExpense}
            className="mt-4 inline-flex items-center px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-xs transition"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Ghi nhận khoản chi mới
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        /* DẠNG THẺ (CARDS VIEW) - Đẹp mắt & trực quan trên di động */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {filteredExpenses.map((expense) => {
            const catInfo = CATEGORY_NAMES[expense.category] || CATEGORY_NAMES.other;

            return (
              <div
                key={expense.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition flex flex-col justify-between overflow-hidden"
              >
                <div className="p-4 space-y-3">
                  
                  {/* Row 1: Header Ngày & Số tiền */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[11px] text-slate-400 flex items-center font-mono">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(expense.date)}
                      </span>
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm mt-0.5">
                        {expense.title}
                      </h3>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-base font-extrabold text-rose-600 dark:text-rose-400 font-mono tracking-tight">
                        -{formatCurrency(expense.amount)}
                      </span>
                    </div>
                  </div>

                  {/* Row 2: Danh mục & Người nhận */}
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-semibold border ${catInfo.color}`}>
                      {catInfo.label}
                    </span>

                    {expense.recipient && (
                      <span className="inline-flex items-center text-slate-500 dark:text-slate-400 text-[11px]">
                        <User className="w-3 h-3 mr-1 text-slate-400" />
                        {expense.recipient}
                      </span>
                    )}
                  </div>

                  {/* Row 3: Ghi chú nội bộ */}
                  {expense.internalNote && (
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 text-[11px] text-slate-600 dark:text-slate-300 flex items-start">
                      <FileText className="w-3.5 h-3.5 mr-1.5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{expense.internalNote}</span>
                    </div>
                  )}

                  {/* Row 4: Ảnh Bill chuyển khoản nếu có */}
                  {expense.receiptImageUrl && (
                    <div 
                      onClick={() => onViewImage(expense.receiptImageUrl!, expense.title)}
                      className="cursor-pointer group relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 h-28 bg-slate-100 dark:bg-slate-800 flex items-center justify-center"
                    >
                      <img
                        src={expense.receiptImageUrl}
                        alt="Ảnh Bill"
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                      />
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-medium">
                        <Eye className="w-4 h-4 mr-1.5" />
                        Xem ảnh bill
                      </div>
                      <span className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded bg-slate-900/80 text-white text-[10px] font-mono">
                        Biên lai
                      </span>
                    </div>
                  )}

                </div>

                {/* Footer Action buttons */}
                <div className="px-4 py-3 bg-slate-50/80 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  {expense.receiptImageUrl ? (
                    <button
                      onClick={() => onViewImage(expense.receiptImageUrl!, expense.title)}
                      className="flex-1 min-h-[38px] px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 text-xs font-semibold flex items-center justify-center transition"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1.5" />
                      Xem Bill
                    </button>
                  ) : (
                    <span className="flex-1 text-[11px] text-slate-400 italic">Chưa đính kèm bill</span>
                  )}

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => onEditExpense(expense)}
                      className="min-h-[38px] p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-amber-500 text-xs flex items-center justify-center transition"
                      title="Sửa khoản chi"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Xóa khoản chi "${expense.title}"?`)) {
                          onDeleteExpense(expense.id);
                        }
                      }}
                      className="min-h-[38px] p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-500 text-xs flex items-center justify-center transition"
                      title="Xóa khoản chi"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        /* DẠNG BẢNG (TABLE VIEW) */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-3 px-4">Ngày & Mục Chi</th>
                  <th className="py-3 px-4">Phân Loại</th>
                  <th className="py-3 px-4">Số Tiền (VND)</th>
                  <th className="py-3 px-4">Người Nhận</th>
                  <th className="py-3 px-4">Ghi Chú Nội Bộ</th>
                  <th className="py-3 px-4 text-center">Ảnh Bill</th>
                  <th className="py-3 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
                {filteredExpenses.map((expense) => {
                  const catInfo = CATEGORY_NAMES[expense.category] || CATEGORY_NAMES.other;

                  return (
                    <tr 
                      key={expense.id} 
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
                    >
                      {/* Cột 1: Ngày & Tên khoản chi */}
                      <td className="py-3 px-4">
                        <div className="flex items-center text-slate-400 text-[11px] mb-0.5 font-mono">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatDate(expense.date)}
                        </div>
                        <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                          {expense.title}
                        </div>
                      </td>

                      {/* Cột 2: Danh mục */}
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${catInfo.color}`}>
                          {catInfo.label}
                        </span>
                      </td>

                      {/* Cột 3: Số tiền */}
                      <td className="py-3 px-4 font-bold text-rose-600 dark:text-rose-400 text-sm whitespace-nowrap font-mono">
                        -{formatCurrency(expense.amount)}
                      </td>

                      {/* Cột 4: Người nhận */}
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                        {expense.recipient || <span className="text-slate-400 italic">Chưa ghi</span>}
                      </td>

                      {/* Cột 5: Ghi chú nội bộ */}
                      <td className="py-3 px-4 max-w-xs">
                        {expense.internalNote ? (
                          <div className="flex items-start text-slate-600 dark:text-slate-300 text-[11px] bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl border border-slate-200 dark:border-slate-700/60">
                            <FileText className="w-3 h-3 mr-1 text-slate-400 shrink-0 mt-0.5" />
                            <span className="line-clamp-2">{expense.internalNote}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Không có ghi chú</span>
                        )}
                      </td>

                      {/* Cột 6: Ảnh bill */}
                      <td className="py-3 px-4 text-center">
                        {expense.receiptImageUrl ? (
                          <button
                            onClick={() => onViewImage(expense.receiptImageUrl!, expense.title)}
                            className="inline-flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            Xem Bill
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[11px] inline-flex items-center">
                            <ImageIcon className="w-3.5 h-3.5 mr-1 opacity-40" />
                            Chưa có
                          </span>
                        )}
                      </td>

                      {/* Cột 7: Thao tác */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => onEditExpense(expense)}
                            title="Sửa"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Xóa khoản chi "${expense.title}"?`)) {
                                onDeleteExpense(expense.id);
                              }
                            }}
                            title="Xóa"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
