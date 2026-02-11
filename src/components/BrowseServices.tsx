import React, { useState, useEffect } from 'react';
import { User, Service } from '../App';
import { ArrowLeft, Search, Filter, Star, MapPin } from 'lucide-react';
import InstantBookingModal from './InstantBookingModal';

interface BrowseServicesProps {
  user: User;
  onSelectService: (service: Service) => void;
  onInstantBooking: (service: Service, description: string, images: string[]) => void;
  onBack: () => void;
}

const serviceCategories = [
  'All',
  'Plumber',
  'Electrician',
  'Carpenter',
  'House Cleaning',
  'AC Repair',
  'Painter',
  'Pest Control',
  'Appliance Repair',
  'Gardener',
];

export default function BrowseServices({ user, onSelectService, onInstantBooking, onBack }: BrowseServicesProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedServiceForBooking, setSelectedServiceForBooking] = useState<Service | null>(null);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = () => {
    // Load services from localStorage
    const storedServices = localStorage.getItem('services');
    if (!storedServices) {
      // Initialize with demo services if none exist
      const demoServices: Service[] = [
        {
          id: 'service-1',
          providerId: 'provider-1',
          providerName: 'Rajesh Kumar',
          serviceType: 'Plumber',
          serviceArea: 'Mumbai, Navi Mumbai',
          rating: 4.5,
          priceMonthly: 500,
          priceQuarterly: 1400,
          priceAnnual: 5000,
          description: 'Expert plumbing services for residential and commercial properties',
          available: true,
        },
        {
          id: 'service-2',
          providerId: 'provider-2',
          providerName: 'Amit Sharma',
          serviceType: 'Electrician',
          serviceArea: 'Bangalore, Whitefield',
          rating: 4.8,
          priceMonthly: 600,
          priceQuarterly: 1700,
          priceAnnual: 6000,
          description: 'Certified electrician with 10+ years experience',
          available: true,
        },
        {
          id: 'service-3',
          providerId: 'provider-3',
          providerName: 'Suresh Patel',
          serviceType: 'House Cleaning',
          serviceArea: 'Delhi, Noida, Gurgaon',
          rating: 4.6,
          priceMonthly: 800,
          priceQuarterly: 2200,
          priceAnnual: 8000,
          description: 'Professional house cleaning with eco-friendly products',
          available: true,
        },
        {
          id: 'service-4',
          providerId: 'provider-4',
          providerName: 'Vikram Singh',
          serviceType: 'AC Repair',
          serviceArea: 'Pune, Pimpri',
          rating: 4.7,
          priceMonthly: 700,
          priceQuarterly: 1900,
          priceAnnual: 7000,
          description: 'AC installation, repair and maintenance specialist',
          available: true,
        },
        {
          id: 'service-5',
          providerId: 'provider-5',
          providerName: 'Ramesh Yadav',
          serviceType: 'Carpenter',
          serviceArea: 'Mumbai, Thane',
          rating: 4.4,
          priceMonthly: 900,
          priceQuarterly: 2500,
          priceAnnual: 9000,
          description: 'Custom furniture making and repair services',
          available: true,
        },
        {
          id: 'service-6',
          providerId: 'provider-6',
          providerName: 'Prakash Verma',
          serviceType: 'Painter',
          serviceArea: 'Bangalore, HSR Layout',
          rating: 4.5,
          priceMonthly: 1000,
          priceQuarterly: 2800,
          priceAnnual: 10000,
          description: 'Interior and exterior painting with quality materials',
          available: true,
        },
      ];
      localStorage.setItem('services', JSON.stringify(demoServices));
      setServices(demoServices);
      setFilteredServices(demoServices);
    } else {
      const parsedServices = JSON.parse(storedServices);
      setServices(parsedServices);
      setFilteredServices(parsedServices);
    }
  };

  useEffect(() => {
    let filtered = services;

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter((s) => s.serviceType === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (s) =>
          s.serviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.providerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by location
    if (locationFilter) {
      filtered = filtered.filter((s) =>
        s.serviceArea.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    setFilteredServices(filtered);
  }, [selectedCategory, searchTerm, locationFilter, services]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <button onClick={onBack} className="flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl text-gray-800">Browse Services</h1>
          <p className="text-gray-600">Find the perfect service provider for your needs</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm mb-2 text-gray-700">
                <Search className="w-4 h-4 inline mr-2" />
                Search Services
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by service or provider..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm mb-2 text-gray-700">
                <Filter className="w-4 h-4 inline mr-2" />
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {serviceCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm mb-2 text-gray-700">
                <MapPin className="w-4 h-4 inline mr-2" />
                Location
              </label>
              <input
                type="text"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                placeholder="Enter city or area..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.length > 0 ? (
            filteredServices.map((service) => (
              <div key={service.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl text-gray-800 mb-1">{service.serviceType}</h3>
                      <p className="text-gray-600">{service.providerName}</p>
                    </div>
                    <div className="flex items-center bg-yellow-100 px-2 py-1 rounded">
                      <Star className="w-4 h-4 text-yellow-500 mr-1" />
                      <span className="text-sm">{service.rating}</span>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4">{service.description}</p>

                  <div className="flex items-center text-gray-600 text-sm mb-4">
                    <MapPin className="w-4 h-4 mr-1" />
                    {service.serviceArea}
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-gray-600 text-sm mb-2">Starting from:</p>
                    <p className="text-2xl text-blue-600 mb-4">₹{service.priceMonthly}/month</p>
                    <div className="space-y-2">
                      <button
                        onClick={() => onSelectService(service)}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Subscribe Now
                      </button>
                      <button
                        onClick={() => {
                          setSelectedServiceForBooking(service);
                          setModalOpen(true);
                        }}
                        className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Instant Booking
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg">No services found matching your criteria</p>
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchTerm('');
                  setLocationFilter('');
                }}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      <InstantBookingModal
        service={selectedServiceForBooking!}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedServiceForBooking(null);
        }}
        onSubmit={(description, images) => {
          onInstantBooking(selectedServiceForBooking!, description, images);
          setModalOpen(false);
          setSelectedServiceForBooking(null);
        }}
      />
    </div>
  );
}
