const axios = require('axios');
const Notice = require('../models/Notice');
const filterService = require('./filterService');

class TedService {
  constructor() {
    this.baseUrl = 'https://api.ted.europa.eu';
    this.apiKey = process.env.TED_API_KEY;
    this.notices = new Map(); // In-memory storage for demo
  }

  async fetchNotices(params = {}) {
    try {
      console.log('🔍 Fetching notices from TED API...');
      
      if (!this.apiKey) {
        console.log('⚠️  No TED API key found, using mock data');
        return this.getMockNotices();
      }

      // Build the search request body according to TED API spec
      let query;
      
      if (params.date) {
        // Search for a specific date
        const dateStr = params.date.replace(/-/g, '');
        query = `publication-date=${dateStr}`;
        console.log(`🔍 Searching for notices published on: ${params.date}`);
      } else {
        // Default: last 7 days if no date specified
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const dateFilter = sevenDaysAgo.toISOString().split('T')[0].replace(/-/g, '');
        query = `publication-date>${dateFilter}`;
        console.log(`🔍 Searching for notices from last 7 days`);
      }
      
      const searchBody = {
        query: params.query || query,
        fields: [
          'ND',
          'notice-title',
          'publication-date',
          'buyer-country',
          'classification-cpv',
          'contract-nature',
          'description-lot',
          'title-lot',
          'estimated-value-lot',
          'deadline-receipt-tender-date-lot'
        ],
        page: params.page || 1,
        limit: params.limit || 100, // Increased from 50 to 100
        scope: params.scope || 'ALL'
      };

      const response = await axios.post(`${this.baseUrl}/v3/notices/search`, searchBody, {
        timeout: 15000,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'User-Agent': 'TED-Notice-Filter-App/1.0'
        }
      });

      const totalCount = response.data.totalNoticeCount || 0;
      console.log('📦 Response data keys:', Object.keys(response.data));
      console.log('📦 Response.data.notices type:', typeof response.data.notices, Array.isArray(response.data.notices));
      
      const notices = response.data.notices || response.data.results || [];
      
      console.log(`✅ TED API Success: ${totalCount} total notices, ${notices.length} in this page`);
      const transformed = this.transformTedData(notices);
      console.log(`📝 Transformed ${transformed.length} notices`);
      return transformed;
      
    } catch (error) {
      const status = error.response?.status;
      const errorData = error.response?.data;
      
      console.error(`❌ TED API Error (${status}):`, errorData || error.message);
      
      if (status === 403 && errorData?.includes('eNotices2 account')) {
        console.log('💡 API Key needs to be registered with an eNotices2 account');
        console.log('   Visit: https://enotices2.ted.europa.eu/ to set up your account');
      } else if (status === 401) {
        console.log('💡 API Key authentication failed - check your key');
      }
      
      console.log('🔄 Falling back to mock data for development...');
      return this.getMockNotices();
    }
  }

  transformTedData(tedResults) {
    console.log(`🔄 Transforming ${tedResults.length} TED results...`);
    return tedResults.map(item => {
      try {
        // Debug: log first item's date fields
        if (tedResults.indexOf(item) === 0) {
          console.log('📅 Debug first item date fields:');
          console.log('  publication-date (raw):', item['publication-date']);
          console.log('  new Date(publication-date):', new Date(item['publication-date']));
          console.log('  deadline-receipt-tender-date-lot:', item['deadline-receipt-tender-date-lot']);
        }
        
        // Extract title from multilingual object
        const noticeTitle = item['notice-title'];
        const title = noticeTitle?.eng || noticeTitle?.fra || noticeTitle?.deu || Object.values(noticeTitle || {})[0] || 'No title';
        
        // Extract description from multilingual object (can be array)
        const descLot = item['description-lot'];
        let description = descLot?.eng || descLot?.fra || descLot?.deu || Object.values(descLot || {})[0] || title;
        // If description is an array, join it
        if (Array.isArray(description)) {
          description = description.join(' ');
        }
        description = String(description || title);
        
        // Extract country from buyer-country array
        const country = Array.isArray(item['buyer-country']) ? item['buyer-country'][0] : item['buyer-country'] || 'Unknown';
        
        // Extract CPV codes
        const cpvCodes = Array.isArray(item['classification-cpv']) ? item['classification-cpv'] : [];
        
        // Extract deadline
        const deadlineArray = item['deadline-receipt-tender-date-lot'];
        const deadline = Array.isArray(deadlineArray) ? deadlineArray[0] : deadlineArray;
        
        return {
          id: item.ND || `TED-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          title: title.substring(0, 200), // Limit title length
          description: description.substring(0, 500), // Limit description length
          country: country,
          cpvCodes: cpvCodes.slice(0, 5), // Limit CPV codes
          estimatedValue: null, // Not easily available in basic fields
          currency: 'EUR',
          deadline: deadline ? this.parseDate(deadline) : null,
          publishDate: item['publication-date'] ? this.parseDate(item['publication-date']) : null,
          contractType: Array.isArray(item['contract-nature']) ? item['contract-nature'][0] : item['contract-nature'] || 'Unknown',
          procuringEntity: 'TED Authority',
          tedUrl: item.links?.html?.ENG || `https://ted.europa.eu/en/notice/-/detail/${item.ND}`,
          rawData: item // Keep original for debugging
        };
      } catch (error) {
        console.error('Error transforming TED item:', error, item);
        return null;
      }
    }).filter(Boolean);
  }

  parseDate(dateStr) {
    if (!dateStr) return null;
    // TED API returns dates in format: 2025-10-23+02:00
    // Convert to ISO 8601: 2025-10-23T00:00:00+02:00
    const corrected = dateStr.replace(/^(\d{4}-\d{2}-\d{2})\+/, '$1T00:00:00+');
    const date = new Date(corrected);
    return isNaN(date.getTime()) ? null : date;
  }

  parseValue(valueStr) {
    if (!valueStr) return null;
    const numStr = valueStr.replace(/[^\d.,]/g, '');
    const num = parseFloat(numStr.replace(',', '.'));
    return isNaN(num) ? null : num;
  }

  getMockNotices() {
    return [
      {
        id: 'TED-001',
        title: 'Construction of New Hospital Wing',
        description: 'Public tender for construction services for a new hospital wing including medical equipment installation',
        country: 'FR',
        cpvCodes: ['45000000-7', '33000000-0'],
        estimatedValue: 2500000,
        currency: 'EUR',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        publishDate: new Date(),
        contractType: 'Works',
        procuringEntity: 'Regional Health Authority',
        tedUrl: 'https://ted.europa.eu/udl?uri=TED:NOTICE:001'
      },
      {
        id: 'TED-002',
        title: 'IT Infrastructure Modernization',
        description: 'Supply and installation of IT equipment and software for government offices',
        country: 'DE',
        cpvCodes: ['30000000-9', '72000000-5'],
        estimatedValue: 850000,
        currency: 'EUR',
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        publishDate: new Date(),
        contractType: 'Supplies',
        procuringEntity: 'Federal IT Department',
        tedUrl: 'https://ted.europa.eu/udl?uri=TED:NOTICE:002'
      }
    ];
  }

  async fetchAndProcessNotices(options = {}) {
    const maxPages = options.maxPages || 1; // Number of pages to fetch
    const date = options.date; // Specific date to fetch
    const allRawNotices = [];
    
    // Fetch multiple pages if requested
    for (let page = 1; page <= maxPages; page++) {
      console.log(`📄 Fetching page ${page}/${maxPages}...`);
      const rawNotices = await this.fetchNotices({ page, limit: 100, date });
      allRawNotices.push(...rawNotices);
      
      // If we got fewer notices than the limit, we've reached the end
      if (rawNotices.length < 100) {
        console.log(`✅ Reached end of results at page ${page}`);
        break;
      }
    }
    
    const newNotices = [];

    for (const rawNotice of allRawNotices) {
      if (!this.notices.has(rawNotice.id)) {
        const notice = new Notice(rawNotice);
        this.notices.set(notice.id, notice);
        newNotices.push(notice);
      }
    }

    if (newNotices.length > 0) {
      console.log(`Processing ${newNotices.length} new notices`);
      await filterService.processNewNotices(newNotices);
    }

    return newNotices;
  }

  getNoticeById(id) {
    return this.notices.get(id);
  }

  getAllNotices() {
    return Array.from(this.notices.values());
  }
}

module.exports = new TedService();