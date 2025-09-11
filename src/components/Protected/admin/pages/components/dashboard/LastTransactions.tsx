'use client';

interface Transaction {
  id: string;
  issuedDate: string;
  total: string;
  status?: string;
}

interface LastTransactionsProps {
  transactions: Transaction[];
  className?: string;
}

export default function LastTransactions({ 
  transactions, 
  className = ""
}: LastTransactionsProps) {
  return (
    <div className={`bg-white p-6 rounded-lg border border-gray-200 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Last Transactions</h3>
        <button className="text-sm text-blue-600 hover:text-blue-800 transition-colors">
          View All
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 text-sm font-medium text-gray-600">ID</th>
              <th className="text-left py-2 text-sm font-medium text-gray-600">Issued Date</th>
              <th className="text-left py-2 text-sm font-medium text-gray-600">Total</th>
              <th className="text-left py-2 text-sm font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="border-b border-gray-100">
                <td className="py-3 text-sm text-gray-900">{transaction.id}</td>
                <td className="py-3 text-sm text-gray-600">{transaction.issuedDate}</td>
                <td className="py-3 text-sm text-gray-900">{transaction.total}</td>
                <td className="py-3">
                  <button className="text-sm text-blue-600 hover:text-blue-800 transition-colors">
                    View Detail
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
