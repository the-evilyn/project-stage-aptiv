import React from 'react';
import { Package, Box, Cpu, Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { KPICard } from './KPICard';

export const Dashboard: React.FC = () => {
  const { getKPIs, families, robs, auditLogs } = useData();
  const kpis = getKPIs();

  const recentActivities = auditLogs.slice(0, 5);
  
  const robStatusData = [
    { name: 'SERIAL', value: kpis.serialROBs, color: '#3B82F6' },
    { name: 'MPR', value: kpis.mprROBs, color: '#10B981' },
    { name: 'MYC', value: kpis.mycROBs, color: '#F59E0B' }
  ];

  const familyStatusData = families.reduce((acc, family) => {
    acc[family.status] = (acc[family.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Production management overview</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Last updated</p>
          <p className="text-sm font-medium text-gray-900">
            {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Families"
          value={kpis.totalFamilies}
          icon={Package}
          color="blue"
          trend={{ value: 12, isPositive: true }}
        />
        <KPICard
          title="Active Families"
          value={kpis.activeFamilies}
          icon={CheckCircle}
          color="green"
          trend={{ value: 8, isPositive: true }}
        />
        <KPICard
          title="Total Holders"
          value={kpis.totalHolders}
          icon={Box}
          color="purple"
          trend={{ value: 5, isPositive: true }}
        />
        <KPICard
          title="ROB Utilization"
          value={kpis.robUtilization}
          unit="%"
          icon={Activity}
          color={kpis.robUtilization > 80 ? "red" : kpis.robUtilization > 60 ? "yellow" : "green"}
          trend={{ value: 3, isPositive: false }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ROB Distribution Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">ROB Distribution by Type</h2>
          <div className="space-y-4">
            {robStatusData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-medium text-gray-700">{item.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">{item.value} ROBs</span>
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full"
                      style={{ 
                        backgroundColor: item.color,
                        width: `${(item.value / Math.max(...robStatusData.map(d => d.value))) * 100}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h2>
          <div className="space-y-4">
            {recentActivities.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No recent activities</p>
            ) : (
              recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    {activity.operation === 'CREATE' && (
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    )}
                    {activity.operation === 'UPDATE' && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    )}
                    {activity.operation === 'DELETE' && (
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium capitalize">{activity.operation.toLowerCase()}</span>
                      {' '}operation on {activity.tableName}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Status Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">System Status Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="font-medium text-gray-900">Production Status</h3>
            <p className="text-sm text-gray-500 mt-1">All systems operational</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
            </div>
            <h3 className="font-medium text-gray-900">Maintenance Due</h3>
            <p className="text-sm text-gray-500 mt-1">2 items require attention</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Cpu className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="font-medium text-gray-900">ROB Performance</h3>
            <p className="text-sm text-gray-500 mt-1">Optimal efficiency levels</p>
          </div>
        </div>
      </div>
    </div>
  );
};