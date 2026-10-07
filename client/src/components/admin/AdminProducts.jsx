import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import ProductForm from "./ProductForm.jsx";
import { fetchProducts, createProduct, updateProduct, deleteProduct, errorMessage } from "../../services/api.js";
import { showToast } from "../../store/uiSlice.js";
import { rupees } from "../../lib/format.js";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState("loading");
  const [editing, setEditing] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const dispatch = useDispatch();

  const load = () => {
    fetchProducts({})
      .then((res) => {
        setProducts(res.data.products);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  };

  useEffect(load, []);

  const handleSave = async (data) => {
    try {
      if (editing) {
        await updateProduct(editing._id, data);
        setEditing(null);
      } else {
        await createProduct(data);
      }
      load();
      return null;
    } catch (err) {
      return errorMessage(err, "Couldn't save the product.");
    }
  };

  const handleDelete = async (product) => {
    try {
      await deleteProduct(product._id);
      setConfirmId(null);
      if (editing && editing._id === product._id) setEditing(null);
      setProducts(products.filter((item) => item._id !== product._id));
      dispatch(showToast(`${product.name} deleted.`));
    } catch (err) {
      dispatch(showToast(errorMessage(err, "Couldn't delete the product.")));
    }
  };

  return (
    <div className="admin-products">
      <ProductForm editing={editing} onSubmit={handleSave} onCancel={() => setEditing(null)} />

      <section>
        <h2 className="admin-heading">
          Catalogue {status === "ready" && <span className="admin-count">{products.length}</span>}
        </h2>

        {status === "loading" && <p className="page-lede">Loading products…</p>}
        {status === "error" && (
          <p className="notice notice-error">
            Couldn't load products.{" "}
            <button type="button" className="admin-link" onClick={load}>
              Try again
            </button>
          </p>
        )}

        {status === "ready" && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col">Product</th>
                  <th scope="col">Category</th>
                  <th scope="col" className="num">
                    Price
                  </th>
                  <th scope="col" className="num">
                    Stock
                  </th>
                  <th scope="col">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id} className={editing && editing._id === product._id ? "is-editing" : ""}>
                    <td>
                      <span className="admin-product">
                        <img src={product.image} alt="" />
                        {product.name}
                      </span>
                    </td>
                    <td>{product.category}</td>
                    <td className="num">{rupees(product.price)}</td>
                    <td className="num">{product.stock}</td>
                    <td className="admin-cell-actions">
                      {confirmId === product._id ? (
                        <>
                          <span>Delete?</span>
                          <button type="button" className="admin-link danger" onClick={() => handleDelete(product)}>
                            Yes, delete
                          </button>
                          <button type="button" className="admin-link" onClick={() => setConfirmId(null)}>
                            Keep
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            className="admin-link"
                            onClick={() => {
                              setEditing(product);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                          >
                            Edit
                          </button>
                          <button type="button" className="admin-link danger" onClick={() => setConfirmId(product._id)}>
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
