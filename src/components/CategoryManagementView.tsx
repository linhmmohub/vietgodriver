import React, { useState } from 'react';
import { 
  Boxes, 
  Receipt, 
  Settings, 
  Plus, 
  Edit2, 
  Trash2, 
  Check, 
  X, 
  AlertCircle, 
  DollarSign, 
  ShieldAlert, 
  Shirt, 
  HardHat, 
  Package, 
  Shield, 
  Layers, 
  Tag, 
  HelpCircle,
  Save,
  RotateCcw,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Info,
  Sliders
} from 'lucide-react';
import { 
  EquipmentCategory, 
  ExpenseCategoryConfig, 
  SystemFeeSettings, 
  ShirtSize, 
  AuthSession 
} from '../types';
import { formatCurrency } from '../utils/formatters';
import { CurrencyInput } from './CurrencyInput';
import { 
  DEFAULT_EQUIPMENT_CATEGORIES, 
  DEFAULT_EXPENSE_CATEGORIES, 
  DEFAULT_SYSTEM_FEE_SETTINGS 
} from '../utils/categories';

interface CategoryManagementViewProps {
  equipmentCategories: EquipmentCategory[];
  expenseCategories: ExpenseCategoryConfig[];
  systemFeeSettings: SystemFeeSettings;
  adminUser: AuthSession | null;
  onSaveEquipmentCategory: (cat: EquipmentCategory) => void;
  onDeleteEquipmentCategory: (id: string) => void;
  onSaveExpenseCategory: (cat: ExpenseCategoryConfig) => void;
  onDeleteExpenseCategory: (id: string) => void;
  onSaveFeeSettings: (settings: SystemFeeSettings) => void;
  onResetToDefaults: () => void;
}

type SettingsSubTab = 'equipment' | 'expenses' | 'policy';

const COLOR_MAP: Record<ExpenseCategoryConfig['color'], { bg: string; text: string; border: string; label: string }> = {
  emerald: { bg: 'bg-emerald-500/10 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-300 dark:border-emerald-800', label: 'Xanh lá cây' },
  blue: { bg: 'bg-blue-500/10 dark:bg-blue-950/40', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-300 dark:border-blue-800', label: 'Xanh dương' },
  amber: { bg: 'bg-amber-500/10 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-300 dark:border-amber-800', label: 'Vàng cam' },
  indigo: { bg: 'bg-indigo-500/10 dark:bg-indigo-950/40', text: 'text-indigo-700 dark:text-indigo-300', border: 'border-indigo-300 dark:border-indigo-800', label: 'Xanh chàm' },
  purple: { bg: 'bg-purple-500/10 dark:bg-purple-950/40', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-300 dark:border-purple-800', label: 'Tím đậm' },
  rose: { bg: 'bg-rose-500/10 dark:bg-rose-950/40', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-300 dark:border-rose-800', label: 'Hồng đỏ' },
  slate: { bg: 'bg-slate-500/10 dark:bg-slate-800/60', text: 'text-slate-700 dark:text-slate-300', border: 'border-slate-300 dark:border-slate-700', label: 'Xám ghi' },
  teal: { bg: 'bg-teal-500/10 dark:bg-teal-950/40', text: 'text-teal-700 dark:text-teal-300', border: 'border-teal-300 dark:border-teal-800', label: 'Xanh ngọc' },
  orange: { bg: 'bg-orange-500/10 dark:bg-orange-950/40', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-300 dark:border-orange-800', label: 'Cam tươi' },
  cyan: { bg: 'bg-cyan-500/10 dark:bg-cyan-950/40', text: 'text-cyan-700 dark:text-cyan-300', border: 'border-cyan-300 dark:border-cyan-800', label: 'Xanh cyan' },
};

export const CategoryManagementView: React.FC<CategoryManagementViewProps> = ({
  equipmentCategories,
  expenseCategories,
  systemFeeSettings,
  adminUser,
  onSaveEquipmentCategory,
  onDeleteEquipmentCategory,
  onSaveExpenseCategory,
  onDeleteExpenseCategory,
  onSaveFeeSettings,
  onResetToDefaults,
}) => {
  const [subTab, setSubTab] = useState<SettingsSubTab>('equipment');
  const isSuperAdmin = adminUser?.role === 'super_admin';

  // Modal State for Equipment Category
  const [isEquipModalOpen, setIsEquipModalOpen] = useState(false);
  const [editingEquip, setEditingEquip] = useState<EquipmentCategory | null>(null);
  const [equipForm, setEquipForm] = useState<{
    id: string;
    name: string;
    code: string;
    unit: string;
    icon: EquipmentCategory['icon'];
    defaultDeposit: number;
    hasSize: boolean;
    penaltyOnLoss: number;
    description: string;
    isActive: boolean;
  }>({
    id: '',
    name: '',
    code: '',
    unit: 'cái',
    icon: 'shirt',
    defaultDeposit: 100000,
    hasSize: false,
    penaltyOnLoss: 100000,
    description: '',
    isActive: true,
  });

  // Modal State for Expense Category
  const [isExpModalOpen, setIsExpModalOpen] = useState(false);
  const [editingExp, setEditingExp] = useState<ExpenseCategoryConfig | null>(null);
  const [expForm, setExpForm] = useState<{
    id: string;
    name: string;
    code: string;
    color: ExpenseCategoryConfig['color'];
    estimatedUnitPrice: number;
    description: string;
    isActive: boolean;
  }>({
    id: '',
    name: '',
    code: '',
    color: 'emerald',
    estimatedUnitPrice: 50000,
    description: '',
    isActive: true,
  });

  // Policy Settings Form State
  const [feeForm, setFeeForm] = useState<SystemFeeSettings>({
    defaultUniformDeposit: systemFeeSettings.defaultUniformDeposit || 300000,
    autoCalculateDepositFromItems: systemFeeSettings.autoCalculateDepositFromItems ?? true,
    defaultRefundPercentage: systemFeeSettings.defaultRefundPercentage ?? 100,
    feePolicyNote: systemFeeSettings.feePolicyNote || '',
    updatedAt: systemFeeSettings.updatedAt || new Date().toISOString(),
  });
  const [isFeeSavedFeedback, setIsFeeSavedFeedback] = useState(false);

  // Helper to open Add/Edit Equipment modal
  const handleOpenEquipModal = (cat?: EquipmentCategory) => {
    if (cat) {
      setEditingEquip(cat);
      setEquipForm({
        id: cat.id,
        name: cat.name,
        code: cat.code,
        unit: cat.unit || 'cái',
        icon: cat.icon || 'shirt',
        defaultDeposit: cat.defaultDeposit || 0,
        hasSize: cat.hasSize || false,
        penaltyOnLoss: cat.penaltyOnLoss || cat.defaultDeposit || 0,
        description: cat.description || '',
        isActive: cat.isActive !== false,
      });
    } else {
      const generatedId = 'item_' + Date.now();
      setEditingEquip(null);
      setEquipForm({
        id: generatedId,
        name: '',
        code: '',
        unit: 'cái',
        icon: 'package',
        defaultDeposit: 100000,
        hasSize: false,
        penaltyOnLoss: 100000,
        description: '',
        isActive: true,
      });
    }
    setIsEquipModalOpen(true);
  };

  const handleSaveEquipSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!equipForm.name.trim()) return;

    const finalId = editingEquip ? editingEquip.id : (equipForm.code ? equipForm.code.toLowerCase().replace(/[^a-z0-9]/g, '_') : equipForm.id);
    const updated: EquipmentCategory = {
      id: finalId,
      name: equipForm.name.trim(),
      code: equipForm.code.trim().toUpperCase() || 'TB',
      unit: equipForm.unit.trim() || 'cái',
      icon: equipForm.icon,
      defaultDeposit: equipForm.defaultDeposit || 0,
      hasSize: equipForm.hasSize,
      availableSizes: equipForm.hasSize ? ['S', 'M', 'L', 'XL', 'XXL', '3XL'] : undefined,
      penaltyOnLoss: equipForm.penaltyOnLoss || 0,
      description: equipForm.description.trim(),
      isActive: equipForm.isActive,
      order: editingEquip ? editingEquip.order : equipmentCategories.length + 1,
      createdAt: editingEquip ? editingEquip.createdAt : new Date().toISOString(),
    };

    onSaveEquipmentCategory(updated);
    setIsEquipModalOpen(false);
  };

  // Helper to open Add/Edit Expense Category modal
  const handleOpenExpModal = (cat?: ExpenseCategoryConfig) => {
    if (cat) {
      setEditingExp(cat);
      setExpForm({
        id: cat.id,
        name: cat.name,
        code: cat.code,
        color: cat.color || 'emerald',
        estimatedUnitPrice: cat.estimatedUnitPrice || 0,
        description: cat.description || '',
        isActive: cat.isActive !== false,
      });
    } else {
      const generatedId = 'exp_' + Date.now();
      setEditingExp(null);
      setExpForm({
        id: generatedId,
        name: '',
        code: '',
        color: 'emerald',
        estimatedUnitPrice: 50000,
        description: '',
        isActive: true,
      });
    }
    setIsExpModalOpen(true);
  };

  const handleSaveExpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expForm.name.trim()) return;

    const finalId = editingExp ? editingExp.id : (expForm.code ? expForm.code.toLowerCase().replace(/[^a-z0-9]/g, '_') : expForm.id);
    const updated: ExpenseCategoryConfig = {
      id: finalId,
      name: expForm.name.trim(),
      code: expForm.code.trim().toUpperCase() || 'CHI',
      color: expForm.color,
      estimatedUnitPrice: expForm.estimatedUnitPrice || 0,
      description: expForm.description.trim(),
      isActive: expForm.isActive,
      order: editingExp ? editingExp.order : expenseCategories.length + 1,
      createdAt: editingExp ? editingExp.createdAt : new Date().toISOString(),
    };

    onSaveExpenseCategory(updated);
    setIsExpModalOpen(false);
  };

  const handleSaveFeeSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: SystemFeeSettings = {
      ...feeForm,
      updatedAt: new Date().toISOString(),
    };
    onSaveFeeSettings(updated);
    setIsFeeSavedFeedback(true);
    setTimeout(() => setIsFeeSavedFeedback(false), 3000);
  };

  const renderIcon = (iconName: EquipmentCategory['icon']) => {
    switch (iconName) {
      case 'shirt':
        return <Shirt className="w-5 h-5" />;
      case 'helmet':
        return <HardHat className="w-5 h-5" />;
      case 'box':
        return <Package className="w-5 h-5" />;
      case 'shield':
        return <Shield className="w-5 h-5" />;
      case 'package':
        return <Boxes className="w-5 h-5" />;
      case 'layers':
        return <Layers className="w-5 h-5" />;
      case 'tag':
        return <Tag className="w-5 h-5" />;
      default:
        return <Boxes className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 text-white shadow-lg relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="h-12 w-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
              <Sliders className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg sm:text-xl font-black tracking-tight text-slate-100">
                  Cấu Hình Danh Mục & Chi Phí
                </h2>
                <span className="text-[11px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                  Admin Custom
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Quản lý thêm, sửa, xóa các loại trang bị đồng phục, danh mục chi tiêu và mức tiền cọc quy định
              </p>
            </div>
          </div>

          {/* Sub Navigation Pills */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700">
            <button
              id="subtab-equipment"
              onClick={() => setSubTab('equipment')}
              className={`flex items-center px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                subTab === 'equipment'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Boxes className="w-3.5 h-3.5 mr-1.5" />
              <span>Trang Bị ({equipmentCategories.length})</span>
            </button>

            <button
              id="subtab-expenses"
              onClick={() => setSubTab('expenses')}
              className={`flex items-center px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                subTab === 'expenses'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Receipt className="w-3.5 h-3.5 mr-1.5" />
              <span>Danh Mục Chi ({expenseCategories.length})</span>
            </button>

            <button
              id="subtab-policy"
              onClick={() => setSubTab('policy')}
              className={`flex items-center px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                subTab === 'policy'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5 mr-1.5" />
              <span>Mức Tiền Cọc & Thu Chi</span>
            </button>
          </div>
        </div>
      </div>

      {/* SUB TAB 1: EQUIPMENT CATEGORIES */}
      {subTab === 'equipment' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Boxes className="w-4 h-4 text-amber-500" />
                Danh Sách Trang Bị / Đồng Phục Cấp Phát
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Các món đồ cấp cho tài xế kèm mức cọc quy định và mức phạt trừ cọc khi làm mất
              </p>
            </div>

            <div className="flex items-center gap-2">
              {isSuperAdmin && (
                <button
                  id="btn-add-equipment-cat"
                  onClick={() => handleOpenEquipModal()}
                  className="inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-sm transition active:scale-95"
                >
                  <Plus className="w-4 h-4 mr-1.5 stroke-[2.5]" />
                  Thêm Trang Bị Mới
                </button>
              )}
            </div>
          </div>

          {/* Equipment Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {equipmentCategories.map((item) => {
              return (
                <div
                  key={item.id}
                  className={`bg-white dark:bg-slate-900 border rounded-2xl p-4.5 shadow-sm hover:shadow-md transition flex flex-col justify-between ${
                    item.isActive
                      ? 'border-slate-200 dark:border-slate-800'
                      : 'border-slate-200 dark:border-slate-800 opacity-60 bg-slate-50/60 dark:bg-slate-950/40'
                  }`}
                >
                  <div>
                    {/* Top Row: Icon, Name, Code & Badge */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                          {renderIcon(item.icon)}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                            {item.name}
                            <span className="text-[10px] font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded">
                              {item.code}
                            </span>
                          </h4>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            Đơn vị tính: {item.unit}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          item.isActive
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {item.isActive ? 'Hoạt động' : 'Tạm ẩn'}
                      </span>
                    </div>

                    {item.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
                        {item.description}
                      </p>
                    )}

                    {/* Financial Specs */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 space-y-2 border border-slate-100 dark:border-slate-800 mb-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                          Mức cọc quy định:
                        </span>
                        <span className="font-bold text-slate-900 dark:text-slate-100 font-mono">
                          {formatCurrency(item.defaultDeposit)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                          Trừ cọc nếu mất/hỏng:
                        </span>
                        <span className="font-bold text-rose-600 dark:text-rose-400 font-mono">
                          {formatCurrency(item.penaltyOnLoss)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                        <span className="text-slate-500 dark:text-slate-400">Có chọn Size:</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {item.hasSize ? 'Có (S / M / L / XL / XXL / 3XL)' : 'Không (Free size)'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  {isSuperAdmin && (
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => {
                          const updated = { ...item, isActive: !item.isActive };
                          onSaveEquipmentCategory(updated);
                        }}
                        className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition"
                      >
                        {item.isActive ? 'Tạm ngưng cấp' : 'Kích hoạt lại'}
                      </button>

                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleOpenEquipModal(item)}
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition"
                          title="Chỉnh sửa thông tin & chi phí"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Bạn có chắc chắn muốn xóa trang bị "${item.name}" khỏi danh mục không?`)) {
                              onDeleteEquipmentCategory(item.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
                          title="Xóa danh mục này"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB TAB 2: EXPENSE CATEGORIES */}
      {subTab === 'expenses' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-500" />
                Danh Sách Phân Loại Khoản Chi Tiêu Nội Bộ
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Thêm sửa xóa các mục chi tiêu mua sắm, in ấn, vận chuyển, hoàn cọc và sửa chữa
              </p>
            </div>

            <div className="flex items-center gap-2">
              {isSuperAdmin && (
                <button
                  id="btn-add-expense-cat"
                  onClick={() => handleOpenExpModal()}
                  className="inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-sm transition active:scale-95"
                >
                  <Plus className="w-4 h-4 mr-1.5 stroke-[2.5]" />
                  Thêm Danh Mục Chi
                </button>
              )}
            </div>
          </div>

          {/* Expense Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {expenseCategories.map((cat) => {
              const colorConfig = COLOR_MAP[cat.color] || COLOR_MAP.emerald;
              return (
                <div
                  key={cat.id}
                  className={`bg-white dark:bg-slate-900 border rounded-2xl p-4.5 shadow-sm hover:shadow-md transition flex flex-col justify-between ${
                    cat.isActive
                      ? 'border-slate-200 dark:border-slate-800'
                      : 'border-slate-200 dark:border-slate-800 opacity-60 bg-slate-50/60 dark:bg-slate-950/40'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${colorConfig.bg} ${colorConfig.text} ${colorConfig.border}`}>
                          {cat.code}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1.5">
                          {cat.name}
                        </h4>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          cat.isActive
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {cat.isActive ? 'Đang dùng' : 'Tạm ẩn'}
                      </span>
                    </div>

                    {cat.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
                        {cat.description}
                      </p>
                    )}

                    {cat.estimatedUnitPrice ? (
                      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-2.5 flex items-center justify-between text-xs border border-slate-100 dark:border-slate-800 mb-4">
                        <span className="text-slate-500 dark:text-slate-400">Đơn giá dự toán:</span>
                        <span className="font-bold text-slate-900 dark:text-slate-100 font-mono">
                          {formatCurrency(cat.estimatedUnitPrice)}
                        </span>
                      </div>
                    ) : (
                      <div className="h-4 mb-4" />
                    )}
                  </div>

                  {/* Actions Footer */}
                  {isSuperAdmin && (
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => {
                          const updated = { ...cat, isActive: !cat.isActive };
                          onSaveExpenseCategory(updated);
                        }}
                        className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
                      >
                        {cat.isActive ? 'Tạm ẩn' : 'Bật lại'}
                      </button>

                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleOpenExpModal(cat)}
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition"
                          title="Sửa tên & màu sắc danh mục"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Bạn có chắc chắn muốn xóa danh mục chi "${cat.name}" không?`)) {
                              onDeleteExpenseCategory(cat.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
                          title="Xóa danh mục chi này"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB TAB 3: FEE SETTINGS & POLICY */}
      {subTab === 'policy' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <form onSubmit={handleSaveFeeSettingsSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-6">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-amber-500" />
                Cài Đặt Mức Tiền Cọc & Chính Sách Tài Chính Mặc Định
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Tùy chỉnh số tiền cọc yêu cầu khi tạo mới tài xế, tỷ lệ hoàn trả và công thức cộng dồn
              </p>
            </div>

            {/* Default Required Uniform Fee */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Mức tiền cọc mặc định khi tạo mới tài xế (VND) <span className="text-rose-500">*</span>
              </label>
              <CurrencyInput
                value={feeForm.defaultUniformDeposit}
                onChange={(val) => setFeeForm({ ...feeForm, defaultUniformDeposit: val })}
                className="w-full text-base font-bold text-amber-600 dark:text-amber-400 font-mono"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Mặc định hiện tại: <strong>300.000đ</strong> (Bạn có thể đổi thành 400.000đ, 500.000đ hoặc bất kỳ số tiền nào phù hợp với quy định công ty).
              </p>
            </div>

            {/* Auto Calculate Toggle */}
            <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Tự động cộng dồn tiền cọc theo các trang bị được chọn
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Khi bật, form Cấp mới TX sẽ tự động tính tổng tiền cọc dựa theo danh sách trang bị được tích chọn (ví dụ: Áo 100k + Mũ 100k + Thùng 100k = 300k).
                </p>
              </div>

              <button
                type="button"
                onClick={() => setFeeForm({ ...feeForm, autoCalculateDepositFromItems: !feeForm.autoCalculateDepositFromItems })}
                className={`p-1 rounded-full transition ${
                  feeForm.autoCalculateDepositFromItems
                    ? 'text-amber-500'
                    : 'text-slate-400'
                }`}
              >
                {feeForm.autoCalculateDepositFromItems ? (
                  <ToggleRight className="w-8 h-8 stroke-[1.5]" />
                ) : (
                  <ToggleLeft className="w-8 h-8 stroke-[1.5]" />
                )}
              </button>
            </div>

            {/* Default Refund Percentage */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Tỷ lệ hoàn tiền cọc mặc định khi tài xế nghỉ việc trả đủ đồ (%)
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={feeForm.defaultRefundPercentage}
                  onChange={(e) => setFeeForm({ ...feeForm, defaultRefundPercentage: Number(e.target.value) || 0 })}
                  className="w-32 px-3 py-2 text-sm font-bold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-slate-900 dark:text-slate-100 font-mono"
                />
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  % (Ví dụ: 100% hoàn đủ, 80% khấu trừ hao mòn khấu hao)
                </span>
              </div>
            </div>

            {/* Policy Notes */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Ghi chú chính sách & Quy định cọc nội bộ
              </label>
              <textarea
                rows={3}
                value={feeForm.feePolicyNote || ''}
                onChange={(e) => setFeeForm({ ...feeForm, feePolicyNote: e.target.value })}
                placeholder="Nhập ghi chú quy định thu nộp, khấu trừ vi phạm hoặc điều kiện hoàn trả cọc..."
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-slate-900 dark:text-slate-100"
              />
            </div>

            {/* Submit Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Khôi phục lại toàn bộ mức cọc và danh mục về thiết lập mặc định của hệ thống?')) {
                    onResetToDefaults();
                    setFeeForm(DEFAULT_SYSTEM_FEE_SETTINGS);
                  }
                }}
                className="inline-flex items-center px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                Khôi phục mặc định ban đầu
              </button>

              <div className="flex items-center space-x-2">
                {isFeeSavedFeedback && (
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 animate-in fade-in">
                    <Check className="w-4 h-4 stroke-[3]" />
                    Đã lưu cấu hình thành công!
                  </span>
                )}

                <button
                  type="submit"
                  className="inline-flex items-center px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-sm transition active:scale-95"
                >
                  <Save className="w-4 h-4 mr-1.5" />
                  Lưu Cài Đặt Chính Sách
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD / EDIT EQUIPMENT CATEGORY */}
      {/* ======================================================== */}
      {isEquipModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Boxes className="w-4 h-4 text-amber-500" />
                {editingEquip ? 'Chỉnh Sửa Trang Bị / Mức Cọc' : 'Thêm Trang Bị / Đồng Phục Mới'}
              </h3>
              <button
                onClick={() => setIsEquipModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEquipSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Tên trang bị / vật phẩm <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={equipForm.name}
                    onChange={(e) => setEquipForm({ ...equipForm, name: e.target.value })}
                    placeholder="VD: Áo khoác mùa đông, Áo mưa cánh dơi, Balo..."
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Mã ký hiệu viết tắt
                  </label>
                  <input
                    type="text"
                    value={equipForm.code}
                    onChange={(e) => setEquipForm({ ...equipForm, code: e.target.value.toUpperCase() })}
                    placeholder="VD: AO, MU, THUNG, BALO"
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-slate-900 dark:text-slate-100 uppercase font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Đơn vị tính
                  </label>
                  <input
                    type="text"
                    value={equipForm.unit}
                    onChange={(e) => setEquipForm({ ...equipForm, unit: e.target.value })}
                    placeholder="VD: cái, chiếc, bộ, thùng..."
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Biểu tượng đại diện (Icon)
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['shirt', 'helmet', 'box', 'shield', 'package', 'layers', 'tag', 'bag'] as const).map((ic) => (
                      <button
                        type="button"
                        key={ic}
                        onClick={() => setEquipForm({ ...equipForm, icon: ic })}
                        className={`flex items-center justify-center p-2.5 rounded-xl border text-xs transition ${
                          equipForm.icon === ic
                            ? 'bg-amber-500/15 border-amber-500 text-amber-600 dark:text-amber-400 font-bold'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        {renderIcon(ic)}
                        <span className="ml-1.5 capitalize text-[10px]">{ic}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Mức cọc quy định (VND)
                  </label>
                  <CurrencyInput
                    value={equipForm.defaultDeposit}
                    onChange={(val) => setEquipForm({ ...equipForm, defaultDeposit: val })}
                    className="w-full text-xs font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Trừ cọc nếu mất/hỏng (VND)
                  </label>
                  <CurrencyInput
                    value={equipForm.penaltyOnLoss}
                    onChange={(val) => setEquipForm({ ...equipForm, penaltyOnLoss: val })}
                    className="w-full text-xs font-mono font-bold text-rose-600 dark:text-rose-400"
                  />
                </div>

                <div className="sm:col-span-2 flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      Cho phép chọn kích thước (Size S / M / L / XL / XXL / 3XL)
                    </span>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      Thích hợp cho áo, quần, trang phục cần kích cỡ cụ thể
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={equipForm.hasSize}
                    onChange={(e) => setEquipForm({ ...equipForm, hasSize: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Mô tả / Ghi chú trang bị
                  </label>
                  <textarea
                    rows={2}
                    value={equipForm.description}
                    onChange={(e) => setEquipForm({ ...equipForm, description: e.target.value })}
                    placeholder="VD: Áo thun cổ bẻ dệt kim thấm hút mồ hôi, mũ nửa đầu tiêu chuẩn..."
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEquipModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-sm transition active:scale-95"
                >
                  {editingEquip ? 'Cập Nhật Trang Bị' : 'Thêm Vào Danh Mục'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD / EDIT EXPENSE CATEGORY */}
      {/* ======================================================== */}
      {isExpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-500" />
                {editingExp ? 'Chỉnh Sửa Danh Mục Chi' : 'Thêm Danh Mục Chi Tiêu Mới'}
              </h3>
              <button
                onClick={() => setIsExpModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveExpSubmit} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Tên phân loại chi phí <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={expForm.name}
                  onChange={(e) => setExpForm({ ...expForm, name: e.target.value })}
                  placeholder="VD: Mua Áo khoác mùa đông, Thuê mặt bằng kho, Quảng cáo..."
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Mã danh mục
                  </label>
                  <input
                    type="text"
                    value={expForm.code}
                    onChange={(e) => setExpForm({ ...expForm, code: e.target.value.toUpperCase() })}
                    placeholder="VD: CHI_KHO, CHI_AOKHOAC"
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-slate-100 uppercase font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Đơn giá dự toán (VND)
                  </label>
                  <CurrencyInput
                    value={expForm.estimatedUnitPrice}
                    onChange={(val) => setExpForm({ ...expForm, estimatedUnitPrice: val })}
                    className="w-full text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Màu sắc thẻ phân loại
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {(Object.keys(COLOR_MAP) as Array<ExpenseCategoryConfig['color']>).map((col) => {
                    const c = COLOR_MAP[col];
                    return (
                      <button
                        type="button"
                        key={col}
                        onClick={() => setExpForm({ ...expForm, color: col })}
                        className={`p-2 rounded-xl border text-center text-xs font-bold transition flex flex-col items-center gap-1 ${c.bg} ${c.text} ${
                          expForm.color === col
                            ? 'ring-2 ring-slate-900 dark:ring-white border-transparent'
                            : c.border
                        }`}
                      >
                        <span className="w-3 h-3 rounded-full bg-current" />
                        <span className="text-[10px] capitalize">{c.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Mô tả / Ghi chú danh mục
                </label>
                <textarea
                  rows={2}
                  value={expForm.description}
                  onChange={(e) => setExpForm({ ...expForm, description: e.target.value })}
                  placeholder="Ghi chú mục đích sử dụng hoặc dự toán cho danh mục chi này..."
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsExpModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-sm transition active:scale-95"
                >
                  {editingExp ? 'Cập Nhật Danh Mục Chi' : 'Thêm Vào Danh Mục'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
