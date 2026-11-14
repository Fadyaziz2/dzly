import React, { useState, useEffect } from 'react';
import api from '../api/api';
import {
  ShoppingBag,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  MapPin,
  Phone,
  FileText,
  DollarSign,
  AlertTriangle,
  RefreshCw,
  X,
  Eye,
  Check,
} from 'lucide-react';

export default function PharmacyOrdersView({ subscriptionStatus }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  // Modals
  const [prescriptionModalUrl, setPrescriptionModalUrl] = useState(null);
  const [rejectingOrder, setRejectingOrder] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processingId, setProcessingId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/pharmacy/orders');
      setOrders(res.data.data || []);
    } catch (err) {
      console.error('Error fetching pharmacy orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus, reason = '') => {
    setProcessingId(orderId);
    try {
      const res = await api.put(`/pharmacy/orders/${orderId}/status`, {
        status: newStatus,
        rejectionReason: reason,
      });

      if (newStatus === 'accepted') {
        alert('تم قبول الطلب وخصم كميات الأدوية تلقائياً من مخزون الصيدلية!');
      }

      fetchOrders();
      setRejectingOrder(null);
      setRejectionReason('');
    } catch (err) {
      alert(err.response?.data?.message || 'خطأ أثناء تحديث حالة الطلب');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (statusFilter && o.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchCode = o.orderCode?.toLowerCase().includes(q);
      const matchCustomer = o.customerName?.toLowerCase().includes(q);
      const matchPhone = o.customerPhone?.includes(q);
      return matchCode || matchCustomer || matchPhone;
    }
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full text-xs font-bold">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>مكتمل ومستلم</span>
          </span>
        );
      case 'accepted':
      case 'preparing':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full text-xs font-bold">
            <Clock className="w-3.5 h-3.5" />
            <span>قيد التجهيز بالصيدلية</span>
          </span>
        );
      case 'ready_for_pickup':
        return (
          <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-1 rounded-full text-xs font-bold">
            <Package className="w-3.5 h-3.5" />
            <span>جاهز لاستلام المريض</span>
          </span>
        );
      case 'out_for_delivery':
        return (
          <span className="inline-flex items-center gap-1 bg-cyan-50 text-cyan-700 border border-cyan-200 px-2.5 py-1 rounded-full text-xs font-bold">
            <MapPin className="w-3.5 h-3.5" />
            <span>جاري التوصيل</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-full text-xs font-bold">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>مرفوض</span>
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full text-xs font-bold animate-pulse">
            <Clock className="w-3.5 h-3.5" />
            <span>طلب جديد بانتظار موافقتك</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-800 to-teal-950 text-white p-6 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
            <ShoppingBag className="w-6 h-6 text-teal-300" />
          </div>
          <div>
            <h2 className="text-xl font-black">طلبات شراء الأدوية والروشتات الواردة</h2>
            <p className="text-xs text-teal-100 mt-0.5">
              مراجعة الروشتات الطبية، تأكيد توفر الأصناف، وخصم المخزون الفوري بنقرة واحدة
            </p>
          </div>
        </div>

        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition border border-white/10"
        >
          <RefreshCw className="w-4 h-4" />
          <span>تحديث الطلبات</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث بكود الطلب أو اسم العميل أو الهاتف..."
            className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-teal-500 font-medium"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-bold focus:outline-none focus:border-teal-500"
        >
          <option value="">جميع الحالات</option>
          <option value="pending">طلبات جديدة بانتظار التأكيد</option>
          <option value="accepted">مقبولة وقيد التجهيز</option>
          <option value="ready_for_pickup">جاهزة للاستلام</option>
          <option value="out_for_delivery">خرجت مع المندوب</option>
          <option value="completed">مكتملة ومستلمة</option>
          <option value="rejected">مرفوضة</option>
        </select>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
            <RefreshCw className="w-6 h-6 animate-spin text-teal-600 mx-auto mb-2" />
            جاري تحميل الطلبات...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
            لا توجد طلبات أدوية واردة حالياً
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isProcessing = processingId === order._id;
            return (
              <div
                key={order._id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition space-y-4"
              >
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-teal-50 text-teal-800 rounded-lg font-mono font-black text-xs border border-teal-200">
                      #{order.orderCode}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(order.createdAt).toLocaleString('ar-DZ')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {order.deliveryType === 'delivery' ? (
                      <span className="bg-cyan-50 text-cyan-800 border border-cyan-200 text-xs px-2.5 py-0.5 rounded-full font-bold">
                        توصيل منزلي
                      </span>
                    ) : (
                      <span className="bg-slate-100 text-slate-700 text-xs px-2.5 py-0.5 rounded-full font-bold">
                        استلام مباشر من الصيدلية
                      </span>
                    )}
                    {getStatusBadge(order.status)}
                  </div>
                </div>

                {/* Customer and Delivery Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs bg-slate-50 p-3.5 rounded-xl">
                  <div>
                    <span className="text-slate-400">اسم المريض / العميل:</span>
                    <p className="font-extrabold text-slate-900 mt-0.5">{order.customerName}</p>
                    <p className="font-mono text-slate-500 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-teal-600" />
                      <span>{order.customerPhone}</span>
                    </p>
                  </div>

                  <div>
                    <span className="text-slate-400">عنوان التوصيل:</span>
                    <p className="font-bold text-slate-800 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span>{order.deliveryAddress || 'الاستلام داخل مقر الصيدلية'}</span>
                    </p>
                  </div>

                  <div>
                    <span className="text-slate-400">الروشتة المرفقة:</span>
                    <div className="mt-0.5">
                      {order.prescriptionImage ? (
                        <button
                          onClick={() => setPrescriptionModalUrl(order.prescriptionImage)}
                          className="inline-flex items-center gap-1 text-teal-700 bg-teal-100/80 hover:bg-teal-200 px-2.5 py-1 rounded-lg font-bold transition"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>معاينة الروشتة 🩺</span>
                        </button>
                      ) : (
                        <span className="text-slate-400">بدون روشتة (أدوية حرة)</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Items List */}
                <div className="border border-slate-100 rounded-xl overflow-hidden text-xs">
                  <div className="bg-slate-50 p-2.5 font-bold text-slate-600 flex justify-between">
                    <span>الأصناف المطلوبة</span>
                    <span>الكمية والسعر</span>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {order.items?.map((it, idx) => (
                      <div key={idx} className="p-3 flex items-center justify-between">
                        <div>
                          <span className="font-extrabold text-slate-800">{it.name}</span>
                          <span className="text-slate-400 mr-2 text-[11px]">({it.dosage || 'عبوة'})</span>
                        </div>
                        <div className="text-left font-mono">
                          <span className="text-slate-600">{it.quantity} علبة × {it.unitPrice} د.ج = </span>
                          <span className="font-bold text-slate-900">{it.subtotal} د.ج</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price and Commission Breakdown */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-6">
                    <div>
                      <span className="text-slate-400">المبلغ الإجمالي: </span>
                      <span className="font-black text-slate-900">{order.totalPrice?.toLocaleString()} د.ج</span>
                    </div>
                    <div>
                      <span className="text-slate-400">عمولة المنصة (5%): </span>
                      <span className="font-bold text-slate-600">-{order.platformCommission?.toLocaleString()} د.ج</span>
                    </div>
                    <div>
                      <span className="text-slate-400">صافي مستحقات الصيدلية: </span>
                      <span className="font-black text-emerald-700 text-sm">
                        {order.pharmacyNetEarnings?.toLocaleString()} د.ج
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons depending on status */}
                  <div className="flex items-center gap-2">
                    {order.status === 'pending' && (
                      <>
                        <button
                          disabled={isProcessing}
                          onClick={() => handleUpdateStatus(order._id, 'accepted')}
                          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl font-bold shadow-md shadow-emerald-600/20 transition"
                        >
                          <Check className="w-4 h-4" />
                          <span>قبول وتجهيز (خصم من المخزون)</span>
                        </button>

                        <button
                          disabled={isProcessing}
                          onClick={() => setRejectingOrder(order)}
                          className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 px-3 py-2 rounded-xl font-bold border border-rose-200 transition"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>اعتذار</span>
                        </button>
                      </>
                    )}

                    {order.status === 'accepted' && (
                      <button
                        disabled={isProcessing}
                        onClick={() => handleUpdateStatus(order._id, 'ready_for_pickup')}
                        className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl font-bold shadow-md shadow-purple-600/20 transition"
                      >
                        <Package className="w-4 h-4" />
                        <span>جاهز للاستلام</span>
                      </button>
                    )}

                    {order.status === 'ready_for_pickup' && (
                      <button
                        disabled={isProcessing}
                        onClick={() => handleUpdateStatus(order._id, 'completed')}
                        className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl font-bold shadow-md shadow-emerald-600/20 transition"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>تم تسليم الدواء للمريض</span>
                      </button>
                    )}

                    {order.status === 'out_for_delivery' && (
                      <button
                        disabled={isProcessing}
                        onClick={() => handleUpdateStatus(order._id, 'completed')}
                        className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl font-bold shadow-md shadow-emerald-600/20 transition"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>تم توصيل الطلب بنجاح</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Prescription Preview Modal */}
      {prescriptionModalUrl && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in">
            <div className="p-4 bg-teal-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                <h4 className="font-black text-sm">صورة الروشتة الطبية للطلب</h4>
              </div>
              <button
                onClick={() => setPrescriptionModalUrl(null)}
                className="text-teal-200 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 text-center">
              <img
                src={prescriptionModalUrl}
                alt="الروشتة"
                className="max-h-[70vh] w-auto mx-auto rounded-xl object-contain border border-slate-200"
              />
            </div>
          </div>
        </div>
      )}

      {/* Rejection Reason Modal */}
      {rejectingOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-black text-base text-slate-900">الاعتذار عن قبول الطلب #{rejectingOrder.orderCode}</h3>
            <p className="text-xs text-slate-500">
              يرجى ذكر سبب الاعتذار لتوضيحه للمريض (مثال: نفاذ صنف معين، انتهاء وقت الدوام...):
            </p>
            <textarea
              rows="3"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="اكتب سبب الاعتذار هنا..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-rose-500 font-medium"
            ></textarea>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setRejectingOrder(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                تراجع
              </button>
              <button
                onClick={() => handleUpdateStatus(rejectingOrder._id, 'rejected', rejectionReason)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20"
              >
                تأكيد الاعتذار
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
