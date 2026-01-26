import React, { useState } from 'react';
import { Plus, MagnifyingGlass, Funnel, DownloadSimple, DotsThreeVertical, PencilSimple, Trash, Barcode } from '@phosphor-icons/react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useApp } from '../context/AppContext';

export function Inventory() {
    const { inventory, addInventoryItem: addProduct, updateInventoryItem: updateProduct, deleteInventoryItem: deleteProduct, formatCurrency, t } = useApp();
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [showScanner, setShowScanner] = useState(false);
    const [barcode, setBarcode] = useState('');
    const [productType, setProductType] = useState('Digital');

    React.useEffect(() => {
        if (showScanner) {
            const scanner = new Html5QrcodeScanner(
                "reader",
                { fps: 10, qrbox: { width: 250, height: 250 } },
                /* verbose= */ false
            );
            scanner.render((decodedText) => {
                setBarcode(decodedText);
                scanner.clear();
                setShowScanner(false);
            }, (error) => {
                // console.warn(error);
            });

            return () => {
                scanner.clear().catch(err => console.error("Failed to clear html5-qrcode scanner. ", err));
            };
        }
    }, [showScanner]);

    const filteredInventory = inventory.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.id.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase())
    );

    const handleExport = () => {
        const headers = ['ID', 'Name', 'Category', 'Price', 'Cost', 'Stock', 'Status'];
        const csv = [
            headers.join(','),
            ...inventory.map(i => [i.id, i.name, i.category, i.price, i.costPrice, i.stock, i.status].join(','))
        ].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `inventory_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    return (
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{t('inventory')}</h1>
                <div style={{ display: 'flex', gap: '0.8rem' }}>
                    <button onClick={handleExport} className="btn btn-secondary">
                        <DownloadSimple size={18} />
                        Export
                    </button>
                    <button onClick={() => { setEditingProduct(null); setBarcode(''); setProductType('Digital'); setShowModal(true); }} className="btn btn-primary">
                        <Plus size={18} weight="bold" />
                        {t('add_product')}
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <MagnifyingGlass size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Search products..."
                        className="form-input"
                        style={{ paddingLeft: '40px' }}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <button className="btn btn-secondary">
                    <Funnel size={18} />
                    Filters
                </button>
            </div>

            <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>{t('product')}</th>
                            <th>{t('category')}</th>
                            <th>{t('price')}</th>
                            <th>{t('stock')}</th>
                            <th>{t('status')}</th>
                            <th style={{ textAlign: 'right' }}>{t('actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredInventory.map((item) => (
                            <tr key={item.id}>
                                <td style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>{item.id}</td>
                                <td>
                                    <div style={{ fontWeight: 600 }}>{item.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.supplier}</div>
                                </td>
                                <td><span style={{ fontSize: '0.85rem' }}>{item.category}</span></td>
                                <td style={{ fontWeight: 600 }}>{formatCurrency(item.price)}</td>
                                <td style={{ fontWeight: 600 }}>{item.stock}</td>
                                <td>
                                    <span className={`badge badge-${item.status === 'Active' ? 'success' : item.status === 'Low Stock' ? 'warning' : 'danger'}`}>
                                        {item.status}
                                    </span>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                        <button onClick={() => { setEditingProduct(item); setBarcode(item.barcode || ''); setProductType(item.type || 'Digital'); setShowModal(true); }} className="btn-icon">
                                            <PencilSimple size={16} />
                                        </button>
                                        <button onClick={() => deleteProduct(item.id)} className="btn-icon" style={{ color: '#ef4444' }}>
                                            <Trash size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '500px' }}>
                        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.target);
                            const data = Object.fromEntries(formData);
                            data.price = parseFloat(data.price);
                            data.costPrice = parseFloat(data.costPrice);
                            data.stock = parseInt(data.stock);
                            data.lowStockThreshold = parseInt(data.lowStockThreshold || 10);

                            // Ensure required fields
                            if (!data.status) data.status = 'Active';
                            if (!editingProduct && !data.dateAdded) data.dateAdded = new Date().toISOString();

                            if (editingProduct) updateProduct(editingProduct.id, data);
                            else addProduct(data);
                            setShowModal(false);
                        }}>
                            <div className="form-group">
                                <label className="form-label">Product Name</label>
                                <input name="name" required className="form-input" defaultValue={editingProduct?.name} />
                            </div>

                            {productType !== 'Digital' && (
                                <div className="form-group">
                                    <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span>Barcode</span>
                                        <button type="button" onClick={() => setShowScanner(!showScanner)} style={{ border: 'none', background: 'none', color: 'var(--primary)', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Barcode size={18} />
                                            {showScanner ? 'Close Scanner' : 'Scan'}
                                        </button>
                                    </label>
                                    {showScanner && <div id="reader" style={{ width: '100%', marginBottom: '1rem', borderRadius: '8px', overflow: 'hidden' }}></div>}
                                    <input
                                        name="barcode"
                                        className="form-input"
                                        value={barcode}
                                        onChange={(e) => setBarcode(e.target.value)}
                                        placeholder="Scan or enter barcode"
                                    />
                                </div>
                            )}

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Category</label>
                                    <select name="category" className="form-select" defaultValue={editingProduct?.category}>
                                        <option>Subscription</option>
                                        <option>Hardware</option>
                                        <option>Add-on</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Type</label>
                                    <select
                                        name="type"
                                        className="form-select"
                                        value={productType}
                                        onChange={(e) => setProductType(e.target.value)}
                                    >
                                        <option value="Digital">Digital</option>
                                        <option value="Physical">Physical</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Supplier</label>
                                    <input name="supplier" required className="form-input" defaultValue={editingProduct?.supplier} />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Selling Price ({formatCurrency(0).replace(/[0-9.]/g, '')})</label>
                                    <input name="price" type="number" step="0.01" required className="form-input" defaultValue={editingProduct?.price} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Cost Price</label>
                                    <input name="costPrice" type="number" step="0.01" required className="form-input" defaultValue={editingProduct?.costPrice} />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Stock Quantity</label>
                                    <input name="stock" type="number" required className="form-input" defaultValue={editingProduct?.stock} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Low Stock Alert</label>
                                    <input name="lowStockThreshold" type="number" className="form-input" defaultValue={editingProduct?.lowStockThreshold} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Product</button>
                            </div>
                        </form>
                    </div>
                </div >
            )
            }
        </div >
    );
}
