export const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export const revenueData = [
  { name: 'Jan', value: 4000 },
  { name: 'Feb', value: 3000 },
  { name: 'Mar', value: 2000 },
  { name: 'Apr', value: 2780 },
  { name: 'May', value: 1890 },
  { name: 'Jun', value: 2390 },
  { name: 'Jul', value: 3490 },
];

export const categoryData = [
  { name: 'IT', value: 400 },
  { name: 'Retail', value: 300 },
  { name: 'Hospitality', value: 300 },
  { name: 'Automotive', value: 200 },
];

export const recentActivities = [
  { id: 1, type: 'new_vendor', title: 'New Vendor Registration', description: 'Tech Solutions applied for registration.', time: '2 hours ago' },
  { id: 2, type: 'order', title: 'New Order Received', description: 'Order #12345 placed by Alice Johnson.', time: '5 hours ago' },
];

export const monthlyStats = [
  { vendors: 50, revenue: 50000, orders: 1200, growth: 12 },
  { vendors: 45, revenue: 45000, orders: 1100, growth: 10 },
];

export const pendingVendors = [
  { id: "1", businessName: "Tech Solutions", email: "info@techsol.com", businessType: "IT", applicationDate: "2023-10-01", status: "pending", phone: "1234567890" },
  { id: "2", businessName: "Green Grocers", email: "contact@greengrocery.com", businessType: "Retail", applicationDate: "2023-10-05", status: "pending", phone: "0987654321" },
];

export const approvedVendors = [
  { id: "3", businessName: "Blue Sky Cafe", category: "Hospitality", businessRevenue: 12000, joinDate: "2023-01-15", status: 'active', revenue: 12000 },
  { id: "4", businessName: "Quick Fix Garage", category: "Automotive", businessRevenue: 8500, joinDate: "2023-03-20", status: 'active', revenue: 8500 },
];
