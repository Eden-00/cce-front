// src/api/services.ts
import apiClient from './axios';
import { CREDENTIAL_ENDPOINTS, RESULT_ENDPOINTS, AGENT_ENDPOINTS, EXECUTE_ENDPOINTS } from './endpoints';

// 자격 증명 데이터 인터페이스
export interface CredentialData {
  name: string;
  host: string;
  database_type: string;
  auth_type: string;
  username: string;
  password: string;
  database_port: string | number;
}

// 자격 증명 응답 인터페이스
export interface CredentialResponse {
  status: string;
  credential?: {
    id: number;
    name: string;
    host: string;
    database_type: string;
    auth_type: string;
    username: string;
    password: string;
    database_port: number;
    created: string;
    created_by?: string;
    last_used_by?: string;
  };
  credentials?: Array<{
    id: number;
    name: string;
    host: string;
    database_type: string;
    auth_type: string;
    username: string;
    password: string;
    database_port: number;
    created: string;
    created_by?: string;
    last_used_by?: string;
  }>;
}

// 자격 증명(Credential) 관련 API 서비스
export const CredentialService = {
  // 모든 자격 증명 가져오기
  getAll: async (): Promise<CredentialResponse> => {
    const response = await apiClient.get(CREDENTIAL_ENDPOINTS.GET_ALL);
    return response.data;
  },
  
  // ID로 자격 증명 가져오기
  getById: async (id: string | number): Promise<CredentialResponse> => {
    const response = await apiClient.post<AgentData>(AGENT_ENDPOINTS.GET_BY_ID, { id });
    return response.data;
  },
  
  // 새 자격 증명 생성하기
  create: async (data: CredentialData): Promise<CredentialResponse> => {
    const response = await apiClient.post(CREDENTIAL_ENDPOINTS.CREATE, data);
    return response.data;
  },
  
  // 기존 자격 증명 업데이트하기
  update: async (id: string | number, data: CredentialData): Promise<CredentialResponse> => {
    const response = await apiClient.put(CREDENTIAL_ENDPOINTS.UPDATE(id), data);
    return response.data;
  },
  
  // 자격 증명 삭제하기
  delete: async (id: string | number): Promise<CredentialResponse> => {
    const response = await apiClient.delete(CREDENTIAL_ENDPOINTS.DELETE(id));
    return response.data;
  }
};

// 실행 결과 인터페이스
export interface ResultData {
  id: string;
  agent: string;
  executionTime: string;
  fileName: string;
  status: string;
}

// 실행 결과 응답 인터페이스
export interface ResultListResponse {
  status: string;
  results: Array<{
    id: string;
    agent: string;
    execution_time: string;
    file_name: string;
    status: string;
  }>;
}

// 파일 내용 응답 인터페이스
export interface FileContentResponse {
  status: string;
  content: string;
  file_name: string;
}

// 실행 결과(Result) 관련 API 서비스
export const ResultService = {
  // 모든 실행 결과 가져오기
  getAll: async (): Promise<ResultData[]> => {
    try {
      const response = await apiClient.get<ResultListResponse>(RESULT_ENDPOINTS.GET_ALL);
      
      if (response.data.status === 'success') {
        // API 응답 데이터를 컴포넌트에서 사용하는 형식으로 변환
        return response.data.results.map(item => ({
          id: item.id,
          agent: item.agent,
          executionTime: item.execution_time,
          fileName: item.file_name,
          status: item.status
        }));
      }
      return [];
    } catch (error) {
      console.error('실행 결과 조회 오류:', error);
      throw error;
    }
  },
  
  // 파일 내용 가져오기
  getFileContent: async (id: string | number): Promise<string> => {
    try {
      const response = await apiClient.get<FileContentResponse>(RESULT_ENDPOINTS.GET_FILE_CONTENT(id));
      
      if (response.data.status === 'success') {
        return response.data.content;
      }
      return '';
    } catch (error) {
      console.error('파일 내용 조회 오류:', error);
      throw error;
    }
  }
};

// 에이전트 인터페이스
export interface AgentData {
  id: string;
  name: string;
  agent_id: string;
  os: string;
  os_version: string;
  ip: string;
  purpose: string;
  admin: string;
  last_active: string | null;
  tags: string[];
  status: string;
}

// 에이전트 업데이트 요청 인터페이스
export interface AgentUpdateRequest {
  agent_id: string;
  name: string;
  ip: string;
  os: string;
  os_version: string;
  last_active: string | null;
  purpose: string;
  admin: string;
  tags: string[];
  status: string;
}

// 에이전트 응답 인터페이스
export interface AgentListResponse {
  status: string;
  data: Array<AgentData>;
}

// 에이전트 업데이트 응답 인터페이스
export interface AgentUpdateResponse {
  status: string;
  message: string;
  data?: AgentData;
}

// 에이전트 삭제 요청 인터페이스
export interface AgentDeleteRequest {
  agent_id: string;
}

// 에이전트 삭제 응답 인터페이스
export interface AgentDeleteResponse {
  status: string;
  message: string;
}

// 에이전트(Agent) 관련 API 서비스
export const AgentService = {
  // 모든 에이전트 가져오기
  getAll: async (): Promise<AgentData[]> => {
    try {
      const response = await apiClient.get<AgentListResponse>(AGENT_ENDPOINTS.GET_ALL);
      
      if (response.data && response.data.status === 'success' && Array.isArray(response.data.data)) {
        // API 응답 데이터를 컴포넌트에서 사용하는 형식으로 변환
        return response.data.data.map(item => ({
          id: item.id,
          name: item.name || 'Unknown',
          agent_id: item.agent_id,
          os: item.os || '',
          os_version: item.os_version || '',
          ip: item.ip || '',
          purpose: item.purpose || '',
          admin: item.admin || '',
          last_active: item.last_active,
          tags: item.tags || [],
          status: item.status || 'offline'
        }));
      }
      console.error('API 응답 구조가 예상과 다릅니다:', response.data);
      return [];
    } catch (error) {
      console.error('에이전트 목록 조회 오류:', error);
      throw error;
    }
  },
  
  // ID로 에이전트 가져오기 
  getById: async (agent_id: string | number): Promise<AgentData | null> => {
    try {
      const response = await apiClient.post<AgentData>(
        AGENT_ENDPOINTS.GET_BY_ID, 
        { agent_id }, // body로 전송
        { 
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      if (response.data.status === 'success') {
        const item = response.data;
        return {
          id: item.id,
          name: item.name,          
          agent_id: item.agent_id,
          os: item.os,
          os_version: item.os_version,
          ip: item.ip,
          purpose: item.purpose,
          admin: item.admin,
          last_active: item.last_active,
          tags: item.tags,
          status: item.status
        };
      }
      return null;
    } catch (error) {
      console.error('에이전트 조회 오류:', error);
      throw error;
    }
  },

  // 에이전트 정보 업데이트
  updateAgent: async (data: AgentUpdateRequest): Promise<AgentUpdateResponse> => {
    try {
      const response = await apiClient.post<AgentUpdateResponse>(
        AGENT_ENDPOINTS.UPDATE_AGENT,
        data,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('에이전트 정보 업데이트 오류:', error);
      throw error;
    }
  },

  // 에이전트 삭제
  deleteAgent: async (agent_id: string): Promise<AgentDeleteResponse> => {
    try {
      const response = await apiClient.delete<AgentDeleteResponse>(
        AGENT_ENDPOINTS.DELETE,
        {
          data: { agent_id },
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('에이전트 삭제 오류:', error);
      throw error;
    }
  }
};

// 다른 API 서비스들은 필요에 따라 추가할 수 있습니다.

// Execute Agent Request Interface
// Execute Agent Request Interface 수정
export interface ExecuteAgentRequest {
  agent_id: string;
  execution_time: string; // ISO 문자열 형식 (예: 2025-03-11T14:48)
  select_credential: string | null; // 자격 증명 ID
  command: string[]; // 실행할 명령어 ID 배열
  db_folder?: string; // 선택적 DB 폴더 경로
  queue?: string; // 선택적 큐 이름
}

// ExecuteAgentService 수정
export const ExecuteAgentService = {
  executeAgent: async (data: ExecuteAgentRequest): Promise<any> => {
    try {
      // URLSearchParams 객체를 사용하여 form 데이터 형식으로 변환
      const params = new URLSearchParams();
      params.append('agent_id', data.agent_id);
      
      if (data.execution_time) {
        params.append('execution_time', data.execution_time);
      }
      
      if (data.select_credential) {
        params.append('select_credential', data.select_credential);
      }
      
      // 선택적 필드 추가
      if (data.db_folder) {
        params.append('db_folder', data.db_folder);
      }
      
      if (data.queue) {
        params.append('queue', data.queue);
      }
      
      // 명령어 배열을 JSON 문자열로 변환하여 추가
      params.append('command', JSON.stringify(data.command));
      
      const response = await apiClient.post(EXECUTE_ENDPOINTS.EXECUTE_AGENT, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error executing agent:', error);
      throw error;
    }
  }
};