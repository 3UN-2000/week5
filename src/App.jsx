import { useEffect, useState, useRef } from 'react'
import axios from "axios";
import * as bootstrap from 'bootstrap';
import "./assets/style.css";
import ProductModal from './components/ProductModal';
import Pagination from "./components/Pagination";
import Login from './views/Login';



// API 設定
const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

const INITIAL_TEMPLATE_DATA = {
  id: "",
  title: "",
  category: "",
  origin_price: "",
  price: "",
  unit: "",
  description: "",
  content: "",
  is_enabled: false,
  imageUrl: "",
  imagesUrl: [],
}

function App() {
  

  const [isAuth, setIsAuth] = useState(false);
  const [products, setProducts] = useState([]);
  const [templateProduct, setTemplateProduct] = useState(INITIAL_TEMPLATE_DATA);
  const [modalType, setModalType] = useState('');
  const [pagination, setPagination] = useState({});
  const productModalRef = useRef(null);



  const handleModalInputChange = (e) => {
    const { name, value, checked, type } = e.target
    // console.log(name, value);
    setTemplateProduct((perData) => ({
      ...perData,
      [name]: type === "checkbox" ? checked : value,
    }))

  };

  const handleModalImageChange = (index, value) => {
    setTemplateProduct((pre) => {
      const newImage = [...pre.imagesUrl];
      newImage[index] = value;

      if (value !== "" && index === newImage.length - 1 && newImage.length < 5) {
        newImage.push("");
      };

      if (value === "" && newImage.length > 1 && newImage[newImage.length - 1] === "") {
        newImage.pop();
      };

      return {
        ...pre,
        imagesUrl: newImage,
      };
    });
  };

  const handleAddImage = () => {
    setTemplateProduct((pre) => {
      const newImage = [...pre.imagesUrl];
      newImage.push("");
      return {
        ...pre,
        imagesUrl: newImage,
      };
    });
  };

  const handleRemoveImage = () => {
    setTemplateProduct((pre) => {
      const newImage = [...pre.imagesUrl];
      newImage.pop();
      return {
        ...pre,
        imagesUrl: newImage,
      };
    });

  };

  const getProducts = async (page = 1) => {
    try {
      const response = await axios.get(`${API_BASE}/api/${API_PATH}/admin/products?page=${page}`);

      console.log('API Response:', response.data);
      setProducts(response.data.products);
      setPagination(response.data.pagination);

    } catch (error) {
      console.log(error.response);
    }

  };

  const updateProduct = async (id) => {
    let url = `${API_BASE}/api/${API_PATH}/admin/product`;
    let method = "post";

    if (modalType === "edit") {
      url = `${API_BASE}/api/${API_PATH}/admin/product/${id}`;
      method = "put";
    }

  

    const productData = {
      data: {
        ...templateProduct,
        origin_price: Number(templateProduct.origin_price),
        price: Number(templateProduct.price),
        is_enabled: templateProduct.is_enabled ? 1 : 0,
        imagesUrl: [...templateProduct.imagesUrl.filter(url => url !== "")]
      },

    };

    try {
      const response = await axios[method](url, productData);
      console.log(response.data);
      getProducts();
      closeModal();
    } catch (error) {
      console.log(error.response);
    }

  };

  const delProduct = async (id) => {
    try {
      const response = await axios.delete(`${API_BASE}/api/${API_PATH}/admin/product/${id}`);
      console.log(response.data);
      getProducts();
      closeModal();
    } catch (error) {
      console.log(error.response);
    }
  };

  const uploadImage = async (e) => {
    const file = e.target.files?.[0];
    

    if (!file) {
      return;
    }

    try {
      const uploadData = new FormData();
      uploadData.append("file-to-upload", file);

      const response = await axios.post(`${API_BASE}/api/${API_PATH}/admin/upload`, uploadData, );

      setTemplateProduct((pre) => ({
        ...pre,
        imageUrl: response.data.imageUrl,
      }));
    } catch (error) {
      console.log(error.response);
    }
  };

  



  useEffect(() => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("hexToken="))
      ?.split("=")[1];

    if (token) {
      axios.defaults.headers.common['Authorization'] = `${token}`;
    }
    productModalRef.current = new bootstrap.Modal('#productModal', {
      keyboard: false
    });

    const checkLogin = async () => {
      try {
        const response = await axios.post(`${API_BASE}/api/user/check`)
        console.log(response.data);
        setIsAuth(true);
        getProducts();
      } catch (error) {
        console.log(error.response?.data.message)
      }


    };
    checkLogin();

  }, []);

  const openModal = (type, product) => {
    // console.log(product);
    setModalType(type);
    setTemplateProduct((pre) => ({
      ...pre,
      ...product,
    }));
    productModalRef.current.show();
  }

  const closeModal = () => {
    productModalRef.current.hide();
  }

  return (
    <>
      {
        !isAuth ? (
          <Login getProducts={getProducts} setIsAuth={setIsAuth} />
        ) : (
          <div className='container'>
            <h2>產品列表</h2>
            {/* 新增產品按鈕 */}
            <div className="text-end mt-4">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => openModal("create", INITIAL_TEMPLATE_DATA)}
              >

                建立新的產品
              </button>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">分類</th>
                  <th scope="col">商品名稱</th>
                  <th scope="col">原價</th>
                  <th scope="col">售價</th>
                  <th scope="col">是否啟用</th>
                  <th scope="col">編輯</th>
                </tr>
              </thead>
              <tbody>
                {
                  products.map(product => (
                    <tr key={product.id}>
                      <td>{product.category}</td>
                      <th scope="row">{product.title}</th>
                      <td>{product.origin_price}</td>
                      <td>{product.price}</td>
                      <td className={`${product.is_enabled && 'text-success'}`}>{product.is_enabled ? '啟用' : '未啟用'}</td>
                      <td>
                        <div className="btn-group" role="group" aria-label="Basic example">
                          <button
                            type="button"
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => openModal("edit", product)}
                          >編輯
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => openModal("delete", product)}
                          >
                            刪除</button>
                        </div>
                      </td>
                    </tr>

                  ))
                }


              </tbody>
            </table>
            <Pagination pagination={pagination} onChangePage={getProducts}/>
          </div>
        
        )
      }

      <ProductModal 
      modalType={modalType}
      templateProduct={templateProduct}
      handleModalInputChange={handleModalInputChange}
      handleModalImageChange={handleModalImageChange}
      handleAddImage={handleAddImage}
      handleRemoveImage={handleRemoveImage}
      updateProduct={updateProduct}
      delProduct={delProduct}
      uploadImage={uploadImage}
      closeModal={closeModal}
      />
    </>


  );
}

export default App;
