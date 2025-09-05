declare module 'facebook-nodejs-business-sdk' {
  export class FacebookAdsApi {
    static init(accessToken: string): FacebookAdsApi;
    setDebug(debug: boolean): void;
  }

  export class AdAccount {
    constructor(id: string);
    getCampaigns(fields: string[], params?: any): Promise<Campaign[]>;
    createCampaign(fields: string[], params: any): Promise<Campaign>;
  }

  export class Campaign {
    constructor(id: string | null);
    id: string;
    name: string;
    status: string;
    objective: string;
    daily_budget: number;
    lifetime_budget: number;
    start_time: string;
    end_time: string;
    getAdSets(fields: string[], params?: any): Promise<AdSet[]>;
    getInsights(fields: string[], params?: any): Promise<any[]>;
    update(params: any): Promise<void>;
  }

  export class AdSet {
    constructor(id: string | null);
    id: string;
    name: string;
    status: string;
    campaign_id: string;
    getAds(fields: string[], params?: any): Promise<Ad[]>;
  }

  export class Ad {
    constructor(id: string | null);
    id: string;
    name: string;
    status: string;
    adset_id: string;
    getInsights(fields: string[], params?: any): Promise<any[]>;
  }
}