class User {
  constructor(id, email, criteria = {}) {
    this.id = id;
    this.email = email;
    this.criteria = {
      keywords: criteria.keywords || [],
      countries: criteria.countries || [],
      cpvCodes: criteria.cpvCodes || [], // Common Procurement Vocabulary codes
      valueRange: criteria.valueRange || { min: 0, max: null },
      contractTypes: criteria.contractTypes || [],
      ...criteria
    };
    this.createdAt = new Date();
    this.isActive = true;
  }

  updateCriteria(newCriteria) {
    this.criteria = { ...this.criteria, ...newCriteria };
  }

  matchesNotice(notice) {
    // Keywords matching
    if (this.criteria.keywords.length > 0) {
      const hasKeyword = this.criteria.keywords.some(keyword =>
        notice.title.toLowerCase().includes(keyword.toLowerCase()) ||
        notice.description.toLowerCase().includes(keyword.toLowerCase())
      );
      if (!hasKeyword) return false;
    }

    // Country matching
    if (this.criteria.countries.length > 0) {
      if (!this.criteria.countries.includes(notice.country)) return false;
    }

    // CPV codes matching (supports partial codes)
    // User can specify "45" to match all construction codes (45000000, 45200000, etc.)
    if (this.criteria.cpvCodes.length > 0) {
      const hasMatchingCpv = this.criteria.cpvCodes.some(userCpv => {
        // Remove any non-digit characters and get the user's CPV code
        const cleanUserCpv = String(userCpv).replace(/\D/g, '');
        
        // Check if any notice CPV code starts with the user's CPV code
        return notice.cpvCodes.some(noticeCpv => {
          const cleanNoticeCpv = String(noticeCpv).replace(/\D/g, '');
          return cleanNoticeCpv.startsWith(cleanUserCpv);
        });
      });
      if (!hasMatchingCpv) return false;
    }

    // Value range matching
    if (notice.estimatedValue) {
      if (this.criteria.valueRange.min && notice.estimatedValue < this.criteria.valueRange.min) {
        return false;
      }
      if (this.criteria.valueRange.max && notice.estimatedValue > this.criteria.valueRange.max) {
        return false;
      }
    }

    return true;
  }
}

module.exports = User;