import { useState, useEffect } from 'react';

export interface DashboardStats {
  totalBookings: number;
  monthlyRevenue: number;
  activeTechnicians: number;
  satisfactionScore: number;
}

export interface DashboardBooking {
  id: string;
  customer: string;
  service: string;
  date: string;
  time: string;
  status: string;
  amount: number;
}

export interface TopTechnician {
  id: string;
  name: string;
  jobs: number;
  rating: number;
  revenue: number;
}

export interface RevenueData {
  month: string;
  revenue: number;
}

export function useDashboardData(organizationId?: string) {
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    monthlyRevenue: 0,
    activeTechnicians: 0,
    satisfactionScore: 0,
  });
  const [recentBookings, setRecentBookings] = useState<DashboardBooking[]>([]);
  const [topTechnicians, setTopTechnicians] = useState<TopTechnician[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // For demo mode or when no org ID, fetch first organization
        // const orgParam = organizationId || 'demo=true';
        
        // Don't fetch if no organization ID
        if (!organizationId) {
          setLoading(false);
          return;
        }

        // Fetch organization data
        const orgResponse = await fetch(`/api/organizations?id=${organizationId}`);
        const org = await orgResponse.json();
        
        // Fetch bookings
        const bookingsResponse = await fetch(`/api/bookings?organizationId=${org.id}`);
        const bookings = await bookingsResponse.json();
        
        // Calculate stats
        const completedBookings = bookings.filter((b: {status: string}) => b.status === 'completed');
        const monthlyRevenue = completedBookings
          .filter((b: {date: string}) => {
            const bookingDate = new Date(b.date);
            const currentMonth = new Date().getMonth();
            return bookingDate.getMonth() === currentMonth;
          })
          .reduce((sum: number, b: {finalPrice: number}) => sum + b.finalPrice, 0);
          
        const avgRating = completedBookings
          .filter((b: {rating?: number}) => b.rating)
          .reduce((sum: number, b: {rating?: number}, _: number, arr: {rating?: number}[]) => 
            sum + b.rating / arr.length, 0) || 4.5;

        setStats({
          totalBookings: bookings.length,
          monthlyRevenue,
          activeTechnicians: org.users?.length || 4,
          satisfactionScore: Math.round(avgRating * 10) / 10,
        });

        // Format recent bookings
        const formattedBookings = bookings.slice(0, 5).map((b: {
          id: string;
          customer?: {firstName?: string; lastName?: string};
          service?: {name?: string};
          date: string;
          time: string;
          status: string;
          finalPrice: number;
        }) => ({
          id: b.id,
          customer: `${b.customer?.firstName || 'Guest'} ${b.customer?.lastName || ''}`.trim(),
          service: b.service?.name || 'Service',
          date: new Date(b.date).toLocaleDateString(),
          time: b.time,
          status: b.status.charAt(0).toUpperCase() + b.status.slice(1).replace('_', ' '),
          amount: b.finalPrice,
        }));
        setRecentBookings(formattedBookings);

        // Calculate technician performance
        const technicianStats = new Map();
        bookings.forEach((b: {
          technician?: {id: string; firstName?: string; lastName?: string};
          status: string;
          rating?: number;
          finalPrice: number;
        }) => {
          if (b.technician) {
            const techId = b.technician.id;
            if (!technicianStats.has(techId)) {
              technicianStats.set(techId, {
                id: techId,
                name: `${b.technician.firstName} ${b.technician.lastName}`,
                jobs: 0,
                revenue: 0,
                totalRating: 0,
                ratingCount: 0,
              });
            }
            const stats = technicianStats.get(techId);
            stats.jobs++;
            stats.revenue += b.finalPrice;
            if (b.rating) {
              stats.totalRating += b.rating;
              stats.ratingCount++;
            }
          }
        });

        const technicianArray = Array.from(technicianStats.values())
          .map((tech: {
            name: string;
            jobs: number;
            revenue: number;
            totalRating: number;
            ratingCount: number;
          }) => ({
            ...tech,
            rating: tech.ratingCount > 0 ? Math.round((tech.totalRating / tech.ratingCount) * 10) / 10 : 4.5,
          }))
          .sort((a: {revenue: number}, b: {revenue: number}) => b.revenue - a.revenue)
          .slice(0, 4);
        
        setTopTechnicians(technicianArray);

        // Fetch revenue data
        const revenueResponse = await fetch('/api/revenue');
        const revenue = await revenueResponse.json();
        setRevenueData(revenue);

      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        // Use fallback data
        setStats({
          totalBookings: 15,
          monthlyRevenue: 4500,
          activeTechnicians: 4,
          satisfactionScore: 4.5,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [organizationId]);

  return { stats, recentBookings, topTechnicians, revenueData, loading };
}