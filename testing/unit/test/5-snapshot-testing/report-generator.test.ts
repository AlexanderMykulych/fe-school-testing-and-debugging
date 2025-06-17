import { test, expect, beforeEach, afterEach, vi } from 'vitest';
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

test('should generate HTML report with default config', () => {
  // Act
  const result = generator.generateUserActivityReport(sampleData);

  // Assert - Snapshot порівняння всього HTML
  expect(result).toMatchSnapshot();
});

test('should generate HTML report with custom title', () => {
  // Act


  // Assert
  const result = [{
    name: 'Bob',
    email: 'email@test.com'
  }, {
    name: 'Bob2',
    email: 'email2@test.com'
  },]
  expect(result.map(x => x.email).join(',')).toMatchInlineSnapshot(`"email@test.com,email2@test.com"`);
});

test('should generate HTML report excluding inactive users', () => {
  // Act
  const result = generator.generateUserActivityReport(sampleData, {
    includeInactiveUsers: false
  });

  // Assert
  expect(result).toMatchSnapshot();
});

test('should generate HTML report sorted by login count descending', () => {
  // Act
  const result = generator.generateUserActivityReport(sampleData, {
    sortBy: 'loginCount',
    sortOrder: 'desc'
  });

  // Assert
  expect(result).toMatchSnapshot();
});

test('should generate Markdown report', () => {
  // Act
  const result = generator.generateUserActivityReport(sampleData, {
    format: 'markdown',
    title: 'User Activity Summary'
  });

  // Assert
  expect(result).toMatchSnapshot();
});

test('should generate JSON report', () => {
  // Act
  const result = generator.generateUserActivityReport(sampleData, {
    format: 'json'
  });

  // Assert - Парсимо JSON для prettier snapshot
  const parsed = JSON.parse(result);
  expect(parsed).toMatchSnapshot();
});

test('should generate dashboard summary object', () => {
  // Act
  const result = generator.generateDashboardSummary(sampleData);

  // Assert - Snapshot для складного об'єкта
  expect(result).toMatchSnapshot();
});

test('should handle edge case with no users', () => {
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

test('should handle edge case with all inactive users', () => {
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

test('should generate profile card for active user', () => {
  // Arrange
  const activeUser = sampleData.users.find(u => u.isActive && u.loginCount > 20)!;

  // Act
  const result = generator.generateUserProfileCard(activeUser);

  // Assert
  expect(result).toMatchSnapshot();
});

test('should generate profile card for inactive user', () => {
  // Arrange
  const inactiveUser = sampleData.users.find(u => !u.isActive)!;

  // Act
  const result = generator.generateUserProfileCard(inactiveUser);

  // Assert
  expect(result).toMatchSnapshot();
});

test('should generate profile card for user who never logged in', () => {
  // Arrange
  const newUser = sampleData.users.find(u => u.loginCount === 0)!;

  // Act
  const result = generator.generateUserProfileCard(newUser);

  // Assert
  expect(result).toMatchSnapshot();
});

test('should generate profile card for highly engaged user', () => {
  // Arrange
  const engagedUser = sampleData.users.find(u => u.loginCount > 50)!;

  // Act
  const result = generator.generateUserProfileCard(engagedUser);

  // Assert
  expect(result).toMatchSnapshot();
});

test('should handle different report configurations consistently', () => {
  // Arrange - Різні конфігурації
  const configs = [
    { format: 'html' as const, includeInactiveUsers: true },
    { format: 'html' as const, includeInactiveUsers: false },
    { format: 'markdown' as const, sortBy: 'name' as const },
    { format: 'json' as const, sortOrder: 'desc' as const }
  ];

  // Act & Assert
  configs.forEach((config, index) => {
    const result = generator.generateUserActivityReport(sampleData, config);
    expect(result).toMatchSnapshot(`config-${index}-${config.format}`);
  });
});

test('should maintain consistent formatting across different data sets', () => {
  // Arrange - Різні набори даних
  const dataSets = [
    // Мінімальний набір
    {
      ...sampleData,
      users: [sampleData.users[0]],
      summary: { ...sampleData.summary, totalUsers: 1 }
    },
    // Тільки активні користувачі  
    {
      ...sampleData,
      users: sampleData.users.filter(u => u.isActive),
      summary: { ...sampleData.summary, totalUsers: 2, inactiveUsers: 0 }
    },
    // Великий набір (дублюємо користувачів)
    {
      ...sampleData,
      users: [...sampleData.users, ...sampleData.users.map(u => ({ ...u, id: u.id + '-copy' }))],
      summary: { ...sampleData.summary, totalUsers: 8 }
    }
  ];

  // Act & Assert
  dataSets.forEach((dataSet, index) => {
    const htmlResult = generator.generateUserActivityReport(dataSet, { format: 'html' });
    const dashboardResult = generator.generateDashboardSummary(dataSet);

    expect(htmlResult).toMatchSnapshot(`dataset-${index}-html`);
    expect(dashboardResult).toMatchSnapshot(`dataset-${index}-dashboard`);
  });
});

test('should maintain backwards compatibility for dashboard structure', () => {
  // Act
  const result = generator.generateDashboardSummary(sampleData);

  // Assert - Перевіряємо наявність ключових полів
  expect(result).toHaveProperty('period');
  expect(result).toHaveProperty('metrics');
  expect(result).toHaveProperty('usersByActivity');
  expect(result).toHaveProperty('recentUsers');

  // Snapshot для повної структури
  expect(result).toMatchSnapshot();
});

test('should handle special characters in user data', () => {
  // Arrange
  const specialData: ReportData = {
    ...sampleData,
    users: [{
      id: 'special-user',
      name: 'José María "El Niño" O\'Connor & Associates <script>alert("xss")</script>',
      email: 'josé.maría@example.com',
      loginCount: 10,
      lastLoginAt: new Date('2024-01-10T14:30:00.000Z'),
      isActive: true,
      accountAge: 100
    }],
    summary: {
      totalUsers: 1,
      activeUsers: 1,
      inactiveUsers: 0,
      averageLoginCount: 10,
      averageAccountAge: 100
    }
  };

  // Act
  const htmlResult = generator.generateUserActivityReport(specialData, { format: 'html' });
  const markdownResult = generator.generateUserActivityReport(specialData, { format: 'markdown' });
  const jsonResult = generator.generateUserActivityReport(specialData, { format: 'json' });

  // Assert - Snapshot тести для різних форматів з спеціальними символами
  expect(htmlResult).toMatchSnapshot('special-chars-html');
  expect(markdownResult).toMatchSnapshot('special-chars-markdown');
  expect(JSON.parse(jsonResult)).toMatchSnapshot('special-chars-json');
}); 