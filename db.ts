import Database from 'better-sqlite3';
import path from 'path';

const db = new Database('risksphere.db');

// Enable foreign keys
db.pragma('foreign_keys = ON');

export function initDb() {
  // Helper to add column if it doesn't exist
  const addColumnIfNotExists = (table: string, column: string, type: string) => {
    const info = db.prepare(`PRAGMA table_info(${table})`).all() as any[];
    if (!info.find(c => c.name === column)) {
      try {
        db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
        console.log(`Added column ${column} to ${table}`);
      } catch (err) {
        console.error(`Failed to add column ${column} to ${table}:`, err);
      }
    }
  };

  // Organizations table
  db.exec(`
    CREATE TABLE IF NOT EXISTS organizations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      logo_url TEXT,
      plan TEXT DEFAULT 'basic', -- basic, professional, enterprise
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      org_id INTEGER,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL, -- super_admin, risk_manager, compliance_officer, auditor, dept_manager, employee
      department TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (org_id) REFERENCES organizations(id)
    )
  `);
  addColumnIfNotExists('users', 'org_id', 'INTEGER');

  // Risks table
  db.exec(`
    CREATE TABLE IF NOT EXISTS risks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      org_id INTEGER,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL, -- operational, financial, cybersecurity, legal, compliance, strategic
      department TEXT NOT NULL,
      likelihood INTEGER NOT NULL, -- 1-5
      impact INTEGER NOT NULL, -- 1-5
      score INTEGER NOT NULL,
      priority TEXT NOT NULL, -- low, medium, high, critical
      mitigation_plan TEXT,
      owner_id INTEGER,
      status TEXT DEFAULT 'active', -- active, mitigated, closed
      review_date DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (org_id) REFERENCES organizations(id),
      FOREIGN KEY (owner_id) REFERENCES users(id)
    )
  `);
  addColumnIfNotExists('risks', 'org_id', 'INTEGER');

  // Compliance table
  db.exec(`
    CREATE TABLE IF NOT EXISTS compliance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      org_id INTEGER,
      framework TEXT NOT NULL, -- ISO 27001, SOC 2, GDPR, etc.
      requirement TEXT NOT NULL,
      description TEXT,
      owner_id INTEGER,
      status TEXT DEFAULT 'under_review', -- compliant, partially_compliant, non_compliant, under_review
      progress INTEGER DEFAULT 0,
      evidence_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (org_id) REFERENCES organizations(id),
      FOREIGN KEY (owner_id) REFERENCES users(id)
    )
  `);
  addColumnIfNotExists('compliance', 'org_id', 'INTEGER');

  // Audits table
  db.exec(`
    CREATE TABLE IF NOT EXISTS audits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      org_id INTEGER,
      title TEXT NOT NULL,
      plan_description TEXT,
      auditor_id INTEGER,
      schedule_date DATE,
      status TEXT DEFAULT 'planning', -- planning, fieldwork, review, closed
      findings TEXT,
      corrective_actions TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (org_id) REFERENCES organizations(id),
      FOREIGN KEY (auditor_id) REFERENCES users(id)
    )
  `);
  addColumnIfNotExists('audits', 'org_id', 'INTEGER');

  // Incidents table
  db.exec(`
    CREATE TABLE IF NOT EXISTS incidents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      org_id INTEGER,
      title TEXT NOT NULL,
      description TEXT,
      type TEXT NOT NULL, -- security_breach, system_outage, operational_failure, fraud
      severity TEXT NOT NULL, -- low, medium, high, critical
      reporter_id INTEGER,
      investigator_id INTEGER,
      root_cause TEXT,
      corrective_actions TEXT,
      status TEXT DEFAULT 'reported', -- reported, investigating, resolved, closed
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (org_id) REFERENCES organizations(id),
      FOREIGN KEY (reporter_id) REFERENCES users(id),
      FOREIGN KEY (investigator_id) REFERENCES users(id)
    )
  `);
  addColumnIfNotExists('incidents', 'org_id', 'INTEGER');

  // Tasks table
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      org_id INTEGER,
      title TEXT NOT NULL,
      description TEXT,
      assignee_id INTEGER,
      deadline DATE,
      status TEXT DEFAULT 'pending', -- pending, in_progress, completed, overdue
      priority TEXT DEFAULT 'medium',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (org_id) REFERENCES organizations(id),
      FOREIGN KEY (assignee_id) REFERENCES users(id)
    )
  `);
  addColumnIfNotExists('tasks', 'org_id', 'INTEGER');

  // Activity Logs
  db.exec(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      org_id INTEGER,
      user_id INTEGER,
      action TEXT NOT NULL,
      module TEXT NOT NULL,
      details TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (org_id) REFERENCES organizations(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
  addColumnIfNotExists('activity_logs', 'org_id', 'INTEGER');

  // Notifications
  db.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      org_id INTEGER,
      user_id INTEGER,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL, -- info, warning, error, success
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (org_id) REFERENCES organizations(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
  addColumnIfNotExists('notifications', 'org_id', 'INTEGER');

  // Risk Templates
  db.exec(`
    CREATE TABLE IF NOT EXISTS risk_templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      org_id INTEGER,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      department TEXT NOT NULL,
      likelihood INTEGER NOT NULL,
      impact INTEGER NOT NULL,
      mitigation_plan TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (org_id) REFERENCES organizations(id)
    )
  `);
  addColumnIfNotExists('risk_templates', 'org_id', 'INTEGER');
}

export async function seedDb() {
  const bcrypt = await import('bcryptjs');
  const hashedPassword = await bcrypt.default.hash('admin123', 10);
  
  // Create default organization
  const orgExists = db.prepare("SELECT * FROM organizations WHERE name = ?").get('RiskSphere Corp');
  let orgId = 1;
  if (!orgExists) {
    const result = db.prepare("INSERT INTO organizations (name, description, plan) VALUES (?, ?, ?)")
      .run('RiskSphere Corp', 'Global Enterprise Risk Management', 'enterprise');
    orgId = result.lastInsertRowid as number;
  } else {
    orgId = (orgExists as any).id;
  }

  // Ensure all users have an org_id if they don't (migration)
  db.prepare("UPDATE users SET org_id = ? WHERE org_id IS NULL").run(orgId);

  const userExists = db.prepare("SELECT * FROM users WHERE email = ?").get('admin@risksphere.com');
  if (!userExists) {
    db.prepare("INSERT INTO users (org_id, username, email, password, role, department) VALUES (?, ?, ?, ?, ?, ?)")
      .run(orgId, 'Admin User', 'admin@risksphere.com', hashedPassword, 'super_admin', 'Executive');
    
    // Seed some risks
    const risks = [
      [orgId, 'Data Breach Vulnerability', 'Potential unauthorized access to customer PII due to outdated firewall.', 'cybersecurity', 'IT Security', 4, 5, 20, 'critical'],
      [orgId, 'Regulatory Non-compliance', 'Failure to meet new GDPR requirements for data portability.', 'compliance', 'Legal', 3, 4, 12, 'high'],
      [orgId, 'Supply Chain Disruption', 'Single source dependency for critical server components.', 'operational', 'Operations', 3, 3, 9, 'medium']
    ];
    
    const riskStmt = db.prepare("INSERT INTO risks (org_id, title, description, category, department, likelihood, impact, score, priority, owner_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)");
    risks.forEach(r => riskStmt.run(...r));

    // Seed some compliance
    db.prepare("INSERT INTO compliance (org_id, framework, requirement, description, owner_id, status, progress) VALUES (?, ?, ?, ?, ?, ?, ?)")
      .run(orgId, 'ISO 27001', 'Access Control Policy', 'Establish, document and review an access control policy based on business and information security requirements.', 1, 'compliant', 100);

    // Seed some incidents
    const incidents = [
      [orgId, 'Unauthorized Database Access Attempt', 'Multiple failed login attempts detected from an external IP address.', 'security_breach', 'high'],
      [orgId, 'Main ERP System Downtime', 'Primary ERP system was unavailable for 45 minutes due to database lock.', 'system_outage', 'critical']
    ];
    const incidentStmt = db.prepare("INSERT INTO incidents (org_id, title, description, type, severity, reporter_id) VALUES (?, ?, ?, ?, ?, 1)");
    incidents.forEach(i => incidentStmt.run(...i));
  }
}

export default db;
