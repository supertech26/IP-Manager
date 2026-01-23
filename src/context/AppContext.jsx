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
            if (inventoryData) {
                const mappedInventory = inventoryData.map(item => ({
                    ...item,
                    dateAdded: item.date_added,
                    costPrice: item.cost_price,
                    lowStockThreshold: item.low_stock_threshold
                }));
                setInventory(mappedInventory);
            }

            // Load transactions
            const { data: transactionsData } = await supabase
                .from('transactions')
                .select('*')
                .order('date', { ascending: false });
            if (transactionsData) {
                const mappedTransactions = transactionsData.map(tx => ({
                    ...tx,
                    customerName: tx.customer_name,
                    phoneNumber: tx.phone_number,
                    productId: tx.product_id,
                    productName: tx.product_name,
                    subName: tx.sub_name,
                    subType: tx.sub_type,
                    digitalType: tx.digital_type,
                    startDate: tx.start_date,
                    expiryDate: tx.expiry_date,
                    sellingPrice: tx.selling_price,
                    totalAmount: tx.total_amount,
                    activationCode: tx.activation_code,
                    m3uUrl: tx.m3u_url
                }));
                setTransactions(mappedTransactions);
            }

            // Load users
            const { data: usersData, error: usersError } = await supabase
                .from('users')
                .select('*');

            if (usersError) console.error('Error loading users:', usersError);

            if (usersData && usersData.length === 0) {
                console.log('No users found. Creating default admin...');
                const defaultAdmin = {
                    id: 'user-admin',
                    name: 'Administrator',
                    username: 'admin',
                    email: 'admin@ipmanager.local',
                    role: 'Admin',
                    password_hash: '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', // admin123
                    pin_hash: '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', // 1234
                    status: 'Active'
                };

                const { data: newAdmin, error: createError } = await supabase
                    .from('users')
                    .insert([defaultAdmin])
                    .select();

                if (createError) {
                    console.error('Failed to create default admin:', createError);
                } else if (newAdmin) {
                    console.log('Default admin created successfully');
                    setUsers(newAdmin);
                }
            } else if (usersData) {
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
            name: item.name,
            category: item.category,
            type: item.type,
            supplier: item.supplier,
            date_added: item.dateAdded,
            price: parseFloat(item.price),
            cost_price: parseFloat(item.costPrice),
            stock: parseInt(item.stock),
            initial_stock: parseInt(item.stock),
            low_stock_threshold: parseInt(item.lowStockThreshold),
            status: item.status,
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
            const addedItem = {
                ...data[0],
                dateAdded: data[0].date_added,
                costPrice: data[0].cost_price,
                lowStockThreshold: data[0].low_stock_threshold
            };
            setInventory([addedItem, ...inventory]);
            logActivity('Add Product', `Added ${item.name}`);
        }
    };

    const updateInventoryItem = async (id, updates) => {
        // Map updates to snake_case
        const dbUpdates = {
            ...updates,
            cost_price: updates.costPrice,
            date_added: updates.dateAdded,
            low_stock_threshold: updates.lowStockThreshold,
            updated_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('inventory')
            .update(dbUpdates)
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
            customer_name: transaction.customerName,
            phone_number: transaction.phoneNumber,
            product_id: transaction.productId,
            product_name: transaction.productName,
            sub_name: transaction.subName,
            sub_type: transaction.subType,
            digital_type: transaction.digitalType,
            duration: transaction.duration,
            start_date: transaction.startDate,
            expiry_date: transaction.expiryDate,
            quantity: transaction.quantity || 1,
            selling_price: transaction.sellingPrice,
            total_amount: transaction.totalAmount,
            profit: transaction.profit,
            status: transaction.status,
            activation_code: transaction.activationCode,
            m3u_url: transaction.m3uUrl,
            notes: transaction.notes,
            date: new Date().toISOString(),
            created_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('transactions')
            .insert([newTransaction])
            .select();

        if (!error && data) {
            const addedTx = {
                ...data[0],
                customerName: data[0].customer_name,
                phoneNumber: data[0].phone_number,
                productId: data[0].product_id,
                productName: data[0].product_name,
                subName: data[0].sub_name,
                subType: data[0].sub_type,
                digitalType: data[0].digital_type,
                startDate: data[0].start_date,
                expiryDate: data[0].expiry_date,
                sellingPrice: data[0].selling_price,
                totalAmount: data[0].total_amount,
                activationCode: data[0].activation_code,
                m3uUrl: data[0].m3u_url
            };
            setTransactions([addedTx, ...transactions]);

            // Update inventory stock
            if (transaction.productId) {
                const product = inventory.find(p => p.id === transaction.productId);
                if (product) {
                    await updateInventoryItem(transaction.productId, {
                        ...product,
                        stock: product.stock - (transaction.quantity || 1)
                    });
                }
            }

            logActivity('New Sale', `Sale to ${transaction.customerName}`);
        }
    };

    const updateTransaction = async (id, updates) => {
        const dbUpdates = {
            ...updates,
            customer_name: updates.customerName,
            phone_number: updates.phoneNumber,
            product_id: updates.productId,
            product_name: updates.productName,
            sub_name: updates.subName,
            sub_type: updates.subType,
            digital_type: updates.digitalType,
            start_date: updates.startDate,
            expiry_date: updates.expiryDate,
            selling_price: updates.sellingPrice,
            total_amount: updates.totalAmount,
            activation_code: updates.activationCode,
            m3u_url: updates.m3uUrl,
            updated_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('transactions')
            .update(dbUpdates)
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
        console.log('Login attempt for:', username);
        console.log('Available users:', users.length, users.map(u => u.username));

        const user = users.find(u => u.username === username);
        if (!user) {
            console.warn('User not found in local state');
            return { success: false, message: 'User not found' };
        }

        const passwordHash = await hashString(password);
        console.log('Login Debug:', {
            inputPassword: password,
            computedHash: passwordHash,
            storedHash: user.password_hash,
            match: passwordHash === user.password_hash
        });

        if (passwordHash !== user.password_hash) {
            console.warn('Password hash mismatch');
            return { success: false, message: 'Invalid password' };
        }

        const sessionData = {
            user: { ...user, password_hash: undefined, pin_hash: undefined },
            timestamp: new Date().getTime()
        };

        localStorage.setItem('ipManagerSession', JSON.stringify(sessionData));
        setCurrentUser(sessionData.user);
        setSession(sessionData);

        // Update last_active
        updateUser(user.id, { last_active: new Date().toISOString() }).catch(err => console.error(err));

        logActivity('Login', `User ${username} logged in`);

        return { success: true };
    };

    const loginWithPin = async (pin) => {
        const pinHash = await hashString(pin);
        console.log('PIN Debug:', { inputPin: pin, computedHash: pinHash });
        console.log('Available Users Hashes:', users.map(u => ({ username: u.username, pinHash: u.pin_hash })));

        const user = users.find(u => u.pin_hash === pinHash);

        if (!user) {
            console.warn('No user found with matching PIN hash');
            return { success: false, message: 'Invalid PIN' };
        }

        const sessionData = {
            user: { ...user, password_hash: undefined, pin_hash: undefined },
            timestamp: new Date().getTime()
        };

        localStorage.setItem('ipManagerSession', JSON.stringify(sessionData));
        setCurrentUser(sessionData.user);
        setSession(sessionData);

        // Update last_active
        updateUser(user.id, { last_active: new Date().toISOString() }).catch(err => console.error(err));

        logActivity('PIN Login', `User ${user.username} logged in via PIN`);

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
        loginWithPin,
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
