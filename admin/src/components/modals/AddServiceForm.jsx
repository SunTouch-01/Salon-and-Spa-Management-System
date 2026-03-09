import React, { useState, useEffect } from "react";

export default function AddServiceForm({ isOpen, onClose, onSave, salonId }) {
  const [form, setForm] = useState({
    name: "",
    categoryId: "",
    description: "",
    gender: "unisex",
    priceUnisex: "",
    priceMale: "",
    priceFemale: "",
    duration: "",
    image: null,
    status: true,
    notes: "",
  });

  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [showAddCategory, setShowAddCategory] = useState(false);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5050/categories?salonId=${salonId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setCategories(data);
      } else {
        console.error("Categories data is not an array:", data);
        setCategories([]);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
      setCategories([]);
    }
  };

  useEffect(() => {
    if (isOpen && salonId) {
      fetchCategories();
    }
  }, [isOpen, salonId]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") setForm({ ...form, [name]: checked });
    else if (type === "file") setForm({ ...form, [name]: files[0] });
    else setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const requiredPrice = form.gender === 'unisex' ? form.priceUnisex : form.gender === 'male' ? form.priceMale : form.gender === 'female' ? form.priceFemale : (form.priceMale && form.priceFemale);
    if (!form.name || !form.categoryId || !requiredPrice || !form.duration) {
      alert("Please fill all required fields!");
      return;
    }
    onSave({ ...form, salonId });
    setForm({
      name: "",
      categoryId: "",
      description: "",
      gender: "unisex",
      priceUnisex: "",
      priceMale: "",
      priceFemale: "",
      duration: "",
      image: null,
      status: true,
      notes: "",
    });
    onClose();
  };

  const handleAddCategory = async () => {
    if (newCategory.trim()) {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch("http://localhost:5050/categories", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ name: newCategory, salonId }),
        });
        if (res.ok) {
          const addedCategory = await res.json();
          setCategories([...categories, addedCategory]);
          setForm({ ...form, categoryId: addedCategory._id });
        }
      } catch (err) {
        console.error("Error adding category:", err);
      }
    }
    setNewCategory("");
    setShowAddCategory(false);
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 border-t-4 border-purple-600 flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-2xl font-semibold text-gray-800">Add New Service</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto scrollbar-hide space-y-4 pr-1">
            {/* Service Name */}
            <div>
              <label className="block font-medium text-gray-700 mb-1">Service Name *</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g., Men's Haircut"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Category with inline add */}
            <div>
              <label className="block font-medium text-gray-700 mb-1">Category *</label>
              <div className="flex gap-2 items-center">
                <select
                  name="categoryId"
                  value={form.categoryId}
                  onChange={handleChange}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowAddCategory(!showAddCategory)}
                  className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  + Add
                </button>
              </div>
              {showAddCategory && (
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    placeholder="New Category"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Save
                  </button>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Short description of the service"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block font-medium text-gray-700 mb-1">Gender *</label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="unisex">Unisex</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="both">Both</option>
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="block font-medium text-gray-700 mb-1">Price *</label>
              {form.gender === 'unisex' && (
                <input
                  type="number"
                  name="priceUnisex"
                  value={form.priceUnisex}
                  onChange={handleChange}
                  placeholder="₹500"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              )}
              {form.gender === 'male' && (
                <input
                  type="number"
                  name="priceMale"
                  value={form.priceMale}
                  onChange={handleChange}
                  placeholder="₹500"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              )}
              {form.gender === 'female' && (
                <input
                  type="number"
                  name="priceFemale"
                  value={form.priceFemale}
                  onChange={handleChange}
                  placeholder="₹500"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              )}
              {form.gender === 'both' && (
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block font-medium text-gray-700 mb-1">Male Price *</label>
                    <input
                      type="number"
                      name="priceMale"
                      value={form.priceMale}
                      onChange={handleChange}
                      placeholder="₹500"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block font-medium text-gray-700 mb-1">Female Price *</label>
                    <input
                      type="number"
                      name="priceFemale"
                      value={form.priceFemale}
                      onChange={handleChange}
                      placeholder="₹500"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Duration */}
            <div>
              <label className="block font-medium text-gray-700 mb-1">Duration (minutes) *</label>
              <input
                type="number"
                name="duration"
                value={form.duration}
                onChange={handleChange}
                placeholder="30"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block font-medium text-gray-700 mb-1">Image Upload</label>
              <input
                type="file"
                name="image"
                onChange={handleChange}
                className="border border-gray-300 rounded-lg px-3 py-2 w-full"
              />
            </div>

            {/* Status */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="status"
                checked={form.status}
                onChange={handleChange}
                className="w-4 h-4"
              />
              <label className="font-medium text-gray-700">Active</label>
            </div>

            {/* Special Notes */}
            <div>
              <label className="block font-medium text-gray-700 mb-1">Special Notes</label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Optional notes"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Buttons - Pinned at bottom */}
          <div className="sticky bottom-0 bg-white pt-4 pb-2 flex justify-end gap-3 border-t mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 font-medium shadow-lg shadow-purple-200 transition-all active:scale-95"
            >
              Add Service
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
