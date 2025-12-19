import { Router } from 'express';
import { db } from '../db';
import { 
  enterpriseDistributors, 
  distributorBranding, 
  distributorSettings,
  distributorUsers,
  enterpriseApiKeys,
  enterpriseAuditLogs,
  enterpriseMessagingTemplates,
  enterpriseMessageLogs,
} from '@shared/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { 
  generateApiKey, 
  revokeApiKey, 
  listApiKeys, 
  getAuditLogs,
  logAuditEvent,
  getDistributorStats,
} from '../services/service-guy/enterprise-security';
import { 
  sendEnterpriseEmail, 
  getMessageLogs,
  getDistributorBranding,
} from '../services/service-guy/enterprise-messaging';

const router = Router();

router.get('/distributors', async (req, res) => {
  try {
    const distributors = await db
      .select()
      .from(enterpriseDistributors)
      .orderBy(desc(enterpriseDistributors.createdAt));
    
    res.json(distributors);
  } catch (error) {
    console.error('[ServiceGuyAdmin] Get distributors error:', error);
    res.status(500).json({ error: 'Failed to fetch distributors' });
  }
});

router.get('/distributors/:id', async (req, res) => {
  try {
    const [distributor] = await db
      .select()
      .from(enterpriseDistributors)
      .where(eq(enterpriseDistributors.id, req.params.id))
      .limit(1);
    
    if (!distributor) {
      return res.status(404).json({ error: 'Distributor not found' });
    }
    
    const stats = await getDistributorStats(req.params.id);
    const { branding } = await getDistributorBranding(req.params.id);
    
    res.json({ ...distributor, branding, ...stats });
  } catch (error) {
    console.error('[ServiceGuyAdmin] Get distributor error:', error);
    res.status(500).json({ error: 'Failed to fetch distributor' });
  }
});

router.post('/distributors', async (req, res) => {
  try {
    const { companyName, slug, contactName, contactEmail, contactPhone, planId } = req.body;
    
    const [created] = await db
      .insert(enterpriseDistributors)
      .values({
        companyName,
        slug,
        contactName,
        contactEmail,
        contactPhone,
        planId,
        status: 'pending',
      })
      .returning();
    
    await db.insert(distributorBranding).values({
      distributorId: created.id,
    });
    
    await db.insert(distributorSettings).values({
      distributorId: created.id,
    });
    
    await logAuditEvent({
      distributorId: created.id,
      actorType: 'admin',
      action: 'create',
      resource: 'distributor',
      resourceId: created.id,
      description: `Distributor "${companyName}" created`,
      success: true,
    });
    
    res.status(201).json(created);
  } catch (error) {
    console.error('[ServiceGuyAdmin] Create distributor error:', error);
    res.status(500).json({ error: 'Failed to create distributor' });
  }
});

router.get('/distributors/:id/branding', async (req, res) => {
  try {
    const [branding] = await db
      .select()
      .from(distributorBranding)
      .where(eq(distributorBranding.distributorId, req.params.id))
      .limit(1);
    
    res.json(branding || {});
  } catch (error) {
    console.error('[ServiceGuyAdmin] Get branding error:', error);
    res.status(500).json({ error: 'Failed to fetch branding' });
  }
});

router.patch('/distributors/:id/branding', async (req, res) => {
  try {
    const { 
      logoUrl, logoLightUrl, faviconUrl,
      primaryColor, secondaryColor, accentColor, backgroundColor, textColor,
      headingFont, bodyFont,
      customDomain,
      emailFromName, emailFromAddress, emailFooterHtml,
      loginPageTitle, loginPageSubtitle, dashboardWelcomeMessage,
      supportEmail, supportPhone,
    } = req.body;
    
    const [updated] = await db
      .update(distributorBranding)
      .set({
        logoUrl, logoLightUrl, faviconUrl,
        primaryColor, secondaryColor, accentColor, backgroundColor, textColor,
        headingFont, bodyFont,
        customDomain,
        emailFromName, emailFromAddress, emailFooterHtml,
        loginPageTitle, loginPageSubtitle, dashboardWelcomeMessage,
        supportEmail, supportPhone,
        updatedAt: new Date(),
      })
      .where(eq(distributorBranding.distributorId, req.params.id))
      .returning();
    
    await logAuditEvent({
      distributorId: req.params.id,
      actorType: 'admin',
      action: 'update',
      resource: 'branding',
      resourceId: updated?.id,
      description: 'Branding settings updated',
      newValue: req.body,
      success: true,
    });
    
    res.json(updated);
  } catch (error) {
    console.error('[ServiceGuyAdmin] Update branding error:', error);
    res.status(500).json({ error: 'Failed to update branding' });
  }
});

router.get('/distributors/:id/api-keys', async (req, res) => {
  try {
    const keys = await listApiKeys(req.params.id);
    res.json(keys);
  } catch (error) {
    console.error('[ServiceGuyAdmin] Get API keys error:', error);
    res.status(500).json({ error: 'Failed to fetch API keys' });
  }
});

router.post('/distributors/:id/api-keys', async (req, res) => {
  try {
    const { name, scopes, rateLimit, expiresAt } = req.body;
    
    const result = await generateApiKey(
      req.params.id,
      name,
      scopes || {},
      { rateLimit, expiresAt: expiresAt ? new Date(expiresAt) : undefined }
    );
    
    res.status(201).json({
      keyId: result.keyId,
      apiKey: result.apiKey,
      message: 'Save this API key securely - it cannot be retrieved again.',
    });
  } catch (error) {
    console.error('[ServiceGuyAdmin] Create API key error:', error);
    res.status(500).json({ error: 'Failed to create API key' });
  }
});

router.delete('/distributors/:id/api-keys/:keyId', async (req, res) => {
  try {
    const success = await revokeApiKey(req.params.keyId);
    
    if (!success) {
      return res.status(404).json({ error: 'API key not found' });
    }
    
    res.json({ success: true, message: 'API key revoked' });
  } catch (error) {
    console.error('[ServiceGuyAdmin] Revoke API key error:', error);
    res.status(500).json({ error: 'Failed to revoke API key' });
  }
});

router.get('/distributors/:id/audit-logs', async (req, res) => {
  try {
    const logs = await getAuditLogs(req.params.id, {
      limit: parseInt(req.query.limit as string) || 100,
      action: req.query.action as string,
      resource: req.query.resource as string,
    });
    
    res.json(logs);
  } catch (error) {
    console.error('[ServiceGuyAdmin] Get audit logs error:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

router.get('/distributors/:id/message-templates', async (req, res) => {
  try {
    const templates = await db
      .select()
      .from(enterpriseMessagingTemplates)
      .where(eq(enterpriseMessagingTemplates.distributorId, req.params.id))
      .orderBy(enterpriseMessagingTemplates.name);
    
    res.json(templates);
  } catch (error) {
    console.error('[ServiceGuyAdmin] Get templates error:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

router.post('/distributors/:id/message-templates', async (req, res) => {
  try {
    const { name, slug, channel, emailSubject, emailHtml, emailText, smsBody, fromName, fromEmail, replyTo } = req.body;
    
    const [created] = await db
      .insert(enterpriseMessagingTemplates)
      .values({
        distributorId: req.params.id,
        name,
        slug,
        channel,
        emailSubject,
        emailHtml,
        emailText,
        smsBody,
        fromName,
        fromEmail,
        replyTo,
      })
      .returning();
    
    res.status(201).json(created);
  } catch (error) {
    console.error('[ServiceGuyAdmin] Create template error:', error);
    res.status(500).json({ error: 'Failed to create template' });
  }
});

router.patch('/distributors/:id/message-templates/:templateId', async (req, res) => {
  try {
    const [updated] = await db
      .update(enterpriseMessagingTemplates)
      .set({
        ...req.body,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(enterpriseMessagingTemplates.id, req.params.templateId),
          eq(enterpriseMessagingTemplates.distributorId, req.params.id)
        )
      )
      .returning();
    
    res.json(updated);
  } catch (error) {
    console.error('[ServiceGuyAdmin] Update template error:', error);
    res.status(500).json({ error: 'Failed to update template' });
  }
});

router.get('/distributors/:id/message-logs', async (req, res) => {
  try {
    const logs = await getMessageLogs(req.params.id, parseInt(req.query.limit as string) || 50);
    res.json(logs);
  } catch (error) {
    console.error('[ServiceGuyAdmin] Get message logs error:', error);
    res.status(500).json({ error: 'Failed to fetch message logs' });
  }
});

router.post('/distributors/:id/send-test-email', async (req, res) => {
  try {
    const { recipient, templateSlug, variables } = req.body;
    
    const result = await sendEnterpriseEmail({
      distributorId: req.params.id,
      templateSlug: templateSlug || 'test',
      recipient,
      variables: variables || {
        title: 'Test Email',
        message: 'This is a test email from Service Guy AI Enterprise.',
      },
    });
    
    res.json(result);
  } catch (error) {
    console.error('[ServiceGuyAdmin] Send test email error:', error);
    res.status(500).json({ error: 'Failed to send test email' });
  }
});

router.get('/demo/stats', async (req, res) => {
  try {
    res.json({
      activeDistributors: 47,
      totalTechnicians: 312,
      jobsCompletedToday: 89,
      avgResponseTime: '2.3 hrs',
      customerSatisfaction: '4.8/5',
      apiCallsToday: 12847,
      messagesDelivered: 2341,
      uptime: '99.97%',
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch demo stats' });
  }
});

router.get('/demo/branding', async (req, res) => {
  res.json({
    companyName: 'AAdvantage Laundry Systems',
    logoUrl: '/demo/aadvantage-logo.png',
    primaryColor: '#C8A661',
    secondaryColor: '#0A1628',
    accentColor: '#F59E0B',
    customDomain: 'fleet.aadvantage.com',
    emailFromName: 'AAdvantage Service Team',
    supportEmail: 'support@aadvantage.com',
    supportPhone: '1-800-555-WASH',
  });
});

export default router;
