/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Member {
  id: string;
  name: string;
  capacity: number;
}

export interface Project {
  id: string;
  name: string;
  effort: number;
}

export interface Assignment {
  id: string;
  memberId: string;
  projectId: string;
  manDays: number;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}
