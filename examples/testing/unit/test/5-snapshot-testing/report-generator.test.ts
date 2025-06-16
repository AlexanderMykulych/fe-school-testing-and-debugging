import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ReportGenerator, ReportData, UserStats } from '../../src/5-snapshot-testing/report-generator.js';

/**
 * ДЕМОНСТРАЦІЯ SNAPSHOT TESTING
 * 
 * Snapshot тести корисні для:
 * - Тестування виводу, який важко перевірити вручну (HTML, JSON, тощо)
 * - Виявлення неочікуваних змін у форматуванні
 * - Регресивного тестування складних структур даних
 * - Перевірки стабільності API відповідей
 */

describe('ReportGenerator - Snapshot Testing', () => {
  let generator: ReportGenerator;
  let sampleData: ReportData;

  beforeEach(() => {
    generator = new ReportGenerator();
    
    // Фіксуємо дату для детермінованих snapshot'ів
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15T12:00:00.000Z'));

    // Тестові дані
    const users: UserStats[] = [
      {
        id: 'user-1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        loginCount: 25,
        lastLoginAt: new Date('2024-01-10T14:30:00.000Z'),
        isActive: true,
        accountAge: 365
      },
      {
        id: 'user-2',
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        loginCount: 75,
        lastLoginAt: new Date('2024-01-14T09:15:00.000Z'),
        isActive: true,
        accountAge: 180
      },
      {
        id: 'user-3',
        name: 'Bob Johnson',
        email: 'bob.johnson@example.com',
        loginCount: 5,
        lastLoginAt: new Date('2023-12-01T16:45:00.000Z'),
        isActive: false,
        accountAge: 730
      },
      {
        id: 'user-4',
        name: 'Alice Brown',
        email: 'alice.brown@example.com',
        loginCount: 0,
        lastLoginAt: undefined,
        isActive: false,
        accountAge: 15
      }
    ];

    sampleData = {
      period: {
        startDate: new Date('2024-01-01T00:00:00.000Z'),
        endDate: new Date('2024-01-15T23:59:59.000Z')
      },
      users,
      summary: {
        totalUsers: 4,
        activeUsers: 2,
        inactiveUsers: 2,
        averageLoginCount: 26.25,
        averageAccountAge: 322.5
      }
    };
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('generateUserActivityReport', () => {
    it('should generate HTML report with default config', () => {
      // Act
      const result = generator.generateUserActivityReport(sampleData);

      // Assert - Snapshot порівняння всього HTML
      expect(result).toMatchSnapshot();
    });

    it('should generate HTML report with custom title', () => {
      // Act
      const result = generator.generateUserActivityReport(sampleData, {
        title: 'Custom Monthly Report'
      });

      // Assert
      expect(result).toMatchSnapshot();
    });

    it('should generate HTML report excluding inactive users', () => {
      // Act
      const result = generator.generateUserActivityReport(sampleData, {
        includeInactiveUsers: false
      });

      // Assert
      expect(result).toMatchSnapshot();
    });

    it('should generate HTML report sorted by login count descending', () => {
      // Act
      const result = generator.generateUserActivityReport(sampleData, {
        sortBy: 'loginCount',
        sortOrder: 'desc'
      });

      // Assert
      expect(result).toMatchSnapshot();
    });

    it('should generate Markdown report', () => {
      // Act
      const result = generator.generateUserActivityReport(sampleData, {
        format: 'markdown',
        title: 'User Activity Summary'
      });

      // Assert
      expect(result).toMatchSnapshot();
    });

    it('should generate JSON report', () => {
      // Act
      const result = generator.generateUserActivityReport(sampleData, {
        format: 'json'
      });

      // Assert - Парсимо JSON для prettier snapshot
      const parsed = JSON.parse(result);
      expect(parsed).toMatchSnapshot();
    });
  });

  describe('generateDashboardSummary', () => {
    it('should generate dashboard summary object', () => {
      // Act
      const result = generator.generateDashboardSummary(sampleData);

      // Assert - Snapshot для складного об'єкта
      expect(result).toMatchSnapshot();
    });

    it('should handle edge case with no users', () => {
      // Arrange
      const emptyData: ReportData = {
        ...sampleData,
        users: [],
        summary: {
          totalUsers: 0,
          activeUsers: 0,
          inactiveUsers: 0,
          averageLoginCount: 0,
          averageAccountAge: 0
        }
      };

      // Act
      const result = generator.generateDashboardSummary(emptyData);

      // Assert
      expect(result).toMatchSnapshot();
    });

    it('should handle edge case with all inactive users', () => {
      // Arrange
      const inactiveData: ReportData = {
        ...sampleData,
        users: sampleData.users.map(user => ({ ...user, isActive: false })),
        summary: {
          ...sampleData.summary,
          activeUsers: 0,
          inactiveUsers: 4
        }
      };

      // Act
      const result = generator.generateDashboardSummary(inactiveData);

      // Assert
      expect(result).toMatchSnapshot();
    });
  });

  describe('generateUserProfileCard', () => {
    it('should generate profile card for active user', () => {
      // Arrange
      const activeUser = sampleData.users[0]; // John Doe

      // Act
      const result = generator.generateUserProfileCard(activeUser);

      // Assert
      expect(result).toMatchSnapshot();
    });

    it('should generate profile card for inactive user', () => {
      // Arrange
      const inactiveUser = sampleData.users[2]; // Bob Johnson

      // Act
      const result = generator.generateUserProfileCard(inactiveUser);

      // Assert
      expect(result).toMatchSnapshot();
    });

    it('should generate profile card for user who never logged in', () => {
      // Arrange
      const newUser = sampleData.users[3]; // Alice Brown

      // Act
      const result = generator.generateUserProfileCard(newUser);

      // Assert
      expect(result).toMatchSnapshot();
    });

    it('should generate profile card for highly engaged user', () => {
      // Arrange
      const highlyEngagedUser: UserStats = {
        id: 'super-user',
        name: 'Super User',
        email: 'super@example.com',
        loginCount: 150,
        lastLoginAt: new Date('2024-01-15T10:00:00.000Z'),
        isActive: true,
        accountAge: 1000
      };

      // Act
      const result = generator.generateUserProfileCard(highlyEngagedUser);

      // Assert
      expect(result).toMatchSnapshot();
    });
  });

  describe('Complex scenarios', () => {
    it('should handle different report configurations consistently', () => {
      // Act - Генеруємо кілька варіантів звіту
      const htmlDefault = generator.generateUserActivityReport(sampleData);
      const htmlSorted = generator.generateUserActivityReport(sampleData, {
        sortBy: 'loginCount',
        sortOrder: 'desc'
      });
      const markdownReport = generator.generateUserActivityReport(sampleData, {
        format: 'markdown'
      });

      // Assert - Кожен варіант має свій snapshot
      expect({
        htmlDefault,
        htmlSorted,
        markdownReport
      }).toMatchSnapshot();
    });

    it('should maintain consistent formatting across different data sets', () => {
      // Arrange - Різні набори даних
      const smallDataSet: ReportData = {
        period: {
          startDate: new Date('2024-01-01T00:00:00.000Z'),
          endDate: new Date('2024-01-07T23:59:59.000Z')
        },
        users: [sampleData.users[0]],
        summary: {
          totalUsers: 1,
          activeUsers: 1,
          inactiveUsers: 0,
          averageLoginCount: 25,
          averageAccountAge: 365
        }
      };

      const largeDataSet: ReportData = {
        ...sampleData,
        users: [
          ...sampleData.users,
          ...Array.from({ length: 6 }, (_, i) => ({
            id: `user-${i + 5}`,
            name: `User ${i + 5}`,
            email: `user${i + 5}@example.com`,
            loginCount: Math.floor(Math.random() * 100),
            lastLoginAt: new Date('2024-01-12T12:00:00.000Z'),
            isActive: i % 2 === 0,
            accountAge: 100 + (i * 50)
          }))
        ]
      };

      // Act
      const smallReport = generator.generateDashboardSummary(smallDataSet);
      const largeReport = generator.generateDashboardSummary(largeDataSet);

      // Assert
      expect({
        small: smallReport,
        large: largeReport
      }).toMatchSnapshot();
    });
  });

  describe('Regression tests', () => {
    it('should maintain backwards compatibility for dashboard structure', () => {
      // Цей тест перевіряє, що структура dashboard summary не змінилася
      const result = generator.generateDashboardSummary(sampleData);

      // Assert - Перевіряємо наявність ключових полів
      expect(result).toHaveProperty('reportDate');
      expect(result).toHaveProperty('period');
      expect(result).toHaveProperty('metrics');
      expect(result).toHaveProperty('usersByActivity');
      expect(result).toHaveProperty('recentUsers');

      // І також snapshot для повної структури
      expect(result).toMatchSnapshot();
    });

    it('should handle special characters in user data', () => {
      // Arrange
      const specialCharsData: ReportData = {
        ...sampleData,
        users: [{
          id: 'special-user',
          name: 'José María O\'Connor',
          email: 'josé.maría@examplé.com',
          loginCount: 42,
          lastLoginAt: new Date('2024-01-10T14:30:00.000Z'),
          isActive: true,
          accountAge: 100
        }]
      };

      // Act
      const htmlReport = generator.generateUserActivityReport(specialCharsData, {
        format: 'html'
      });
      const jsonReport = generator.generateUserActivityReport(specialCharsData, {
        format: 'json'
      });

      // Assert
      expect({
        html: htmlReport,
        json: JSON.parse(jsonReport)
      }).toMatchSnapshot();
    });
  });
}); 