import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import {
  getCustomerCount,
  getLeadsCount,
  getClosedLeadsCount,
  getConversionRate,
  getBestEmployee,
  getAllEmployees,
  getAllCustomers,
} from "../../api/adminApi";
import {
  getMyCustomers,
  getInterestedCustomers,
  getNotInterestedCustomers,
} from "../../api/employeeApi";
import Modal from "../../components/Modal";
import { RegisterForm } from "../auth/RegisterForm";
import { AddCustomerForm } from "../customers/AddCustomerForm";
import { EmployeeDetails } from "../admin/EmployeeDetails";
import { CustomerDetails } from "../customers/CustomerDetails";
import { InteractionHistory } from "../interactions/InteractionHistory";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

export const Dashboard = () => {
  const { user, logout, loading } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("overview");
  const [employees, setEmployees] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [myCustomers, setMyCustomers] = useState([]);
  const [interestedCustomers, setInterestedCustomers] = useState([]);
  const [notInterestedCustomers, setNotInterestedCustomers] = useState([]);
  const [leadBreakdown, setLeadBreakdown] = useState([]);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [stats, setStats] = useState({
    customers: 0,
    leads: 0,
    closedLeads: 0,
    conversionRate: 0,
    bestEmployee: "N/A",
  });
  const navigate = useNavigate();

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884d8",
    "#82ca9d",
  ];

  const fetchData = () => {
    if (user) {
      if (user.role === "ADMIN") {
        // Fetch Admin stats
        Promise.all([
          getCustomerCount(),
          getLeadsCount(),
          getClosedLeadsCount(),
          getConversionRate(),
          getBestEmployee(),
          getAllCustomers(),
        ])
          .then(([cust, leads, closed, conv, best, allCust]) => {
            setStats({
              customers: cust.data,
              leads: leads.data,
              closedLeads: closed.data,
              conversionRate: conv.data,
              bestEmployee: best.data || "N/A",
            });

            setCustomers(allCust.data);

            // Calculate breakdown from existing customer list
            const counts = allCust.data.reduce((acc, curr) => {
              const status = curr.status || "NEW";
              acc[status] = (acc[status] || 0) + 1;
              return acc;
            }, {});

            setLeadBreakdown(
              Object.keys(counts).map((status) => ({
                name: status,
                value: counts[status],
              })),
            );
          })
          .catch((err) => console.error("Error fetching admin stats:", err));

        // Fetch employees list
        getAllEmployees()
          .then((res) => setEmployees(res.data))
          .catch((err) => console.error(err));
      } else if (user.role === "EMPLOYEE") {
        // Fetch Employee data
        Promise.all([
          getMyCustomers(),
          getInterestedCustomers(),
          getNotInterestedCustomers(),
        ])
          .then(([allRes, intRes, notIntRes]) => {
            setMyCustomers(allRes.data);
            setInterestedCustomers(intRes.data);
            setNotInterestedCustomers(notIntRes.data);

            const closedCount = allRes.data.filter(
              (c) => c.status === "CLOSED",
            ).length;
            setStats((prev) => ({
              ...prev,
              customers: allRes.data.length,
              closedLeads: closedCount,
            }));
          })
          .catch((err) => console.error("Error fetching employee data:", err));
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!user) {
    navigate("/login");
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleRegisterSuccess = () => {
    setIsRegisterModalOpen(false);
    fetchData();
  };

  const handleAddCustomerSuccess = () => {
    setIsAddCustomerModalOpen(false);
    fetchData();
  };

  const handleEmployeeClick = (id) => {
    setSelectedEmployeeId(id);
    setIsDetailsModalOpen(true);
  };

  const handleCustomerClick = (id) => {
    setSelectedCustomerId(id);
    setIsCustomerModalOpen(true);
  };

  const handleHistoryClick = (e, id) => {
    e.stopPropagation();
    setSelectedCustomerId(id);
    setIsHistoryModalOpen(true);
  };

  const handleStarEmployeeClick = () => {
    if (
      stats.bestEmployee &&
      stats.bestEmployee !== "N/A" &&
      stats.bestEmployee !== "No top performing employee found"
    ) {
      const starEmp = employees.find((emp) => emp.name === stats.bestEmployee);
      if (starEmp) {
        handleEmployeeClick(starEmp.id);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/50">
      <nav className="bg-indigo-500 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-white">CRM</h1>
              {user.role === "ADMIN" && (
                <button
                  onClick={() => setIsRegisterModalOpen(true)}
                  className="ml-8 text-sm font-medium text-indigo-100 hover:text-white transition-colors"
                >
                  Register New Employee
                </button>
              )}
              <button
                onClick={() => setIsAddCustomerModalOpen(true)}
                className="ml-8 text-sm font-medium text-indigo-100 hover:text-white transition-colors"
              >
                Add Customer
              </button>
            </div>
            <div className="flex items-center">
              <span className="mr-4 text-xl font-bold text-white">
                Welcome, {user.name} ({user.role})
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-700 text-white px-4 py-2 rounded-md hover:bg-red-600 focus:outline-none transition-colors shadow-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {user.role === "ADMIN" ? (
            <div className="space-y-6">
              {/* Tabs */}
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  {[
                    { id: "overview", label: "Overview", icon: (
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    )},
                    { id: "employees", label: "Employees", icon: (
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )},
                    { id: "customers", label: "Customers", icon: (
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    )}
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        py-4 px-1 border-b-2 font-medium text-sm capitalize flex items-center
                        ${
                          activeTab === tab.id
                            ? "border-indigo-500 text-indigo-600"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }
                      `}
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Total Customers Card */}
                    <div className="bg-indigo-50 overflow-hidden shadow-md rounded-xl border border-indigo-100 relative group transition-all hover:shadow-lg">
                      <div className="px-4 py-5 sm:p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </div>
                          <div className="w-24 h-8 text-indigo-400 opacity-50">
                            <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                              <path d="M0 35 Q 25 15, 50 25 T 100 5" fill="none" stroke="currentColor" strokeWidth="3" />
                            </svg>
                          </div>
                        </div>
                        <dt className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Total Customers</dt>
                        <dd className="mt-1 text-3xl font-extrabold text-gray-900">{stats.customers}</dd>
                      </div>
                    </div>

                    {/* Total Leads Card */}
                    <div className="bg-orange-50 overflow-hidden shadow-md rounded-xl border border-orange-100 relative group transition-all hover:shadow-lg">
                      <div className="px-4 py-5 sm:p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                          </div>
                          <div className="w-24 h-8 text-orange-400 opacity-50">
                            <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                              <path d="M0 30 L 20 20 L 40 35 L 60 10 L 80 25 L 100 5" fill="none" stroke="currentColor" strokeWidth="3" />
                            </svg>
                          </div>
                        </div>
                        <dt className="text-xs font-bold text-orange-600 uppercase tracking-widest">Total Leads</dt>
                        <dd className="mt-1 text-3xl font-extrabold text-gray-900">{stats.leads}</dd>
                      </div>
                    </div>

                    {/* Closed Leads Card */}
                    <div className="bg-emerald-50 overflow-hidden shadow-md rounded-xl border border-emerald-100 relative group transition-all hover:shadow-lg">
                      <div className="px-4 py-5 sm:p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div className="w-24 h-8 text-emerald-400 opacity-50">
                            <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                              <path d="M0 38 Q 20 38, 40 20 T 80 15 T 100 5" fill="none" stroke="currentColor" strokeWidth="3" />
                            </svg>
                          </div>
                        </div>
                        <dt className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Closed Leads</dt>
                        <dd className="mt-1 text-3xl font-extrabold text-gray-900">{stats.closedLeads}</dd>
                      </div>
                    </div>
                  </div>


                  <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                    {/* Conversion Chart Card */}
                    <div className="bg-slate-50 shadow-md rounded-xl p-6 border border-slate-200/50">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          Lead Conversion Analysis
                        </h3>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            Overall Conversion Rate
                          </p>
                          <p className="text-2xl font-bold text-indigo-600">
                            {stats.conversionRate.toFixed(2)}%
                          </p>
                        </div>
                      </div>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={leadBreakdown}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                              label={({ name, percent }) =>
                                `${name} ${(percent * 100).toFixed(0)}%`
                              }
                            >
                              {leadBreakdown.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={COLORS[index % COLORS.length]}
                                />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" height={36} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Performance Summary Card */}
                    <div className="bg-slate-50 shadow-md rounded-xl p-6 border border-slate-200/50">
                      <div className="flex items-center space-x-2 mb-4">
                        <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900">Top Performance</h3>
                      </div>
                      <div
                        onClick={handleStarEmployeeClick}
                        className="flex items-center space-x-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100 mb-4 cursor-pointer hover:bg-indigo-100 transition-colors"
                        title="Click to view details"
                      >
                        <div className="bg-indigo-600 p-3 rounded-full">
                          <svg
                            className="w-8 h-8 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-indigo-600 font-semibold uppercase tracking-wider">
                            Star Employee
                          </p>
                          <p className="text-2xl font-bold text-gray-900">
                            {stats.bestEmployee}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-500 uppercase font-bold mb-1">
                            Success Metric
                          </p>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-indigo-600 h-2.5 rounded-full"
                              style={{ width: `${stats.conversionRate}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-600 mt-2">
                            Target reached: {stats.conversionRate.toFixed(2)}%
                            of closed deals.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* New Quick Access Cards */}
                  <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                    {/* Top Employees Card */}
                    <div className="bg-slate-50 shadow-lg rounded-2xl overflow-hidden border border-slate-200/60">
                      <div className="px-6 py-4 bg-indigo-50/30 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="text-md font-bold text-indigo-900">Key Personnel</h3>
                        <button 
                          onClick={() => setActiveTab('employees')}
                          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                        >
                          View All
                        </button>
                      </div>
                      <div className="divide-y divide-gray-50">
                        {employees.slice(0, 5).map((emp) => (
                          <div 
                            key={emp.id} 
                            onClick={() => handleEmployeeClick(emp.id)}
                            className="px-6 py-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors group"
                          >
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-sm group-hover:scale-110 transition-transform">
                                {emp.name.charAt(0)}
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-bold text-gray-800">{emp.name}</p>
                                <p className="text-[10px] text-gray-500 uppercase tracking-tighter">{emp.role}</p>
                              </div>
                            </div>
                            <svg className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recent Customers Card */}
                    <div className="bg-slate-50 shadow-lg rounded-2xl overflow-hidden border border-slate-200/60">
                      <div className="px-6 py-4 bg-emerald-50/30 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="text-md font-bold text-emerald-900">Priority Customers</h3>
                        <button 
                          onClick={() => setActiveTab('customers')}
                          className="text-xs font-bold text-emerald-600 hover:text-emerald-800 transition-colors"
                        >
                          View All
                        </button>
                      </div>
                      <div className="divide-y divide-gray-50">
                        {customers.slice(0, 5).map((cust) => (
                          <div 
                            key={cust.id} 
                            onClick={() => handleCustomerClick(cust.id)}
                            className="px-6 py-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors group"
                          >
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow-sm group-hover:rotate-12 transition-transform">
                                {cust.name.charAt(0)}
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-bold text-gray-800">{cust.name}</p>
                                <div className="flex items-center">
                                  <span className={`w-1.5 h-1.5 rounded-full mr-1 ${cust.status === 'CLOSED' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                                  <p className="text-[10px] text-gray-500 font-medium">{cust.status}</p>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] text-gray-400 font-mono">#{cust.id}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "employees" && (
                <div className="bg-slate-50 shadow-xl rounded-2xl overflow-hidden border border-slate-200/60">
                  <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900">Employee Directory</h3>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </span>
                      <input 
                        type="text" 
                        placeholder="Search employees..." 
                        className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all shadow-sm"
                      />
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-white">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Employee
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Role
                          </th>
                          <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {employees.map((emp) => (
                          <tr
                            key={emp.id}
                            onClick={() => handleEmployeeClick(emp.id)}
                            className="hover:bg-indigo-50/30 cursor-pointer transition-all group"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-10 w-10 flex-shrink-0">
                                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border-2 border-white shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                    {emp.name.charAt(0).toUpperCase()}
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-semibold text-gray-900">{emp.name}</div>
                                  <div className="text-xs text-gray-500 font-medium">Emp ID: #{emp.id}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                              {emp.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border ${emp.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                                {emp.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1 rounded-lg transition-colors">View Details</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === "customers" && (
                <div className="bg-slate-50 shadow-xl rounded-2xl overflow-hidden border border-slate-200/60">
                  <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900">Global Customer Base</h3>
                    <div className="flex space-x-3">
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </span>
                        <input 
                          type="text" 
                          placeholder="Search customers..." 
                          className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all shadow-sm"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-white">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Customer Info
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Contact Details
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Assigned Agent
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Pipeline Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {customers.map((cust) => (
                          <tr
                            key={cust.id}
                            onClick={() => handleCustomerClick(cust.id)}
                            className="hover:bg-indigo-50/30 cursor-pointer transition-all group"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-10 w-10 flex-shrink-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md transform group-hover:scale-110 transition-transform">
                                  {cust.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-bold text-gray-900">{cust.name}</div>
                                  <div className="text-xs text-gray-500">ID: CRM-{cust.id.toString().padStart(4, '0')}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 font-medium">{cust.email}</div>
                              <div className="text-xs text-gray-500">{cust.phone}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center text-sm text-gray-600 font-semibold">
                                <svg className="w-4 h-4 mr-1.5 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                                {cust.assignedToName}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border-2 ${
                                  cust.status === "CLOSED" 
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                                    : cust.status === "INTERESTED"
                                    ? "bg-blue-50 text-blue-700 border-blue-100"
                                    : "bg-amber-50 text-amber-700 border-amber-100"
                                }`}
                              >
                                {cust.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Employee Stats */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      My Assigned Customers
                    </dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">
                      {stats.customers}
                    </dd>
                  </div>
                </div>
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      My Closed Deals
                    </dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">
                      {stats.closedLeads}
                    </dd>
                  </div>
                </div>
              </div>

              {/* My Customers Table */}
              <div className="bg-slate-50 shadow rounded-lg border border-slate-200/50">
                <div className="px-4 py-5 border-b border-gray-200 flex justify-between items-center sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    My Customers
                  </h3>
                  <span className="text-xs text-gray-400">
                    Click a row for details, or 'History' for interactions
                  </span>
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {myCustomers.map((cust) => (
                      <tr
                        key={cust.id}
                        onClick={() => handleCustomerClick(cust.id)}
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {cust.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {cust.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {cust.phone}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${cust.status === "CLOSED" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
                          >
                            {cust.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={(e) => handleHistoryClick(e, cust.id)}
                            className="text-indigo-600 hover:text-indigo-900 font-medium"
                          >
                            History
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Interest-based Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Interested Customers Column */}
                <div className="bg-slate-50 shadow rounded-lg border border-slate-200/50">
                  <div className="px-4 py-5 border-b border-gray-200 bg-green-50 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-green-800">
                      Interested Customers
                    </h3>
                  </div>
                  <ul className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                    {interestedCustomers.length === 0 ? (
                      <li className="px-6 py-4 text-sm text-gray-500 italic">
                        No interested customers yet.
                      </li>
                    ) : (
                      interestedCustomers.map((cust) => (
                        <li
                          key={cust.id}
                          onClick={() => handleCustomerClick(cust.id)}
                          className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-indigo-600 truncate">
                              {cust.name}
                            </p>
                            <button
                              onClick={(e) => handleHistoryClick(e, cust.id)}
                              className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded hover:bg-indigo-200"
                            >
                              History
                            </button>
                          </div>
                          <div className="mt-1 flex justify-between items-center">
                            <p className="text-xs text-gray-500">
                              {cust.phone}
                            </p>
                            <p className="text-[10px] text-gray-400">
                              {cust.email}
                            </p>
                          </div>
                        </li>
                      ))
                    )}
                  </ul>
                </div>

                {/* Not Interested Customers Column */}
                <div className="bg-slate-50 shadow rounded-lg border border-slate-200/50">
                  <div className="px-4 py-5 border-b border-gray-200 bg-red-50 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-red-800">
                      Not Interested Customers
                    </h3>
                  </div>
                  <ul className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                    {notInterestedCustomers.length === 0 ? (
                      <li className="px-6 py-4 text-sm text-gray-500 italic">
                        No "not interested" customers.
                      </li>
                    ) : (
                      notInterestedCustomers.map((cust) => (
                        <li
                          key={cust.id}
                          onClick={() => handleCustomerClick(cust.id)}
                          className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {cust.name}
                            </p>
                            <button
                              onClick={(e) => handleHistoryClick(e, cust.id)}
                              className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded hover:bg-gray-200"
                            >
                              History
                            </button>
                          </div>
                          <div className="mt-1 flex justify-between items-center">
                            <p className="text-xs text-gray-500">
                              {cust.phone}
                            </p>
                            <p className="text-[10px] text-gray-400">
                              {cust.email}
                            </p>
                          </div>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <Modal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        title="Register New Employee"
      >
        <RegisterForm
          onSuccess={handleRegisterSuccess}
          onCancel={() => setIsRegisterModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isAddCustomerModalOpen}
        onClose={() => setIsAddCustomerModalOpen(false)}
        title="Add New Customer"
      >
        <AddCustomerForm
          onSuccess={handleAddCustomerSuccess}
          onCancel={() => setIsAddCustomerModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title="Employee Details"
      >
        <EmployeeDetails employeeId={selectedEmployeeId} />
      </Modal>

      <Modal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        title="Customer Details & Interactions"
      >
        <CustomerDetails customerId={selectedCustomerId} onUpdate={fetchData} />
      </Modal>

      <Modal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        title="Interaction History"
      >
        <InteractionHistory customerId={selectedCustomerId} />
      </Modal>
    </div>
  );
};
