// src/components/execute/execute-common.ts

// Interfaces
export interface Command {
    id: string;
    name: string;
    group: string;
  }
  
  export interface Agent {
    id: string;
    name: string;
    ipAddress: string;
    status: string;
    tags: string[];
  }
  
  export interface Credential {
    id: number;
    name: string;
  }
  
  // Command Constants
  export const COMMANDS: Command[] = [
    { id: 'db_1', name: 'Cubrid 1.1', group: 'DATABASE' },
    { id: 'db_2', name: 'MariaDB Unix 1.0', group: 'DATABASE' },
    { id: 'db_3', name: 'MariaDB Unix 1.5', group: 'DATABASE' },
    { id: 'db_4', name: 'MariaDB Windows 1.4', group: 'DATABASE' },
    { id: 'db_5', name: 'MSSQL 1.3', group: 'DATABASE' },
    { id: 'db_6', name: 'MySQL Unix 1.3', group: 'DATABASE' },
    { id: 'db_7', name: 'MySQL Unix 1.5', group: 'DATABASE' },
    { id: 'db_8', name: 'MySQL Windows 1.7', group: 'DATABASE' },
    { id: 'db_9', name: 'Oracle Unix 1.6', group: 'DATABASE' },
    { id: 'db_10', name: 'Oracle Windows 1.6', group: 'DATABASE' },
    { id: 'db_11', name: 'PostgreSQL Unix 1.1', group: 'DATABASE' },
    { id: 'db_12', name: 'PostgreSQL Windows 1.1', group: 'DATABASE' },
    { id: 'db_13', name: 'Tibero Unix 1.2', group: 'DATABASE' },
    { id: 'db_14', name: 'Tibero 1.2', group: 'DATABASE' },
    { id: 'pc_1', name: 'Mac', group: 'PC' },
    { id: 'pc_2', name: 'Windows', group: 'PC' },
    { id: 'server_1', name: 'KVM', group: 'SERVER' },
    { id: 'server_2', name: 'Linux', group: 'SERVER' },
    { id: 'server_3', name: 'Windows', group: 'SERVER' },
    { id: 'was_1', name: 'Node.js', group: 'WAS' },
    { id: 'was_2', name: 'Tomcat', group: 'WAS' },
    { id: 'web_1', name: 'Apache', group: 'WEB' },
    { id: 'web_2', name: 'Nginx', group: 'WEB' }
  ];
    
  export const ALL_COMMANDS: Command[] = [
    ...COMMANDS
  ];