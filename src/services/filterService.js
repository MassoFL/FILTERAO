class FilterService {
  constructor() {
    this.users = new Map(); // In-memory storage for demo
    this.notifications = []; // Store notifications to send
  }

  addUser(user) {
    this.users.set(user.id, user);
  }

  getUser(id) {
    return this.users.get(id);
  }

  getAllUsers() {
    return Array.from(this.users.values()).filter(user => user.isActive);
  }

  async processNewNotices(notices) {
    const users = this.getAllUsers();
    
    for (const notice of notices) {
      for (const user of users) {
        if (user.matchesNotice(notice)) {
          this.createNotification(user, notice);
        }
      }
    }

    // In a real app, you'd send emails/push notifications here
    await this.sendPendingNotifications();
  }

  createNotification(user, notice) {
    const notification = {
      id: `${user.id}-${notice.id}-${Date.now()}`,
      userId: user.id,
      userEmail: user.email,
      noticeId: notice.id,
      noticeTitle: notice.title,
      matchReason: this.getMatchReason(user, notice),
      createdAt: new Date(),
      sent: false
    };

    this.notifications.push(notification);
    console.log(`Created notification for user ${user.email}: ${notice.title}`);
  }

  getMatchReason(user, notice) {
    const reasons = [];
    
    if (user.criteria.keywords.length > 0) {
      const matchedKeywords = user.criteria.keywords.filter(keyword =>
        notice.title.toLowerCase().includes(keyword.toLowerCase()) ||
        notice.description.toLowerCase().includes(keyword.toLowerCase())
      );
      if (matchedKeywords.length > 0) {
        reasons.push(`Keywords: ${matchedKeywords.join(', ')}`);
      }
    }

    if (user.criteria.countries.includes(notice.country)) {
      reasons.push(`Country: ${notice.country}`);
    }

    const matchedCpv = user.criteria.cpvCodes.filter(cpv => notice.cpvCodes.includes(cpv));
    if (matchedCpv.length > 0) {
      reasons.push(`CPV Codes: ${matchedCpv.join(', ')}`);
    }

    return reasons.join(' | ');
  }

  async sendPendingNotifications() {
    const pendingNotifications = this.notifications.filter(n => !n.sent);
    
    for (const notification of pendingNotifications) {
      // In a real app, integrate with email service (SendGrid, AWS SES, etc.)
      console.log(`📧 Sending notification to ${notification.userEmail}:`);
      console.log(`   Notice: ${notification.noticeTitle}`);
      console.log(`   Match: ${notification.matchReason}`);
      
      notification.sent = true;
      notification.sentAt = new Date();
    }

    return pendingNotifications.length;
  }

  getUserNotifications(userId) {
    return this.notifications.filter(n => n.userId === userId);
  }
}

module.exports = new FilterService();