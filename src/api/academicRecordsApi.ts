/**
 * Feature: Academic Records API
 * Purpose: Handle FAP record extraction and processing
 * Backend: AcademicRecordsController.cs
 */

import axiosClient from './axiosClient';
import type { ApiResponse } from '../types/base/Api';
import type { FapRecordData } from '../types/academic';

/**
 * Extract FAP record data from HTML content
 * POST /api/academic-records/extract
 */
export const extractFapRecord = async (
  fapHtmlContent: string
): Promise<ApiResponse<FapRecordData>> => {
  return axiosClient.post('/api/academic-records/extract', {
    fapHtmlContent
  });
};