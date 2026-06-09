import React, { useEffect, useState } from "react";
import { getEmployeeById, getAllCustomersOfEmployee } from "../../api/adminApi";

export const EmployeeDetails = ({ employeeId }) => {
  const [employee, setEmployee] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (employeeId) {
      setLoading(true);
      Promise.all([
        getEmployeeById(employeeId),
        getAllCustomersOfEmployee(employeeId)
      ])
        .then(([empRes, custRes]) => {
          setEmployee(empRes.data);
          setCustomers(custRes.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching employee details:", err);
          setError("Failed to load employee details.");
          setLoading(false);
        });
    }
  }, [employeeId]);

  if (loading) return <div className="p-4 text-center">Loading details...</div>;
  if (error) return <div className="p-4 text-center text-red-500">{error}</div>;
  if (!employee) return null;

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Basic Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Name</p>
            <p className="text-base font-medium">{employee.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="text-base font-medium">{employee.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Role</p>
            <p className="text-base font-medium">{employee.role}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Joined Date</p>
            <p className="text-base font-medium">{new Date(employee.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Assigned Customers ({customers.length})</h3>
        {customers.length === 0 ? (
          <p className="text-gray-500 italic">No customers assigned to this employee.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customers.map((cust) => (
                  <tr key={cust.id}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{cust.name}</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${cust.status === 'CLOSED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {cust.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
