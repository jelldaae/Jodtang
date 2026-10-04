import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { DemoDataBanner } from './components/DemoDataBanner';
import { DesktopSidebar, MobileBottomNav, NavTab } from './components/Navigation';
import { HomeDashboard } from './components/HomeDashboard';
import { TransactionsPage } from './components/TransactionsPage';
import { AccountsPage } from './components/AccountsPage';
import { BudgetsPage } from './components/BudgetsPage';
import { DebtsPage } from './components/DebtsPage';
import { SavingsPage } from './components/SavingsPage';
import { RecurringPage } from './components/RecurringPage';
import { AssetsPage } from './components/AssetsPage';
import { SettingsPage } from './components/SettingsPage';
import { TransactionModal } from './components/TransactionModal';
import { LoginView } from './components/LoginView';
import { Debt, Transaction } from './types';

const MainLayout: React.FC = () => {
  const { user, isLoading, accounts } = useApp();
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [txAccountFilter, setTxAccountFilter] = useState<string | null>(null);

  if (isLoading && !user) {
    return (
      <div className="min-h-screen bg-[#FAF8F2] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-[#3F8F72] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm font-semibold text-gray-600">กำลังโหลด จดตังค์ (JODTANG)...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginView />;
  }

  const handleOpenAddModal = () => {
    setEditingTx(null);
    setIsAddModalOpen(true);
  };

  const handleOpenTransferModal = () => {
    // Open with transfer type
    setEditingTx({
      id: '',
      date: new Date().toISOString().slice(0, 10),
      type: 'transfer',
      accountId: '',
      description: 'โอนเงินระหว่างบัญชี',
      amount: 0,
      currency: 'THB',
      status: 'ใช้งาน',
      createdAt: '',
      updatedAt: '',
    });
    setIsAddModalOpen(true);
  };

  const handlePayDebt = (debt: Debt) => {
    setEditingTx({
      id: '',
      date: new Date().toISOString().slice(0, 10),
      type: 'debt_payment',
      amount: debt.minPay || 0,
      accountId: debt.accountId || (accounts[0]?.id ?? ''),
      debtId: debt.id,
      description: `ชำระหนี้: ${debt.name}`,
      currency: 'THB',
      status: 'ใช้งาน',
      createdAt: '',
      updatedAt: '',
    });
    setIsAddModalOpen(true);
  };

  const handleEditTransaction = (tx: Transaction) => {
    setEditingTx(tx);
    setIsAddModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F2] flex flex-col font-['IBM_Plex_Sans_Thai','Plus_Jakarta_Sans',sans-serif]">
      {/* Header */}
      <Header
        onOpenAddModal={handleOpenAddModal}
        onNavigateSettings={() => setCurrentTab('settings')}
      />

      {/* Demo Data Mode Notification Banner (Master Prompt Section 1-28) */}
      <DemoDataBanner
        onNavigateSettings={() => setCurrentTab('settings')}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar */}
        <DesktopSidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 overflow-y-auto">
          {currentTab === 'home' && (
            <HomeDashboard
              onOpenAddModal={handleOpenAddModal}
              onNavigateTransactions={() => setCurrentTab('transactions')}
              onEditTransaction={handleEditTransaction}
              onNavigateAccounts={() => setCurrentTab('accounts')}
              onNavigateDebts={() => setCurrentTab('debts')}
              onNavigateSavings={() => setCurrentTab('savings')}
              onNavigateAssets={() => setCurrentTab('assets')}
              onNavigateBudgets={() => setCurrentTab('budgets')}
            />
          )}

          {currentTab === 'transactions' && (
            <TransactionsPage
              onOpenAddModal={handleOpenAddModal}
              onEditTransaction={handleEditTransaction}
              initialFilterAccount={txAccountFilter}
              onClearFilterAccount={() => setTxAccountFilter(null)}
            />
          )}

          {currentTab === 'accounts' && (
            <AccountsPage
              onOpenTransferModal={handleOpenTransferModal}
              onNavigateSettings={() => setCurrentTab('settings')}
              onNavigateToAccountTransactions={(accId) => {
                setTxAccountFilter(accId);
                setCurrentTab('transactions');
              }}
              onOpenAddTransaction={(accId) => {
                setEditingTx({
                  id: '',
                  date: new Date().toISOString().slice(0, 10),
                  type: 'expense',
                  accountId: accId || '',
                  description: '',
                  amount: 0,
                  currency: 'THB',
                  status: 'ใช้งาน',
                  createdAt: '',
                  updatedAt: '',
                });
                setIsAddModalOpen(true);
              }}
            />
          )}

          {currentTab === 'assets' && (
            <AssetsPage />
          )}

          {currentTab === 'budgets' && (
            <BudgetsPage />
          )}

          {currentTab === 'debts' && (
            <DebtsPage onPayDebt={handlePayDebt} />
          )}

          {currentTab === 'savings' && (
            <SavingsPage />
          )}

          {currentTab === 'recurring' && (
            <RecurringPage />
          )}

          {(currentTab === 'settings' || currentTab === 'categories') && (
            <SettingsPage />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenAddModal={handleOpenAddModal}
      />

      {/* Transaction Modal (Add / Edit) */}
      <TransactionModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingTx(null);
        }}
        editTx={editingTx}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
