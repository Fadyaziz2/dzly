const Booking = require('../models/Booking');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const Service = require('../models/Service');

// @desc    Get provider financial report
// @route   GET /api/financials/provider
// @access  Private (Provider)
exports.getProviderFinancials = async (req, res, next) => {
  try {
    const providerId = req.user._id;

    const bookings = await Booking.find({ provider: providerId }).sort({ createdAt: -1 });

    const totalGross = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    const completedOrConfirmed = bookings.filter((b) => b.status === 'completed' || b.status === 'confirmed');

    const confirmedEarnings = completedOrConfirmed.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    const platformCommissions = completedOrConfirmed.reduce((sum, b) => sum + (b.commissionAmount || 0), 0);
    const netReceivable = completedOrConfirmed.reduce((sum, b) => sum + (b.providerNet || 0), 0);

    const pendingBookings = bookings.filter((b) => b.status === 'pending');
    const pendingAmount = pendingBookings.reduce((sum, b) => sum + (b.providerNet || 0), 0);

    res.json({
      success: true,
      summary: {
        totalGross,
        confirmedEarnings,
        platformCommissions,
        netReceivable,
        pendingAmount,
        totalBookingsCount: bookings.length,
        completedCount: bookings.filter((b) => b.status === 'completed').length,
        pendingCount: pendingBookings.length,
      },
      transactions: bookings.map((b) => ({
        id: b._id,
        bookingCode: b.bookingCode,
        serviceTitle: b.serviceTitle,
        customerName: b.customerName,
        date: b.date,
        totalPrice: b.totalPrice,
        commissionAmount: b.commissionAmount,
        providerNet: b.providerNet,
        status: b.status,
        createdAt: b.createdAt,
      })),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get admin platform analytics & KPIs
// @route   GET /api/financials/admin
// @access  Private (Admin)
exports.getAdminAnalytics = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'client' });
    const totalProviders = await User.countDocuments({ role: 'provider' });
    const activeProviders = await Subscription.distinct('provider', {
      status: 'active',
      endDate: { $gt: new Date() },
    });

    const totalServices = await Service.countDocuments({ isActive: true });
    const allBookings = await Booking.find();
    const allSubscriptions = await Subscription.find();

    const totalSubscriptionRevenue = allSubscriptions.reduce((sum, s) => sum + (s.amountPaid || 0), 0);

    const successfulBookings = allBookings.filter((b) => b.status === 'completed' || b.status === 'confirmed');
    const totalGrossBookingVolume = allBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    const totalCommissionRevenue = successfulBookings.reduce((sum, b) => sum + (b.commissionAmount || 0), 0);

    const totalPlatformProfit = totalSubscriptionRevenue + totalCommissionRevenue;

    // Status breakdown
    const statusCounts = {
      pending: allBookings.filter((b) => b.status === 'pending').length,
      confirmed: allBookings.filter((b) => b.status === 'confirmed').length,
      completed: allBookings.filter((b) => b.status === 'completed').length,
      cancelled: allBookings.filter((b) => b.status === 'cancelled').length,
      rejected: allBookings.filter((b) => b.status === 'rejected').length,
    };

    // Category breakdown
    const categoryStats = {};
    for (const b of allBookings) {
      if (!categoryStats[b.categoryId]) {
        categoryStats[b.categoryId] = { count: 0, revenue: 0 };
      }
      categoryStats[b.categoryId].count++;
      categoryStats[b.categoryId].revenue += b.totalPrice || 0;
    }

    res.json({
      success: true,
      kpis: {
        totalUsers,
        totalProviders,
        activeProvidersCount: activeProviders.length,
        totalServices,
        totalBookingsCount: allBookings.length,
        totalGrossBookingVolume,
        totalSubscriptionRevenue,
        totalCommissionRevenue,
        totalPlatformProfit,
      },
      statusCounts,
      categoryStats,
      recentBookings: allBookings.slice(0, 10),
    });
  } catch (error) {
    next(error);
  }
};

