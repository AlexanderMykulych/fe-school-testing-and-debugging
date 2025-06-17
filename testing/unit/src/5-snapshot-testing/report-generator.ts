export interface UserStats {
  id: string;
  name: string;
  email: string;
  loginCount: number;
  lastLoginAt?: Date;
  isActive: boolean;
  accountAge: number;
}

export interface ReportData {
  period: {
    startDate: Date;
    endDate: Date;
  };
  users: UserStats[];
  summary: {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    averageLoginCount: number;
    averageAccountAge: number;
  };
}

export interface ReportConfig {
  title?: string;
  includeInactiveUsers?: boolean;
  sortBy?: 'name' | 'loginCount' | 'accountAge';
  sortOrder?: 'asc' | 'desc';
  format?: 'html' | 'markdown' | 'json';
}

export class ReportGenerator {
  generateUserActivityReport(data: ReportData, config: ReportConfig = {}): string {
    const {
      title = 'User Activity Report',
      includeInactiveUsers = true,
      sortBy = 'name',
      sortOrder = 'asc',
      format = 'html'
    } = config;

    const filteredUsers = includeInactiveUsers 
      ? data.users 
      : data.users.filter(user => user.isActive);

    const sortedUsers = this.sortUsers(filteredUsers, sortBy, sortOrder);

    switch (format) {
      case 'html':
        return this.generateHtmlReport(title, data, sortedUsers);
      case 'markdown':
        return this.generateMarkdownReport(title, data, sortedUsers);
      case 'json':
        return this.generateJsonReport(title, data, sortedUsers);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  generateDashboardSummary(data: ReportData): object {
    return {
      reportDate: new Date().toISOString(),
      period: {
        from: data.period.startDate.toISOString().split('T')[0],
        to: data.period.endDate.toISOString().split('T')[0],
        durationDays: Math.ceil(
          (data.period.endDate.getTime() - data.period.startDate.getTime()) / (1000 * 60 * 60 * 24)
        )
      },
      metrics: {
        totalUsers: data.summary.totalUsers,
        activeUsers: data.summary.activeUsers,
        inactiveUsers: data.summary.inactiveUsers,
        activityRate: this.calculatePercentage(data.summary.activeUsers, data.summary.totalUsers),
        averageLoginCount: Math.round(data.summary.averageLoginCount * 100) / 100,
        averageAccountAge: Math.round(data.summary.averageAccountAge)
      },
      usersByActivity: {
        highActivity: data.users.filter(u => u.loginCount > 50).length,
        mediumActivity: data.users.filter(u => u.loginCount >= 10 && u.loginCount <= 50).length,
        lowActivity: data.users.filter(u => u.loginCount < 10).length
      },
      recentUsers: data.users
        .filter(u => u.accountAge <= 30)
        .map(u => ({
          name: u.name,
          accountAge: u.accountAge,
          isActive: u.isActive
        }))
    };
  }

  generateUserProfileCard(user: UserStats): object {
    return {
      profile: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      activity: {
        status: user.isActive ? 'Active' : 'Inactive',
        loginCount: user.loginCount,
        lastLogin: user.lastLoginAt 
          ? {
              date: user.lastLoginAt.toISOString().split('T')[0],
              daysAgo: Math.ceil((Date.now() - user.lastLoginAt.getTime()) / (1000 * 60 * 60 * 24))
            }
          : null
      },
      account: {
        ageInDays: user.accountAge,
        ageCategory: this.categorizeAccountAge(user.accountAge),
        engagementLevel: this.categorizeEngagement(user.loginCount, user.isActive)
      }
    };
  }

  private sortUsers(users: UserStats[], sortBy: string, sortOrder: string): UserStats[] {
    return [...users].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'loginCount':
          comparison = a.loginCount - b.loginCount;
          break;
        case 'accountAge':
          comparison = a.accountAge - b.accountAge;
          break;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }

  private generateHtmlReport(title: string, data: ReportData, users: UserStats[]): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>${title}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 5px; }
        .summary { display: flex; gap: 20px; margin: 20px 0; }
        .metric { background: #e3f2fd; padding: 15px; border-radius: 5px; text-align: center; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .active { color: green; font-weight: bold; }
        .inactive { color: red; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${title}</h1>
        <p>Period: ${data.period.startDate.toISOString().split('T')[0]} to ${data.period.endDate.toISOString().split('T')[0]}</p>
    </div>
    
    <div class="summary">
        <div class="metric">
            <h3>${data.summary.totalUsers}</h3>
            <p>Total Users</p>
        </div>
        <div class="metric">
            <h3>${data.summary.activeUsers}</h3>
            <p>Active Users</p>
        </div>
        <div class="metric">
            <h3>${this.calculatePercentage(data.summary.activeUsers, data.summary.totalUsers)}%</h3>
            <p>Activity Rate</p>
        </div>
    </div>
    
    <table>
        <thead>
            <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Login Count</th>
                <th>Account Age (days)</th>
            </tr>
        </thead>
        <tbody>
            ${users.map(user => `
                <tr>
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td class="${user.isActive ? 'active' : 'inactive'}">
                        ${user.isActive ? 'Active' : 'Inactive'}
                    </td>
                    <td>${user.loginCount}</td>
                    <td>${user.accountAge}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
</body>
</html>`.trim();
  }

  private generateMarkdownReport(title: string, data: ReportData, users: UserStats[]): string {
    return `
# ${title}

## Summary
- **Period:** ${data.period.startDate.toISOString().split('T')[0]} to ${data.period.endDate.toISOString().split('T')[0]}
- **Total Users:** ${data.summary.totalUsers}
- **Active Users:** ${data.summary.activeUsers}
- **Inactive Users:** ${data.summary.inactiveUsers}
- **Activity Rate:** ${this.calculatePercentage(data.summary.activeUsers, data.summary.totalUsers)}%

## User Details

| Name | Email | Status | Login Count | Account Age |
|------|-------|--------|-------------|-------------|
${users.map(user => 
  `| ${user.name} | ${user.email} | ${user.isActive ? '✅ Active' : '❌ Inactive'} | ${user.loginCount} | ${user.accountAge} days |`
).join('\n')}
`.trim();
  }

  private generateJsonReport(title: string, data: ReportData, users: UserStats[]): string {
    const report = {
      title,
      generatedAt: new Date().toISOString(),
      period: {
        startDate: data.period.startDate.toISOString(),
        endDate: data.period.endDate.toISOString()
      },
      summary: data.summary,
      users: users.map(user => ({
        ...user,
        lastLoginAt: user.lastLoginAt?.toISOString()
      }))
    };
    
    return JSON.stringify(report, null, 2);
  }

  private calculatePercentage(numerator: number, denominator: number): number {
    if (denominator === 0) return 0;
    return Math.round((numerator / denominator) * 100);
  }

  private categorizeAccountAge(days: number): string {
    if (days <= 30) return 'New';
    if (days <= 180) return 'Recent';
    if (days <= 365) return 'Established';
    return 'Veteran';
  }

  private categorizeEngagement(loginCount: number, isActive: boolean): string {
    if (!isActive) return 'Dormant';
    if (loginCount >= 100) return 'Highly Engaged';
    if (loginCount >= 50) return 'Moderately Engaged';
    if (loginCount >= 10) return 'Lightly Engaged';
    return 'Minimal Engagement';
  }
} 