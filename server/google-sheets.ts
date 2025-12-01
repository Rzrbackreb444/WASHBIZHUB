// Google Sheets Integration for WashBizHub Calculators
// Using Replit's Google Sheets connector

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
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

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
    throw new Error('Google Sheet not connected');
  }
  return accessToken;
}

export async function getGoogleSheetsClient() {
  const accessToken = await getAccessToken();

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken
  });

  return google.sheets({ version: 'v4', auth: oauth2Client });
}

export async function getGoogleDriveClient() {
  const accessToken = await getAccessToken();

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken
  });

  return google.drive({ version: 'v3', auth: oauth2Client });
}

// Calculator template definitions
export const CALCULATOR_TEMPLATES = {
  valuation: {
    title: 'WashBizHub - Business Valuation Calculator',
    sheets: [
      {
        name: 'Valuation Calculator',
        headers: ['Business Valuation Calculator', '', '', ''],
        data: [
          ['', '', '', ''],
          ['INCOME DATA', '', '', ''],
          ['Annual Gross Revenue', '$0', '', 'Enter your annual revenue'],
          ['Cost of Goods Sold', '$0', '', 'Direct costs (supplies, utilities)'],
          ['Gross Profit', '=B3-B4', '', 'Calculated automatically'],
          ['Operating Expenses', '$0', '', 'Rent, labor, insurance, etc.'],
          ['Owner Salary Add-back', '$0', '', 'Owner compensation to add back'],
          ['Depreciation Add-back', '$0', '', 'Non-cash depreciation expense'],
          ['Interest Add-back', '$0', '', 'Loan interest payments'],
          ['One-time Expense Add-back', '$0', '', 'Non-recurring expenses'],
          ['', '', '', ''],
          ["Seller's Discretionary Earnings (SDE)", '=B5-B6+B7+B8+B9+B10', '', 'Key valuation metric'],
          ['', '', '', ''],
          ['VALUATION MULTIPLES', '', '', ''],
          ['Low Multiple (2.0x)', '=B12*2', '', 'Conservative valuation'],
          ['Mid Multiple (2.5x)', '=B12*2.5', '', 'Market average'],
          ['High Multiple (3.0x)', '=B12*3', '', 'Premium valuation'],
          ['', '', '', ''],
          ['ASSET-BASED VALUATION', '', '', ''],
          ['Equipment Value', '$0', '', 'Current equipment value'],
          ['Inventory', '$0', '', 'Supplies and inventory'],
          ['Leasehold Improvements', '$0', '', 'Build-out value'],
          ['Total Asset Value', '=B20+B21+B22', '', 'Asset-based floor'],
          ['', '', '', ''],
          ['RECOMMENDED RANGE', '', '', ''],
          ['Minimum Value', '=MAX(B15,B23)', '', 'Higher of SDE or assets'],
          ['Maximum Value', '=B17', '', 'Premium SDE multiple'],
        ]
      }
    ]
  },
  roi: {
    title: 'WashBizHub - ROI Calculator',
    sheets: [
      {
        name: 'ROI Calculator',
        headers: ['Return on Investment Calculator', '', '', ''],
        data: [
          ['', '', '', ''],
          ['INVESTMENT DATA', '', '', ''],
          ['Purchase Price', '$0', '', 'Total acquisition cost'],
          ['Down Payment', '$0', '', 'Cash investment'],
          ['Loan Amount', '=B3-B4', '', 'Financing amount'],
          ['Interest Rate', '7%', '', 'Annual interest rate'],
          ['Loan Term (Years)', '10', '', 'Loan duration'],
          ['', '', '', ''],
          ['ANNUAL INCOME', '', '', ''],
          ['Gross Revenue', '$0', '', 'Total annual revenue'],
          ['Operating Expenses', '$0', '', 'All operating costs'],
          ['Net Operating Income', '=B10-B11', '', 'NOI before debt'],
          ['Annual Debt Service', '=PMT(B6/12,B7*12,-B5)*12', '', 'Loan payments'],
          ['Cash Flow After Debt', '=B12-B13', '', 'Net cash to owner'],
          ['', '', '', ''],
          ['ROI METRICS', '', '', ''],
          ['Cash-on-Cash Return', '=B14/B4', '', 'Annual return on cash invested'],
          ['Cap Rate', '=B12/B3', '', 'NOI / Purchase Price'],
          ['Payback Period (Years)', '=B4/B14', '', 'Years to recover investment'],
          ['', '', '', ''],
          ['5-YEAR PROJECTION', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
          ['Annual Cash Flow', '=B14', '=B14*1.03', '=C21*1.03', '=D21*1.03', '=E21*1.03'],
          ['Cumulative Cash Flow', '=B21', '=B22+C21', '=C22+D21', '=D22+E21', '=E22+F21'],
          ['Total 5-Year Return', '=F22', '', '', '', ''],
        ]
      }
    ]
  },
  startup: {
    title: 'WashBizHub - Startup Costs Calculator',
    sheets: [
      {
        name: 'Startup Costs',
        headers: ['Laundromat Startup Cost Calculator', '', '', ''],
        data: [
          ['', '', '', ''],
          ['EQUIPMENT COSTS', 'Quantity', 'Unit Cost', 'Total'],
          ['Commercial Washers (20-80 lb)', '0', '$5,000', '=B3*C3'],
          ['Commercial Dryers (30-75 lb)', '0', '$4,000', '=B4*C4'],
          ['Coin/Card Payment Systems', '0', '$500', '=B5*C5'],
          ['Folding Tables', '0', '$300', '=B6*C6'],
          ['Seating', '0', '$200', '=B7*C7'],
          ['Vending Machines', '0', '$3,000', '=B8*C8'],
          ['Equipment Subtotal', '', '', '=SUM(D3:D8)'],
          ['', '', '', ''],
          ['BUILD-OUT COSTS', '', 'Estimate', ''],
          ['Lease Deposit (3 months)', '', '$0', ''],
          ['Plumbing Installation', '', '$15,000', ''],
          ['Electrical Upgrades', '', '$10,000', ''],
          ['HVAC System', '', '$8,000', ''],
          ['Flooring', '', '$5,000', ''],
          ['Painting & Finishes', '', '$3,000', ''],
          ['Signage', '', '$2,500', ''],
          ['Security System', '', '$2,000', ''],
          ['Build-out Subtotal', '', '=SUM(C12:C19)', ''],
          ['', '', '', ''],
          ['OPERATING CAPITAL', '', 'Estimate', ''],
          ['3 Months Rent Reserve', '', '$0', ''],
          ['3 Months Utilities Reserve', '', '$3,000', ''],
          ['Initial Supplies', '', '$1,500', ''],
          ['Marketing Launch', '', '$2,500', ''],
          ['Insurance (Annual)', '', '$5,000', ''],
          ['Licenses & Permits', '', '$1,000', ''],
          ['Operating Capital Subtotal', '', '=SUM(C23:C28)', ''],
          ['', '', '', ''],
          ['TOTAL STARTUP COSTS', '', '=D9+C20+C29', ''],
          ['Contingency (10%)', '', '=C31*0.1', ''],
          ['GRAND TOTAL', '', '=C31+C32', ''],
        ]
      }
    ]
  },
  operations: {
    title: 'WashBizHub - Operating Costs Calculator',
    sheets: [
      {
        name: 'Operating Costs',
        headers: ['Monthly Operating Costs Calculator', '', '', ''],
        data: [
          ['', '', '', ''],
          ['FIXED COSTS', 'Monthly', 'Annual', 'Notes'],
          ['Rent', '$0', '=B3*12', 'Base rent payment'],
          ['Insurance', '$0', '=B4*12', 'Liability + property'],
          ['Loan Payment', '$0', '=B5*12', 'Equipment financing'],
          ['Phone/Internet', '$150', '=B6*12', 'Business services'],
          ['POS/Software', '$100', '=B7*12', 'Payment processing'],
          ['Security Monitoring', '$50', '=B8*12', 'Alarm service'],
          ['Fixed Costs Subtotal', '=SUM(B3:B8)', '=SUM(C3:C8)', ''],
          ['', '', '', ''],
          ['VARIABLE COSTS', 'Monthly', 'Annual', 'Notes'],
          ['Water', '$0', '=B12*12', 'Based on usage'],
          ['Gas', '$0', '=B13*12', 'For dryers/hot water'],
          ['Electricity', '$0', '=B14*12', 'Lighting + equipment'],
          ['Sewer', '$0', '=B15*12', 'Often 90% of water'],
          ['Supplies (soap, etc)', '$0', '=B16*12', 'Cleaning supplies'],
          ['Maintenance/Repairs', '$0', '=B17*12', 'Equipment upkeep'],
          ['Variable Costs Subtotal', '=SUM(B12:B17)', '=SUM(C12:C17)', ''],
          ['', '', '', ''],
          ['LABOR COSTS', 'Monthly', 'Annual', 'Notes'],
          ['Attendant Wages', '$0', '=B21*12', 'Hourly staff'],
          ['Payroll Taxes (10%)', '=B21*0.1', '=B22*12', 'Employer taxes'],
          ['Workers Comp', '=B21*0.03', '=B23*12', 'Insurance'],
          ['Labor Costs Subtotal', '=SUM(B21:B23)', '=SUM(C21:C23)', ''],
          ['', '', '', ''],
          ['TOTAL OPERATING COSTS', '=B9+B18+B24', '=C9+C18+C24', ''],
          ['', '', '', ''],
          ['REVENUE ANALYSIS', '', '', ''],
          ['Monthly Revenue', '$0', '', 'Enter expected revenue'],
          ['Monthly Profit', '=B29-B26', '', 'Before owner salary'],
          ['Profit Margin', '=B30/B29', '', 'Percentage'],
        ]
      }
    ]
  }
};

// Create a new calculator spreadsheet
export async function createCalculatorSheet(calculatorType: keyof typeof CALCULATOR_TEMPLATES): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  const sheets = await getGoogleSheetsClient();
  const template = CALCULATOR_TEMPLATES[calculatorType];

  // Create the spreadsheet
  const spreadsheet = await sheets.spreadsheets.create({
    requestBody: {
      properties: {
        title: template.title,
      },
      sheets: template.sheets.map((sheet, index) => ({
        properties: {
          sheetId: index,
          title: sheet.name,
          gridProperties: {
            rowCount: 50,
            columnCount: 10,
          },
        },
      })),
    },
  });

  const spreadsheetId = spreadsheet.data.spreadsheetId!;

  // Populate each sheet with data
  for (const sheet of template.sheets) {
    const allData = [sheet.headers, ...sheet.data];
    
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `'${sheet.name}'!A1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: allData,
      },
    });

    // Apply formatting
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          // Header formatting
          {
            repeatCell: {
              range: {
                sheetId: 0,
                startRowIndex: 0,
                endRowIndex: 1,
                startColumnIndex: 0,
                endColumnIndex: 4,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.2, green: 0.4, blue: 0.6 },
                  textFormat: {
                    bold: true,
                    fontSize: 14,
                    foregroundColor: { red: 1, green: 1, blue: 1 },
                  },
                },
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat)',
            },
          },
          // Column widths
          {
            updateDimensionProperties: {
              range: {
                sheetId: 0,
                dimension: 'COLUMNS',
                startIndex: 0,
                endIndex: 1,
              },
              properties: { pixelSize: 250 },
              fields: 'pixelSize',
            },
          },
          {
            updateDimensionProperties: {
              range: {
                sheetId: 0,
                dimension: 'COLUMNS',
                startIndex: 1,
                endIndex: 2,
              },
              properties: { pixelSize: 120 },
              fields: 'pixelSize',
            },
          },
        ],
      },
    });
  }

  return {
    spreadsheetId,
    spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
  };
}

// Get data from a calculator sheet
export async function getCalculatorData(spreadsheetId: string, range: string = 'A1:F50'): Promise<any[][]> {
  const sheets = await getGoogleSheetsClient();
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });

  return response.data.values || [];
}

// Update calculator data
export async function updateCalculatorData(spreadsheetId: string, range: string, values: any[][]): Promise<void> {
  const sheets = await getGoogleSheetsClient();
  
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values },
  });
}

// CLEANBI Analysis Export Template
export const CLEANBI_EXPORT_TEMPLATE = {
  title: 'CLEANBI™ Location Analysis',
  sheets: [
    {
      name: 'Analysis Report',
      headers: ['CLEANBI™ Location Analysis Report', '', '', ''],
      data: [
        ['', '', '', ''],
        ['LOCATION DETAILS', '', '', ''],
        ['Address', '', '', ''],
        ['Analysis Date', '', '', ''],
        ['CLEANBI™ Score', '', '', ''],
        ['Grade', '', '', ''],
        ['', '', '', ''],
        ['MARKET DEMOGRAPHICS', '', '', ''],
        ['Population Density', '', '', 'per sq mi'],
        ['Median Income', '', '', ''],
        ['Traffic Score', '', '', '/100'],
        ['Parking Availability', '', '', '/100'],
        ['', '', '', ''],
        ['COMPETITION ANALYSIS', '', '', ''],
        ['Competitors Within 3 Miles', '', '', ''],
        ['Nearest Competitor', '', '', 'miles away'],
        ['Market Saturation', '', '', ''],
        ['', '', '', ''],
        ['FINANCIAL PROJECTIONS', '', '', ''],
        ['Estimated Annual Revenue', '', '', ''],
        ['Estimated Operating Expenses', '', '', ''],
        ['Estimated NOI', '', '', ''],
        ['Fair Market Value (2.5x NOI)', '', '', ''],
        ['', '', '', ''],
        ['DEAL ANALYSIS', '', '', ''],
        ['Asking Price', '', '', ''],
        ['Deal Verdict', '', '', ''],
        ['Your Target Offer', '', '', ''],
        ['', '', '', ''],
        ['ROI METRICS', '', '', ''],
        ['Cash-on-Cash Return', '', '', ''],
        ['Cap Rate', '', '', ''],
        ['Monthly NOI', '', '', ''],
        ['', '', '', ''],
        ['', '', '', ''],
        ['Generated by WashBizHub.com', '', '', ''],
        ['CLEANBI™ Proprietary Technology', '', '', ''],
      ]
    }
  ]
};

// Create CLEANBI export spreadsheet with data
export async function createCleanbiExport(analysisData: {
  address: string;
  score: number;
  grade: string;
  populationDensity: number;
  medianIncome: number;
  trafficScore: number;
  parkingScore: number;
  competitorCount: number;
  nearestCompetitor: number;
  annualRevenue: number;
  operatingExpenses: number;
  askingPrice: number;
  dealVerdict: string;
}): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  const sheets = await getGoogleSheetsClient();
  const template = CLEANBI_EXPORT_TEMPLATE;
  const now = new Date().toLocaleDateString();
  
  // Calculate derived values
  const noi = analysisData.annualRevenue - analysisData.operatingExpenses;
  const fairValue = noi * 2.5;
  const targetOffer = noi * 2.2;
  const cashOnCash = analysisData.askingPrice > 0 ? ((noi / (analysisData.askingPrice * 0.25)) * 100).toFixed(1) + '%' : 'N/A';
  const capRate = analysisData.askingPrice > 0 ? ((noi / analysisData.askingPrice) * 100).toFixed(1) + '%' : 'N/A';
  
  // Create the spreadsheet
  const spreadsheet = await sheets.spreadsheets.create({
    requestBody: {
      properties: {
        title: `${template.title} - ${analysisData.address}`,
      },
      sheets: [{
        properties: {
          sheetId: 0,
          title: 'Analysis Report',
          gridProperties: { rowCount: 50, columnCount: 10 },
        },
      }],
    },
  });

  const spreadsheetId = spreadsheet.data.spreadsheetId!;

  // Populate with actual data
  const populatedData = [
    ['CLEANBI™ Location Analysis Report', '', '', ''],
    ['', '', '', ''],
    ['LOCATION DETAILS', '', '', ''],
    ['Address', analysisData.address, '', ''],
    ['Analysis Date', now, '', ''],
    ['CLEANBI™ Score', analysisData.score.toString(), '', '/100'],
    ['Grade', analysisData.grade, '', ''],
    ['', '', '', ''],
    ['MARKET DEMOGRAPHICS', '', '', ''],
    ['Population Density', analysisData.populationDensity.toLocaleString(), '', 'per sq mi'],
    ['Median Income', '$' + analysisData.medianIncome.toLocaleString(), '', ''],
    ['Traffic Score', analysisData.trafficScore.toString(), '', '/100'],
    ['Parking Availability', analysisData.parkingScore.toString(), '', '/100'],
    ['', '', '', ''],
    ['COMPETITION ANALYSIS', '', '', ''],
    ['Competitors Within 3 Miles', analysisData.competitorCount.toString(), '', ''],
    ['Nearest Competitor', analysisData.nearestCompetitor.toFixed(1), '', 'miles away'],
    ['Market Saturation', analysisData.competitorCount <= 3 ? 'Low' : analysisData.competitorCount <= 6 ? 'Moderate' : 'High', '', ''],
    ['', '', '', ''],
    ['FINANCIAL PROJECTIONS', '', '', ''],
    ['Estimated Annual Revenue', '$' + analysisData.annualRevenue.toLocaleString(), '', ''],
    ['Estimated Operating Expenses', '$' + analysisData.operatingExpenses.toLocaleString(), '', ''],
    ['Estimated NOI', '$' + noi.toLocaleString(), '', ''],
    ['Fair Market Value (2.5x NOI)', '$' + Math.round(fairValue).toLocaleString(), '', ''],
    ['', '', '', ''],
    ['DEAL ANALYSIS', '', '', ''],
    ['Asking Price', '$' + analysisData.askingPrice.toLocaleString(), '', ''],
    ['Deal Verdict', analysisData.dealVerdict.toUpperCase(), '', ''],
    ['Your Target Offer', '$' + Math.round(targetOffer).toLocaleString(), '', ''],
    ['', '', '', ''],
    ['ROI METRICS', '', '', ''],
    ['Cash-on-Cash Return', cashOnCash, '', ''],
    ['Cap Rate', capRate, '', ''],
    ['Monthly NOI', '$' + Math.round(noi / 12).toLocaleString(), '', ''],
    ['', '', '', ''],
    ['', '', '', ''],
    ['Generated by WashBizHub.com', '', '', ''],
    ['CLEANBI™ Proprietary Technology', '', '', ''],
  ];

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: "'Analysis Report'!A1",
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: populatedData },
  });

  // Apply formatting
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        // Title formatting
        {
          repeatCell: {
            range: { sheetId: 0, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: 4 },
            cell: {
              userEnteredFormat: {
                backgroundColor: { red: 0.118, green: 0.227, blue: 0.373 }, // Navy
                textFormat: { bold: true, fontSize: 16, foregroundColor: { red: 1, green: 1, blue: 1 } },
              },
            },
            fields: 'userEnteredFormat(backgroundColor,textFormat)',
          },
        },
        // Section headers formatting
        {
          repeatCell: {
            range: { sheetId: 0, startRowIndex: 2, endRowIndex: 3, startColumnIndex: 0, endColumnIndex: 1 },
            cell: {
              userEnteredFormat: {
                backgroundColor: { red: 0.784, green: 0.651, blue: 0.067 }, // Gold
                textFormat: { bold: true, fontSize: 11 },
              },
            },
            fields: 'userEnteredFormat(backgroundColor,textFormat)',
          },
        },
        // Column widths
        { updateDimensionProperties: { range: { sheetId: 0, dimension: 'COLUMNS', startIndex: 0, endIndex: 1 }, properties: { pixelSize: 220 }, fields: 'pixelSize' } },
        { updateDimensionProperties: { range: { sheetId: 0, dimension: 'COLUMNS', startIndex: 1, endIndex: 2 }, properties: { pixelSize: 180 }, fields: 'pixelSize' } },
      ],
    },
  });

  return {
    spreadsheetId,
    spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
  };
}

// List all calculator sheets
export async function listCalculatorSheets(): Promise<Array<{ id: string; name: string; url: string }>> {
  const drive = await getGoogleDriveClient();
  
  const response = await drive.files.list({
    q: "name contains 'WashBizHub' and mimeType='application/vnd.google-apps.spreadsheet'",
    fields: 'files(id, name, webViewLink)',
    orderBy: 'modifiedTime desc',
  });

  return (response.data.files || []).map(file => ({
    id: file.id!,
    name: file.name!,
    url: file.webViewLink!,
  }));
}
