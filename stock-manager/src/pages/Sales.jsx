import { useEffect, useState } from "react";
import { getProducts } from "../api/productApi";
import { useAuth } from "../hooks/useAuth";
import API_URL from "../config";

const Sales = () => {
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState("");
    const [quantity, setQuantity] = useState(0);
    const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
    const [salesList, setSalesList] = useState([]);
    const [loading, setLoading] = useState(true);
    const { role } = useAuth();

    // Load products on mount
    useEffect(() => {
        loadProducts();
        loadSales();
    }, []);

    const loadProducts = async () => {
        try {
            const data = await getProducts();
            setProducts(data);
        } catch (error) {
            console.error("Failed to load products:", error);
            alert("Failed to load products.");
        } finally {
            setLoading(false);
        }
    };

    const loadSales = async () => {
        try {
            const response = await fetch(`${API_URL}/sales`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (response.ok) {
                const data = await response.json();
                setSalesList(data);
            } else {
                console.error("Failed to load sales:", response.status);
            }
        } catch (error) {
            console.error("Failed to load sales:", error);
        }
    };

    const handleInvoice = async (saleId, action = 'download') => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/invoices/by-sale/${saleId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                return alert('Invoice not available for this sale yet.');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            if (action === 'print') {
                const win = window.open(url, '_blank');
                if (win) {
                    win.addEventListener('load', () => {
                        win.focus();
                        win.print();
                    });
                }
            } else {
                const a = document.createElement('a');
                a.href = url;
                a.download = `invoice-${saleId}.pdf`;
                document.body.appendChild(a);
                a.click();
                a.remove();
            }
        } catch (err) {
            console.error('Failed to fetch invoice', err);
            alert('Failed to download invoice.');
        }
    };

    const handleAddSale = async (e) => {
        e.preventDefault();
        
        if (!selectedProduct || quantity <= 0) {
            alert("Please select a product and enter a valid quantity.");
            return;
        }

        try {
            const token = localStorage.getItem('token');
            console.log('Recording sale with token:', token ? 'Present' : 'Missing');
            
            const response = await fetch(`${API_URL}/sales`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    produitId: Number(selectedProduct),
                    quantitAc: Number(quantity),
                    quantité: Number(quantity), // legacy field name for backend compatibility
                    dateSale: saleDate
                })
            });

            const contentType = response.headers.get('content-type');
            console.log('Response content-type:', contentType);
            console.log('Response status:', response.status);

            const text = await response.text();
            console.log('Response text:', text.substring(0, 100));

            if (response.ok) {
                const data = JSON.parse(text);
                alert("Sale recorded successfully!");
                // Attempt to generate and store an invoice for this sale
                if (data.id) {
                    try {
                        await fetch(`${API_URL}/invoices/${data.id}`, {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        });
                        console.log('Invoice generated for sale', data.id);
                    } catch (err) {
                        console.error('Failed to generate invoice', err);
                    }
                }
                setSelectedProduct("");
                setQuantity(0);
                setSaleDate(new Date().toISOString().split('T')[0]);
                loadSales();
            } else {
                try {
                    const error = JSON.parse(text);
                    alert("Failed to record sale: " + (error.msg || "Unknown error"));
                } catch {
                    alert("Failed to record sale: " + text.substring(0, 200));
                }
            }
        } catch (error) {
            console.error("Error recording sale:", error);
            alert("Error recording sale: " + error.message);
        }
    };

    if (loading) return <div className="p-6 text-center">Loading...</div>;

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">📊 Record Sales</h1>

            {/* Sales Form */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-2xl font-bold mb-4">New Sale</h2>
                <form onSubmit={handleAddSale} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold mb-2">Product</label>
                        <select
                            value={selectedProduct}
                            onChange={(e) => setSelectedProduct(e.target.value)}
                            className="w-full p-2 border rounded"
                        >
                            <option value="">Select Product</option>
                            {products.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.nom} (Stock: {p.quantité})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2">Quantity</label>
                        <input
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            className="w-full p-2 border rounded"
                            placeholder="Enter quantity"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2">Sale Date</label>
                        <input
                            type="date"
                            value={saleDate}
                            onChange={(e) => setSaleDate(e.target.value)}
                            className="w-full p-2 border rounded"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-green-600 text-white p-2 rounded font-semibold hover:bg-green-700"
                    >
                        ✅ Record Sale
                    </button>
                </form>
            </div>

            {/* Sales History */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-4">My Sales History</h2>
                <table className="w-full border">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="p-2 border">Product</th>
                            <th className="p-2 border">Quantity</th>
                            <th className="p-2 border">Date</th>
                            <th className="p-2 border">Invoice</th>
                        </tr>
                    </thead>
                    <tbody>
                        {salesList.length > 0 ? (
                            salesList.map((sale) => (
                                <tr key={sale.id}>
                                    <td className="p-2 border">{sale.productName}</td>
                                    <td className="p-2 border">{sale.quantitAc || sale.quantité}</td>
                                    <td className="p-2 border">{new Date(sale.date).toLocaleDateString()}</td>
                                    <td className="p-2 border space-x-2 text-sm">
                                        <button
                                            onClick={() => handleInvoice(sale.id, 'download')}
                                            className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                                        >
                                            Download
                                        </button>
                                        <button
                                            onClick={() => handleInvoice(sale.id, 'print')}
                                            className="bg-gray-700 text-white px-2 py-1 rounded hover:bg-gray-800"
                                        >
                                            Print
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="p-2 border text-center">No sales recorded yet</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Sales;
