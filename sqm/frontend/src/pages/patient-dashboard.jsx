import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Determine if a hospital is specialized based on its name
 */
const isSpecializedHospital = (hospitalName) => {
  const name = hospitalName.toLowerCase();
  
  // Specialized hospital keywords
  const specializedKeywords = [
    'cardiac', 'heart', 'cardio',
    'eye', 'ophthalmic', 'vision',
    'chest', 'pulmonary', 'lung', 'respiratory',
    'orthopedic', 'bone', 'joint', 'spine',
    'dermatology', 'skin',
    'children', 'pediatric', 'kids',
    'maternity', 'women', 'gynecology', 'obstetrics',
    'cancer', 'oncology',
    'neuro', 'brain', 'neurology',
    'dental', 'dental care',
    'psychiatric', 'mental health',
    'burn', 'trauma',
    'surgical', 'surgery'
  ];
  
  return specializedKeywords.some(keyword => name.includes(keyword));
};

/**
 * Format hospital address in human-readable format with enhanced location precision
 */
const formatAddress = (item) => {
  // Use the address object from Nominatim if available
  if (item.address) {
    const addr = item.address;
    
    // Enhanced area/locality detection with multiple fallbacks
    let area = '';
    let subArea = '';
    
    // Priority 1: Most specific localities (colonies, nagars, junctions)
    area = addr.suburb || addr.neighbourhood || addr.village || addr.locality || addr.hamlet || '';
    
    // Priority 2: Try to extract from road name if it contains locality info
    if (!area && addr.road) {
      const roadName = addr.road;
      // Filter out road codes but keep meaningful road names with locality info
      if (!/^[A-Z]{2,4}\d{1,4}$/.test(roadName) && !/^NH\d+$/.test(roadName) && !/^SH\d+$/.test(roadName)) {
        // Keep road names that might contain locality information
        if (roadName.includes('Junction') || roadName.includes('Jct') || 
            roadName.includes('Colony') || roadName.includes('Nagar') ||
            roadName.includes('Complex') || roadName.includes('Center') ||
            roadName.includes('Station') || roadName.includes('Road') && roadName.length > 10) {
          area = roadName;
        }
      }
    }
    
    // Priority 3: Try residential or commercial areas
    if (!area) {
      area = addr.residential || addr.commercial || addr.industrial || '';
    }
    
    // Priority 4: Use city district or sub-city
    if (!area) {
      area = addr.city_district || addr.suburb || addr.district || '';
    }
    
    // Try to get sub-area from other address components
    subArea = addr.place || addr.allotments || addr.plot || '';
    
    // Enhanced city detection with multiple options
    let city = '';
    
    // Priority 1: Main city
    city = addr.city || addr.town || addr.municipality || '';
    
    // Priority 2: If no city, try county or state admin level
    if (!city) {
      city = addr.county || addr.state || '';
    }
    
    // Priority 3: Use state if still no city found
    if (!city) {
      city = addr.state || '';
    }
    
    // Clean up area name - keep meaningful locality indicators
    if (area) {
      // Keep locality indicators like Colony, Nagar, Junction, Complex
      area = area.replace(/\b(Hospital|Medical|Center|Clinic|Emergency|Healthcare)\b/gi, '').trim();
    }
    
    // Build detailed address with multiple components
    const addressParts = [];
    
    // Add sub-area if available and different from main area
    if (subArea && subArea.toLowerCase() !== area.toLowerCase()) {
      addressParts.push(subArea);
    }
    
    // Add main area
    if (area) {
      addressParts.push(area);
    }
    
    // Add city if different from area
    if (city && city.toLowerCase() !== area.toLowerCase()) {
      addressParts.push(city);
    }
    
    // Return formatted address with up to 3 components
    if (addressParts.length >= 2) {
      return addressParts.slice(0, 3).join(', ');
    } else if (addressParts.length === 1) {
      return addressParts[0];
    }
  }
  
  // Enhanced fallback to display_name parsing with better extraction
  const addressParts = item.display_name.split(',').map(part => part.trim());
  
  // More sophisticated filtering and extraction for meaningful parts
  const meaningfulParts = addressParts.filter((part, index) => {
    // Skip hospital name (first part)
    if (index === 0) return false;
    
    // Skip if it looks like a road code
    if (/^[A-Z]{2,4}\d{1,4}$/.test(part) || /^NH\d+$/.test(part) || /^SH\d+$/.test(part)) {
      return false;
    }
    
    // Skip if it's just a number or postal code
    if (/^\d+$/.test(part) || /^\d{6}$/.test(part)) {
      return false;
    }
    
    // Skip hospital-related terms
    if (part.toLowerCase().includes('hospital') || part.toLowerCase().includes('medical') || 
        part.toLowerCase().includes('clinic') || part.toLowerCase().includes('emergency')) {
      return false;
    }
    
    // Skip country codes and very short abbreviations
    if (/^[A-Z]{1,3}$/.test(part) && part.length <= 3) {
      return false;
    }
    
    // Skip common generic terms but keep specific Indian states if needed
    const genericTerms = ['india'];
    if (genericTerms.includes(part.toLowerCase())) {
      return false;
    }
    
    // Keep parts that look like specific localities
    const localityIndicators = ['colony', 'nagar', 'junction', 'jct', 'complex', 'center', 'station', 'road', 'street', 'nagar', 'colony', 'palem', 'pet', 'gudem', 'puram', 'bagh', 'ganj', 'mandir', 'bazaar'];
    const partLower = part.toLowerCase();
    
    // Keep if it contains locality indicators or is reasonably long
    if (localityIndicators.some(indicator => partLower.includes(indicator)) || 
        (part.length > 3 && !partLower.match(/^(andhra|telangana|tamil|karnataka|kerala)/))) {
      return true;
    }
    
    return true;
  });
  
  // Take the most meaningful parts for detailed address
  if (meaningfulParts.length >= 2) {
    // Try to construct area + city format
    const area = meaningfulParts[0];
    const city = meaningfulParts[meaningfulParts.length - 1]; // Usually last part is city
    
    if (area.toLowerCase() !== city.toLowerCase()) {
      return meaningfulParts.slice(0, 3).join(', ');
    } else {
      return area;
    }
  } else if (meaningfulParts.length === 1) {
    return meaningfulParts[0];
  }
  
  // Final fallback - try to extract from the original display_name differently
  const fallbackParts = addressParts.slice(1).filter(part => {
    // More lenient filtering for final fallback
    return !/^\d+$/.test(part) && 
           !/^[A-Z]{2,4}\d{1,4}$/.test(part) && 
           part.length > 2 &&
           !part.toLowerCase().includes('hospital') &&
           !part.toLowerCase().includes('india');
  });
  
  if (fallbackParts.length > 0) {
    return fallbackParts.slice(0, 3).join(', ');
  }
  
  // Ultimate fallback
  return item.address?.state || 'Nearby location';
};

/**
 * Calculate medical relevance score for a hospital based on the user's medical problem
 */
const calculateMedicalRelevance = (hospitalName, displayName, medicalProblem) => {
  if (!medicalProblem) return 0;
  
  const problemLower = medicalProblem.toLowerCase();
  const nameLower = hospitalName.toLowerCase();
  const displayLower = displayName.toLowerCase();
  
  let relevanceScore = 0;
  
  // High relevance for exact matches
  if (nameLower.includes(problemLower) || displayLower.includes(problemLower)) {
    relevanceScore += 10;
  }
  
  // Medium relevance for specialty matches
  if (problemLower.includes('heart') || problemLower.includes('cardiologist')) {
    if (nameLower.includes('cardiac') || nameLower.includes('heart') || displayLower.includes('cardiac') || displayLower.includes('heart')) {
      relevanceScore += 8;
    }
  }
  
  if (problemLower.includes('eye') || problemLower.includes('ophthalmologist')) {
    if (nameLower.includes('eye') || nameLower.includes('ophthalmic') || displayLower.includes('eye') || displayLower.includes('ophthalmic')) {
      relevanceScore += 8;
    }
  }
  
  if (problemLower.includes('lung') || problemLower.includes('pulmonologist') || problemLower.includes('breathing')) {
    if (nameLower.includes('chest') || nameLower.includes('pulmonary') || nameLower.includes('lung') || displayLower.includes('chest') || displayLower.includes('pulmonary') || displayLower.includes('lung')) {
      relevanceScore += 8;
    }
  }
  
  if (problemLower.includes('bone') || problemLower.includes('orthopedic') || problemLower.includes('joint')) {
    if (nameLower.includes('orthopedic') || nameLower.includes('bone') || nameLower.includes('joint') || displayLower.includes('orthopedic') || displayLower.includes('bone') || displayLower.includes('joint')) {
      relevanceScore += 8;
    }
  }
  
  if (problemLower.includes('skin') || problemLower.includes('dermatologist')) {
    if (nameLower.includes('dermatology') || nameLower.includes('skin') || displayLower.includes('dermatology') || displayLower.includes('skin')) {
      relevanceScore += 8;
    }
  }
  
  if (problemLower.includes('child') || problemLower.includes('pediatrician')) {
    if (nameLower.includes('children') || nameLower.includes('pediatric') || nameLower.includes('child') || displayLower.includes('children') || displayLower.includes('pediatric') || displayLower.includes('child')) {
      relevanceScore += 8;
    }
  }
  
  if (problemLower.includes('women') || problemLower.includes('gynecologist')) {
    if (nameLower.includes('maternity') || nameLower.includes('women') || nameLower.includes('gynecology') || displayLower.includes('maternity') || displayLower.includes('women') || displayLower.includes('gynecology')) {
      relevanceScore += 8;
    }
  }
  
  // Low relevance for general medical terms
  if (nameLower.includes('medical') || nameLower.includes('clinic') || displayLower.includes('medical') || displayLower.includes('clinic')) {
    relevanceScore += 2;
  }
  
  return relevanceScore;
};

const PatientDashboardSimple = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get medical problem from navigation state
  const medicalProblem = location.state?.medicalProblem || '';
  
  // State
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [nearbyHospitals, setNearbyHospitals] = useState([]);
  const [fetchingHospitals, setFetchingHospitals] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [filterMessage, setFilterMessage] = useState('');
  const [patientName, setPatientName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');

  // Constants
  const NOMINATIM_API = 'https://nominatim.openstreetmap.org/search';

  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const EARTH_RADIUS_KM = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return EARTH_RADIUS_KM * c;
  };

  /**
   * Get user's current location
   */
  const getUserLocation = () => {
    setFetchingHospitals(true);
    setLocationError(null);
    setSelectedHospital(null);
    setNearbyHospitals([]);

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      setFetchingHospitals(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lon: longitude });
        searchNearbyHospitals(latitude, longitude);
      },
      (error) => {
        let errorMessage = 'Unable to retrieve your location.';
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location services.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }
        setLocationError(errorMessage);
        setFetchingHospitals(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  /**
   * Search for hospitals within bounding box using Nominatim
   */
  const searchNearbyHospitals = async (userLat, userLon) => {
    try {
      console.log('Searching near coordinates:', userLat, userLon);
      
      // Build more accurate bounding box (~5 km radius for better coverage)
      // More precise calculation: 1 degree latitude = 111.32 km
      const kmPerDegreeLat = 111.32;
      const kmPerDegreeLon = 111.32 * Math.cos(userLat * Math.PI / 180);
      const searchRadiusKm = 5; // 5km radius for better coverage
      
      const latDelta = searchRadiusKm / kmPerDegreeLat;
      const lonDelta = searchRadiusKm / kmPerDegreeLon;
      
      const left = userLon - lonDelta;
      const top = userLat + latDelta;
      const right = userLon + lonDelta;
      const bottom = userLat - latDelta;
      
      const viewbox = `${left},${top},${right},${bottom}`;
      
      console.log('Precise bounding box:', viewbox);
      console.log(`Search radius: ${searchRadiusKm}km (${latDelta.toFixed(4)}° lat, ${lonDelta.toFixed(4)}° lon)`);
      
      let allResults = [];
      
      // Multiple search strategies for hospitals only with broader coverage and medical problem filtering
      let searchStrategies = [
        {
          name: 'Hospitals in bounding box',
          url: `${NOMINATIM_API}?format=json&q=hospital&viewbox=${viewbox}&bounded=1&limit=20&addressdetails=1&extratags=1`
        },
        {
          name: 'Medical centers in bounding box', 
          url: `${NOMINATIM_API}?format=json&q=medical center&viewbox=${viewbox}&bounded=1&limit=10&addressdetails=1&extratags=1`
        },
        {
          name: 'Emergency services in bounding box',
          url: `${NOMINATIM_API}?format=json&q=emergency hospital&viewbox=${viewbox}&bounded=1&limit=10&addressdetails=1&extratags=1`
        },
        {
          name: 'Healthcare facilities in bounding box',
          url: `${NOMINATIM_API}?format=json&q=healthcare&viewbox=${viewbox}&bounded=1&limit=10&addressdetails=1&extratags=1`
        },
        // Enhanced searches for better location data
        {
          name: 'Multi-specialty hospitals',
          url: `${NOMINATIM_API}?format=json&q="multi specialty hospital"&viewbox=${viewbox}&bounded=1&limit=5&addressdetails=1&extratags=1`
        },
        {
          name: 'Government hospitals',
          url: `${NOMINATIM_API}?format=json&q="government hospital"&viewbox=${viewbox}&bounded=1&limit=5&addressdetails=1&extratags=1`
        },
        {
          name: 'Private hospitals',
          url: `${NOMINATIM_API}?format=json&q="private hospital"&viewbox=${viewbox}&bounded=1&limit=5&addressdetails=1&extratags=1`
        }
      ];

      // Add medical problem-specific searches if a problem is specified
      if (medicalProblem) {
        const problemKeywords = medicalProblem.toLowerCase();
        
        // Add specialized searches based on medical problem
        if (problemKeywords.includes('heart') || problemKeywords.includes('cardiologist')) {
          searchStrategies.push({
            name: 'Cardiac hospitals',
            url: `${NOMINATIM_API}?format=json&q=cardiac hospital&viewbox=${viewbox}&bounded=1&limit=5&addressdetails=1&extratags=1`
          });
        }
        
        if (problemKeywords.includes('eye') || problemKeywords.includes('ophthalmologist')) {
          searchStrategies.push({
            name: 'Eye hospitals',
            url: `${NOMINATIM_API}?format=json&q=eye hospital&viewbox=${viewbox}&bounded=1&limit=5&addressdetails=1&extratags=1`
          });
        }
        
        if (problemKeywords.includes('lung') || problemKeywords.includes('pulmonologist') || problemKeywords.includes('breathing')) {
          searchStrategies.push({
            name: 'Chest hospitals',
            url: `${NOMINATIM_API}?format=json&q=chest hospital&viewbox=${viewbox}&bounded=1&limit=5&addressdetails=1&extratags=1`
          });
        }
        
        if (problemKeywords.includes('bone') || problemKeywords.includes('orthopedic') || problemKeywords.includes('joint')) {
          searchStrategies.push({
            name: 'Orthopedic hospitals',
            url: `${NOMINATIM_API}?format=json&q=orthopedic hospital&viewbox=${viewbox}&bounded=1&limit=5&addressdetails=1&extratags=1`
          });
        }
        
        if (problemKeywords.includes('skin') || problemKeywords.includes('dermatologist')) {
          searchStrategies.push({
            name: 'Dermatology clinics',
            url: `${NOMINATIM_API}?format=json&q=dermatology clinic&viewbox=${viewbox}&bounded=1&limit=5&addressdetails=1&extratags=1`
          });
        }
        
        if (problemKeywords.includes('child') || problemKeywords.includes('pediatrician')) {
          searchStrategies.push({
            name: 'Children hospitals',
            url: `${NOMINATIM_API}?format=json?q=children hospital&viewbox=${viewbox}&bounded=1&limit=5&addressdetails=1&extratags=1`
          });
        }
        
        if (problemKeywords.includes('women') || problemKeywords.includes('gynecologist')) {
          searchStrategies.push({
            name: 'Maternity hospitals',
            url: `${NOMINATIM_API}?format=json&q=maternity hospital&viewbox=${viewbox}&bounded=1&limit=5&addressdetails=1&extratags=1`
          });
        }
        
        // Add general medical problem search
        searchStrategies.push({
          name: `Medical problem: ${medicalProblem}`,
          url: `${NOMINATIM_API}?format=json&q=${encodeURIComponent(medicalProblem + ' hospital')}&viewbox=${viewbox}&bounded=1&limit=5&addressdetails=1&extratags=1`
        });
      }
      
      // Execute searches with small delays to avoid rate limiting
      for (let i = 0; i < searchStrategies.length; i++) {
        const strategy = searchStrategies[i];
        
        try {
          console.log(`Executing: ${strategy.name}`);
          
          const response = await fetch(strategy.url, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'SmartQueue/1.0 (college-project@example.com)'
            }
          });
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          const data = await response.json();
          console.log(`${strategy.name} found:`, data.length, 'results');
          
          // Add distance and filter by actual distance with better location parsing
          const validResults = data
            .map(item => {
              const distance = calculateDistance(userLat, userLon, parseFloat(item.lat), parseFloat(item.lon));
              
              // Use the new formatAddress function for clean, human-readable addresses
              const hospitalName = item.display_name.split(',')[0]?.trim() || 'Unknown Hospital';
              const formattedAddress = formatAddress(item);
              
              return {
                name: hospitalName,
                area: formattedAddress,
                city: item.address?.city || item.address?.town || '',
                fullAddress: item.display_name,
                display_name: item.display_name,
                lat: parseFloat(item.lat),
                lon: parseFloat(item.lon),
                distance: distance,
                type: item.class || 'hospital',
                importance: item.importance || 0,
                // More inclusive hospital filtering
                isHospital: item.type === 'hospital' || 
                           item.class === 'healthcare' ||
                           hospitalName.toLowerCase().includes('hospital') ||
                           hospitalName.toLowerCase().includes('medical') ||
                           item.display_name.toLowerCase().includes('hospital') ||
                           item.display_name.toLowerCase().includes('medical') ||
                           item.category?.includes('hospital') ||
                           item.category?.includes('healthcare') ||
                           item.type?.includes('healthcare'),
                // Medical problem relevance scoring
                medicalRelevance: calculateMedicalRelevance(hospitalName, item.display_name, medicalProblem)
              };
            })
            .filter(item => 
              item.distance <= searchRadiusKm && // Only keep results within our search radius
              item.isHospital // Only include actual hospitals
            );
          
          allResults = allResults.concat(validResults);
          
          // Small delay between requests
          if (i < searchStrategies.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
          
        } catch (err) {
          console.log(`Failed: ${strategy.name}`, err.message);
        }
      }
      
      // Remove duplicates based on name and coordinates with fuzzy matching
      const uniqueHospitals = allResults.filter((hospital, index, self) =>
        index === self.findIndex((h) => 
          h.name.toLowerCase() === hospital.name.toLowerCase() && 
          Math.abs(h.lat - hospital.lat) < 0.001 && 
          Math.abs(h.lon - hospital.lon) < 0.001
        )
      );
      
      // If we have very few results, try a more inclusive approach
      let finalHospitals = uniqueHospitals;
      if (uniqueHospitals.length < 3) {
        console.log('Few results found, trying more inclusive search...');
        
        // Add some results that might have been filtered out
        const additionalResults = allResults
          .filter(item => !uniqueHospitals.includes(item))
          .filter(item => 
            item.distance <= searchRadiusKm && 
            (item.type === 'amenity' || item.type === 'building' || item.class === 'amenity')
          )
          .slice(0, 5); // Limit additional results
          
        finalHospitals = [...uniqueHospitals, ...additionalResults];
        console.log(`Added ${additionalResults.length} additional results`);
      }
      
      // Smart filtering based on medical relevance
      const relevantHospitals = finalHospitals.filter(h => h.medicalRelevance > 0);
      let displayHospitals = [];
      let filterMessage = '';
      
      if (medicalProblem) {
        if (relevantHospitals.length >= 3) {
          // Show only matched hospitals if we have 3+ relevant results
          displayHospitals = relevantHospitals;
          filterMessage = `Showing ${relevantHospitals.length} hospitals relevant to "${medicalProblem}"`;
        } else if (relevantHospitals.length >= 1) {
          // Show matched + general hospitals if we have 1-2 relevant results
          displayHospitals = [...relevantHospitals, ...finalHospitals.filter(h => h.medicalRelevance === 0).slice(0, 10 - relevantHospitals.length)];
          filterMessage = `${relevantHospitals.length} relevant hospitals found + nearby options`;
        } else {
          // Show general hospitals if no relevant matches found
          displayHospitals = finalHospitals.slice(0, 15);
          filterMessage = `No specialized hospitals found for "${medicalProblem}". Showing nearby hospitals.`;
        }
      } else {
        // No medical problem - show all hospitals
        displayHospitals = finalHospitals.slice(0, 15);
        filterMessage = '';
      }
      
      // Sort by medical relevance first, then by distance, then by importance
      const sortedHospitals = displayHospitals.sort((a, b) => {
        // Primary sort: medical relevance (higher score first)
        if (a.medicalRelevance !== b.medicalRelevance) {
          return b.medicalRelevance - a.medicalRelevance;
        }
        
        // Secondary sort: distance (closer first)
        if (Math.abs(a.distance - b.distance) > 0.1) {
          return a.distance - b.distance;
        }
        
        // Tertiary sort: importance (Nominatim's relevance score)
        return (b.importance || 0) - (a.importance || 0);
      });
      
      // Limit to top 15 results for better UX
      const limitedHospitals = sortedHospitals.slice(0, 15);
      
      console.log('Final processed hospitals:', limitedHospitals.length);
      limitedHospitals.forEach(h => {
        const relevanceText = h.medicalRelevance > 0 ? ` (relevance: ${h.medicalRelevance})` : '';
        const matchText = h.medicalRelevance > 0 ? ' ✓' : '';
        console.log(`${h.name} - ${h.distance.toFixed(2)}km - ${h.area}${relevanceText}${matchText}`);
      });
      
      if (medicalProblem) {
        console.log(`🏥 Medical problem-based search: "${medicalProblem}"`);
        console.log(`📍 ${filterMessage}`);
        console.log(`🎯 Relevant hospitals: ${relevantHospitals.length}/${limitedHospitals.length}`);
      }
      
      setNearbyHospitals(limitedHospitals);
      setFilterMessage(filterMessage);
      
      if (limitedHospitals.length === 0) {
        setLocationError(`No hospitals found within ${searchRadiusKm}km. Try searching in a more populated area or check location permissions.`);
      } else {
        console.log(`✅ Found ${limitedHospitals.length} hospitals within ${searchRadiusKm}km`);
      }
      
    } catch (error) {
      console.error('Search error:', error);
      setLocationError('Failed to search for hospitals. Please check your internet connection and try again.');
    } finally {
      setFetchingHospitals(false);
    }
  };

  /**
   * Search hospitals based on user input and medical problem
   */
  const searchHospitalsByQuery = async (query) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    try {
      console.log('Searching hospitals for:', query, 'with medical problem:', medicalProblem);
      
      let allSearchResults = [];
      
      // Build search query with medical problem for better results
      const searchTerms = medicalProblem ? `${query} ${medicalProblem}` : query;
      
      // Multiple search strategies for comprehensive coverage
      const searchStrategies = [
        {
          name: 'Direct hospital search',
          url: `${NOMINATIM_API}?format=json&q=${encodeURIComponent(searchTerms + ' hospital')}&limit=15`
        },
        {
          name: 'Medical center search',
          url: `${NOMINATIM_API}?format=json&q=${encodeURIComponent(searchTerms + ' medical center')}&limit=10`
        },
        {
          name: 'Healthcare search',
          url: `${NOMINATIM_API}?format=json&q=${encodeURIComponent(searchTerms + ' healthcare')}&limit=10`
        },
        {
          name: 'Emergency search',
          url: `${NOMINATIM_API}?format=json&q=${encodeURIComponent(searchTerms + ' emergency')}&limit=5`
        }
      ];
      
      // Execute all search strategies
      for (const strategy of searchStrategies) {
        try {
          console.log(`Executing: ${strategy.name}`);
          
          const response = await fetch(strategy.url, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'SmartQueue/1.0 (college-project@example.com)'
            }
          });
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          const data = await response.json();
          console.log(`${strategy.name} found:`, data.length, 'results');
          
          allSearchResults = allSearchResults.concat(data);
          
          // Small delay between requests
          await new Promise(resolve => setTimeout(resolve, 300));
          
        } catch (err) {
          console.log(`Failed: ${strategy.name}`, err.message);
        }
      }
      
      // Process all search results with distance filtering
      const hospitals = allSearchResults
        .map(item => {
          const hospitalName = item.display_name.split(',')[0]?.trim() || 'Unknown Hospital';
          const formattedAddress = formatAddress(item);
          
          // Calculate distance if user location is available
          let distance = null;
          if (userLocation) {
            distance = calculateDistance(userLocation.lat, userLocation.lon, parseFloat(item.lat), parseFloat(item.lon));
          }
          
          return {
            name: hospitalName,
            area: formattedAddress,
            city: item.address?.city || item.address?.town || '',
            display_name: item.display_name,
            lat: parseFloat(item.lat),
            lon: parseFloat(item.lon),
            distance: distance,
            type: item.class || 'hospital',
            importance: item.importance || 0
          };
        })
        .filter(item => 
          item.name.toLowerCase().includes('hospital') || 
          item.display_name.toLowerCase().includes('hospital') ||
          item.name.toLowerCase().includes('medical') ||
          item.display_name.toLowerCase().includes('medical') ||
          item.name.toLowerCase().includes('healthcare') ||
          item.display_name.toLowerCase().includes('healthcare')
        )
        .filter(item => {
          // Apply distance filter if user location is available (increased range)
          if (userLocation && item.distance !== null) {
            return item.distance <= 15; // 15km radius for search results (increased from 10km)
          }
          return true; // No distance filter if user location is not available
        })
        .sort((a, b) => {
          // Sort by distance if available, otherwise by importance
          if (a.distance !== null && b.distance !== null) {
            return a.distance - b.distance;
          }
          return (b.importance || 0) - (a.importance || 0);
        });
      
      // Remove duplicates
      const uniqueHospitals = hospitals.filter((hospital, index, self) =>
        index === self.findIndex((h) => 
          h.name.toLowerCase() === hospital.name.toLowerCase() && 
          Math.abs(h.lat - hospital.lat) < 0.001 && 
          Math.abs(h.lon - hospital.lon) < 0.001
        )
      );
      
      setSearchResults(uniqueHospitals);
      setShowDropdown(uniqueHospitals.length > 0);
      
      // Log distance filtering info
      if (userLocation) {
        const nearbyCount = uniqueHospitals.filter(h => h.distance !== null && h.distance <= 5).length;
        const totalCount = uniqueHospitals.length;
        console.log(`Found ${totalCount} unique hospitals, ${nearbyCount} within 5km of user location`);
      }
      
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setShowDropdown(false);
    } finally {
      setIsSearching(false);
    }
  };

  /**
   * Handle search input change with proper debouncing
   */
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Clear previous timeout
    if (window.searchTimeout) {
      clearTimeout(window.searchTimeout);
    }
    
    // Debounce search
    window.searchTimeout = setTimeout(() => {
      searchHospitalsByQuery(query);
    }, 300);
  };

  /**
   * Handle hospital selection from search results
   */
  const selectSearchHospital = (hospital) => {
    setSelectedHospital(hospital);
    setSearchQuery(hospital.name);
    setShowDropdown(false);
    console.log('Selected hospital:', hospital.name);
  };

  /**
   * Handle phone number input change with real-time validation
   */
  const handlePhoneChange = (e) => {
    const phone = e.target.value;
    setPhoneNumber(phone);
    
    // Clear error when user starts typing
    if (phone.trim() === '') {
      setPhoneError('');
    } else if (validatePhoneNumber(phone)) {
      setPhoneError('');
    } else {
      setPhoneError('Invalid phone number format');
    }
  };

  /**
   * Validate phone number format
   */
  const validatePhoneNumber = (phone) => {
    const cleanedPhone = phone.replace(/\s/g, '').replace(/[-()]/g, '');
    
    // STRICT Indian phone number validation
    // Option 1: Exactly 10 digits, starts with 6-9 (mobile)
    const indianMobile = /^[6-9]\d{9}$/;
    
    // Option 2: Starts with 0 and exactly 11 digits total (with STD code)
    const indianWithStd = /^0[6-9]\d{9}$/;
    
    // Option 3: Country code +91 followed by exactly 10 digits starting with 6-9
    const indianWithCountry = /^\+91[6-9]\d{9}$/;
    
    // ONLY accept these specific Indian formats
    return indianMobile.test(cleanedPhone) || 
           indianWithStd.test(cleanedPhone) || 
           indianWithCountry.test(cleanedPhone);
  };

  /**
   * Handle queue joining
   */
  const handleJoinQueue = () => {
    if (!selectedHospital) {
      alert('Please select a hospital first');
      return;
    }
    
    if (!patientName.trim()) {
      alert('Please enter your name');
      return;
    }
    
    if (!phoneNumber.trim()) {
      alert('Please enter your phone number');
      return;
    }
    
    // Validate phone number format
    if (!validatePhoneNumber(phoneNumber.trim())) {
      alert('Please enter a valid phone number\n\nValid formats:\n• 9876543210 (10-digit mobile)\n• +919876543210 (with country code)\n• 09876543210 (with STD code)');
      return;
    }
    
    // Create queue data object
    const queueData = {
      patientName: patientName.trim(),
      phoneNumber: phoneNumber.trim(),
      hospital: selectedHospital.name,
      hospitalAddress: selectedHospital.area,
      hospitalCity: selectedHospital.city,
      distance: selectedHospital.distance.toFixed(1),
      medicalProblem: medicalProblem,
      timestamp: new Date().toISOString(),
      queueId: `QUEUE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    // Store in localStorage for persistence
    localStorage.setItem('currentQueue', JSON.stringify(queueData));
    
    // Add to queue history (if you want to maintain history)
    const existingQueues = JSON.parse(localStorage.getItem('queueHistory') || '[]');
    existingQueues.push(queueData);
    localStorage.setItem('queueHistory', JSON.stringify(existingQueues));
    
    // Log for debugging
    console.log('Queue Data Stored:', queueData);
    
    // Show success message with all details
    alert(`✅ Queue Joined Successfully!\n\n` +
          `🏥 Hospital: ${selectedHospital.name}\n` +
          `📍 Location: ${selectedHospital.area}\n` +
          `📞 Phone: ${phoneNumber}\n` +
          `👤 Patient: ${patientName}\n` +
          `📏 Distance: ${selectedHospital.distance.toFixed(1)} km\n` +
          `🆔 Queue ID: ${queueData.queueId}\n\n` +
          `Please save your Queue ID for reference.`);
    
    // Optional: Clear form after successful submission
    setPatientName('');
    setPhoneNumber('');
    setSelectedHospital(null);
  };

  return (
    <section className="min-h-screen bg-gray-50 transition-colors duration-300">
      {/* Modified Header Component */}
      <header
        className="fixed top-4 left-1/2 transform -translate-x-1/2 w-[92%] md:w-[80%]
        flex items-center justify-between px-6 py-3
        backdrop-blur-[10px] bg-transparent
        border border-blue-600/20
        rounded-full z-50 transition-all duration-300"
      >
        <div className="flex w-full items-center justify-between px-6">

          {/* Brand - Only Website Name */}
          <div className="leading-tight">
            <h1 className="text-xl font-bold text-blue-700">
              SmartQueue
            </h1>
            <p className="text-xs text-gray-500">
              Hospital Queue System
            </p>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center gap-3">
            {/* Back to Medical Problem Button */}
            <motion.button
              onClick={() => navigate('/medical-problem')}
              className="group relative p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg 
                className="w-5 h-5 text-blue-600 group-hover:text-blue-700 transition-colors duration-300" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M10 19l-7-7m0 0l7-7m-7 7h18" 
                />
              </svg>
              
              {/* Tooltip */}
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  Back to Medical Problem
                </div>
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
              </div>
            </motion.button>

            {/* Back to Home Button */}
            <motion.button
              onClick={() => navigate('/')}
              className="group relative p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg 
                className="w-5 h-5 text-blue-600 group-hover:text-blue-700 transition-colors duration-300" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
                />
              </svg>
              
              {/* Tooltip */}
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  Back to Home
                </div>
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
              </div>
            </motion.button>
          </div>

        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-40 px-4 sm:px-6 lg:px-8 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Patient Dashboard</h1>
          <p className="text-gray-600">Manage your hospital queue appointments</p>
          
          {/* Medical Problem Display */}
          {medicalProblem && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg"
            >
              <p className="text-sm text-blue-800">
                <span className="font-medium">Medical Problem:</span> {medicalProblem}
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Location Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-8 max-w-2xl mx-auto"
        >
          <button
            onClick={getUserLocation}
            disabled={fetchingHospitals}
            className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-3 font-medium"
          >
            {fetchingHospitals ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Fetching nearby hospitals...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Find Nearby Hospitals
              </>
            )}
          </button>
          
          {/* Location Error */}
          {locationError && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {locationError}
            </div>
          )}
        </motion.div>

        {/* Hospital Selection and Queue Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto mb-7">
          
          {/* Hospital Search */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-8"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6">Select nearest hospital</h2>
            
            {/* Search Input Section */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search by hospital name</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => setShowDropdown(searchResults.length > 0)}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                  placeholder="Enter hospital name or location..."
                  className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                />
                
                {/* Search Icon */}
                <div className="absolute right-3 top-3.5 text-gray-400">
                  {isSearching ? (
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  )}
                </div>
                
                {/* Search Results Dropdown - contained within input container */}
                {showDropdown && searchResults.length > 0 && (
                  <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                    {searchResults.map((hospital, index) => (
                      <div
                        key={`search-${index}`}
                        onClick={() => selectSearchHospital(hospital)}
                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium text-gray-900">{hospital.name}</div>
                        <div className="text-sm text-gray-500">
                          {hospital.area !== 'Location unknown' ? hospital.area : 'Area not specified'}
                          {hospital.city && hospital.city !== hospital.area && (
                            <span className="ml-1">• {hospital.city}</span>
                          )}
                        </div>
                        {hospital.distance !== null && (
                          <div className="text-sm text-blue-600 font-medium">
                            {hospital.distance.toFixed(1)} km away
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* No search results */}
              {!isSearching && searchQuery && searchResults.length === 0 && (
                <div className="mt-2 text-center py-4 text-gray-500 bg-gray-50 rounded-lg">
                  <svg className="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p className="text-sm">No hospitals found for "{searchQuery}"</p>
                  <p className="text-xs mt-1">Try different keywords</p>
                </div>
              )}
            </div>
            
            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">OR</span>
              </div>
            </div>
            
            {/* Nearby Hospitals Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700">Nearby hospitals</label>
                {nearbyHospitals.length > 0 && (
                  <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    {nearbyHospitals.length} found
                  </span>
                )}
              </div>
              
              {/* Filter Message */}
              {filterMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700"
                >
                  {filterMessage}
                </motion.div>
              )}

              {nearbyHospitals.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {nearbyHospitals.map((hospital, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => {
                        setSelectedHospital(hospital);
                        setShowDropdown(false);
                      }}
                      className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                        selectedHospital?.name === hospital.name
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-sm text-gray-900">{hospital.name}</p>
                            {hospital.medicalRelevance > 0 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                ✓ Relevant
                              </span>
                            )}
                            {/* Show specialized/general tags when no relevant hospitals found */}
                            {medicalProblem && hospital.medicalRelevance === 0 && (
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                isSpecializedHospital(hospital.name) 
                                  ? 'bg-purple-100 text-purple-800' 
                                  : 'bg-blue-100 text-blue-700'
                              }`}>
                                {isSpecializedHospital(hospital.name) ? 'Specialized' : 'General'}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{hospital.area}</p>
                          {hospital.distance !== null && (
                            <p className="text-xs text-gray-400 mt-1">{hospital.distance.toFixed(1)} km away</p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="font-medium">No nearby hospitals found</p>
                  <p className="text-sm mt-2">Click "Find Nearby Hospitals" to search your area</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Join Queue Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-8"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6">Join Queue</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Selected Hospital</label>
                <input
                  type="text"
                  value={selectedHospital ? selectedHospital.name : ''}
                  placeholder="Select a hospital from the list"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  readOnly
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Patient Name</label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  placeholder="Enter your phone number"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    phoneError 
                      ? 'border-red-500 bg-red-50' 
                      : phoneNumber && validatePhoneNumber(phoneNumber)
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-300'
                  }`}
                />
                {phoneError && (
                  <p className="mt-1 text-xs text-red-600">{phoneError}</p>
                )}
                {phoneNumber && !phoneError && validatePhoneNumber(phoneNumber) && (
                  <p className="mt-1 text-xs text-green-600">✓ Valid phone number</p>
                )}
              </div>
              
              {selectedHospital && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-sm text-blue-700">
                    <div className="font-medium">{selectedHospital.name}</div>
                    <div className="flex items-center gap-2">
                      <span>{selectedHospital.area !== 'Location unknown' ? selectedHospital.area : 'Area not specified'}</span>
                      {selectedHospital.city && selectedHospital.city !== selectedHospital.area && (
                        <>
                          <span className="text-blue-400">•</span>
                          <span>{selectedHospital.city}</span>
                        </>
                      )}
                    </div>
                    <div className="mt-1">
                      <span className="font-medium">Distance:</span> {selectedHospital.distance.toFixed(1)} km
                    </div>
                  </div>
                </div>
              )}
              
              <button 
                onClick={handleJoinQueue}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={!selectedHospital || !patientName.trim() || !phoneNumber.trim()}
              >
                Join Queue
              </button>
            </div>
          </motion.div>
        </div>
      </main>
    </section>
  );
};

export default PatientDashboardSimple;
