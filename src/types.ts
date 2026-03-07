export type Role = 'super_admin' | 'risk_manager' | 'compliance_officer' | 'auditor' | 'dept_manager' | 'employee';

export interface User {
  id: number;
  org_id: number;
  username: string;
  email: string;
  role: Role;
  department: string;
  created_at?: string;
}

export interface Risk {
  id: number;
  org_id: number;
  title: string;
  description: string;
  category: 'operational' | 'financial' | 'cybersecurity' | 'legal' | 'compliance' | 'strategic';
  department: string;
  likelihood: number;
  impact: number;
  score: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  mitigation_plan: string;
  owner_id: number;
  owner_name?: string;
  status: 'active' | 'mitigated' | 'closed';
  review_date: string;
  created_at: string;
}

export interface Compliance {
  id: number;
  org_id: number;
  framework: string;
  requirement: string;
  description: string;
  owner_id: number;
  owner_name?: string;
  status: 'compliant' | 'partially_compliant' | 'non_compliant' | 'under_review';
  progress: number;
  evidence_url?: string;
  created_at: string;
}

export interface Audit {
  id: number;
  org_id: number;
  title: string;
  plan_description: string;
  auditor_id: number;
  auditor_name?: string;
  schedule_date: string;
  status: 'planning' | 'fieldwork' | 'review' | 'closed';
  findings: string;
  corrective_actions: string;
  created_at: string;
}

export interface Incident {
  id: number;
  org_id: number;
  title: string;
  description: string;
  type: 'security_breach' | 'system_outage' | 'operational_failure' | 'fraud';
  severity: 'low' | 'medium' | 'high' | 'critical';
  reporter_id: number;
  reporter_name?: string;
  investigator_id?: number;
  investigator_name?: string;
  root_cause?: string;
  corrective_actions?: string;
  status: 'reported' | 'investigating' | 'resolved' | 'closed';
  created_at: string;
}

export interface Task {
  id: number;
  org_id: number;
  title: string;
  description: string;
  assignee_id: number;
  assignee_name?: string;
  deadline: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
}
