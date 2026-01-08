import React, { useState } from 'react';
import {
  Building2,
  Search,
  MapPin,
  SlidersHorizontal,
  Heart,
  Share2,
  Eye,
  Home,
  Bell,
  User,
  Plus,
  TrendingUp,
  Star,
  Maximize2,
} from 'lucide-react';

export default function ExploreProperties() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedType, setSelectedType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [favorites, setFavorites] = useState([]);

  // Mock property data
  const properties = [
    {
      id: 1,
      name: 'Skyline Residences',
      location: 'Beverly Hills, CA',
      area: 'Downtown',
      type: 'Apartment',
      bhk: '3 BHK',
      price: '$850,000',
      status: 'Featured',
      image: 'https://images.unsplash.com/photo-1515263487990-61b07816b324?w=800',
      size: '2,450 sq ft',
      isFavorite: false,
    },
    {
      id: 2,
      name: 'Ocean View Villa',
      location: 'Miami Beach, FL',
      area: 'Coastal Zone',
      type: 'Villa',
      bhk: '5 BHK',
      price: '$2,500,000',
      status: 'Ready',
      image: 'https://images.unsplash.com/photo-1598635031829-4bfae29d33eb?w=800',
      size: '4,850 sq ft',
      isFavorite: false,
    },
    {
      id: 3,
      name: 'Green Valley Apartments',
      location: 'Austin, TX',
      area: 'Suburban',
      type: 'Apartment',
      bhk: '2 BHK',
      price: '$425,000',
      status: 'Under Construction',
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
      size: '1,650 sq ft',
      isFavorite: false,
    },
    {
      id: 4,
      name: 'Corporate Heights',
      location: 'New York, NY',
      area: 'Business District',
      type: 'Commercial',
      bhk: 'Office Space',
      price: '$1,200,000',
      status: 'New',
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
      size: '3,200 sq ft',
      isFavorite: false,
    },
  ];

  const propertyTypes = ['All', 'Apartment', 'Villa', 'Commercial', 'Plot'];
  const statusOptions = ['All', 'Ready', 'Under Construction', 'New', 'Featured'];

  const toggleFavorite = (propertyId) => {
    setFavorites((prev) =>
      prev.includes(propertyId)
        ? prev.filter((id) => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Featured':
        return '#F59E0B';
      case 'New':
        return '#10B981';
      case 'Ready':
        return '#3B82F6';
      case 'Under Construction':
        return '#F97316';
      default:
        return '#6B7280';
    }
  };

  const filteredProperties = properties.filter((property) => {
    const matchesType = selectedType === 'All' || property.type === selectedType;
    const matchesStatus = selectedStatus === 'All' || property.status === selectedStatus;
    const matchesSearch =
      searchQuery === '' ||
      property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.location.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesType && matchesStatus && matchesSearch;
  });

  const clearFilters = () => {
    setSelectedType('All');
    setSelectedStatus('All');
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Fixed Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center">
                <Building2 size={16} className="text-white" strokeWidth={2} />
              </div>
              <span className="text-lg font-semibold text-emerald-700">EstateHub</span>
            </div>
            <button className="relative w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors">
              <Heart size={20} className="text-gray-700" strokeWidth={2} />
              {favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-semibold rounded-full flex items-center justify-center px-1">
                  {favorites.length}
                </span>
              )}
            </button>
          </div>

          {/* Title & Description */}
          <div className="mb-3">
            <h1 className="text-xl font-bold text-gray-900 mb-1">Explore Properties</h1>
            <p className="text-sm text-gray-600">
              Discover homes, projects, and investments tailored for you
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative mb-3">
            <Search size={20} className="absolute left-3.5 top-3 text-gray-400" strokeWidth={2} />
            <input
              type="text"
              placeholder="Search by city or project"
              className="w-full h-11 bg-gray-50 border border-gray-300 rounded-xl pl-11 pr-11 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="absolute right-3.5 top-3">
              <MapPin size={20} className="text-gray-400" strokeWidth={2} />
            </button>
          </div>

          {/* Filter Bar */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-2 no-scrollbar">
            <button className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 text-white rounded-lg text-sm font-medium whitespace-nowrap hover:bg-emerald-800 transition-colors">
              <SlidersHorizontal size={16} strokeWidth={2} />
              Filters
            </button>
            {propertyTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedType === type
                    ? 'bg-emerald-700 text-white'
                    : 'bg-gray-50 text-gray-700 border border-gray-300 hover:bg-gray-100'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-2.5 no-scrollbar">
            {statusOptions.map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedStatus === status
                    ? 'bg-emerald-700 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <TrendingUp size={16} className="text-emerald-700" strokeWidth={2} />
              <span className="text-sm text-gray-700">
                <span className="font-semibold text-emerald-700">{filteredProperties.length}</span> properties
              </span>
            </div>
            {(selectedType !== 'All' || selectedStatus !== 'All' || searchQuery !== '') && (
              <button onClick={clearFilters} className="text-sm text-emerald-700 font-medium hover:text-emerald-800">
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Property List */}
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {filteredProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProperties.map((property) => (
                <div
                  key={property.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                >
                  {/* Property Image */}
                  <div className="relative h-44">
                    <img
                      src={property.image}
                      alt={property.name}
                      className="w-full h-full object-cover"
                    />
                    {/* Status Badge */}
                    <div
                      className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2.5 py-1 rounded-full"
                      style={{ backgroundColor: getStatusColor(property.status) }}
                    >
                      <Star size={10} className="text-white" fill="white" strokeWidth={2} />
                      <span className="text-white text-[11px] font-semibold">{property.status}</span>
                    </div>
                    {/* Favorite Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(property.id);
                      }}
                      className="absolute top-2.5 right-2.5 w-9 h-9 bg-white/95 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                    >
                      <Heart
                        size={18}
                        className={favorites.includes(property.id) ? 'text-red-500' : 'text-gray-700'}
                        fill={favorites.includes(property.id) ? '#EF4444' : 'none'}
                        strokeWidth={2}
                      />
                    </button>
                  </div>

                  {/* Property Details */}
                  <div className="p-3.5">
                    <h3 className="text-base font-semibold text-gray-900 mb-1.5">{property.name}</h3>
                    <div className="flex items-center gap-1 mb-2.5">
                      <MapPin size={14} className="text-gray-600" strokeWidth={2} />
                      <span className="text-sm text-gray-600">{property.location}</span>
                    </div>

                    {/* Property Specs */}
                    <div className="flex gap-3.5 mb-3">
                      <div className="flex items-center gap-1">
                        <Home size={14} className="text-gray-600" strokeWidth={2} />
                        <span className="text-sm text-gray-600">{property.bhk}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Maximize2 size={14} className="text-gray-600" strokeWidth={2} />
                        <span className="text-sm text-gray-600">{property.size}</span>
                      </div>
                    </div>

                    {/* Price & Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div>
                        <p className="text-[11px] text-gray-600 mb-0.5">Starting from</p>
                        <p className="text-lg font-bold text-emerald-700">{property.price}</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="w-[38px] h-[38px] bg-emerald-700 rounded-lg flex items-center justify-center hover:bg-emerald-800 transition-colors">
                          <Eye size={18} className="text-white" strokeWidth={2} />
                        </button>
                        <button className="w-[38px] h-[38px] bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors">
                          <Share2 size={18} className="text-gray-700" strokeWidth={2} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Search size={40} className="text-gray-400" strokeWidth={2} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No properties found</h3>
              <p className="text-sm text-gray-600 mb-4 text-center">
                Try adjusting your filters or search query
              </p>
              <button
                onClick={clearFilters}
                className="px-6 py-2.5 bg-emerald-700 text-white rounded-xl text-sm font-semibold hover:bg-emerald-800 transition-colors"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      <button className="fixed bottom-24 right-6 w-14 h-14 bg-emerald-700 rounded-full flex items-center justify-center shadow-lg hover:bg-emerald-800 transition-all hover:scale-105">
        <Plus size={24} className="text-white" strokeWidth={2} />
      </button>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-5 py-2.5 flex justify-around">
          <button className="flex flex-col items-center gap-1">
            <Home size={24} className="text-emerald-700" strokeWidth={2} />
            <span className="text-[11px] font-semibold text-emerald-700">Explore</span>
          </button>
          <button className="flex flex-col items-center gap-1">
            <div className="relative">
              <Heart size={24} className="text-gray-400" strokeWidth={2} />
              {favorites.length > 0 && (
                <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-semibold rounded-full flex items-center justify-center px-1">
                  {favorites.length}
                </span>
              )}
            </div>
            <span className="text-[11px] text-gray-400">Saved</span>
          </button>
          <button className="flex flex-col items-center gap-1">
            <Bell size={24} className="text-gray-400" strokeWidth={2} />
            <span className="text-[11px] text-gray-400">Alerts</span>
          </button>
          <button className="flex flex-col items-center gap-1">
            <User size={24} className="text-gray-400" strokeWidth={2} />
            <span className="text-[11px] text-gray-400">Profile</span>
          </button>
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}