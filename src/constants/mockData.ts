import { Risk, Incident, Compliance, Audit, Task } from '../types';

export const MOCK_STATS = {
  totalRisks: 24,
  highPriorityRisks: 8,
  openAudits: 3,
  resolvedIncidents: 15,
  complianceScore: 82
};

export const MOCK_RISKS: Risk[] = [
  { id: 1, org_id: 1, title: 'Data Breach in Customer Portal', description: 'Potential vulnerability in the login system.', category: 'cybersecurity', department: 'IT', likelihood: 4, impact: 5, score: 20, priority: 'critical', mitigation_plan: 'Implement MFA and regular security audits.', owner_id: 1, owner_name: 'Demo Admin', status: 'active', review_date: '2024-06-01', created_at: '2024-01-01' },
  { id: 2, org_id: 1, title: 'Supply Chain Disruption', description: 'Key supplier facing financial difficulties.', category: 'operational', department: 'Logistics', likelihood: 3, impact: 4, score: 12, priority: 'high', mitigation_plan: 'Identify alternative suppliers.', owner_id: 1, owner_name: 'Demo Admin', status: 'active', review_date: '2024-05-15', created_at: '2024-01-10' },
  { id: 3, org_id: 1, title: 'Regulatory Compliance Update', description: 'New GDPR requirements coming into effect.', category: 'compliance', department: 'Legal', likelihood: 5, impact: 3, score: 15, priority: 'high', mitigation_plan: 'Update privacy policy and data handling procedures.', owner_id: 1, owner_name: 'Demo Admin', status: 'active', review_date: '2024-04-20', created_at: '2024-02-01' },
];

export const MOCK_INCIDENTS: Incident[] = [
  { id: 1, org_id: 1, title: 'Unauthorized Access Attempt', description: 'Multiple failed login attempts from unknown IP.', type: 'security_breach', severity: 'high', status: 'investigating', reporter_id: 1, reporter_name: 'Demo Admin', created_at: '2024-03-01' },
];

export const MOCK_COMPLIANCE: Compliance[] = [
  { id: 1, org_id: 1, framework: 'ISO 27001', requirement: 'Access Control', description: 'Ensure only authorized users have access.', status: 'compliant', progress: 100, owner_id: 1, owner_name: 'Demo Admin', created_at: '2024-01-15' },
  { id: 2, org_id: 1, framework: 'GDPR', requirement: 'Data Portability', description: 'Users must be able to download their data.', status: 'partially_compliant', progress: 60, owner_id: 1, owner_name: 'Demo Admin', created_at: '2024-02-10' },
];

export const MOCK_AUDITS: Audit[] = [
  { id: 1, org_id: 1, title: 'Annual IT Security Audit', plan_description: 'Review of all security controls.', schedule_date: '2024-04-01', status: 'planning', auditor_id: 1, auditor_name: 'Demo Admin', findings: '', corrective_actions: '', created_at: '2024-01-01' },
];

export const MOCK_TASKS: Task[] = [
  { id: 1, org_id: 1, title: 'Review Firewall Logs', description: 'Check for any suspicious activity.', deadline: '2024-03-15', priority: 'high', status: 'pending', assignee_id: 1, assignee_name: 'Demo Admin', created_at: '2024-03-01' },
];
