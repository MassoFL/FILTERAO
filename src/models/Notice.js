class Notice {
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.description = data.description;
    this.country = data.country;
    this.cpvCodes = data.cpvCodes || [];
    this.estimatedValue = data.estimatedValue;
    this.currency = data.currency;
    // Handle dates - they might already be Date objects from tedService
    this.deadline = data.deadline instanceof Date ? data.deadline : (data.deadline ? new Date(data.deadline) : null);
    this.publishDate = data.publishDate instanceof Date ? data.publishDate : (data.publishDate ? new Date(data.publishDate) : null);
    this.contractType = data.contractType;
    this.procuringEntity = data.procuringEntity;
    this.tedUrl = data.tedUrl;
    this.processed = false;
  }

  isExpired() {
    return new Date() > this.deadline;
  }

  getDaysUntilDeadline() {
    const now = new Date();
    const diffTime = this.deadline - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}

module.exports = Notice;