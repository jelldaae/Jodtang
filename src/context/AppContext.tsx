import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { 
  AppUser, 
  Transaction, 
  Account, 
  Category, 
  Project, 
  Budget, 
  Debt, 
  Receivable, 
  Goal, 
  Recurring, 
  Asset, 
  AssetCategory,
  SheetMetadata,
  DEFAULT_ASSET_CATEGORIES
} from '../types';
import { serializeAccountNote, normalizeAccountType } from '../utils/accountUtils';
import { initAuth, googleSignIn, logout, getAccessToken, setAccessToken } from '../services/auth';
import { 
  findExistingDatabaseSheet, 
  createDatabaseSheet, 
  fetchAllDataFromSheet, 
  appendTransactionToSheet, 
  updateTransactionInSheet,
  saveMasterToSheet,
  generateTransactionId,
  SHEET_TABS,
  getDefaultIncomeCategories,
  getDefaultExpenseCategories,
} from '../services/googleSheets';
import {
  DEMO_ACCOUNTS,
  getDemoBudgets,
  DEMO_DEBTS,
  DEMO_GOALS,
  DEMO_ASSETS,
  DEMO_RECURRING,
  getDemoTransactions
} from '../services/demoData';

interface AppContextType {
  user: AppUser | null;
  accessToken: string | null;
  spreadsheet: SheetMetadata | null;
  isLoading: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  syncError: string | null;
  transactions: Transaction[];
  accounts: Account[];
  projects: Project[];
  incomeCats: Category[];
  expenseCats: Category[];
  budgets: Budget[];
  debts: Debt[];
  receivables: Receivable[];
  goals: Goal[];
  recurring: Recurring[];
  assets: Asset[];
  assetCats: AssetCategory[];
  
  // Demo Data Management (Section 1 - 28)
  isDemoActive: boolean;
  demoItemCounts: {
    accounts: number;
    budgets: number;
    debts: number;
    goals: number;
    assets: number;
    recurring: number;
    transactions: number;
  };
  loadDemoData: (force?: boolean) => Promise<void>;
  deleteDemoData: () => Promise<void>;
  
  // Derived financial indicators
  totalBalance: number;
  totalDebtRemaining: number;
  totalSavingsCurrent: number;
  totalAssetCost: number;
  totalAssetValue: number;
  unlinkedAssetValue: number;
  totalCreditCardDebt: number;
  assetProfitLoss: number;
  assetProfitLossPct: number;
  netWorth: number;
  monthlyIncome: number;
  monthlyExpense: number;
  todayExpense: number;

  // Actions
  loginWithGoogle: () => Promise<void>;
  handleLogout: () => Promise<void>;
  syncData: () => Promise<void>;
  createNewSpreadsheet: (name?: string) => Promise<void>;
  connectSpreadsheetById: (id: string) => Promise<void>;
  
  // CRUD Actions
  saveTransaction: (txData: Partial<Transaction> & { id?: string }) => Promise<string>;
  deleteTransaction: (id: string) => Promise<void>;
  
  saveAccount: (accData: Partial<Account> & { id?: string }) => Promise<string>;
  deleteAccount: (id: string) => Promise<void>;
  toggleAccountStatus: (id: string) => Promise<void>;
  hasAccountTransactions: (id: string) => boolean;

  saveCategory: (catData: Partial<Category> & { id?: string }, isIncome: boolean) => Promise<string>;
  deleteCategory: (id: string, isIncome: boolean) => Promise<void>;
  toggleCategoryStatus: (id: string, isIncome: boolean) => Promise<void>;

  saveAssetCategory: (catData: Partial<AssetCategory> & { id?: string }) => Promise<string>;
  deleteAssetCategory: (id: string) => Promise<void>;
  toggleAssetCategoryStatus: (id: string) => Promise<void>;

  saveBudget: (budgetData: Partial<Budget> & { id?: string }) => Promise<string>;
  deleteBudget: (id: string) => Promise<void>;

  saveDebt: (debtData: Partial<Debt> & { id?: string }) => Promise<string>;
  deleteDebt: (id: string) => Promise<void>;

  saveReceivable: (recData: Partial<Receivable> & { id?: string }) => Promise<string>;
  deleteReceivable: (id: string) => Promise<void>;

  saveGoal: (goalData: Partial<Goal> & { id?: string }) => Promise<string>;
  deleteGoal: (id: string) => Promise<void>;

  saveRecurring: (recData: Partial<Recurring> & { id?: string }) => Promise<string>;
  deleteRecurring: (id: string) => Promise<void>;
  toggleRecurringStatus: (id: string) => Promise<void>;
  createFromRecurring: (recurringId: string, date?: string) => Promise<void>;

  saveAsset: (assetData: Partial<Asset> & { id?: string }) => Promise<string>;
  deleteAsset: (id: string) => Promise<void>;

  saveProject: (projectData: Partial<Project> & { id?: string }) => Promise<string>;
  deleteProject: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [accessToken, setTokenState] = useState<string | null>(null);
  const [spreadsheet, setSpreadsheet] = useState<SheetMetadata | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  // In-memory data stores
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [incomeCats, setIncomeCats] = useState<Category[]>(() => {
    const curTs = new Date().toISOString();
    return getDefaultIncomeCategories(curTs).map(r => ({
      id: r[0], name: r[1], group: r[2], icon: r[3], note: r[4], status: r[5] as any, createdAt: r[6], updatedAt: r[7]
    }));
  });
  const [expenseCats, setExpenseCats] = useState<Category[]>(() => {
    const curTs = new Date().toISOString();
    return getDefaultExpenseCategories(curTs).map(r => ({
      id: r[0], name: r[1], group: r[2], icon: r[3], note: r[4], status: r[5] as any, createdAt: r[6], updatedAt: r[7]
    }));
  });
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [receivables, setReceivables] = useState<Receivable[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [recurring, setRecurring] = useState<Recurring[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [assetCats, setAssetCats] = useState<AssetCategory[]>(() => {
    const curTs = new Date().toISOString();
    return DEFAULT_ASSET_CATEGORIES.map((ac, idx) => ({
      id: `ACAT-${String(idx + 1).padStart(3, '0')}`,
      name: ac.name,
      icon: ac.icon,
      status: 'ใช้งาน' as const,
      createdAt: curTs,
      updatedAt: curTs,
    }));
  });

  // Init Auth & Local Storage on mount
  useEffect(() => {
    // 1. Try loading cached data from localStorage
    const localTxs = localStorage.getItem('jodtang_local_txs');
    const localAccs = localStorage.getItem('jodtang_local_accounts');
    const localBdgs = localStorage.getItem('jodtang_local_budgets');
    const localDebts = localStorage.getItem('jodtang_local_debts');
    const localGoals = localStorage.getItem('jodtang_local_goals');
    const localAssets = localStorage.getItem('jodtang_local_assets');
    const localRec = localStorage.getItem('jodtang_local_recurring');

    let hasLocalData = false;
    if (localAccs) {
      try {
        const parsedAccs = JSON.parse(localAccs);
        if (parsedAccs.length > 0) {
          setAccounts(parsedAccs);
          if (localTxs) setTransactions(JSON.parse(localTxs));
          if (localBdgs) setBudgets(JSON.parse(localBdgs));
          if (localDebts) setDebts(JSON.parse(localDebts));
          if (localGoals) setGoals(JSON.parse(localGoals));
          if (localAssets) setAssets(JSON.parse(localAssets));
          if (localRec) setRecurring(JSON.parse(localRec));
          hasLocalData = true;
        }
      } catch (e) {
        console.error('Failed to parse local cached data', e);
      }
    }

    // 2. If no data exists and demo was not explicitly cleared, seed demo data
    const wasCleared = localStorage.getItem('jodtang_demo_cleared') === 'true';
    if (!hasLocalData && !wasCleared) {
      const curMonth = new Date().toISOString().slice(0, 7);
      const demoBudgets = getDemoBudgets(curMonth, expenseCats);
      const demoTxs = getDemoTransactions(incomeCats, expenseCats);

      setAccounts(DEMO_ACCOUNTS);
      setBudgets(demoBudgets);
      setDebts(DEMO_DEBTS);
      setGoals(DEMO_GOALS);
      setAssets(DEMO_ASSETS);
      setRecurring(DEMO_RECURRING);
      setTransactions(demoTxs);

      localStorage.setItem('jodtang_demo_active', 'true');
    }

    const unsubscribe = initAuth(
      async (appUser, token) => {
        setUser(appUser);
        if (token) {
          setTokenState(token);
          setAccessToken(token);
          await loadUserSpreadsheet(appUser, token);
        } else {
          setIsLoading(false);
        }
      },
      () => {
        setUser(null);
        setTokenState(null);
        setAccessToken(null);
        setSpreadsheet(null);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Find or Create user's Google Sheet
  const loadUserSpreadsheet = async (currentUser: AppUser, token: string) => {
    setIsLoading(true);
    setSyncError(null);
    try {
      const userKey = `jodtang_sheet_${currentUser.email}`;
      const storedSheetId = localStorage.getItem(userKey);

      let sheetMeta: SheetMetadata | null = null;

      if (storedSheetId) {
        sheetMeta = {
          id: storedSheetId,
          name: 'จดตังค์ (JODTANG) Database',
          webViewLink: `https://docs.google.com/spreadsheets/d/${storedSheetId}`,
        };
      } else {
        sheetMeta = await findExistingDatabaseSheet(token);
      }

      if (!sheetMeta) {
        sheetMeta = await createDatabaseSheet(token);
      }

      setSpreadsheet(sheetMeta);
      if (currentUser.email) {
        localStorage.setItem(`jodtang_sheet_${currentUser.email}`, sheetMeta.id);
      }

      await loadSheetData(sheetMeta.id, token);
    } catch (err: any) {
      console.error('Error loading spreadsheet:', err);
      setSyncError(err.message || 'ไม่สามารถโหลด Google Sheet ได้');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSheetData = async (sheetId: string, token: string) => {
    setIsSyncing(true);
    setSyncError(null);
    try {
      const data = await fetchAllDataFromSheet(sheetId, token);
      setTransactions(data.transactions);
      setAccounts(data.accounts);
      setProjects(data.projects);
      setIncomeCats(data.incomeCats);
      setExpenseCats(data.expenseCats);
      setBudgets(data.budgets);
      setDebts(data.debts);
      setReceivables(data.receivables);
      setGoals(data.goals);
      setRecurring(data.recurring);
      setAssets(data.assets);
      setAssetCats(data.assetCats);
      setLastSyncTime(new Date());
    } catch (err: any) {
      console.error('Fetch data error:', err);
      setSyncError(err.message || 'ซิงค์ข้อมูลไม่สำเร็จ');
    } finally {
      setIsSyncing(false);
    }
  };

  const syncData = useCallback(async () => {
    let token = accessToken;
    if (!token) {
      token = await getAccessToken();
    }
    if (!token || !spreadsheet) return;
    await loadSheetData(spreadsheet.id, token);
  }, [accessToken, spreadsheet]);

  const loginWithGoogle = async () => {
    setIsLoading(true);
    setSyncError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setTokenState(result.accessToken);
        setAccessToken(result.accessToken);
        await loadUserSpreadsheet(result.user, result.accessToken);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setSyncError(err.message || 'เข้าสู่ระบบด้วย Google ไม่สำเร็จ');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setTokenState(null);
    setAccessToken(null);
    setSpreadsheet(null);
    setTransactions([]);
    setAccounts([]);
    setBudgets([]);
    setDebts([]);
    setGoals([]);
    setIncomeCats([]);
    setExpenseCats([]);
    setAssets([]);
    setRecurring([]);
  };

  const createNewSpreadsheet = async (name?: string) => {
    let token = accessToken || await getAccessToken();
    if (!token || !user) throw new Error('กรุณาเข้าสู่ระบบก่อน');
    setIsLoading(true);
    try {
      const newSheet = await createDatabaseSheet(token, name);
      setSpreadsheet(newSheet);
      if (user.email) {
        localStorage.setItem(`jodtang_sheet_${user.email}`, newSheet.id);
      }
      await loadSheetData(newSheet.id, token);
    } finally {
      setIsLoading(false);
    }
  };

  const connectSpreadsheetById = async (id: string) => {
    let token = accessToken || await getAccessToken();
    if (!token || !user) throw new Error('กรุณาเข้าสู่ระบบก่อน');
    setIsLoading(true);
    try {
      const cleanId = id.trim().replace(/^.*\/d\//, '').replace(/\/.*$/, '');
      const sheetMeta: SheetMetadata = {
        id: cleanId,
        name: 'จดตังค์ (JODTANG) Database',
        webViewLink: `https://docs.google.com/spreadsheets/d/${cleanId}`,
      };
      setSpreadsheet(sheetMeta);
      if (user.email) {
        localStorage.setItem(`jodtang_sheet_${user.email}`, cleanId);
      }
      await loadSheetData(cleanId, token);
    } finally {
      setIsLoading(false);
    }
  };

  const genId = (prefix: string) => {
    const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `${prefix}-${Date.now().toString().slice(-4)}${rand}`;
  };

  const nowIso = () => new Date().toISOString().replace('T', ' ').substring(0, 19);

  // Demo Data Management (Section 1 - 28)
  const isDemoActive = useMemo(() => {
    return (
      accounts.some(a => a.isDemo) ||
      transactions.some(t => t.isDemo) ||
      budgets.some(b => b.isDemo) ||
      debts.some(d => d.isDemo) ||
      goals.some(g => g.isDemo) ||
      assets.some(a => a.isDemo) ||
      recurring.some(r => r.isDemo)
    );
  }, [accounts, transactions, budgets, debts, goals, assets, recurring]);

  const demoItemCounts = useMemo(() => {
    return {
      accounts: accounts.filter(a => a.isDemo).length,
      budgets: budgets.filter(b => b.isDemo).length,
      debts: debts.filter(d => d.isDemo).length,
      goals: goals.filter(g => g.isDemo).length,
      assets: assets.filter(a => a.isDemo).length,
      recurring: recurring.filter(r => r.isDemo).length,
      transactions: transactions.filter(t => t.isDemo).length,
    };
  }, [accounts, budgets, debts, goals, assets, recurring, transactions]);

  const loadDemoData = async (force: boolean = false) => {
    const curMonth = new Date().toISOString().slice(0, 7);

    // 1. Keep user-created real data intact (Sections 20, 22, 23)
    const realAccounts = accounts.filter(a => !a.isDemo);
    const realBudgets = budgets.filter(b => !b.isDemo);
    const realDebts = debts.filter(d => !d.isDemo);
    const realGoals = goals.filter(g => !g.isDemo);
    const realAssets = assets.filter(a => !a.isDemo);
    const realRecurring = recurring.filter(r => !r.isDemo);
    const realTransactions = transactions.filter(t => !t.isDemo);

    // 2. Generate fresh demo set
    const demoBudgets = getDemoBudgets(curMonth, expenseCats);
    const demoTxs = getDemoTransactions(incomeCats, expenseCats);

    const nextAccs = [...realAccounts, ...DEMO_ACCOUNTS];
    const nextBdgs = [...realBudgets, ...demoBudgets];
    const nextDebts = [...realDebts, ...DEMO_DEBTS];
    const nextGoals = [...realGoals, ...DEMO_GOALS];
    const nextAssets = [...realAssets, ...DEMO_ASSETS];
    const nextRec = [...realRecurring, ...DEMO_RECURRING];
    const nextTxs = [...realTransactions, ...demoTxs];

    setAccounts(nextAccs);
    setBudgets(nextBdgs);
    setDebts(nextDebts);
    setGoals(nextGoals);
    setAssets(nextAssets);
    setRecurring(nextRec);
    setTransactions(nextTxs);

    localStorage.setItem('jodtang_local_accounts', JSON.stringify(nextAccs));
    localStorage.setItem('jodtang_local_budgets', JSON.stringify(nextBdgs));
    localStorage.setItem('jodtang_local_debts', JSON.stringify(nextDebts));
    localStorage.setItem('jodtang_local_goals', JSON.stringify(nextGoals));
    localStorage.setItem('jodtang_local_assets', JSON.stringify(nextAssets));
    localStorage.setItem('jodtang_local_recurring', JSON.stringify(nextRec));
    localStorage.setItem('jodtang_local_txs', JSON.stringify(nextTxs));

    localStorage.removeItem('jodtang_demo_cleared');
    localStorage.setItem('jodtang_demo_active', 'true');
  };

  const deleteDemoData = async () => {
    // CRITICAL SAFETY (Sections 19, 20, 23):
    // Delete ONLY records WHERE isDemo === true!
    const realAccounts = accounts.filter(a => !a.isDemo);
    const realBudgets = budgets.filter(b => !b.isDemo);
    const realDebts = debts.filter(d => !d.isDemo);
    const realGoals = goals.filter(g => !g.isDemo);
    const realAssets = assets.filter(a => !a.isDemo);
    const realRecurring = recurring.filter(r => !r.isDemo);
    const realTransactions = transactions.filter(t => !t.isDemo);

    setAccounts(realAccounts);
    setBudgets(realBudgets);
    setDebts(realDebts);
    setGoals(realGoals);
    setAssets(realAssets);
    setRecurring(realRecurring);
    setTransactions(realTransactions);

    localStorage.setItem('jodtang_local_accounts', JSON.stringify(realAccounts));
    localStorage.setItem('jodtang_local_budgets', JSON.stringify(realBudgets));
    localStorage.setItem('jodtang_local_debts', JSON.stringify(realDebts));
    localStorage.setItem('jodtang_local_goals', JSON.stringify(realGoals));
    localStorage.setItem('jodtang_local_assets', JSON.stringify(realAssets));
    localStorage.setItem('jodtang_local_recurring', JSON.stringify(realRecurring));
    localStorage.setItem('jodtang_local_txs', JSON.stringify(realTransactions));

    localStorage.setItem('jodtang_demo_cleared', 'true');
    localStorage.removeItem('jodtang_demo_active');
  };

  // 1. Transaction Actions with Requirement 13 ID Format: TX-Year-Month-Day-Time-Num000xx
  const saveTransaction = async (txData: Partial<Transaction> & { id?: string }): Promise<string> => {
    let token = accessToken || await getAccessToken();

    const isEdit = Boolean(txData.id);
    const id = txData.id || generateTransactionId(transactions);
    const current = isEdit ? transactions.find(t => t.id === id) : null;

    const fullTx: Transaction = {
      id,
      date: txData.date || new Date().toISOString().slice(0, 10),
      type: txData.type || 'expense',
      accountId: txData.accountId || '',
      toAccountId: txData.toAccountId,
      projectId: txData.projectId,
      categoryId: txData.categoryId,
      description: txData.description || '',
      amount: Number(txData.amount) || 0,
      currency: txData.currency || 'THB',
      debtId: txData.debtId,
      principal: txData.principal != null ? Number(txData.principal) : undefined,
      interest: txData.interest != null ? Number(txData.interest) : undefined,
      receivableId: txData.receivableId,
      goalId: txData.goalId,
      subscriptionId: txData.subscriptionId,
      recurringId: txData.recurringId,
      status: txData.status || 'ใช้งาน',
      isDemo: txData.isDemo ?? false, // Crucial: real user records have isDemo: false!
      createdAt: current ? current.createdAt : nowIso(),
      updatedAt: nowIso(),
      deletedAt: txData.deletedAt,
    };

    setTransactions(prev => {
      const next = isEdit ? prev.map(t => (t.id === id ? fullTx : t)) : [fullTx, ...prev];
      localStorage.setItem('jodtang_local_txs', JSON.stringify(next));
      return next;
    });

    if (token && spreadsheet) {
      try {
        if (isEdit) {
          await updateTransactionInSheet(spreadsheet.id, token, fullTx);
        } else {
          await appendTransactionToSheet(spreadsheet.id, token, fullTx);
        }
        setLastSyncTime(new Date());
      } catch (err) {
        console.warn('Sheet sync deferred:', err);
      }
    }

    return id;
  };

  const deleteTransaction = async (id: string) => {
    let token = accessToken || await getAccessToken();

    const tx = transactions.find(t => t.id === id);
    if (!tx) return;

    const updatedTx: Transaction = {
      ...tx,
      status: 'ลบแล้ว',
      deletedAt: nowIso(),
      updatedAt: nowIso(),
    };

    setTransactions(prev => {
      const next = prev.filter(t => t.id !== id);
      localStorage.setItem('jodtang_local_txs', JSON.stringify(next));
      return next;
    });

    if (token && spreadsheet) {
      try {
        await updateTransactionInSheet(spreadsheet.id, token, updatedTx);
        setLastSyncTime(new Date());
      } catch (err) {
        console.warn('Sheet sync deferred:', err);
      }
    }
  };

  // 2. Account Actions
  const hasAccountTransactions = useCallback((id: string): boolean => {
    return transactions.some(t => t.status !== 'ลบแล้ว' && (t.accountId === id || t.toAccountId === id));
  }, [transactions]);

  const saveAccount = async (accData: Partial<Account> & { id?: string }): Promise<string> => {
    let token = accessToken || await getAccessToken();
    if (!token || !spreadsheet) throw new Error('ไม่ได้เชื่อมต่อ Google Sheets');

    const isEdit = Boolean(accData.id);
    const id = accData.id || genId('ACC');
    const existing = isEdit ? accounts.find(a => a.id === id) : null;

    const fullAcc: Account = {
      ...existing,
      ...accData,
      id,
      name: accData.name || existing?.name || '',
      type: normalizeAccountType(accData.type || existing?.type || 'ธนาคาร'),
      opening: accData.opening != null ? Number(accData.opening) : (existing?.opening != null ? Number(existing.opening) : 0),
      note: accData.note ?? existing?.note ?? '',
      status: accData.status || existing?.status || 'ใช้งาน',
      createdAt: existing ? existing.createdAt : nowIso(),
      updatedAt: nowIso(),
    };

    setAccounts(prev => (isEdit ? prev.map(a => a.id === id ? fullAcc : a) : [...prev, fullAcc]));
    const serializedNote = serializeAccountNote(fullAcc);
    const row = [fullAcc.id, fullAcc.name, fullAcc.type, fullAcc.opening, serializedNote, fullAcc.status, fullAcc.createdAt, fullAcc.updatedAt];
    await saveMasterToSheet(spreadsheet.id, token, SHEET_TABS.ACCOUNTS, id, row);
    return id;
  };

  const toggleAccountStatus = async (id: string) => {
    let token = accessToken || await getAccessToken();
    if (!token || !spreadsheet) throw new Error('ไม่ได้เชื่อมต่อ Google Sheets');
    const acc = accounts.find(a => a.id === id);
    if (!acc) return;
    const nextStatus: 'ใช้งาน' | 'ไม่ใช้งาน' = acc.status === 'ใช้งาน' ? 'ไม่ใช้งาน' : 'ใช้งาน';
    const updated: Account = { ...acc, status: nextStatus, updatedAt: nowIso() };
    setAccounts(prev => prev.map(a => a.id === id ? updated : a));
    const serializedNote = serializeAccountNote(updated);
    await saveMasterToSheet(spreadsheet.id, token, SHEET_TABS.ACCOUNTS, id, [
      updated.id, updated.name, updated.type, updated.opening, serializedNote, updated.status, updated.createdAt, updated.updatedAt
    ]);
  };

  const deleteAccount = async (id: string) => {
    let token = accessToken || await getAccessToken();
    if (!token || !spreadsheet) throw new Error('ไม่ได้เชื่อมต่อ Google Sheets');
    
    // Check if account has transactions
    const hasTx = transactions.some(t => t.status !== 'ลบแล้ว' && (t.accountId === id || t.toAccountId === id));
    if (hasTx) {
      // Cannot hard delete when transactions exist (ข้อกำหนด 17 & 40)
      // Automatically deactivate instead
      const acc = accounts.find(a => a.id === id);
      if (acc) {
        const updated: Account = { ...acc, status: 'ไม่ใช้งาน', updatedAt: nowIso() };
        setAccounts(prev => prev.map(a => a.id === id ? updated : a));
        const serializedNote = serializeAccountNote(updated);
        await saveMasterToSheet(spreadsheet.id, token, SHEET_TABS.ACCOUNTS, id, [
          updated.id, updated.name, updated.type, updated.opening, serializedNote, 'ไม่ใช้งาน', updated.createdAt, nowIso()
        ]);
      }
      return;
    }

    setAccounts(prev => prev.filter(a => a.id !== id));
    const acc = accounts.find(a => a.id === id);
    if (acc) {
      await saveMasterToSheet(spreadsheet.id, token, SHEET_TABS.ACCOUNTS, id, [
        acc.id, acc.name, acc.type, acc.opening, acc.note || '', 'ไม่ใช้งาน', acc.createdAt, nowIso()
      ]);
    }
  };

  // 3. Category Actions (Income & Expense)
  const saveCategory = async (catData: Partial<Category> & { id?: string }, isIncome: boolean): Promise<string> => {
    let token = accessToken || await getAccessToken();
    if (!token || !spreadsheet) throw new Error('ไม่ได้เชื่อมต่อ Google Sheets');

    const prefix = isIncome ? 'INC' : 'EXP';
    const tabName = isIncome ? SHEET_TABS.INCOME_CATS : SHEET_TABS.EXPENSE_CATS;
    const isEdit = Boolean(catData.id);
    const id = catData.id || genId(prefix);
    const list = isIncome ? incomeCats : expenseCats;
    const existing = isEdit ? list.find(c => c.id === id) : null;

    const fullCat: Category = {
      id,
      name: catData.name || '',
      group: catData.group || (isIncome ? 'กลุ่มรายได้จากงานประจำ' : 'กลุ่มอาหารและเครื่องดื่ม'),
      icon: catData.icon || '🏷️',
      note: catData.note || '',
      status: catData.status || 'ใช้งาน',
      createdAt: existing ? existing.createdAt : nowIso(),
      updatedAt: nowIso(),
    };

    if (isIncome) {
      setIncomeCats(prev => isEdit ? prev.map(c => c.id === id ? fullCat : c) : [...prev, fullCat]);
    } else {
      setExpenseCats(prev => isEdit ? prev.map(c => c.id === id ? fullCat : c) : [...prev, fullCat]);
    }

    const row = [fullCat.id, fullCat.name, fullCat.group, fullCat.icon, fullCat.note || '', fullCat.status, fullCat.createdAt, fullCat.updatedAt];
    await saveMasterToSheet(spreadsheet.id, token, tabName, id, row);
    return id;
  };

  const deleteCategory = async (id: string, isIncome: boolean) => {
    let token = accessToken || await getAccessToken();
    if (!token || !spreadsheet) throw new Error('ไม่ได้เชื่อมต่อ Google Sheets');

    const tabName = isIncome ? SHEET_TABS.INCOME_CATS : SHEET_TABS.EXPENSE_CATS;
    const list = isIncome ? incomeCats : expenseCats;
    const cat = list.find(c => c.id === id);
    if (!cat) return;

    if (isIncome) {
      setIncomeCats(prev => prev.filter(c => c.id !== id));
    } else {
      setExpenseCats(prev => prev.filter(c => c.id !== id));
    }

    await saveMasterToSheet(spreadsheet.id, token, tabName, id, [
      cat.id, cat.name, cat.group, cat.icon || '', cat.note || '', 'ลบแล้ว', cat.createdAt, nowIso()
    ]);
  };

  const toggleCategoryStatus = async (id: string, isIncome: boolean) => {
    const list = isIncome ? incomeCats : expenseCats;
    const cat = list.find(c => c.id === id);
    if (!cat) return;
    const newStatus = cat.status === 'ใช้งาน' ? 'ไม่ใช้งาน' : 'ใช้งาน';
    await saveCategory({ ...cat, status: newStatus }, isIncome);
  };

  // 4. Asset Category Actions
  const saveAssetCategory = async (catData: Partial<AssetCategory> & { id?: string }): Promise<string> => {
    let token = accessToken || await getAccessToken();
    if (!token || !spreadsheet) throw new Error('ไม่ได้เชื่อมต่อ Google Sheets');

    const isEdit = Boolean(catData.id);
    const id = catData.id || genId('ACAT');
    const existing = isEdit ? assetCats.find(c => c.id === id) : null;

    const fullCat: AssetCategory = {
      id,
      name: catData.name || '',
      icon: catData.icon || '📦',
      status: catData.status || 'ใช้งาน',
      createdAt: existing ? existing.createdAt : nowIso(),
      updatedAt: nowIso(),
    };

    setAssetCats(prev => isEdit ? prev.map(c => c.id === id ? fullCat : c) : [...prev, fullCat]);
    const row = [fullCat.id, fullCat.name, fullCat.icon, fullCat.status, fullCat.createdAt, fullCat.updatedAt];
    await saveMasterToSheet(spreadsheet.id, token, SHEET_TABS.ASSET_CATS, id, row);
    return id;
  };

  const deleteAssetCategory = async (id: string) => {
    let token = accessToken || await getAccessToken();
    if (!token || !spreadsheet) throw new Error('ไม่ได้เชื่อมต่อ Google Sheets');
    const cat = assetCats.find(c => c.id === id);
    if (!cat) return;
    setAssetCats(prev => prev.filter(c => c.id !== id));
    await saveMasterToSheet(spreadsheet.id, token, SHEET_TABS.ASSET_CATS, id, [
      cat.id, cat.name, cat.icon || '', 'ไม่ใช้งาน', cat.createdAt, nowIso()
    ]);
  };

  const toggleAssetCategoryStatus = async (id: string) => {
    const cat = assetCats.find(c => c.id === id);
    if (!cat) return;
    const newStatus = cat.status === 'ใช้งาน' ? 'ไม่ใช้งาน' : 'ใช้งาน';
    await saveAssetCategory({ ...cat, status: newStatus });
  };

  // 5. Asset Actions
  const saveAsset = async (assetData: Partial<Asset> & { id?: string }): Promise<string> => {
    let token = accessToken || await getAccessToken();
    if (!token || !spreadsheet) throw new Error('ไม่ได้เชื่อมต่อ Google Sheets');

    const isEdit = Boolean(assetData.id);
    const id = assetData.id || genId('AST');
    const existing = isEdit ? assets.find(a => a.id === id) : null;

    const fullAsset: Asset = {
      id,
      name: assetData.name || '',
      category: assetData.category || 'สินทรัพย์อื่น ๆ',
      cost: Number(assetData.cost) || 0,
      value: Number(assetData.value) || 0,
      buyDate: assetData.buyDate || '',
      accountId: assetData.accountId || undefined,
      note: assetData.note || '',
      status: assetData.status || 'ใช้งาน',
      createdAt: existing ? existing.createdAt : nowIso(),
      updatedAt: nowIso(),
    };

    setAssets(prev => isEdit ? prev.map(a => a.id === id ? fullAsset : a) : [...prev, fullAsset]);
    const row = [
      fullAsset.id, fullAsset.name, fullAsset.category, fullAsset.cost, 
      fullAsset.value, fullAsset.buyDate || '', fullAsset.accountId || '', 
      fullAsset.note || '', fullAsset.status, fullAsset.createdAt, fullAsset.updatedAt
    ];
    await saveMasterToSheet(spreadsheet.id, token, SHEET_TABS.ASSETS, id, row);
    return id;
  };

  const deleteAsset = async (id: string) => {
    let token = accessToken || await getAccessToken();
    if (!token || !spreadsheet) throw new Error('ไม่ได้เชื่อมต่อ Google Sheets');
    const ast = assets.find(a => a.id === id);
    if (!ast) return;
    setAssets(prev => prev.filter(a => a.id !== id));
    await saveMasterToSheet(spreadsheet.id, token, SHEET_TABS.ASSETS, id, [
      ast.id, ast.name, ast.category, ast.cost, ast.value, ast.buyDate || '', ast.accountId || '', ast.note || '', 'ไม่ใช้งาน', ast.createdAt, nowIso()
    ]);
  };

  // 6. Budget Actions
  const saveBudget = async (budgetData: Partial<Budget> & { id?: string }): Promise<string> => {
    let token = accessToken || await getAccessToken();
    if (!token || !spreadsheet) throw new Error('ไม่ได้เชื่อมต่อ Google Sheets');

    const isEdit = Boolean(budgetData.id);
    const id = budgetData.id || genId('BDG');
    const existing = isEdit ? budgets.find(b => b.id === id) : null;

    const fullBudget: Budget = {
      id,
      month: budgetData.month || new Date().toISOString().slice(0, 7),
      categoryId: budgetData.categoryId || '',
      amount: Number(budgetData.amount) || 0,
      status: budgetData.status || 'ใช้งาน',
      createdAt: existing ? existing.createdAt : nowIso(),
      updatedAt: nowIso(),
    };

    setBudgets(prev => isEdit ? prev.map(b => b.id === id ? fullBudget : b) : [...prev, fullBudget]);
    const row = [fullBudget.id, fullBudget.month, fullBudget.categoryId, fullBudget.amount, fullBudget.status, fullBudget.createdAt, fullBudget.updatedAt];
    await saveMasterToSheet(spreadsheet.id, token, SHEET_TABS.BUDGETS, id, row);
    return id;
  };

  const deleteBudget = async (id: string) => {
    let token = accessToken || await getAccessToken();
    if (!token || !spreadsheet) throw new Error('ไม่ได้เชื่อมต่อ Google Sheets');
    setBudgets(prev => prev.filter(b => b.id !== id));
    const b = budgets.find(x => x.id === id);
    if (b) {
      await saveMasterToSheet(spreadsheet.id, token, SHEET_TABS.BUDGETS, id, [
        b.id, b.month, b.categoryId, b.amount, 'ไม่ใช้งาน', b.createdAt, nowIso()
      ]);
    }
  };

  // 7. Debt Actions
  const saveDebt = async (debtData: Partial<Debt> & { id?: string }): Promise<string> => {
    let token = accessToken || await getAccessToken();
    if (!token || !spreadsheet) throw new Error('ไม่ได้เชื่อมต่อ Google Sheets');

    const isEdit = Boolean(debtData.id);
    const id = debtData.id || genId('DBT');
    const existing = isEdit ? debts.find(d => d.id === id) : null;

    const fullDebt: Debt = {
      id,
      name: debtData.name || '',
      category: debtData.category || '',
      creditor: debtData.creditor || '',
      initial: Number(debtData.initial) || 0,
      interest: Number(debtData.interest) || 0,
      minPay: Number(debtData.minPay) || 0,
      dueDate: debtData.dueDate,
      note: debtData.note,
      accountId: debtData.accountId,
      status: debtData.status || 'ใช้งาน',
      createdAt: existing ? existing.createdAt : nowIso(),
      updatedAt: nowIso(),
    };

    setDebts(prev => isEdit ? prev.map(d => d.id === id ? fullDebt : d) : [...prev, fullDebt]);
    const row = [
      fullDebt.id, fullDebt.name, fullDebt.category, fullDebt.creditor, 
      fullDebt.initial, fullDebt.interest, fullDebt.minPay, fullDebt.dueDate || '', 
      fullDebt.note || '', fullDebt.accountId || '', fullDebt.status, fullDebt.createdAt, fullDebt.updatedAt
    ];
    await saveMasterToSheet(spreadsheet.id, token, SHEET_TABS.DEBTS, id, row);
    return id;
  };

  const deleteDebt = async (id: string) => {
    let token = accessToken || await getAccessToken();
    if (!token || !spreadsheet) throw new Error('ไม่ได้เชื่อมต่อ Google Sheets');
    setDebts(prev => prev.filter(d => d.id !== id));
    const d = debts.find(x => x.id === id);
    if (d) {
      await saveMasterToSheet(spreadsheet.id, token, SHEET_TABS.DEBTS, id, [
        d.id, d.name, d.category, d.creditor, d.initial, d.interest, d.minPay, d.dueDate || '', d.note || '', d.accountId || '', 'ไม่ใช้งาน', d.createdAt, nowIso()
      ]);
    }
  };

  // 8. Receivable Actions
  const saveReceivable = async (recData: Partial<Receivable> & { id?: string }): Promise<string> => {
    let token = accessToken || await getAccessToken();
    if (!token || !spreadsheet) throw new Error('ไม่ได้เชื่อมต่อ Google Sheets');

    const isEdit = Boolean(recData.id);
    const id = recData.id || genId('RCV');
    const existing = isEdit ? receivables.find(r => r.id === id) : null;

    const fullRec: Receivable = {
      id,
      name: recData.name || '',
      category: recData.category || '',
      initial: Number(recData.initial) || 0,
      dueDate: recData.dueDate,
      note: recData.note,
      status: recData.status || 'ใช้งาน',
      createdAt: existing ? existing.createdAt : nowIso(),
      updatedAt: nowIso(),
    };

    setReceivables(prev => isEdit ? prev.map(r => r.id === id ? fullRec : r) : [...prev, fullRec]);
    const row = [
      fullRec.id, fullRec.name, fullRec.category, fullRec.initial, 
      fullRec.dueDate || '', fullRec.note || '', fullRec.status, fullRec.createdAt, fullRec.updatedAt
    ];
    await saveMasterToSheet(spreadsheet.id, token, SHEET_TABS.RECEIVABLES, id, row);
    return id;
  };

  const deleteReceivable = async (id: string) => {
    let token = accessToken || await getAccessToken();
    if (!token || !spreadsheet) throw new Error('ไม่ได้เชื่อมต่อ Google Sheets');
    setReceivables(prev => prev.filter(r => r.id !== id));
    const r = receivables.find(x => x.id === id);
    if (r) {
      await saveMasterToSheet(spreadsheet.id, token, SHEET_TABS.RECEIVABLES, id, [
        r.id, r.name, r.category, r.initial, r.dueDate || '', r.note || '', 'ไม่ใช้งาน', r.createdAt, nowIso()
      ]);
    }
  };

  // 9. Savings Goal Actions
  const saveGoal = async (goalData: Partial<Goal> & { id?: string }): Promise<string> => {
    let token = accessToken || await getAccessToken();
    if (!token || !spreadsheet) throw new Error('ไม่ได้เชื่อมต่อ Google Sheets');

    const isEdit = Boolean(goalData.id);
    const id = goalData.id || genId('GOL');
    const existing = isEdit ? goals.find(g => g.id === id) : null;

    const fullGoal: Goal = {
      id,
      name: goalData.name || '',
      category: goalData.category || '',
      target: Number(goalData.target) || 0,
      deadline: goalData.deadline,
      accountId: goalData.accountId,
      note: goalData.note,
      status: goalData.status || 'ใช้งาน',
      createdAt: existing ? existing.createdAt : nowIso(),
      updatedAt: nowIso(),
    };

    setGoals(prev => isEdit ? prev.map(g => g.id === id ? fullGoal : g) : [...prev, fullGoal]);
    const row = [
      fullGoal.id, fullGoal.name, fullGoal.category, fullGoal.target, 
      fullGoal.deadline || '', fullGoal.accountId || '', fullGoal.note || '', fullGoal.status, fullGoal.createdAt, fullGoal.updatedAt
    ];
    await saveMasterToSheet(spreadsheet.id, token, SHEET_TABS.GOALS, id, row);
    return id;
  };

  const deleteGoal = async (id: string) => {
    let token = accessToken || await getAccessToken();
    if (!token || !spreadsheet) throw new Error('ไม่ได้เชื่อมต่อ Google Sheets');
    setGoals(prev => prev.filter(g => g.id !== id));
    const g = goals.find(x => x.id === id);
    if (g) {
      await saveMasterToSheet(spreadsheet.id, token, SHEET_TABS.GOALS, id, [
        g.id, g.name, g.category, g.target, g.deadline || '', g.accountId || '', g.note || '', 'ไม่ใช้งาน', g.createdAt, nowIso()
      ]);
    }
  };

  // 10. Recurring Actions
  const saveRecurring = async (recData: Partial<Recurring> & { id?: string }): Promise<string> => {
    let token = accessToken || await getAccessToken();
    if (!token || !spreadsheet) throw new Error('ไม่ได้เชื่อมต่อ Google Sheets');

    const isEdit = Boolean(recData.id);
    const id = recData.id || genId('REC');
    const existing = isEdit ? recurring.find(r => r.id === id) : null;

    const fullRec: Recurring = {
      id,
      name: recData.name || '',
      type: recData.type || 'รายจ่าย',
      amount: Number(recData.amount) || 0,
      freq: recData.freq || 'รายเดือน',
      nextDate: recData.nextDate || new Date().toISOString().slice(0, 10),
      startDate: recData.startDate,
      endDate: recData.endDate,
      accountId: recData.accountId,
      projectId: recData.projectId,
      categoryId: recData.categoryId,
      note: recData.note,
      status: recData.status || 'ใช้งาน',
      createdAt: existing ? existing.createdAt : nowIso(),
      updatedAt: nowIso(),
    };

    setRecurring(prev => isEdit ? prev.map(r => r.id === id ? fullRec : r) : [...prev, fullRec]);
    const row = [
      fullRec.id, fullRec.name, fullRec.type, fullRec.amount, fullRec.freq, 
      fullRec.nextDate, fullRec.startDate || '', fullRec.endDate || '', fullRec.accountId || '', 
      fullRec.projectId || '', fullRec.categoryId || '', fullRec.note || '', fullRec.status, fullRec.createdAt, fullRec.updatedAt
    ];
    await saveMasterToSheet(spreadsheet.id, token, SHEET_TABS.RECURRING, id, row);
    return id;
  };

  const deleteRecurring = async (id: string) => {
    let token = accessToken || await getAccessToken();
    if (!token || !spreadsheet) throw new Error('ไม่ได้เชื่อมต่อ Google Sheets');
    setRecurring(prev => prev.filter(r => r.id !== id));
    const r = recurring.find(x => x.id === id);
    if (r) {
      await saveMasterToSheet(spreadsheet.id, token, SHEET_TABS.RECURRING, id, [
        r.id, r.name, r.type, r.amount, r.freq, r.nextDate, r.startDate || '', r.endDate || '', r.accountId || '', r.projectId || '', r.categoryId || '', r.note || '', 'ไม่ใช้งาน', r.createdAt, nowIso()
      ]);
    }
  };

  const toggleRecurringStatus = async (id: string) => {
    const item = recurring.find(r => r.id === id);
    if (!item) return;
    const newStatus = item.status === 'ใช้งาน' ? 'ไม่ใช้งาน' : 'ใช้งาน';
    await saveRecurring({ ...item, status: newStatus });
  };

  const createFromRecurring = async (recurringId: string, date?: string) => {
    const item = recurring.find(r => r.id === recurringId);
    if (!item) return;

    const txDate = date || item.nextDate || new Date().toISOString().slice(0, 10);
    await saveTransaction({
      type: item.type === 'รายรับ' ? 'income' : 'expense',
      date: txDate,
      accountId: item.accountId || accounts[0]?.id || '',
      projectId: item.projectId,
      categoryId: item.categoryId,
      description: item.name,
      amount: item.amount,
      recurringId: item.id,
    });

    // Advance nextDate according to frequency
    const d = new Date(txDate);
    if (item.freq === 'รายวัน') d.setDate(d.getDate() + 1);
    else if (item.freq === 'รายสัปดาห์') d.setDate(d.getDate() + 7);
    else if (item.freq === 'รายปี') d.setFullYear(d.getFullYear() + 1);
    else d.setMonth(d.getMonth() + 1);

    const nextDate = d.toISOString().slice(0, 10);
    await saveRecurring({
      ...item,
      nextDate,
    });
  };

  // 11. Project Actions
  const saveProject = async (projectData: Partial<Project> & { id?: string }): Promise<string> => {
    let token = accessToken || await getAccessToken();
    if (!token || !spreadsheet) throw new Error('ไม่ได้เชื่อมต่อ Google Sheets');

    const isEdit = Boolean(projectData.id);
    const id = projectData.id || genId('PRJ');
    const existing = isEdit ? projects.find(p => p.id === id) : null;

    const fullPrj: Project = {
      id,
      name: projectData.name || '',
      type: projectData.type || 'ทั่วไป',
      budget: Number(projectData.budget) || 0,
      startDate: projectData.startDate,
      endDate: projectData.endDate,
      note: projectData.note,
      status: projectData.status || 'ใช้งาน',
      createdAt: existing ? existing.createdAt : nowIso(),
      updatedAt: nowIso(),
    };

    setProjects(prev => isEdit ? prev.map(p => p.id === id ? fullPrj : p) : [...prev, fullPrj]);
    const row = [
      fullPrj.id, fullPrj.name, fullPrj.type, fullPrj.budget, 
      fullPrj.startDate || '', fullPrj.endDate || '', fullPrj.note || '', fullPrj.status, fullPrj.createdAt, fullPrj.updatedAt
    ];
    await saveMasterToSheet(spreadsheet.id, token, SHEET_TABS.PROJECTS, id, row);
    return id;
  };

  const deleteProject = async (id: string) => {
    let token = accessToken || await getAccessToken();
    if (!token || !spreadsheet) throw new Error('ไม่ได้เชื่อมต่อ Google Sheets');
    setProjects(prev => prev.filter(p => p.id !== id));
    const p = projects.find(x => x.id === id);
    if (p) {
      await saveMasterToSheet(spreadsheet.id, token, SHEET_TABS.PROJECTS, id, [
        p.id, p.name, p.type, p.budget, p.startDate || '', p.endDate || '', p.note || '', 'ไม่ใช้งาน', p.createdAt, nowIso()
      ]);
    }
  };

  // ==========================================
  // FINANCIAL COMPUTATIONS & ANTI-DOUBLE COUNTING
  // ==========================================
  const { 
    totalBalance, 
    totalDebtRemaining, 
    totalCreditCardDebt,
    totalSavingsCurrent, 
    totalAssetCost,
    totalAssetValue,
    unlinkedAssetValue,
    assetProfitLoss,
    assetProfitLossPct,
    netWorth,
    monthlyIncome, 
    monthlyExpense, 
    todayExpense 
  } = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const thisMonthStr = todayStr.slice(0, 7);

    // 1. Calculate Account Balances
    const accountBalances: { [key: string]: number } = {};
    accounts.forEach(a => {
      accountBalances[a.id] = Number(a.opening) || 0;
    });

    let mIncome = 0;
    let mExpense = 0;
    let tExpense = 0;

    transactions.forEach(tx => {
      if (tx.status === 'ลบแล้ว') return;
      const amt = Number(tx.amount) || 0;
      const isThisMonth = tx.date.startsWith(thisMonthStr);
      const isToday = tx.date === todayStr;

      switch (tx.type) {
        case 'income':
          if (tx.accountId) accountBalances[tx.accountId] = (accountBalances[tx.accountId] || 0) + amt;
          if (isThisMonth) mIncome += amt;
          break;
        case 'expense':
        case 'subscription':
          if (tx.accountId) accountBalances[tx.accountId] = (accountBalances[tx.accountId] || 0) - amt;
          if (isThisMonth) mExpense += amt;
          if (isToday) tExpense += amt;
          break;
        case 'refund':
          if (tx.accountId) accountBalances[tx.accountId] = (accountBalances[tx.accountId] || 0) + amt;
          if (isThisMonth) mExpense -= amt;
          if (isToday) tExpense -= amt;
          break;
        case 'transfer':
          if (tx.accountId) accountBalances[tx.accountId] = (accountBalances[tx.accountId] || 0) - amt;
          if (tx.toAccountId) accountBalances[tx.toAccountId] = (accountBalances[tx.toAccountId] || 0) + amt;
          break;
        case 'debt_payment':
          if (tx.accountId) accountBalances[tx.accountId] = (accountBalances[tx.accountId] || 0) - amt;
          const interest = Number(tx.interest) || 0;
          if (isThisMonth) mExpense += interest;
          if (isToday) tExpense += interest;
          break;
        case 'receivable_receipt':
          if (tx.accountId) accountBalances[tx.accountId] = (accountBalances[tx.accountId] || 0) + amt;
          break;
        case 'saving':
          // Sections 13, 14, 18, 30: Savings Goal is an allocation/tracking layer.
          // Saved Amount ≠ Account Deduction. Account balance does NOT change unless there is an actual transfer!
          break;
      }
    });

    // KPI 1: ยอดบัญชีทั้งหมด (ข้อกำหนด 13 & 14)
    // รวมเฉพาะเงินที่ผู้ใช้มี: เงินสด, ธนาคาร, Wallet, บัญชีลงทุน
    // ห้ามรวมวงเงินบัตรเครดิต และไม่นับบัตรเครดิตเป็นเงินสด
    let totalBal = 0;
    let cardDebtTotal = 0;

    accounts.forEach(a => {
      const bal = accountBalances[a.id] != null ? accountBalances[a.id] : Number(a.opening || 0);
      if (a.type === 'บัตรเครดิต') {
        if (bal !== 0) {
          cardDebtTotal += Math.abs(bal);
        } else if (a.outstandingDebt) {
          cardDebtTotal += Number(a.outstandingDebt);
        }
      } else {
        totalBal += bal;
      }
    });

    // KPI 2: ยอดหนี้คงเหลือ = ยอดหนี้ที่ยังไม่ได้ชำระทั้งหมด + ยอดค้างชำระบัตรเครดิต
    const debtPaidMap: { [key: string]: number } = {};
    transactions.forEach(tx => {
      if (tx.status === 'ลบแล้ว' || tx.type !== 'debt_payment' || !tx.debtId) return;
      debtPaidMap[tx.debtId] = (debtPaidMap[tx.debtId] || 0) + (Number(tx.principal) || Number(tx.amount) || 0);
    });
    const totalRemainingDebt = debts.reduce((sum, d) => {
      const paid = debtPaidMap[d.id] || 0;
      return sum + Math.max(0, (Number(d.initial) || 0) - paid);
    }, 0) + cardDebtTotal;

    // KPI 3: เงินออมที่มี = ยอดเงินที่อยู่ในเป้าหมาย/รายการการออมที่บันทึกไว้
    const savingsMap: { [key: string]: number } = {};
    transactions.forEach(tx => {
      if (tx.status === 'ลบแล้ว' || tx.type !== 'saving' || !tx.goalId) return;
      savingsMap[tx.goalId] = (savingsMap[tx.goalId] || 0) + (Number(tx.amount) || 0);
    });
    const totalSavings = goals.reduce((sum, g) => sum + (savingsMap[g.id] || 0), 0);

    // 4. Asset Calculations
    const activeAssets = assets.filter(a => a.status === 'ใช้งาน');
    const totAssetCost = activeAssets.reduce((sum, a) => sum + (Number(a.cost) || 0), 0);
    const totAssetValue = activeAssets.reduce((sum, a) => sum + (Number(a.value) || 0), 0);
    const pLoss = totAssetValue - totAssetCost;
    const pLossPct = totAssetCost > 0 ? (pLoss / totAssetCost) * 100 : 0;

    // ANTI-DOUBLE COUNTING FOR NET WORTH (ข้อกำหนด 9):
    // สูตร: มูลค่าสุทธิ = สินทรัพย์ + เงินในบัญชี - หนี้สินคงเหลือ
    const effectiveAssetValue = activeAssets.reduce((sum, a) => {
      const isCashDuplicate = (a.category === 'เงินสด' || a.category === 'เงินฝาก' || a.category === 'เงินฝากธนาคาร') && Boolean(a.accountId);
      if (isCashDuplicate) {
        return sum; // ป้องกันการนับเงินสด/เงินฝากซ้ำกับยอดเงินในบัญชี
      }
      return sum + (Number(a.value) || 0);
    }, 0);

    // KPI 4: มูลค่าสุทธิ = สินทรัพย์ทั้งหมด(ไม่ซ้ำ) + ยอดเงินทั้งหมด - หนี้สินคงเหลือ (รวมบัตรเครดิต)
    const netW = totalBal + effectiveAssetValue - totalRemainingDebt;

    return {
      totalBalance: totalBal,
      totalDebtRemaining: totalRemainingDebt,
      totalCreditCardDebt: cardDebtTotal,
      totalSavingsCurrent: totalSavings,
      totalAssetCost: totAssetCost,
      totalAssetValue: totAssetValue,
      unlinkedAssetValue: effectiveAssetValue,
      assetProfitLoss: pLoss,
      assetProfitLossPct: pLossPct,
      netWorth: netW,
      monthlyIncome: mIncome,
      monthlyExpense: mExpense,
      todayExpense: tExpense,
    };
  }, [accounts, transactions, assets, debts, goals]);

  // Enrich accounts with calculated balance
  const enrichedAccounts = useMemo(() => {
    const balances: { [key: string]: number } = {};
    accounts.forEach(a => {
      balances[a.id] = Number(a.opening) || 0;
    });

    transactions.forEach(tx => {
      if (tx.status === 'ลบแล้ว') return;
      const amt = Number(tx.amount) || 0;
      if (tx.type === 'income' || tx.type === 'refund' || tx.type === 'receivable_receipt') {
        if (tx.accountId) balances[tx.accountId] = (balances[tx.accountId] || 0) + amt;
      } else if (tx.type === 'expense' || tx.type === 'subscription' || tx.type === 'debt_payment') {
        if (tx.accountId) balances[tx.accountId] = (balances[tx.accountId] || 0) - amt;
      } else if (tx.type === 'transfer') {
        if (tx.accountId) balances[tx.accountId] = (balances[tx.accountId] || 0) - amt;
        if (tx.toAccountId) balances[tx.toAccountId] = (balances[tx.toAccountId] || 0) + amt;
      } else if (tx.type === 'saving') {
        // Sections 13, 14, 18, 30: Savings Goal is an allocation/tracking layer.
        // Saved Amount ≠ Account Deduction. Account balance does NOT change unless there is an actual transfer!
      }
    });

    return accounts.map(a => ({
      ...a,
      balance: balances[a.id] ?? Number(a.opening) ?? 0,
    }));
  }, [accounts, transactions]);

  // Enrich debts with paid & remaining
  const enrichedDebts = useMemo(() => {
    const paidMap: { [key: string]: number } = {};
    transactions.forEach(tx => {
      if (tx.status === 'ลบแล้ว' || tx.type !== 'debt_payment' || !tx.debtId) return;
      paidMap[tx.debtId] = (paidMap[tx.debtId] || 0) + (Number(tx.principal) || Number(tx.amount) || 0);
    });

    return debts.map(d => {
      const paid = paidMap[d.id] || 0;
      const remaining = Math.max(0, (Number(d.initial) || 0) - paid);
      return {
        ...d,
        paid,
        remaining,
      };
    });
  }, [debts, transactions]);

  // Enrich receivables with received & remaining
  const enrichedReceivables = useMemo(() => {
    const receivedMap: { [key: string]: number } = {};
    transactions.forEach(tx => {
      if (tx.status === 'ลบแล้ว' || tx.type !== 'receivable_receipt' || !tx.receivableId) return;
      receivedMap[tx.receivableId] = (receivedMap[tx.receivableId] || 0) + (Number(tx.amount) || 0);
    });

    return receivables.map(r => {
      const received = receivedMap[r.id] || 0;
      const remaining = Math.max(0, (Number(r.initial) || 0) - received);
      return {
        ...r,
        received,
        remaining,
      };
    });
  }, [receivables, transactions]);

  // Enrich goals with current & progress
  const enrichedGoals = useMemo(() => {
    const savedMap: { [key: string]: number } = {};
    transactions.forEach(tx => {
      if (tx.status === 'ลบแล้ว' || tx.type !== 'saving' || !tx.goalId) return;
      savedMap[tx.goalId] = (savedMap[tx.goalId] || 0) + (Number(tx.amount) || 0);
    });

    return goals.map(g => {
      const current = savedMap[g.id] || 0;
      const target = Number(g.target) || 0;
      const progress = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
      return {
        ...g,
        current,
        remaining: Math.max(0, target - current),
        progress,
      };
    });
  }, [goals, transactions]);

  // Enrich budgets with actual & remaining
  const enrichedBudgets = useMemo(() => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const spentMap: { [key: string]: number } = {};

    transactions.forEach(tx => {
      if (tx.status === 'ลบแล้ว') return;
      if ((tx.type === 'expense' || tx.type === 'subscription') && tx.categoryId) {
        const m = tx.date.slice(0, 7);
        const k = `${m}|${tx.categoryId}`;
        spentMap[k] = (spentMap[k] || 0) + (Number(tx.amount) || 0);
      } else if (tx.type === 'refund' && tx.categoryId) {
        const m = tx.date.slice(0, 7);
        const k = `${m}|${tx.categoryId}`;
        spentMap[k] = (spentMap[k] || 0) - (Number(tx.amount) || 0);
      }
    });

    return budgets.map(b => {
      const m = b.month || currentMonth;
      const actual = spentMap[`${m}|${b.categoryId}`] || 0;
      const amount = Number(b.amount) || 0;
      const remaining = amount - actual;
      const pct = amount > 0 ? Math.round((actual / amount) * 100) : 0;
      const state: 'อยู่ในงบ' | 'ใกล้เต็มงบ' | 'เกินงบ' = pct > 100 ? 'เกินงบ' : pct >= 80 ? 'ใกล้เต็มงบ' : 'อยู่ในงบ';

      return {
        ...b,
        actual,
        remaining,
        pct,
        state,
      };
    });
  }, [budgets, transactions]);

  return (
    <AppContext.Provider
      value={{
        user,
        accessToken,
        spreadsheet,
        isLoading,
        isSyncing,
        lastSyncTime,
        syncError,
        transactions,
        accounts: enrichedAccounts,
        projects,
        incomeCats,
        expenseCats,
        budgets: enrichedBudgets,
        debts: enrichedDebts,
        receivables: enrichedReceivables,
        goals: enrichedGoals,
        recurring,
        assets,
        assetCats,
        isDemoActive,
        demoItemCounts,
        loadDemoData,
        deleteDemoData,
        totalBalance,
        totalDebtRemaining,
        totalSavingsCurrent,
        totalAssetCost,
        totalAssetValue,
        unlinkedAssetValue,
        totalCreditCardDebt,
        assetProfitLoss,
        assetProfitLossPct,
        netWorth,
        monthlyIncome,
        monthlyExpense,
        todayExpense,
        loginWithGoogle,
        handleLogout,
        syncData,
        createNewSpreadsheet,
        connectSpreadsheetById,
        saveTransaction,
        deleteTransaction,
        saveAccount,
        deleteAccount,
        toggleAccountStatus,
        hasAccountTransactions,
        saveCategory,
        deleteCategory,
        toggleCategoryStatus,
        saveAssetCategory,
        deleteAssetCategory,
        toggleAssetCategoryStatus,
        saveBudget,
        deleteBudget,
        saveDebt,
        deleteDebt,
        saveReceivable,
        deleteReceivable,
        saveGoal,
        deleteGoal,
        saveRecurring,
        deleteRecurring,
        toggleRecurringStatus,
        createFromRecurring,
        saveAsset,
        deleteAsset,
        saveProject,
        deleteProject,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
