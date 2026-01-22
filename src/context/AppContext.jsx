import React, { createContext, useState, useContext, useEffect } from 'react';
import { translations } from '../utils/translations';
import { hashString } from '../utils/security';
import { supabase } from '../utils/supabaseClient';

const AppContext = createContext();

export function AppProvider({ children }) {
    // State
    const [inventory, setInventory] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [users, setUsers] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [activityLogs, setActivityLogs] = useState([]);
    const [settings, setSettings] = useState({
        appName: 'IP Manager',
        currency: 'MAD',
        dateFormat: 'MM/DD/YYYY',
        logoUrl: '',
        language: 'en',
        theme: 'light'
    });

    // Auth State
    const [currentUser, setCurrentUser] = useState(null);
    const [session, setSession] = useState(null);

    // Load data from Supabase on mount
    useEffect(() => {
        loadAllData();
        checkSession();
    }, []);

    const loadAllData = async () => {
        try {
            // Load inventory
            const { data: inventoryData } = await supabase
                .from('inventory')
                .select('*')
                .order('created_at', { ascending: false });
            if (inventoryData) setInventory(inventoryData);

            // Load transactions
            const { data: transactionsData } = await supabase
                .from('transactions')
                .select('*')
                .order('date', { ascending: false });
            if (transactionsData) setTransactions(transactionsData);

            // Load users
            const { data: usersData, error: usersError } = await supabase
                .from('users')
                .select('*');

            if (usersError) console.error('Error loading users:', usersError);
            if (usersData) {
                console.log('Users loaded:', usersData.length);
                setUsers(usersData);
            }

            // Load suppliers
            const { data: suppliersData } = await supabase
                .from('suppliers')
                .select('*');
            if (suppliersData) setSuppliers(suppliersData);

            // Load settings
            const { data: settingsData } = await supabase
                .from('settings')
                .select('*')
                .single();
            if (settingsData) setSettings(settingsData);

            // Load activity logs
            const { data: logsData } = await supabase
                .from('activity_logs')
                .select('*')
                .order('timestamp', { ascending: false })
                .limit(100);
            if (logsData) setActivityLogs(logsData);
        } catch (error) {
            console.error('Error loading data:', error);
        }
    };

    const checkSession = () => {
        const savedSession = localStorage.getItem('ipManagerSession');
        if (savedSession) {
            const sessionData = JSON.parse(savedSession);
            const now = new Date().getTime();
            if (now - sessionData.timestamp < 3600000) { // 1 hour
                setCurrentUser(sessionData.user);
                setSession(sessionData);
            } else {
                localStorage.removeItem('ipManagerSession');
            }
        }
    };

    // Inventory Functions
    const addInventoryItem = async (item) => {
        const newItem = {
            id: `IP-${Date.now()}`,
            ...item,
            initial_stock: parseInt(item.stock),
            created_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('inventory')
            .insert([newItem])
            .select();

        if (error) {
            console.error('Supabase Insert Error:', error);
            alert(`Error saving product: ${error.message}`);
            return;
        }

        if (data) {
            setInventory([data[0], ...inventory]);
            logActivity('Add Product', `Added ${item.name}`);
        }
    };

    const updateInventoryItem = async (id, updates) => {
        const { data, error } = await supabase
            .from('inventory')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select();

        if (!error && data) {
            setInventory(inventory.map(item => item.id === id ? data[0] : item));
            logActivity('Update Product', `Updated product ${id}`);
        }
    };

    const deleteInventoryItem = async (id) => {
        const { error } = await supabase
            .from('inventory')
            .delete()
            .eq('id', id);

        if (!error) {
            setInventory(inventory.filter(item => item.id !== id));
            logActivity('Delete Product', `Deleted product ${id}`);
        }
    };

    // Transaction Functions
    const addTransaction = async (transaction) => {
        const newTransaction = {
            id: `TXN-${Date.now()}`,
            ...transaction,
            date: new Date().toISOString(),
            created_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('transactions')
            .insert([newTransaction])
            .select();

        if (!error && data) {
            setTransactions([data[0], ...transactions]);

            // Update inventory stock
            if (transaction.product_id) {
                const product = inventory.find(p => p.id === transaction.product_id);
                if (product) {
                    await updateInventoryItem(transaction.product_id, {
                        stock: product.stock - (transaction.quantity || 1)
                    });
                }
            }

            logActivity('New Sale', `Sale to ${transaction.customer_name}`);
        }
    };

    const updateTransaction = async (id, updates) => {
        const { data, error } = await supabase
            .from('transactions')
            .update(updates)
            .eq('id', id)
            .select();

        if (!error && data) {
            setTransactions(transactions.map(tx => tx.id === id ? data[0] : tx));
            logActivity('Update Sale', `Updated transaction ${id}`);
        }
    };

    const deleteTransaction = async (id) => {
        const { error } = await supabase
            .from('transactions')
            .delete()
            .eq('id', id);

        if (!error) {
            setTransactions(transactions.filter(tx => tx.id !== id));
            logActivity('Delete Sale', `Deleted transaction ${id}`);
        }
    };

    // User Functions
    const addUser = async (userData) => {
        const newUser = {
            id: `user-${Date.now()}`,
            ...userData,
            password_hash: await hashString(userData.password || 'password123'),
            pin_hash: await hashString('0000'),
            status: 'Active',
            created_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('users')
            .insert([newUser])
            .select();

        if (!error && data) {
            setUsers([...users, data[0]]);
            logActivity('Add User', `Added user ${userData.username}`);
        }
    };

    const updateUser = async (id, updates) => {
        const { data, error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', id)
            .select();

        if (!error && data) {
            setUsers(users.map(u => u.id === id ? data[0] : u));
            logActivity('Update User', `Updated user ${id}`);
        }
    };

    const deleteUser = async (id) => {
        const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', id);

        if (!error) {
            setUsers(users.filter(u => u.id !== id));
            logActivity('Delete User', `Deleted user ${id}`);
        }
    };

    // Supplier Functions
    const addSupplier = async (supplierData) => {
        const newSupplier = {
            id: `SUP-${Date.now()}`,
            ...supplierData,
            created_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('suppliers')
            .insert([newSupplier])
            .select();

        if (!error && data) {
            setSuppliers([...suppliers, data[0]]);
            logActivity('Add Supplier', `Added supplier ${supplierData.name}`);
        }
    };

    const updateSupplier = async (id, updates) => {
        const { data, error } = await supabase
            .from('suppliers')
            .update(updates)
            .eq('id', id)
            .select();

        if (!error && data) {
            setSuppliers(suppliers.map(s => s.id === id ? data[0] : s));
            logActivity('Update Supplier', `Updated supplier ${id}`);
        }
    };

    const deleteSupplier = async (id) => {
        const { error } = await supabase
            .from('suppliers')
            .delete()
            .eq('id', id);

        if (!error) {
            setSuppliers(suppliers.filter(s => s.id !== id));
            logActivity('Delete Supplier', `Deleted supplier ${id}`);
        }
    };

    // Settings Functions
    const updateSettings = async (newSettings) => {
        const { data, error } = await supabase
            .from('settings')
            .update({ ...newSettings, updated_at: new Date().toISOString() })
            .eq('id', settings.id)
            .select();

        if (!error && data) {
            setSettings(data[0]);
            logActivity('Update Settings', 'Settings updated');
        }
    };

    // Activity Log
    const logActivity = async (action, details) => {
        const log = {
            id: `LOG-${Date.now()}`,
            action,
            details,
            user_name: currentUser?.username || 'System',
            timestamp: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('activity_logs')
            .insert([log])
            .select();

        if (!error && data) {
            setActivityLogs([data[0], ...activityLogs]);
        }
    };

    // Auth Functions
    const login = async (username, password) => {
        console.log('Login attempt:', { username, usersCount: users.length });

        const user = users.find(u => u.username === username);
        if (!user) {
            console.log('User not found in local state');
            return { success: false, message: 'User not found' };
        }

        const passwordHash = await hashString(password);
        console.log('Hash comparison:', { input: passwordHash, stored: user.password_hash });

        if (passwordHash !== user.password_hash) {
            console.log('Hash mismatch');
            return { success: false, message: 'Invalid password' };
        }

        const sessionData = {
            user: { ...user, password_hash: undefined, pin_hash: undefined },
            timestamp: new Date().getTime()
        };

        localStorage.setItem('ipManagerSession', JSON.stringify(sessionData));
        setCurrentUser(sessionData.user);
        setSession(sessionData);

        try {
            await updateUser(user.id, { last_active: new Date().toISOString() });
        } catch (err) {
            console.error('Failed to update last_active:', err);
        }

        logActivity('Login', `User ${username} logged in`);
        console.log('Login successful, returning true');

        return { success: true };
    };

    const logout = () => {
        localStorage.removeItem('ipManagerSession');
        setCurrentUser(null);
        setSession(null);
    };

    const updateAccount = async (username, password) => {
        if (!currentUser) return { success: false };

        const updates = { username };
        if (password) {
            updates.password_hash = await hashString(password);
        }

        await updateUser(currentUser.id, updates);
        return { success: true };
    };

    // Export/Import Functions
    const exportData = () => {
        const data = {
            inventory,
            transactions,
            users: users.map(u => ({ ...u, password_hash: undefined, pin_hash: undefined })),
            suppliers,
            settings,
            exportDate: new Date().toISOString()
        };
        return JSON.stringify(data, null, 2);
    };

    const importData = async (jsonString) => {
        try {
            const data = JSON.parse(jsonString);

            // Note: This is a simple import - in production you'd want more validation
            if (data.inventory) {
                for (const item of data.inventory) {
                    await supabase.from('inventory').upsert(item);
                }
            }
            if (data.transactions) {
                for (const tx of data.transactions) {
                    await supabase.from('transactions').upsert(tx);
                }
            }

            await loadAllData();
            logActivity('Import Data', 'Data imported successfully');
            alert('Data imported successfully!');
        } catch (error) {
            alert('Error importing data: ' + error.message);
        }
    };

    // Utility Functions
    const formatCurrency = (amount) => {
        const curr = settings.currency || 'MAD';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: curr === 'MAD' ? 'USD' : curr,
            minimumFractionDigits: 2
        }).format(amount).replace('$', curr + ' ');
    };

    const t = (key) => {
        const lang = settings.language || 'en';
        return translations[lang]?.[key] || key;
    };

    const value = {
        inventory,
        transactions,
        users,
        suppliers,
        settings,
        activityLogs,
        currentUser,
        session,
        isAuthenticated: !!currentUser,
        addInventoryItem,
        updateInventoryItem,
        deleteInventoryItem,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addUser,
        updateUser,
        deleteUser,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        updateSettings,
        login,
        logout,
        updateAccount,
        exportData,
        importData,
        formatCurrency,
        t,
        logActivity
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
    return useContext(AppContext);
}
