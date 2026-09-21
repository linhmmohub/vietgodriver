import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  ShieldCheck, 
  User, 
  Clock, 
  Calendar,
  Layers,
  ArrowUpDown,
  Car,
  DollarSign,
  Key,
  Shield,
  UserPlus,
  RefreshCw
} from 'lucide-react';
import { AuditLogItem, AuthSession, AuditActionType } from '../types';
import { downloadCSV, formatDate, formatTime } from '../utils/formatters';
import { clearAllAuditLogs } from '../utils/auth';

interface AuditLogViewProps {
  logs: AuditLogItem[];
  currentUser: AuthSession;
  onRefreshLogs: () => void;
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({
  logs,
  currentUser,
  onRefreshLogs,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserFilter, setSelectedUserFilter] = useState<string>('all');
  const [selectedActionFilter, setSelectedActionFilter] = useState<string>('all');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('all'); // all, today, week

  // Extract distinct usernames for filter dropdown
  const uniqueUsers = useMemo(() => {
    const set = new Set<string>();
    logs.forEach(l => set.add(l.username));
    return Array.from(set);
  }, [logs]);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Search
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchText = 
          log.description.toLowerCase().includes(term) ||
          log.actionLabel.toLowerCase().includes(term) ||
          log.username.toLowerCase().includes(term) ||
          log.displayName.toLowerCase().includes(term) ||
          (log.targetName && log.targetName.toLowerCase().includes(term));
        if (!matchText) return false;
      }

      // User filter
      if (selectedUserFilter !== 'all' && log.username !== selectedUserFilter) {
        return false;
      }

      // Action Category filter
      if (selectedActionFilter !== 'all') {
        if (selectedActionFilter === 'driver' && !log.actionType.startsWith('DRIVER_')) {
          return false;
        }
        if (selectedActionFilter === 'expense' && !log.actionType.startsWith('EXPENSE_')) {
          return false;
        }
        if (selectedActionFilter === 'auth' && log.actionType !== 'LOGIN' && log.actionType !== 'LOGOUT') {
          return false;
        }
        if (selectedActionFilter === 'user' && !log.actionType.startsWith('USER_')) {
          return false;
        }
      }

      // Date filter
      if (selectedDateFilter === 'today') {
        const todayStr = new Date().toISOString().slice(0, 10);
        if (!log.timestamp.startsWith(todayStr)) return false;
      } else if (selectedDateFilter === 'week') {
        const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
        if (log.timestamp < weekAgo) return false;
      }

      return true;
    });
  }, [logs, searchTerm, selectedUserFilter, selectedActionFilter, selectedDateFilter]);

  // Export to CSV
  const handleExportLogs = () => {
    const rows = [
      ['Thời Gian', 'Tài Khoản', 'Họ Tên', 'Vai Trò', 'Loại Thao Tác', 'Hành Động', 'Chi Tiết Thao Tác', 'Đối Tượng Liên Quan'],
      ...filteredLogs.map(l => [
        new Date(l.timestamp).toLocaleString('vi-VN'),
        l.username,
        l.displayName,
        l.role === 'super_admin' ? 'Admin Tổng' : 'Cấp Dưới (Nhân Viên)',
        l.actionType,
        l.actionLabel,
        l.description,
        l.targetName || '',
      ])
    ];
    downloadCSV(`nhat-ky-thao-tac-${new Date().toISOString().slice(0, 10)}.csv`, rows);
  };

  // Clear logs
  const handleClearLogs = () => {
    if (window.confirm('CẢNH BÁO: Bạn có chắc chắn muốn xóa toàn bộ lịch sử nhật ký thao tác không? Hành động này sẽ được ghi nhận lại trong log mới.')) {
      clearAllAuditLogs(currentUser);
      onRefreshLogs();
    }
  };

  const getActionBadge = (type: AuditActionType) => {
    if (type.startsWith('DRIVER_')) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
          <Car className="w-3 h-3 mr-1" />
          Tài xế
        </span>
      );
    }
    if (type.startsWith('EXPENSE_')) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
          <DollarSign className="w-3 h-3 mr-1" />
          Khoản chi
        </span>
      );
    }
    if (type.startsWith('USER_')) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
          <UserPlus className="w-3 h-3 mr-1" />
          Phân quyền
        </span>
      );
    }
    if (type === 'LOGIN' || type === 'LOGOUT') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
          <Key className="w-3 h-3 mr-1" />
          Phiên đăng nhập
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
        <Shield className="w-3 h-3 mr-1" />
        Hệ thống
      </span>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      
      {/* Header card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="h-10 w-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-500 dark:text-indigo-400 shrink-0">
                <FileText className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100">
                  Nhật Ký Thao Tác Hệ Thống (Audit Logs)
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Lưu trữ chi tiết mọi hành động thêm, sửa, xóa, thu/hoàn tiền và đăng nhập của Admin Tổng & Cấp dưới
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={onRefreshLogs}
              title="Làm mới nhật ký"
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={handleExportLogs}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs flex items-center space-x-1.5 transition active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Xuất Nhật Ký CSV</span>
            </button>

            {currentUser.role === 'super_admin' && (
              <button
                onClick={handleClearLogs}
                title="Dọn sạch nhật ký cũ"
                className="px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-semibold flex items-center space-x-1 transition active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Xóa Nhật Ký</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm hành động, nội dung, tài khoản..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Filter by User */}
          <div>
            <select
              value={selectedUserFilter}
              onChange={(e) => setSelectedUserFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Tất cả người thao tác ({uniqueUsers.length})</option>
              {uniqueUsers.map((u) => (
                <option key={u} value={u}>
                  Tài khoản: {u}
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Action Category */}
          <div>
            <select
              value={selectedActionFilter}
              onChange={(e) => setSelectedActionFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Tất cả loại hành động</option>
              <option value="driver">Thao tác Tài xế (Thêm/Sửa/Cọc/Hoàn)</option>
              <option value="expense">Khoản chi tiêu nội bộ & Bill</option>
              <option value="auth">Phiên đăng nhập & Đăng xuất</option>
              <option value="user">Phân quyền & Tài khoản</option>
            </select>
          </div>

          {/* Filter by Date */}
          <div>
            <select
              value={selectedDateFilter}
              onChange={(e) => setSelectedDateFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Toàn bộ thời gian</option>
              <option value="today">Chỉ hôm nay</option>
              <option value="week">Trong 7 ngày qua</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Stats bar */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
        <div>
          Hiển thị <strong className="text-slate-900 dark:text-slate-100 font-mono">{filteredLogs.length}</strong> / {logs.length} bản ghi nhật ký
        </div>
        <div className="flex items-center space-x-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Hệ thống tự động ghi nhật ký thời gian thực</span>
        </div>
      </div>

      {/* Logs List / Table */}
      {filteredLogs.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 border border-slate-200/80 dark:border-slate-800 text-center text-slate-400 space-y-2">
          <FileText className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700" />
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            Không tìm thấy bản ghi nhật ký nào phù hợp
          </p>
          <p className="text-xs">
            Hãy thử thay đổi từ khóa tìm kiếm hoặc đặt lại các bộ lọc.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="divide-y divide-slate-100 dark:divide-slate-800/70">
            {filteredLogs.map((log) => {
              const isSuperAdmin = log.role === 'super_admin';
              const logDate = new Date(log.timestamp);

              return (
                <div 
                  key={log.id} 
                  className="p-3.5 sm:p-4 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition flex flex-col md:flex-row md:items-start justify-between gap-3 text-xs"
                >
                  {/* Left: User & action identity */}
                  <div className="flex items-start space-x-3">
                    <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isSuperAdmin 
                        ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30' 
                        : 'bg-indigo-500/15 text-indigo-500 border border-indigo-500/30'
                    }`}>
                      {isSuperAdmin ? <ShieldCheck className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center flex-wrap gap-1.5">
                        <span className="font-bold text-slate-900 dark:text-slate-100">
                          {log.displayName}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          (@{log.username})
                        </span>
                        <span className={`px-1.5 py-0.2 text-[10px] font-semibold rounded-md border ${
                          isSuperAdmin 
                            ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800' 
                            : 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800'
                        }`}>
                          {isSuperAdmin ? 'Admin Tổng' : 'Cấp Dưới'}
                        </span>
                        {getActionBadge(log.actionType)}
                      </div>

                      {/* Description / What was done */}
                      <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                        {log.description}
                      </p>

                      {log.targetName && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center space-x-1">
                          <span>Mục tiêu:</span>
                          <strong className="text-slate-700 dark:text-slate-300">{log.targetName}</strong>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Timestamp */}
                  <div className="shrink-0 flex md:flex-col md:items-end text-[11px] text-slate-400 font-mono space-x-2 md:space-x-0">
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 mr-1 text-slate-400" />
                      {formatTime(log.timestamp)}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400">
                      {formatDate(log.timestamp)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
