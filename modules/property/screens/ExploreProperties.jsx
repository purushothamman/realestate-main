import React, { useState } from 'react';
import {
  Building2,
  Search,
  MapPin,
  Heart,
  Eye,
  Home,
  Bell,
  User,
  Plus,
  TrendingUp,
  Star,
  Maximize2,
  Calendar,
  ChevronRight,
  Filter,
  Grid3x3,
  List,
  Award,
  Sparkles,
} from 'lucide-react';

export default function ExploreProperties() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [favorites, setFavorites] = useState([]);
  const [viewMode, setViewMode] = useState('grid');

  const properties = [
    {
      id: 1,
      name: 'Skyline Residences',
      location: 'Beverly Hills, CA',
      type: 'Apartment',
      bhk: '3 BHK',
      price: 850000,
      status: 'Featured',
      image: 'https://images.unsplash.com/photo-1515263487990-61b07816b324?w=800',
      size: '2,450 sq ft',
      bathrooms: 3,
      parking: 2,
      yearBuilt: 2023,
      views: 245,
      rating: 4.8,
    },
    {
      id: 2,
      name: 'Ocean View Villa',
      location: 'Miami Beach, FL',
      type: 'Villa',
      bhk: '5 BHK',
      price: 2500000,
      status: 'Ready',
      image: 'https://images.unsplash.com/photo-1598635031829-4bfae29d33eb?w=800',
      size: '4,850 sq ft',
      bathrooms: 5,
      parking: 4,
      yearBuilt: 2024,
      views: 389,
      rating: 4.9,
    },
    {
      id: 3,
      name: 'Green Valley Apartments',
      location: 'Austin, TX',
      type: 'Apartment',
      bhk: '2 BHK',
      price: 425000,
      status: 'Under Construction',
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
      size: '1,650 sq ft',
      bathrooms: 2,
      parking: 1,
      yearBuilt: 2025,
      views: 178,
      rating: 4.6,
    },
    {
      id: 4,
      name: 'Corporate Heights',
      location: 'New York, NY',
      type: 'Commercial',
      bhk: 'Office Space',
      price: 1200000,
      status: 'New',
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
      size: '3,200 sq ft',
      bathrooms: 4,
      parking: 6,
      yearBuilt: 2024,
      views: 412,
      rating: 4.7,
    },
    {
      id: 5,
      name: 'Sunset Paradise',
      location: 'Los Angeles, CA',
      type: 'Villa',
      bhk: '4 BHK',
      price: 1850000,
      status: 'Featured',
      image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
      size: '3,800 sq ft',
      bathrooms: 4,
      parking: 3,
      yearBuilt: 2023,
      views: 567,
      rating: 4.9,
    },
    {
      id: 6,
      name: 'Urban Loft Studios',
      location: 'Seattle, WA',
      type: 'Apartment',
      bhk: '1 BHK',
      price: 325000,
      status: 'Ready',
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
      size: '850 sq ft',
      bathrooms: 1,
      parking: 1,
      yearBuilt: 2024,
      views: 203,
      rating: 4.5,
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

  const getStatusConfig = (status) => {
    switch (status) {
      case 'Featured':
        return { bg: 'from-amber-500 to-orange-500', icon: Sparkles };
      case 'New':
        return { bg: 'from-emerald-500 to-teal-500', icon: Award };
      case 'Ready':
        return { bg: 'from-blue-500 to-indigo-500', icon: Home };
      case 'Under Construction':
        return { bg: 'from-orange-500 to-red-500', icon: Building2 };
      default:
        return { bg: 'from-gray-500 to-gray-600', icon: Star };
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
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

  const hasActiveFilters = selectedType !== 'All' || selectedStatus !== 'All' || searchQuery !== '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 opacity-30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-200 opacity-30 rounded-full blur-3xl animate-pulse"></div>
      </div>

      {/* Header */}
      <div className="sticky top-0 z-50 bg-white bg-opacity-70 backdrop-blur-xl border-b border-white border-opacity-20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                  <Building2 size={24} className="text-white" strokeWidth={2.5} />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
                  EstateHub
                </h1>
                <p className="text-xs text-gray-500">Premium Properties</p>
              </div>
            </div>
            <button className="relative w-11 h-11 bg-white rounded-2xl flex items-center justify-center shadow-md transition-all hover:scale-105">
              <Heart size={20} className="text-gray-700" strokeWidth={2} />
              {favorites.length > 0 && (
                <span className="absolute -top-2 -right-2 min-w-[20px] h-5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1.5 shadow-lg">
                  {favorites.length}
                </span>
              )}
            </button>
          </div>

          {/* Hero */}
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Discover Your <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">Dream Home</span>
            </h2>
            <p className="text-gray-600">
              Explore premium properties curated just for you
            </p>
          </div>

          {/* Search */}
          <div className="relative mb-5">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur opacity-20"></div>
            <div className="relative bg-white rounded-2xl shadow-xl">
              <Search size={20} className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400" strokeWidth={2} />
              <input
                type="text"
                placeholder="Search by location, project name, or developer..."
                className="w-full h-14 bg-transparent pl-14 pr-32 text-gray-900 placeholder-gray-400 focus:outline-none rounded-2xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors flex items-center gap-2">
                  <MapPin size={16} className="text-gray-600" strokeWidth={2} />
                  <span className="text-sm font-medium text-gray-700">Near me</span>
                </button>
                <button className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center transition-all hover:scale-105">
                  <Search size={18} className="text-white" strokeWidth={2} />
                </button>
              </div>
            </div>
          </div>

          {/* Type Filters */}
          <div className="flex items-center gap-3 mb-4 overflow-x-auto pb-2 no-scrollbar">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg transition-all hover:scale-105 whitespace-nowrap">
              <Filter size={18} strokeWidth={2} />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
              )}
            </button>
            {propertyTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-5 py-2.5 rounded-xl font-medium whitespace-nowrap transition-all hover:scale-105 ${
                  selectedType === type
                    ? 'bg-white text-blue-600 shadow-lg'
                    : 'bg-white bg-opacity-60 text-gray-700 hover:bg-white hover:shadow-md'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Status Filters */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {statusOptions.map((status) => {
                const config = getStatusConfig(status);
                const StatusIcon = config.icon;
                return (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                      selectedStatus === status
                        ? `bg-gradient-to-r ${config.bg} text-white shadow-lg`
                        : 'bg-white bg-opacity-60 text-gray-700 hover:bg-white hover:shadow-md'
                    }`}
                  >
                    {selectedStatus === status && <StatusIcon size={14} strokeWidth={2} />}
                    {status}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white bg-opacity-60 text-gray-600 hover:bg-white'
                }`}
              >
                <Grid3x3 size={18} strokeWidth={2} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white bg-opacity-60 text-gray-600 hover:bg-white'
                }`}
              >
                <List size={18} strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="flex items-center justify-between bg-white bg-opacity-60 backdrop-blur-sm rounded-xl px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                <TrendingUp size={18} className="text-white" strokeWidth={2} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Found Properties</p>
                <p className="text-lg font-bold text-gray-900">{filteredProperties.length} listings</p>
              </div>
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-white hover:bg-gray-50 text-blue-600 font-medium rounded-xl shadow-md transition-all hover:scale-105"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Property Grid */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
        {filteredProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => {
              const statusConfig = getStatusConfig(property.status);
              const StatusIcon = statusConfig.icon;
              
              return (
                <div
                  key={property.id}
                  className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer"
                >
                  {/* Image */}
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={property.image}
                      alt={property.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black from-opacity-60 via-transparent to-transparent"></div>
                    
                    {/* Status */}
                    <div className={`absolute top-4 left-4 flex items-center gap-2 px-3 py-2 bg-gradient-to-r ${statusConfig.bg} rounded-xl shadow-lg backdrop-blur-sm`}>
                      <StatusIcon size={14} className="text-white" strokeWidth={2} />
                      <span className="text-white text-xs font-bold">{property.status}</span>
                    </div>

                    {/* Favorite */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(property.id);
                      }}
                      className="absolute top-4 right-4 w-11 h-11 bg-white bg-opacity-95 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white transition-all hover:scale-110 shadow-lg"
                    >
                      <Heart
                        size={20}
                        className={favorites.includes(property.id) ? 'text-red-500' : 'text-gray-700'}
                        fill={favorites.includes(property.id) ? '#EF4444' : 'none'}
                        strokeWidth={2}
                      />
                    </button>

                    {/* Rating */}
                    <div className="absolute bottom-4 left-4 flex items-center gap-1.5 px-3 py-1.5 bg-white bg-opacity-95 backdrop-blur-sm rounded-xl shadow-lg">
                      <Star size={14} className="text-yellow-500" fill="#EAB308" strokeWidth={2} />
                      <span className="text-sm font-bold text-gray-900">{property.rating}</span>
                    </div>

                    {/* Views */}
                    <div className="absolute bottom-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-white bg-opacity-95 backdrop-blur-sm rounded-xl shadow-lg">
                      <Eye size={14} className="text-gray-600" strokeWidth={2} />
                      <span className="text-xs font-semibold text-gray-700">{property.views}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {property.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-4">
                      <MapPin size={16} className="text-gray-500" strokeWidth={2} />
                      <span className="text-sm text-gray-600">{property.location}</span>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3 mb-4 pb-4 border-b border-gray-100">
                      <div className="text-center">
                        <div className="w-10 h-10 mx-auto mb-1 bg-blue-50 rounded-xl flex items-center justify-center">
                          <Home size={18} className="text-blue-600" strokeWidth={2} />
                        </div>
                        <p className="text-xs font-semibold text-gray-900">{property.bhk}</p>
                      </div>
                      <div className="text-center">
                        <div className="w-10 h-10 mx-auto mb-1 bg-indigo-50 rounded-xl flex items-center justify-center">
                          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" className="text-indigo-600">
                            <path stroke="currentColor" strokeWidth="2" d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z"/>
                            <path stroke="currentColor" strokeWidth="2" d="M12 7V12L15 15"/>
                          </svg>
                        </div>
                        <p className="text-xs font-semibold text-gray-900">{property.bathrooms} Bath</p>
                      </div>
                      <div className="text-center">
                        <div className="w-10 h-10 mx-auto mb-1 bg-purple-50 rounded-xl flex items-center justify-center">
                          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" className="text-purple-600">
                            <path stroke="currentColor" strokeWidth="2" d="M19 17H5M19 17C20.1046 17 21 16.1046 21 15V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V15C3 16.1046 3.89543 17 5 17M19 17V20M5 17V20"/>
                          </svg>
                        </div>
                        <p className="text-xs font-semibold text-gray-900">{property.parking} Park</p>
                      </div>
                    </div>

                    {/* Size & Year */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Maximize2 size={16} className="text-gray-500" strokeWidth={2} />
                        <span className="text-sm font-medium text-gray-700">{property.size}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-500" strokeWidth={2} />
                        <span className="text-sm font-medium text-gray-700">{property.yearBuilt}</span>
                      </div>
                    </div>

                    {/* Price & CTA */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Starting from</p>
                        <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
                          {formatPrice(property.price)}
                        </p>
                      </div>
                      <button className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg transition-all hover:scale-105">
                        <span>View</span>
                        <ChevronRight size={18} strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative mb-6">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                <Search size={64} className="text-blue-600" strokeWidth={1.5} />
              </div>
              <div className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-xl">
                <Heart size={24} className="text-white" strokeWidth={2} />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No Properties Found</h3>
            <p className="text-gray-600 mb-6 text-center max-w-md">
              We couldn't find any properties matching your criteria. Try adjusting your filters.
            </p>
            <button
              onClick={clearFilters}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-semibold shadow-xl transition-all hover:scale-105"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* FAB */}
      <button className="fixed bottom-28 right-6 w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl transition-all hover:scale-110 z-40">
        <Plus size={28} className="text-white" strokeWidth={2.5} />
      </button>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white bg-opacity-80 backdrop-blur-xl border-t border-white border-opacity-20 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-around items-center">
            <button className="flex flex-col items-center gap-1.5 transition-all hover:scale-110">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Home size={24} className="text-white" strokeWidth={2} />
              </div>
              <span className="text-xs font-bold text-blue-600">Explore</span>
            </button>
            <button className="flex flex-col items-center gap-1.5 transition-all hover:scale-110">
              <div className="relative w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center">
                <Heart size={24} className="text-gray-500" strokeWidth={2} />
                {favorites.length > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-[20px] h-5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1.5 shadow-lg">
                    {favorites.length}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium text-gray-500">Saved</span>
            </button>
            <button className="flex flex-col items-center gap-1.5 transition-all hover:scale-110">
              <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center">
                <Bell size={24} className="text-gray-500" strokeWidth={2} />
              </div>
              <span className="text-xs font-medium text-gray-500">Alerts</span>
            </button>
            <button className="flex flex-col items-center gap-1.5 transition-all hover:scale-110">
              <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center">
                <User size={24} className="text-gray-500" strokeWidth={2} />
              </div>
              <span className="text-xs font-medium text-gray-500">Profile</span>
            </button>
          </div>
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