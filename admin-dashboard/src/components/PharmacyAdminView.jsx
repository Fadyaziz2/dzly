import React, { useState, useEffect } from 'react';
import api from '../api/api';
import {
  Pill,
  Search,
  Building,
  MapPin,
  Clock,
  Phone,
  AlertTriangle,
  CheckCircle,
  FileText,
  DollarSign,
  Package,
  Eye,
  X,
  RefreshCw,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react';

export default function PharmacyAdminView() {
  const [activeSubTab, setActiveSubTab] = useState('orders'); // 'orders', 'medicines', 'pharmacies'
  const [pharmacies, setPharmacies] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPharmacyFilter, setSelectedPharmacyFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [prescriptionModalUrl, setPrescriptionModalUrl] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pharmRes, medRes, ordersRes] = await Promise.all([
        api.get('/pharmacy/nearby'),
        api.get('/pharmacy/medicines'),
        api.get('/pharmacy/orders'),
      ]);

      setPharmacies(pharmRes.data.data || []);
      setMedicines(medRes.data.data || []);
      setOrders(ordersRes.data.data || []);
    } catch (err) {
      console.error('Error fetching pharmacy admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered lists
  const filteredOrders = orders.filter((o) => {
    if (statusFilter && o.status !== statusFilter) return false;
    if (selectedPharmacyFilter && o.pharmacy?._id !== selectedPharmacyFilter && o.pharmacy !== selectedPharmacyFilter)
      return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchCode = o.orderCode?.toLowerCase().includes(q);
      const matchCustomer = o.customerName?.toLowerCase().includes(q);
      const matchPhone = o.customerPhone?.includes(q);
      const matchPharmacy = o.pharmacyName?.toLowerCase().includes(q);
      return matchCode || matchCustomer || matchPhone || matchPharmacy;
    }
    return true;
  });

  const filteredMedicines = medicines.filter((m) => {
    if (selectedPharmacyFilter && m.pharmacy?._id !== selectedPharmacyFilter && m.pharmacy !== selectedPharmacyFilter)
      return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = m.name?.toLowerCase().includes(q);
      const matchGeneric = m.genericName?.toLowerCase().includes(q);
      const matchCategory = m.category?.toLowerCase().includes(q);
      return matchName || matchGeneric || matchCategory;
    }
    return true;
  });

  // Calculate Metrics
  const totalCommission = orders.reduce((sum, o) => sum + (o.platformCommission || 0), 0);
  const totalVolume = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  const lowStockCount = medicines.filter((m) => m.stock <= 5).length;

  const getOrderStatusBadge = (status) => {
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
            <span>قيد التجهيز</span>
          </span>
        );
      case 'ready_for_pickup':
        return (
          <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-1 rounded-full text-xs font-bold">
            <Package className="w-3.5 h-3.5" />
            <span>جاهز للاستلام</span>
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
          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full text-xs font-bold">
            <Clock className="w-3.5 h-3.5" />
            <span>بانتظار الصيدلية</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & KPI Cards */}
      <div className="bg-gradient-to-r from-teal-800 to-teal-950 p-6 rounded-2xl text-white shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center">
              <Pill className="w-6 h-6 text-teal-300" />
            </div>
            <div>
              <h2 className="text-xl font-black">منظومة الصيدليات وطلب الأدوية المعتمدة</h2>
              <p className="text-xs text-teal-200 mt-0.5">
                متابعة شبكة الصيدليات، مقارنة الأسعار والمخزون، واعتماد الطلبات والروشتات الطبية بعمولة منصة 5%
              </p>
            </div>
          </div>

          <button
            onClick={fetchData}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-xs font-bold transition border border-white/10"
          >
            <RefreshCw className="w-4 h-4" />
            <span>تحديث البيانات</span>
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
            <p className="text-xs text-teal-200 font-semibold">الصيدليات المعتمدة</p>
            <h3 className="text-2xl font-black mt-1">{pharmacies.length}</h3>
            <span className="text-[11px] text-teal-300">في ولاية الوادي وضواحيها</span>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
            <p className="text-xs text-teal-200 font-semibold">إجمالي الأدوية المسجلة</p>
            <h3 className="text-2xl font-black mt-1">{medicines.length}</h3>
            <span className="text-[11px] text-amber-300">منها {lowStockCount} منخفضة المخزون</span>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
            <p className="text-xs text-teal-200 font-semibold">إجمالي طلبات الأدوية</p>
            <h3 className="text-2xl font-black mt-1">{orders.length}</h3>
            <span className="text-[11px] text-teal-300">بقيمة {totalVolume.toLocaleString()} د.ج</span>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
            <p className="text-xs text-teal-200 font-semibold">أرباح عمولة المنصة (5%)</p>
            <h3 className="text-2xl font-black mt-1 text-emerald-300">{totalCommission.toLocaleString()} د.ج</h3>
            <span className="text-[11px] text-emerald-400 font-bold">صافي إيراد مباشر</span>
          </div>
        </div>
      </div>

      {/* Tabs Selection */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2">
        <button
          onClick={() => setActiveSubTab('orders')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeSubTab === 'orders'
              ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>طلبات الأدوية والروشتات ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('medicines')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeSubTab === 'medicines'
              ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Pill className="w-4 h-4" />
          <span>دليل الأدوية والأسعار بالمخزون ({medicines.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('pharmacies')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeSubTab === 'pharmacies'
              ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>شبكة الصيدليات ومواقعها الجغرافية ({pharmacies.length})</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث بالاسم، الكود، الدواء، أو رقم الهاتف..."
            className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-teal-500 transition font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedPharmacyFilter}
            onChange={(e) => setSelectedPharmacyFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-bold focus:outline-none focus:border-teal-500"
          >
            <option value="">جميع الصيدليات</option>
            {pharmacies.map((p) => (
              <option key={p.id || p._id} value={p.id || p._id}>
                {p.name}
              </option>
            ))}
          </select>

          {activeSubTab === 'orders' && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-bold focus:outline-none focus:border-teal-500"
            >
              <option value="">جميع الحالات</option>
              <option value="pending">بانتظار الصيدلية</option>
              <option value="accepted">مقبول وقيد التجهيز</option>
              <option value="ready_for_pickup">جاهز للاستلام</option>
              <option value="out_for_delivery">جاري التوصيل</option>
              <option value="completed">مكتمل ومستلم</option>
              <option value="rejected">مرفوض</option>
            </select>
          )}
        </div>
      </div>

      {/* TAB 1: ORDERS */}
      {activeSubTab === 'orders' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="p-4">كود الطلب</th>
                  <th className="p-4">العميل</th>
                  <th className="p-4">الصيدلية</th>
                  <th className="p-4">الأدوية المطلوبة</th>
                  <th className="p-4">طريقة الاستلام</th>
                  <th className="p-4">إجمالي السعر</th>
                  <th className="p-4">عمولة المنصة (5%)</th>
                  <th className="p-4">الروشتة الطبية</th>
                  <th className="p-4">الحالة</th>
                  <th className="p-4 text-center">التفاصيل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-slate-400">
                      <RefreshCw className="w-6 h-6 animate-spin text-teal-600 mx-auto mb-2" />
                      جاري تحميل طلبات الصيدليات...
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-slate-400">
                      لا توجد طلبات أدوية مطابقة للبحث
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((o) => (
                    <tr key={o._id} className="hover:bg-slate-50 transition">
                      <td className="p-4 font-mono font-bold text-teal-700">{o.orderCode}</td>
                      <td className="p-4">
                        <div className="font-bold text-slate-800">{o.customerName}</div>
                        <div className="text-[11px] text-slate-400">{o.customerPhone}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-700">{o.pharmacyName}</div>
                        <div className="text-[11px] text-slate-400">{o.pharmacyPhone}</div>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-slate-800">
                          {o.items?.length || 0} صنف (
                          {o.items?.map((it) => `${it.name} × ${it.quantity}`).join('، ')})
                        </span>
                      </td>
                      <td className="p-4">
                        {o.deliveryType === 'delivery' ? (
                          <span className="inline-flex items-center gap-1 text-cyan-700 bg-cyan-50 px-2.5 py-0.5 rounded-full font-bold">
                            توصيل منزلي
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full font-bold">
                            استلام بالصيدلية
                          </span>
                        )}
                      </td>
                      <td className="p-4 font-extrabold text-slate-900">{o.totalPrice?.toLocaleString()} د.ج</td>
                      <td className="p-4 font-extrabold text-emerald-600">
                        +{o.platformCommission?.toLocaleString()} د.ج
                      </td>
                      <td className="p-4">
                        {o.prescriptionImage ? (
                          <button
                            onClick={() => setPrescriptionModalUrl(o.prescriptionImage)}
                            className="inline-flex items-center gap-1 text-teal-600 hover:text-teal-700 font-bold bg-teal-50 hover:bg-teal-100 px-2.5 py-1 rounded-lg transition"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>عرض الروشتة</span>
                          </button>
                        ) : (
                          <span className="text-slate-400">بدون روشتة</span>
                        )}
                      </td>
                      <td className="p-4">{getOrderStatusBadge(o.status)}</td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => setSelectedOrder(o)}
                          className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition"
                          title="عرض كافة التفاصيل"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: MEDICINES CATALOG & PRICE MONITOR */}
      {activeSubTab === 'medicines' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="p-4">اسم الدواء التجاري</th>
                  <th className="p-4">الاسم العلمي (Generic)</th>
                  <th className="p-4">التصنيف الدوائي</th>
                  <th className="p-4">الصيدلية التابع لها</th>
                  <th className="p-4">الجرعة / العبوة</th>
                  <th className="p-4">السعر الرسمي</th>
                  <th className="p-4">المخزون المتاح</th>
                  <th className="p-4">الروشتة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMedicines.map((m) => {
                  const isLowStock = m.stock <= 5;
                  return (
                    <tr key={m._id} className="hover:bg-slate-50 transition">
                      <td className="p-4">
                        <div className="font-extrabold text-slate-900">{m.name}</div>
                        <div className="text-[11px] text-slate-400">{m.description?.slice(0, 45)}...</div>
                      </td>
                      <td className="p-4 font-mono text-slate-600">{m.genericName || '-'}</td>
                      <td className="p-4">
                        <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-bold">
                          {m.category}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-teal-700">
                        {m.pharmacy?.businessName || m.pharmacy?.name || 'صيدلية معتمدة'}
                      </td>
                      <td className="p-4 text-slate-600 font-medium">{m.dosage || '-'}</td>
                      <td className="p-4 font-black text-slate-900">{m.price?.toLocaleString()} د.ج</td>
                      <td className="p-4">
                        {isLowStock ? (
                          <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full font-bold">
                            <AlertTriangle className="w-3 h-3" />
                            <span>متبقي {m.stock} فقط</span>
                          </span>
                        ) : (
                          <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold">
                            {m.stock} علبة
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        {m.requiresPrescription ? (
                          <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-bold text-[11px]">
                            تتطلب روشتة
                          </span>
                        ) : (
                          <span className="text-slate-400">مباشر (OTC)</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PHARMACIES NETWORK */}
      {activeSubTab === 'pharmacies' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pharmacies.map((pharm) => {
            const coords = pharm.location?.coordinates || [];
            return (
              <div
                key={pharm.id || pharm._id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
                    <Building className="w-6 h-6" />
                  </div>
                  {pharm.isOpen ? (
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>مفتوحة الآن</span>
                    </span>
                  ) : (
                    <span className="bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full text-xs font-bold">
                      مغلقة مؤقتاً
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="text-base font-extrabold text-slate-900">{pharm.name}</h4>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1.5">
                    <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span>{pharm.address || pharm.city}</span>
                  </p>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="font-semibold">أوقات العمل:</span>
                    <span className="font-bold text-slate-800">{pharm.openingHours || '8:00 - 22:00'}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span className="font-semibold">رقم الهاتف:</span>
                    <span className="font-bold font-mono text-slate-800">{pharm.phone}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span className="font-semibold">إحداثيات GPS:</span>
                    <span className="font-mono text-[11px] text-teal-700 font-bold">
                      {coords.length === 2 ? `${coords[1].toFixed(4)}, ${coords[0].toFixed(4)}` : 'غير محدد'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400">حساب مزود معتمد</span>
                  <span className="font-bold text-teal-600 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                    <span>اشتراك فعال</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Prescription Image Viewer Modal */}
      {prescriptionModalUrl && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in">
            <div className="p-4 bg-teal-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                <h4 className="font-black text-sm">معاينة صورة الروشتة الطبية</h4>
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
                alt="الروشتة الطبية"
                className="max-h-[70vh] w-auto mx-auto rounded-xl object-contain border border-slate-200"
              />
            </div>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">تفاصيل طلب الدواء #{selectedOrder.orderCode}</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  تاريخ الطلب: {new Date(selectedOrder.createdAt).toLocaleString('ar-DZ')}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl">
              <div>
                <span className="text-slate-400">العميل:</span>
                <p className="font-bold text-slate-800 mt-0.5">{selectedOrder.customerName}</p>
                <p className="font-mono text-slate-500">{selectedOrder.customerPhone}</p>
              </div>
              <div>
                <span className="text-slate-400">الصيدلية المستلمة:</span>
                <p className="font-bold text-slate-800 mt-0.5">{selectedOrder.pharmacyName}</p>
                <p className="font-mono text-slate-500">{selectedOrder.pharmacyPhone}</p>
              </div>
            </div>

            <div>
              <h5 className="font-bold text-xs text-slate-700 mb-2">قائمة الأدوية:</h5>
              <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 text-xs">
                {selectedOrder.items?.map((it, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800">{it.name}</span>
                      <span className="text-slate-400 mr-2">({it.dosage})</span>
                    </div>
                    <div className="text-left font-mono">
                      <span>{it.quantity} × {it.unitPrice} د.ج = </span>
                      <span className="font-bold text-slate-900">{it.subtotal} د.ج</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-teal-50 p-4 rounded-xl space-y-2 text-xs border border-teal-100">
              <div className="flex justify-between font-bold text-slate-800">
                <span>إجمالي المبلغ:</span>
                <span>{selectedOrder.totalPrice?.toLocaleString()} د.ج</span>
              </div>
              <div className="flex justify-between font-bold text-emerald-700">
                <span>عمولة المنصة (5%):</span>
                <span>+{selectedOrder.platformCommission?.toLocaleString()} د.ج</span>
              </div>
              <div className="flex justify-between font-bold text-slate-600 border-t border-teal-200 pt-2">
                <span>صافي مستحقات الصيدلية:</span>
                <span>{selectedOrder.pharmacyNetEarnings?.toLocaleString()} د.ج</span>
              </div>
            </div>

            {selectedOrder.customerNotes && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs">
                <span className="font-bold text-amber-800">ملاحظات العميل: </span>
                <span className="text-amber-900">{selectedOrder.customerNotes}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
