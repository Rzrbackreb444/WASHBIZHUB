import { google } from 'googleapis';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    console.log('Google Sheets: X_REPLIT_TOKEN not available, skipping sync');
    return null;
  }

  try {
    connectionSettings = await fetch(
      'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=google-sheet',
      {
        headers: {
          'Accept': 'application/json',
          'X_REPLIT_TOKEN': xReplitToken
        }
      }
    ).then(res => res.json()).then(data => data.items?.[0]);

    const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

    if (!connectionSettings || !accessToken) {
      console.log('Google Sheets: Not connected');
      return null;
    }
    return accessToken;
  } catch (error) {
    console.error('Google Sheets: Error getting access token', error);
    return null;
  }
}

async function getGoogleSheetsClient() {
  const accessToken = await getAccessToken();
  if (!accessToken) return null;

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken
  });

  return google.sheets({ version: 'v4', auth: oauth2Client });
}

const FUNDING_LEADS_SPREADSHEET_ID = process.env.FUNDING_LEADS_SHEET_ID;

export async function appendFundingLead(leadData: {
  timestamp: string;
  name: string;
  email: string;
  phone?: string;
  loanAmount: string;
  loanPurpose: string;
  creditScore: string;
  creditScoreNumeric?: number;
  timeInBusiness: string;
  annualRevenue?: string;
  urgency: string;
  topMatches: string;
  matchScores: string;
  source: string;
}) {
  try {
    const sheets = await getGoogleSheetsClient();
    if (!sheets || !FUNDING_LEADS_SPREADSHEET_ID) {
      console.log('Google Sheets: Skipping lead sync (not configured)');
      return false;
    }

    const values = [[
      leadData.timestamp,
      leadData.name,
      leadData.email,
      leadData.phone || '',
      leadData.loanAmount,
      leadData.loanPurpose,
      leadData.creditScore,
      leadData.creditScoreNumeric || '',
      leadData.timeInBusiness,
      leadData.annualRevenue || '',
      leadData.urgency,
      leadData.topMatches,
      leadData.matchScores,
      leadData.source
    ]];

    await sheets.spreadsheets.values.append({
      spreadsheetId: FUNDING_LEADS_SPREADSHEET_ID,
      range: 'Leads!A:N',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values }
    });

    console.log('Google Sheets: Lead appended successfully');
    return true;
  } catch (error) {
    console.error('Google Sheets: Error appending lead', error);
    return false;
  }
}

export async function appendAffiliateClick(clickData: {
  timestamp: string;
  partnerId: string;
  partnerName: string;
  userId?: string;
  creditScore?: string;
  loanAmount?: string;
  loanPurpose?: string;
  sessionId?: string;
}) {
  try {
    const sheets = await getGoogleSheetsClient();
    if (!sheets || !FUNDING_LEADS_SPREADSHEET_ID) {
      console.log('Google Sheets: Skipping click sync (not configured)');
      return false;
    }

    const values = [[
      clickData.timestamp,
      clickData.partnerId,
      clickData.partnerName,
      clickData.userId || 'anonymous',
      clickData.creditScore || '',
      clickData.loanAmount || '',
      clickData.loanPurpose || '',
      clickData.sessionId || ''
    ]];

    await sheets.spreadsheets.values.append({
      spreadsheetId: FUNDING_LEADS_SPREADSHEET_ID,
      range: 'Clicks!A:H',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values }
    });

    console.log('Google Sheets: Click appended successfully');
    return true;
  } catch (error) {
    console.error('Google Sheets: Error appending click', error);
    return false;
  }
}
