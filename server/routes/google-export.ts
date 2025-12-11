import { Router } from "express";
import { google } from "googleapis";
import { isAuthenticated } from "../replitAuth";
import { z } from "zod";

const router = Router();

let connectionSettings: any;

async function getAccessToken(): Promise<string | null> {
  if (
    connectionSettings &&
    connectionSettings.settings?.expires_at &&
    new Date(connectionSettings.settings.expires_at).getTime() > Date.now()
  ) {
    return connectionSettings.settings.access_token;
  }

  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? "repl " + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
    ? "depl " + process.env.WEB_REPL_RENEWAL
    : null;

  if (!xReplitToken || !hostname) {
    console.log("Google Export: Replit connector token not available");
    return null;
  }

  try {
    connectionSettings = await fetch(
      "https://" +
        hostname +
        "/api/v2/connection?include_secrets=true&connector_names=google-sheet",
      {
        headers: {
          Accept: "application/json",
          X_REPLIT_TOKEN: xReplitToken,
        },
      }
    )
      .then((res) => res.json())
      .then((data) => data.items?.[0]);

    const accessToken =
      connectionSettings?.settings?.access_token ||
      connectionSettings?.settings?.oauth?.credentials?.access_token;

    if (!connectionSettings || !accessToken) {
      console.log("Google Export: Google connection not found");
      return null;
    }
    return accessToken;
  } catch (error) {
    console.error("Google Export: Error getting access token", error);
    return null;
  }
}

async function getGoogleSheetsClient() {
  const accessToken = await getAccessToken();
  if (!accessToken) return null;

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });

  return google.sheets({ version: "v4", auth: oauth2Client });
}

async function getGoogleDocsClient() {
  const accessToken = await getAccessToken();
  if (!accessToken) return null;

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });

  return google.docs({ version: "v1", auth: oauth2Client });
}

async function getGoogleDriveClient() {
  const accessToken = await getAccessToken();
  if (!accessToken) return null;

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });

  return google.drive({ version: "v3", auth: oauth2Client });
}

const exportToSheetsSchema = z.object({
  title: z.string().min(1).max(255),
  data: z.array(z.record(z.any())).or(z.record(z.any())),
  sheetName: z.string().min(1).max(100).optional().default("Analysis Data"),
  existingSpreadsheetId: z.string().optional(),
});

router.post("/export-to-sheets", isAuthenticated, async (req, res) => {
  try {
    const parsed = exportToSheetsSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: "Invalid request data",
        details: parsed.error.format(),
      });
    }

    const { title, data, sheetName, existingSpreadsheetId } = parsed.data;

    const sheets = await getGoogleSheetsClient();
    if (!sheets) {
      return res.status(401).json({
        success: false,
        error: "Google Sheets not connected",
        requiresAuth: true,
        authUrl: "/api/auth/google",
      });
    }

    const dataArray = Array.isArray(data) ? data : [data];
    if (dataArray.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No data provided for export",
      });
    }

    const allKeys = new Set<string>();
    dataArray.forEach((item) => {
      if (item && typeof item === "object") {
        Object.keys(item).forEach((key) => allKeys.add(key));
      }
    });
    const headers = Array.from(allKeys);

    const rows = dataArray.map((item) =>
      headers.map((header) => {
        const value = item?.[header];
        if (value === null || value === undefined) return "";
        if (typeof value === "object") return JSON.stringify(value);
        return String(value);
      })
    );

    const formattedHeaders = headers.map((h) =>
      h.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())
    );

    const sheetData = [formattedHeaders, ...rows];

    let spreadsheetId: string;
    let spreadsheetUrl: string;

    if (existingSpreadsheetId) {
      spreadsheetId = existingSpreadsheetId;

      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: sheetName,
                },
              },
            },
          ],
        },
      });

      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `'${sheetName}'!A1`,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: sheetData },
      });

      spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
    } else {
      const spreadsheet = await sheets.spreadsheets.create({
        requestBody: {
          properties: {
            title: `WashBizHub - ${title}`,
          },
          sheets: [
            {
              properties: {
                sheetId: 0,
                title: sheetName,
                gridProperties: {
                  rowCount: Math.max(100, sheetData.length + 10),
                  columnCount: Math.max(26, headers.length + 5),
                },
              },
            },
          ],
        },
      });

      spreadsheetId = spreadsheet.data.spreadsheetId!;

      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `'${sheetName}'!A1`,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: sheetData },
      });

      const footerRow = sheetData.length + 3;
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `'${sheetName}'!A${footerRow}`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [
            [""],
            [`Generated by WashBizHub.com on ${new Date().toLocaleString()}`],
            ["© WashBizHub - Your Laundromat Business Intelligence Platform"],
          ],
        },
      });

      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              repeatCell: {
                range: {
                  sheetId: 0,
                  startRowIndex: 0,
                  endRowIndex: 1,
                  startColumnIndex: 0,
                  endColumnIndex: headers.length,
                },
                cell: {
                  userEnteredFormat: {
                    backgroundColor: { red: 0.039, green: 0.086, blue: 0.157 },
                    textFormat: {
                      bold: true,
                      fontSize: 11,
                      foregroundColor: { red: 1, green: 1, blue: 1 },
                    },
                    horizontalAlignment: "CENTER",
                    verticalAlignment: "MIDDLE",
                  },
                },
                fields:
                  "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)",
              },
            },
            {
              repeatCell: {
                range: {
                  sheetId: 0,
                  startRowIndex: footerRow - 1,
                  endRowIndex: footerRow + 2,
                  startColumnIndex: 0,
                  endColumnIndex: headers.length,
                },
                cell: {
                  userEnteredFormat: {
                    textFormat: {
                      italic: true,
                      fontSize: 9,
                      foregroundColor: { red: 0.5, green: 0.5, blue: 0.5 },
                    },
                  },
                },
                fields: "userEnteredFormat(textFormat)",
              },
            },
            {
              updateDimensionProperties: {
                range: {
                  sheetId: 0,
                  dimension: "ROWS",
                  startIndex: 0,
                  endIndex: 1,
                },
                properties: { pixelSize: 35 },
                fields: "pixelSize",
              },
            },
            {
              autoResizeDimensions: {
                dimensions: {
                  sheetId: 0,
                  dimension: "COLUMNS",
                  startIndex: 0,
                  endIndex: headers.length,
                },
              },
            },
            {
              updateSheetProperties: {
                properties: {
                  sheetId: 0,
                  gridProperties: {
                    frozenRowCount: 1,
                  },
                },
                fields: "gridProperties.frozenRowCount",
              },
            },
          ],
        },
      });

      spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
    }

    console.log(`Google Sheets: Exported "${title}" to ${spreadsheetUrl}`);

    return res.json({
      success: true,
      spreadsheetUrl,
      spreadsheetId,
      sheetName,
      rowCount: rows.length,
      columnCount: headers.length,
    });
  } catch (error: any) {
    console.error("Google Sheets export error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to export to Google Sheets",
    });
  }
});

const exportToDocsSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.object({
    executiveSummary: z.string().optional(),
    metrics: z.array(z.object({
      label: z.string(),
      value: z.string(),
    })).optional(),
    findings: z.array(z.string()).optional(),
    sections: z.array(z.object({
      heading: z.string(),
      content: z.string(),
    })).optional(),
    rawData: z.record(z.any()).optional(),
  }),
  templateType: z.enum(["analysis", "report", "summary", "memo"]).default("analysis"),
});

router.post("/export-to-docs", isAuthenticated, async (req, res) => {
  try {
    const parsed = exportToDocsSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: "Invalid request data",
        details: parsed.error.format(),
      });
    }

    const { title, content, templateType } = parsed.data;

    const docs = await getGoogleDocsClient();
    const drive = await getGoogleDriveClient();

    if (!docs || !drive) {
      return res.status(401).json({
        success: false,
        error: "Google Docs not connected",
        requiresAuth: true,
        authUrl: "/api/auth/google",
      });
    }

    const document = await docs.documents.create({
      requestBody: {
        title: `WashBizHub - ${title}`,
      },
    });

    const documentId = document.data.documentId!;

    const requests: any[] = [];
    let currentIndex = 1;

    requests.push({
      insertText: {
        location: { index: currentIndex },
        text: title + "\n",
      },
    });
    const titleEnd = currentIndex + title.length;
    requests.push({
      updateParagraphStyle: {
        range: { startIndex: currentIndex, endIndex: titleEnd + 1 },
        paragraphStyle: {
          namedStyleType: "HEADING_1",
          alignment: "CENTER",
        },
        fields: "namedStyleType,alignment",
      },
    });
    requests.push({
      updateTextStyle: {
        range: { startIndex: currentIndex, endIndex: titleEnd },
        textStyle: {
          bold: true,
          fontSize: { magnitude: 24, unit: "PT" },
          foregroundColor: {
            color: { rgbColor: { red: 0.039, green: 0.086, blue: 0.157 } },
          },
        },
        fields: "bold,fontSize,foregroundColor",
      },
    });
    currentIndex = titleEnd + 1;

    const templateLabel = templateType.charAt(0).toUpperCase() + templateType.slice(1);
    const dateStr = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const subtitleText = `${templateLabel} Report | ${dateStr}\n\n`;
    requests.push({
      insertText: {
        location: { index: currentIndex },
        text: subtitleText,
      },
    });
    requests.push({
      updateTextStyle: {
        range: { startIndex: currentIndex, endIndex: currentIndex + subtitleText.length },
        textStyle: {
          italic: true,
          fontSize: { magnitude: 11, unit: "PT" },
          foregroundColor: {
            color: { rgbColor: { red: 0.4, green: 0.4, blue: 0.4 } },
          },
        },
        fields: "italic,fontSize,foregroundColor",
      },
    });
    currentIndex += subtitleText.length;

    if (content.executiveSummary) {
      const summaryHeading = "Executive Summary\n";
      requests.push({
        insertText: {
          location: { index: currentIndex },
          text: summaryHeading,
        },
      });
      requests.push({
        updateParagraphStyle: {
          range: { startIndex: currentIndex, endIndex: currentIndex + summaryHeading.length },
          paragraphStyle: { namedStyleType: "HEADING_2" },
          fields: "namedStyleType",
        },
      });
      requests.push({
        updateTextStyle: {
          range: { startIndex: currentIndex, endIndex: currentIndex + summaryHeading.length - 1 },
          textStyle: {
            bold: true,
            foregroundColor: {
              color: { rgbColor: { red: 0.784, green: 0.651, blue: 0.38 } },
            },
          },
          fields: "bold,foregroundColor",
        },
      });
      currentIndex += summaryHeading.length;

      const summaryContent = content.executiveSummary + "\n\n";
      requests.push({
        insertText: {
          location: { index: currentIndex },
          text: summaryContent,
        },
      });
      currentIndex += summaryContent.length;
    }

    if (content.metrics && content.metrics.length > 0) {
      const metricsHeading = "Key Metrics\n";
      requests.push({
        insertText: {
          location: { index: currentIndex },
          text: metricsHeading,
        },
      });
      requests.push({
        updateParagraphStyle: {
          range: { startIndex: currentIndex, endIndex: currentIndex + metricsHeading.length },
          paragraphStyle: { namedStyleType: "HEADING_2" },
          fields: "namedStyleType",
        },
      });
      requests.push({
        updateTextStyle: {
          range: { startIndex: currentIndex, endIndex: currentIndex + metricsHeading.length - 1 },
          textStyle: {
            bold: true,
            foregroundColor: {
              color: { rgbColor: { red: 0.784, green: 0.651, blue: 0.38 } },
            },
          },
          fields: "bold,foregroundColor",
        },
      });
      currentIndex += metricsHeading.length;

      for (const metric of content.metrics) {
        const metricLine = `• ${metric.label}: ${metric.value}\n`;
        requests.push({
          insertText: {
            location: { index: currentIndex },
            text: metricLine,
          },
        });

        const labelEnd = currentIndex + 2 + metric.label.length + 1;
        requests.push({
          updateTextStyle: {
            range: { startIndex: currentIndex + 2, endIndex: labelEnd },
            textStyle: { bold: true },
            fields: "bold",
          },
        });
        currentIndex += metricLine.length;
      }
      requests.push({
        insertText: {
          location: { index: currentIndex },
          text: "\n",
        },
      });
      currentIndex += 1;
    }

    if (content.findings && content.findings.length > 0) {
      const findingsHeading = "Detailed Findings\n";
      requests.push({
        insertText: {
          location: { index: currentIndex },
          text: findingsHeading,
        },
      });
      requests.push({
        updateParagraphStyle: {
          range: { startIndex: currentIndex, endIndex: currentIndex + findingsHeading.length },
          paragraphStyle: { namedStyleType: "HEADING_2" },
          fields: "namedStyleType",
        },
      });
      requests.push({
        updateTextStyle: {
          range: { startIndex: currentIndex, endIndex: currentIndex + findingsHeading.length - 1 },
          textStyle: {
            bold: true,
            foregroundColor: {
              color: { rgbColor: { red: 0.784, green: 0.651, blue: 0.38 } },
            },
          },
          fields: "bold,foregroundColor",
        },
      });
      currentIndex += findingsHeading.length;

      for (let i = 0; i < content.findings.length; i++) {
        const findingLine = `${i + 1}. ${content.findings[i]}\n`;
        requests.push({
          insertText: {
            location: { index: currentIndex },
            text: findingLine,
          },
        });
        currentIndex += findingLine.length;
      }
      requests.push({
        insertText: {
          location: { index: currentIndex },
          text: "\n",
        },
      });
      currentIndex += 1;
    }

    if (content.sections && content.sections.length > 0) {
      for (const section of content.sections) {
        const sectionHeading = section.heading + "\n";
        requests.push({
          insertText: {
            location: { index: currentIndex },
            text: sectionHeading,
          },
        });
        requests.push({
          updateParagraphStyle: {
            range: { startIndex: currentIndex, endIndex: currentIndex + sectionHeading.length },
            paragraphStyle: { namedStyleType: "HEADING_3" },
            fields: "namedStyleType",
          },
        });
        requests.push({
          updateTextStyle: {
            range: { startIndex: currentIndex, endIndex: currentIndex + sectionHeading.length - 1 },
            textStyle: { bold: true },
            fields: "bold",
          },
        });
        currentIndex += sectionHeading.length;

        const sectionContent = section.content + "\n\n";
        requests.push({
          insertText: {
            location: { index: currentIndex },
            text: sectionContent,
          },
        });
        currentIndex += sectionContent.length;
      }
    }

    if (content.rawData && Object.keys(content.rawData).length > 0) {
      const dataHeading = "Raw Data\n";
      requests.push({
        insertText: {
          location: { index: currentIndex },
          text: dataHeading,
        },
      });
      requests.push({
        updateParagraphStyle: {
          range: { startIndex: currentIndex, endIndex: currentIndex + dataHeading.length },
          paragraphStyle: { namedStyleType: "HEADING_2" },
          fields: "namedStyleType",
        },
      });
      currentIndex += dataHeading.length;

      for (const [key, value] of Object.entries(content.rawData)) {
        const formattedKey = key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());
        const formattedValue = typeof value === "object" ? JSON.stringify(value, null, 2) : String(value);
        const dataLine = `${formattedKey}: ${formattedValue}\n`;
        requests.push({
          insertText: {
            location: { index: currentIndex },
            text: dataLine,
          },
        });
        currentIndex += dataLine.length;
      }
      requests.push({
        insertText: {
          location: { index: currentIndex },
          text: "\n",
        },
      });
      currentIndex += 1;
    }

    const dividerLine = "─".repeat(50) + "\n";
    requests.push({
      insertText: {
        location: { index: currentIndex },
        text: dividerLine,
      },
    });
    currentIndex += dividerLine.length;

    const footerText = `Generated by WashBizHub.com\nYour Laundromat Business Intelligence Platform\n${new Date().toLocaleString()}`;
    requests.push({
      insertText: {
        location: { index: currentIndex },
        text: footerText,
      },
    });
    requests.push({
      updateTextStyle: {
        range: { startIndex: currentIndex, endIndex: currentIndex + footerText.length },
        textStyle: {
          italic: true,
          fontSize: { magnitude: 9, unit: "PT" },
          foregroundColor: {
            color: { rgbColor: { red: 0.5, green: 0.5, blue: 0.5 } },
          },
        },
        fields: "italic,fontSize,foregroundColor",
      },
    });
    requests.push({
      updateParagraphStyle: {
        range: { startIndex: currentIndex, endIndex: currentIndex + footerText.length },
        paragraphStyle: { alignment: "CENTER" },
        fields: "alignment",
      },
    });

    await docs.documents.batchUpdate({
      documentId,
      requestBody: { requests },
    });

    const documentUrl = `https://docs.google.com/document/d/${documentId}/edit`;

    console.log(`Google Docs: Exported "${title}" to ${documentUrl}`);

    return res.json({
      success: true,
      documentUrl,
      documentId,
      templateType,
    });
  } catch (error: any) {
    console.error("Google Docs export error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to export to Google Docs",
    });
  }
});

router.get("/auth-status", async (req, res) => {
  try {
    const hasGoogleClientId = !!process.env.GOOGLE_CLIENT_ID;
    const hasGoogleClientSecret = !!process.env.GOOGLE_CLIENT_SECRET;

    const accessToken = await getAccessToken();
    const isConnected = !!accessToken;

    return res.json({
      success: true,
      configured: hasGoogleClientId && hasGoogleClientSecret,
      connected: isConnected,
      authUrl: "/api/auth/google",
      features: {
        sheets: isConnected,
        docs: isConnected,
        drive: isConnected,
      },
    });
  } catch (error: any) {
    console.error("Google auth status check error:", error);
    return res.json({
      success: false,
      configured: false,
      connected: false,
      error: error.message,
    });
  }
});

export default router;
