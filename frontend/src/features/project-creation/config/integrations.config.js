export const INTEGRATION_CATEGORIES = [
  'Project Management',
  'Development',
  'Documentation',
  'Cloud Infrastructure',
  'Database',
  'Communication',
  'Deployment',
  'Monitoring',
  'Security',
  'AI Services'
];

export const INTEGRATIONS_TEMPLATE = [
  {
    id: 'jira',
    category: 'Project Management',
    service: 'Jira',
    description: 'Workspace and project issue tracking',
    icon: 'task_alt',
    status: 'Pending',
    fields: [
      { key: 'workspaceUrl', label: 'Workspace URL', type: 'url', value: '' },
      { key: 'projectKey', label: 'Project Key', type: 'text', value: '' },
      { key: 'projectName', label: 'Project Name', type: 'text', value: '' },
      { key: 'sprintBoard', label: 'Sprint Board', type: 'text', value: '' },
      { key: 'projectAdmin', label: 'Project Administrator', type: 'text', value: '' },
      { key: 'workflow', label: 'Workflow', type: 'text', value: '' },
      { key: 'issueTypes', label: 'Issue Types', type: 'text', value: '' }
    ]
  },
  {
    id: 'github',
    category: 'Development',
    service: 'GitHub',
    description: 'Source code repository for client developers',
    icon: 'code',
    status: 'Pending',
    fields: [
      { key: 'organization', label: 'Organization', type: 'text', value: '' },
      { key: 'repository', label: 'Repository', type: 'text', value: '' },
      { key: 'repositoryUrl', label: 'Repository URL', type: 'url', value: '' },
      { key: 'defaultBranch', label: 'Default Branch', type: 'text', value: '' },
      { key: 'repositoryOwner', label: 'Repository Owner', type: 'text', value: '' },
      { key: 'visibility', label: 'Visibility', type: 'text', value: '' }
    ]
  },
  {
    id: 'confluence',
    category: 'Documentation',
    service: 'Confluence',
    description: 'Central documentation repository',
    icon: 'description',
    status: 'Pending',
    fields: [
      { key: 'workspaceUrl', label: 'Workspace URL', type: 'url', value: '' },
      { key: 'spaceName', label: 'Space Name', type: 'text', value: '' },
      { key: 'spaceKey', label: 'Space Key', type: 'text', value: '' },
      { key: 'homepage', label: 'Homepage', type: 'text', value: '' },
      { key: 'documentationOwner', label: 'Documentation Owner', type: 'text', value: '' }
    ]
  },
  {
    id: 'aws',
    category: 'Cloud Infrastructure',
    service: 'AWS',
    description: 'Application hosting environment',
    icon: 'cloud',
    status: 'Pending',
    fields: [
      { key: 'awsAccountId', label: 'AWS Account ID', type: 'password', value: '' },
      { key: 'accountAlias', label: 'Account Alias', type: 'text', value: '' },
      { key: 'environment', label: 'Environment', type: 'text', value: '' },
      { key: 'region', label: 'Region', type: 'text', value: '' },
      { key: 'iamRole', label: 'IAM Role', type: 'text', value: '' },
      { key: 'vpc', label: 'VPC', type: 'text', value: '' },
      { key: 's3Bucket', label: 'S3 Bucket', type: 'text', value: '' },
      { key: 'cloudwatchDashboard', label: 'CloudWatch Dashboard', type: 'url', value: '' },
      { key: 'consoleUrl', label: 'Console URL', type: 'url', value: '' }
    ]
  },
  {
    id: 'postgresql',
    category: 'Database',
    service: 'PostgreSQL',
    description: 'Relational database service',
    icon: 'database',
    status: 'Pending',
    fields: [
      { key: 'databaseName', label: 'Database Name', type: 'text', value: '' },
      { key: 'host', label: 'Host', type: 'url', value: '' },
      { key: 'port', label: 'Port', type: 'text', value: '' },
      { key: 'environment', label: 'Environment', type: 'text', value: '' },
      { key: 'backupPolicy', label: 'Backup Policy', type: 'text', value: '' }
    ]
  },
  {
    id: 'slack',
    category: 'Communication',
    service: 'Slack',
    description: 'Team collaboration and updates',
    icon: 'forum',
    status: 'Pending',
    fields: [
      { key: 'workspace', label: 'Workspace', type: 'text', value: '' },
      { key: 'channel', label: 'Channel', type: 'text', value: '' },
      { key: 'inviteLink', label: 'Invite Link', type: 'url', value: '' },
      { key: 'owner', label: 'Owner', type: 'text', value: '' }
    ]
  },
  {
    id: 'vercel',
    category: 'Deployment',
    service: 'Vercel',
    description: 'Frontend hosting and deployment',
    icon: 'rocket_launch',
    status: 'Pending',
    fields: [
      { key: 'project', label: 'Project', type: 'text', value: '' },
      { key: 'productionUrl', label: 'Production URL', type: 'url', value: '' },
      { key: 'previewUrl', label: 'Preview URL', type: 'url', value: '' },
      { key: 'customDomain', label: 'Custom Domain', type: 'url', value: '' }
    ]
  },
  {
    id: 'grafana',
    category: 'Monitoring',
    service: 'Grafana',
    description: 'Dashboarding and metrics',
    icon: 'monitoring',
    status: 'Pending',
    fields: [
      { key: 'grafanaDashboard', label: 'Grafana Dashboard', type: 'url', value: '' },
      { key: 'sentryProject', label: 'Sentry Project', type: 'text', value: '' },
      { key: 'datadogWorkspace', label: 'Datadog Workspace', type: 'text', value: '' }
    ]
  },
  {
    id: 'security',
    category: 'Security',
    service: 'Security Setup',
    description: 'Identity and access management',
    icon: 'security',
    status: 'Pending',
    fields: [
      { key: 'vpnAccess', label: 'VPN Access', type: 'boolean', value: 'false' },
      { key: 'ssoEnabled', label: 'SSO Enabled', type: 'boolean', value: 'false' },
      { key: 'mfaEnabled', label: 'MFA Enabled', type: 'boolean', value: 'false' },
      { key: 'iamGroup', label: 'IAM Group', type: 'text', value: '' },
      { key: 'securityContact', label: 'Security Contact', type: 'text', value: '' }
    ]
  },
  {
    id: 'openai',
    category: 'AI Services',
    service: 'OpenAI',
    description: 'Generative AI API integration',
    icon: 'smart_toy',
    status: 'Pending',
    fields: [
      { key: 'apiKey', label: 'API Key', type: 'password', value: '' },
      { key: 'model', label: 'Model', type: 'text', value: '' },
      { key: 'organization', label: 'Organization', type: 'text', value: '' },
      { key: 'vectorDatabase', label: 'Vector Database', type: 'text', value: '' },
      { key: 'pinecone', label: 'Pinecone Index', type: 'text', value: '' },
      { key: 'redis', label: 'Redis Cache', type: 'text', value: '' }
    ]
  }
];

export const generateMockValue = (key, service, type, projectData) => {
  const prefix = (projectData?.projectName || 'Project').toLowerCase().replace(/\s+/g, '-');
  const uuid = crypto.randomUUID().split('-')[0];
  
  if (key.toLowerCase().includes('url') || key === 'host' || key === 'homepage' || type === 'url') {
    return `https://${prefix}-${uuid}.${service.toLowerCase().replace(/\s+/g, '')}.com`;
  }
  if (key.toLowerCase().includes('id') && service === 'AWS') {
    return Math.floor(100000000000 + Math.random() * 900000000000).toString();
  }
  if (key.toLowerCase().includes('key') && !key.toLowerCase().includes('project') && !key.toLowerCase().includes('space')) {
    return `sk_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}`;
  }
  if (key === 'projectKey' || key === 'spaceKey') {
    return (projectData?.projectName?.substring(0, 3) || 'PRJ').toUpperCase() + uuid.substring(0,2).toUpperCase();
  }
  if (type === 'boolean') {
    return 'true';
  }
  return `${prefix}-${key}-${uuid}`;
};
