import { useState, useEffect } from 'react';
import {
  FaSearch,
  FaPlus,
  FaEllipsisV,
  FaPen,
  FaTrash,
  FaChevronDown
} from 'react-icons/fa';
import { useSalon } from '../../context/SalonContext';
import AddServiceForm from '../../components/modals/AddServiceForm';
import EditServiceForm from '../../components/modals/EditServiceForm';



function Services() {
  const { selectedSalon } = useSalon();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [showOptionsDropdown, setShowOptionsDropdown] = useState(false);
  const [showAddDropdown, setShowAddDropdown] = useState(false);
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([{ _id: 'all', name: 'All Categories' }]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState(null);

  useEffect(() => {
    if (selectedSalon) {
      fetchServices();
      fetchCategories();
    }
  }, [selectedSalon]);

  const fetchServices = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5050/services?salonId=${selectedSalon._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setServices(data);
      }
    } catch (err) {
      console.error("Error fetching services:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5050/categories?salonId=${selectedSalon._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setCategories([{ _id: 'all', name: 'All Categories' }, ...data]);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  // Filter services based on search term and category
  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All Categories' || service.categoryId?.name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleEdit = (service) => {
    setServiceToEdit(service);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:5050/services/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) fetchServices();
      } catch (err) {
        console.error("Error deleting service:", err);
      }
    }
  };

  const handleSave = async (formData) => {
    const isEditing = !!formData._id;
    const url = isEditing
      ? `http://localhost:5050/services/${formData._id}`
      : `http://localhost:5050/services`;
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        fetchServices();
        setIsAddModalOpen(false);
        setIsEditModalOpen(false);
      }
    } catch (err) {
      console.error("Error saving service:", err);
    }
  };

  const handleDeleteCategory = async () => {
    const categoryToDelete = categories.find(cat => cat.name === selectedCategory);
    if (!categoryToDelete || categoryToDelete._id === 'all') return;

    if (window.confirm(`Are you sure you want to delete the category "${categoryToDelete.name}"? ALL services in this category will be PERMANENTLY DELETED.`)) {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:5050/categories/${categoryToDelete._id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          fetchCategories();
          setSelectedCategory('All Categories');
          fetchServices(); // Refresh services to show them as uncategorized
        }
      } catch (err) {
        console.error("Error deleting category:", err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f8fb]">
      {/* Header Section */}
      <section className="py-8 px-5 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#0b3c5d]">Our Premium Services</h2>
              <p className="text-gray-500 mt-1">Manage your salon services</p>
            </div>

            {/* Top Right Buttons with Dropdowns */}
            <div className="flex gap-3">
              {/* Options Dropdown */}


              {/* Add Dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowAddDropdown(!showAddDropdown);
                    setShowOptionsDropdown(false);
                  }}
                  className="flex items-center gap-2 bg-[#0b3c5d] hover:bg-[#0a2e4d] text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200"
                >
                  <FaPlus />
                  <span>Add</span>
                  <FaChevronDown className={`text-xs transition-transform ${showAddDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showAddDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <button
                      onClick={() => {
                        setIsAddModalOpen(true);
                        setShowAddDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 text-sm"
                    >
                      + Add New Service
                    </button>
                    <div className="h-px bg-gray-100 my-1"></div>
                    <p className="px-4 py-1 text-xs text-gray-400 uppercase font-semibold">Categories</p>
                    {categories.filter(c => c._id !== 'all').map(category => (
                      <button
                        key={category._id}
                        onClick={() => {
                          // Could potentially preset category
                          setIsAddModalOpen(true);
                          setShowAddDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 text-sm"
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Search Bar (Longer) */}
          <div className="mt-6">
            <div className="relative max-w-2xl">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0b3c5d] focus:border-[#0b3c5d] outline-none transition-all"
              />
            </div>
          </div>

          {/* Category Dropdown */}
          <div className="mt-4 flex items-center gap-2">
            <div className="relative inline-block w-64">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full appearance-none bg-white border border-gray-300 rounded-lg py-3 px-4 pr-10 focus:ring-2 focus:ring-[#0b3c5d] focus:border-[#0b3c5d] outline-none cursor-pointer transition-all"
              >
                {categories.map(category => (
                  <option key={category._id} value={category.name}>{category.name}</option>
                ))}
              </select>
              <FaChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
            </div>
            {selectedCategory !== 'All Categories' && (
              <button
                onClick={handleDeleteCategory}
                className="p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-gray-300 group shadow-sm bg-white"
                title="Delete selected category"
              >
                <FaTrash className="group-hover:scale-110 transition-transform" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Services Table */}
      <section className="py-8 px-5">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 uppercase tracking-wider">Service Name</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 uppercase tracking-wider">Duration</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 uppercase tracking-wider">Price</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredServices.length > 0 ? (
                    filteredServices.map((service, index) => (
                      <tr
                        key={service._id}
                        className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                      >
                        <td className="py-4 px-6">
                          <div className="font-medium text-gray-900">{service.name}</div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {service.categoryId?.name || 'Uncategorized'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center text-gray-600">
                            <span className="font-medium">{service.duration} mins</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-semibold text-[#0b3c5d]">
                            {service.gender === 'unisex' ? `₹${service.priceUnisex}` :
                              service.gender === 'both' ? `M: ₹${service.priceMale} / F: ₹${service.priceFemale}` :
                                service.gender === 'male' ? `M: ₹${service.priceMale}` : `F: ₹${service.priceFemale}`}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(service)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <FaPen />
                            </button>
                            <button
                              onClick={() => handleDelete(service._id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-12 px-6 text-center text-gray-500">
                        <div className="flex flex-col items-center justify-center">
                          <FaSearch className="text-4xl text-gray-300 mb-3" />
                          <p className="text-lg font-medium">No services found</p>
                          <p className="text-sm">Try adjusting your search or category filter</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Click outside to close dropdowns */}
      {(showOptionsDropdown || showAddDropdown) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowOptionsDropdown(false);
            setShowAddDropdown(false);
          }}
        />
      )}
      {/* Modals */}
      <AddServiceForm
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSave}
        salonId={selectedSalon?._id}
      />
      <EditServiceForm
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSave}
        service={serviceToEdit}
        salonId={selectedSalon?._id}
      />
    </div>
  );
}

export default Services;

