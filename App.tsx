
import React, { useState } from 'react';
import { DataProvider } from './context/DataContext';
import Dashboard from './components/Dashboard';
import InvoiceList from './components/InvoiceList';
import CustomerList from './components/CustomerList';
import ItemList from './components/ItemList';
import Settings from './components/Settings';
import { HomeIcon, DocumentTextIcon, UsersIcon, CubeIcon, CogIcon } from './components/common/Icons';

type Page = 'dashboard' | 'invoices' | 'customers' | 'items' | 'settings';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard setCurrentPage={setCurrentPage} />;
      case 'invoices':
        return <InvoiceList />;
      case 'customers':
        return <CustomerList />;
      case 'items':
        return <ItemList />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard setCurrentPage={setCurrentPage} />;
    }
  };

  const NavItem: React.FC<{
    page: Page;
    label: string;
    icon: React.ReactNode;
  }> = ({ page, label, icon }) => (
    <button
      onClick={() => setCurrentPage(page)}
      className={`flex flex-col items-center justify-center space-y-1 w-full text-xs font-medium py-2 rounded-md transition-colors duration-200 ${
        currentPage === page
          ? 'text-blue-600 bg-blue-100'
          : 'text-slate-500 hover:bg-slate-100'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <DataProvider>
      <div className="flex flex-col h-screen font-sans bg-slate-50">
        <header className="bg-white shadow-md z-10 p-4">
            <h1 className="text-xl font-bold text-slate-800">BillBook</h1>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {renderPage()}
        </main>

        <footer className="bg-white border-t border-slate-200 p-2 shadow-lg">
          <nav className="flex justify-around items-center">
            <NavItem page="dashboard" label="Home" icon={<HomeIcon />} />
            <NavItem page="invoices" label="Invoices" icon={<DocumentTextIcon />} />
            <NavItem page="customers" label="Customers" icon={<UsersIcon />} />
            <NavItem page="items" label="Items" icon={<CubeIcon />} />
            <NavItem page="settings" label="Settings" icon={<CogIcon />} />
          </nav>
        </footer>
      </div>
    </DataProvider>
  );
};

export default App;
