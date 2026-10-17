/**
 * Google Cloud Places API (New) and PageSpeed Insights API v5 client integration
 */

import { PageSpeedScores } from '../types';

export interface PlacesNewResponse {
  places?: Array<{
    id: string;
    displayName?: { text: string; languageCode?: string };
    formattedAddress?: string;
    location?: { latitude: number; longitude: number };
    nationalPhoneNumber?: string;
    internationalPhoneNumber?: string;
    websiteUri?: string;
    rating?: number;
    userRatingCount?: number;
    primaryTypeDisplayName?: { text: string };
    types?: string[];
    googleMapsUri?: string;
    businessStatus?: 'OPERATIONAL' | 'CLOSED_TEMPORARILY' | 'CLOSED_PERMANENTLY';
  }>;
  nextPageToken?: string;
}

export class GoogleCloudService {
  /**
   * Places API (New) Text Search
   * POST https://places.googleapis.com/v1/places:searchText
   */
  static async searchPlaces(
    textQuery: string,
    apiKey: string,
    pageToken?: string,
    regionCode = 'CO'
  ): Promise<PlacesNewResponse> {
    if (!apiKey) {
      throw new Error('No se ha configurado la clave de Google Cloud API en Ajustes.');
    }

    const fieldMask = [
      'places.id',
      'places.displayName',
      'places.formattedAddress',
      'places.location',
      'places.nationalPhoneNumber',
      'places.internationalPhoneNumber',
      'places.websiteUri',
      'places.rating',
      'places.userRatingCount',
      'places.primaryTypeDisplayName',
      'places.types',
      'places.googleMapsUri',
      'places.businessStatus',
      'nextPageToken',
    ].join(',');

    const body: Record<string, any> = {
      textQuery,
      languageCode: 'es',
      regionCode,
      pageSize: 20,
    };

    if (pageToken) {
      body.pageToken = pageToken;
    }

    const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': fieldMask,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const message = errData?.error?.message || `Error ${response.status}: ${response.statusText}`;
      throw new Error(`Error en Places API: ${message}`);
    }

    return await response.json();
  }

  /**
   * PageSpeed Insights API v5
   * GET https://www.googleapis.com/pagespeedonline/v5/runPagespeed
   */
  static async runPageSpeed(url: string, apiKey?: string): Promise<PageSpeedScores> {
    if (!url) {
      throw new Error('Se requiere una URL para ejecutar PageSpeed.');
    }

    const params = new URLSearchParams({
      url,
      strategy: 'mobile',
      category: 'performance',
    });
    // Add additional categories
    params.append('category', 'seo');
    params.append('category', 'accessibility');
    params.append('category', 'best-practices');

    if (apiKey) {
      params.append('key', apiKey);
    }

    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${params.toString()}`;

    const response = await fetch(apiUrl);
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const message = errData?.error?.message || `Error ${response.status}: ${response.statusText}`;
      throw new Error(`Error en PageSpeed Insights: ${message}`);
    }

    const data = await response.json();
    const lighthouse = data.lighthouseResult;

    const performance = Math.round((lighthouse?.categories?.performance?.score ?? 0.5) * 100);
    const seo = Math.round((lighthouse?.categories?.seo?.score ?? 0.7) * 100);
    const accessibility = Math.round((lighthouse?.categories?.accessibility?.score ?? 0.7) * 100);
    const bestPractices = Math.round((lighthouse?.categories?.['best-practices']?.score ?? 0.7) * 100);

    const screenshotData = lighthouse?.audits?.['final-screenshot']?.details?.data;

    return {
      performance,
      seo,
      accessibility,
      bestPractices,
      screenshotBase64: screenshotData,
    };
  }
}
