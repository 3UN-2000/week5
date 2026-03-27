import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

function Products() {
    const [products, setProducts] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const getProducts = async () => {
            try {
                // 注意：這裡通常是 /products 而不是 /products/all，依你的 API 規格而定
                const response = await axios.get(`${API_BASE}/api/${API_PATH}/products`);
                setProducts(response.data.products);
            } catch (error) {
                console.log(error.response);
            }
        };
        getProducts();
    }, []);

    // 修正：點擊時要把整個 product 物件傳給 SingleProduct
    const handleView = (product) => {
        navigate(`/product/${product.id}`, {
            state: {
                productData: product // 這樣 SingleProduct 才拿得到資料
            }
        });
    };

    return (
        <div className="container mt-5">
            <div className="row">
                {products && products.length > 0 ? (
                    products.map((product) => (
                        <div className="col-md-4 mb-3" key={product.id}>
                            <div className="card h-100">
                                <img src={product.imageUrl} className="card-img-top" alt={product.title} style={{ height: '200px', objectFit: 'cover' }} />
                                <div className="card-body">
                                    <h5 className="card-title">{product.title}</h5>
                                    <p className="card-text text-truncate">{product.description}</p>
                                    <button 
                                        type="button" 
                                        className="btn btn-primary"
                                        onClick={() => handleView(product)}
                                    >
                                        查看更多
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-12 text-center">
                        <p>產品載入中或目前無產品...</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Products;