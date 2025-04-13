'use client';

import { useCallback, useEffect, useState } from 'react';
import { whatsAppService } from '@/api/whatsapp.service';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FaWhatsapp } from 'react-icons/fa';
import { toast } from 'sonner';

import WhatsAppPlaceholder from '@/components/placeholders/whatsapp';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AudienceList, type AudienceGroup } from '@/components/whatsapp/audience-list';
import { CampaignsList } from '@/components/whatsapp/campaigns-list';
import { ConnectedAccounts } from '@/components/whatsapp/connected-accounts';
import { CreateCampaignModal, type Campaign } from '@/components/whatsapp/create-campaign-modal';
import { MetricsCards } from '@/components/whatsapp/metrics-cards';
import { TemplatesList } from '@/components/whatsapp/templates-list';
import { WhatsAppConnectModal } from '@/components/whatsapp/whatsapp-connect-modal';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

import MessagesList from './messages-list';

type Template = {
  id: string;
  name: string;
  parameter_format: string;
  components: any[];
  language: string;
  status: string;
  category: string;
};

export default function WhatsAppCampaignsPage() {
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [audiences, setAudiences] = useState<AudienceGroup[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [whatsAppCode, setWhatsAppCode] = useState<string | null>(null);
  const [totalCost, setTotalCost] = useState<{ currentMonth: number; previousMonth: number }>({
    currentMonth: 0,
    previousMonth: 0,
  });
  const queryClient = useQueryClient();

  const whatsAppAccount = useQuery({
    queryKey: ['whatsapp-account'],
    queryFn: () => api.get('/whatsapp/accounts'),
  });

  const whatsAppAudiences = useQuery({
    queryKey: ['whatsapp-audiences'],
    queryFn: () => whatsAppService.getAudiences(),
    enabled: !!whatsAppAccount.data,
  });

  const whatsAppCampaigns = useQuery({
    queryKey: ['whatsapp-campaigns'],
    queryFn: () => api.get('/whatsapp/campaigns'),
    enabled: !!whatsAppAccount.data,
  });

  useEffect(() => {
    if (whatsAppAccount.data?.data?.wabaid) {
      console.log('Fetching templates for WABA ID:', whatsAppAccount.data.data.wabaid);
      // @ts-ignore
      FB.api(
        `/${whatsAppAccount.data?.data?.wabaid}/message_templates?access_token=${whatsAppAccount.data?.data?.accessToken}`,
        'GET',
        (response: any) => {
          console.log('Received templates from Facebook API:', response);
          if (response && response.data) {
            setTemplates(response.data);
          }
        }
      );
    }
  }, [whatsAppAccount.data]);

  useEffect(() => {
    if (whatsAppAudiences.data) {
      setAudiences(whatsAppAudiences.data);
    }
    if (whatsAppCampaigns.data) {
      setCampaigns(whatsAppCampaigns.data.data);
    }
  }, [whatsAppAudiences.data, whatsAppCampaigns.data]);

  const handleCreateCampaign = useCallback(async (campaign: Campaign) => {
    try {
      const response = await api.post('/whatsapp/campaigns', {
        name: campaign.name,
        type: campaign.type,
        template: campaign.template,
        templateParams: campaign.templateParams,
        audienceId: campaign.audienceId,
        scheduledAt: campaign.scheduledAt,
      });
      setCampaigns((prev) => [...prev, response.data]);
      toast.success('Campaign created successfully');
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast.error('Failed to create campaign');
    }
  }, []);

  const handleCloseCampaignModal = useCallback(() => {
    setShowCampaignModal(false);
  }, []);

  const handleCreateAudience = (newAudience: AudienceGroup) => {
    setAudiences([...audiences, newAudience]);
    // Invalidate and refetch audiences
    queryClient.invalidateQueries({ queryKey: ['whatsapp-audiences'] });
  };

  const handleCreateTemplate = () => {
    // Invalidate and refetch templates
    queryClient.invalidateQueries({ queryKey: ['whatsapp-templates'] });
  };

  const handleUpdateTemplate = (template: any) => {
    setTemplates(templates.map((t) => (t.id === template.id ? template : t)));
  };

  const { company } = useAuth();

  const handleWhatsAppLogin = () => {
    //@ts-ignore
    FB.login(
      (response: any) => {
        if (response.authResponse) {
          console.log('Logged in as:', response.authResponse);
          //@ts-ignore
          FB.api('/me', { fields: 'name, email' }, (userInfo) => {
            console.log('Logged in as:', userInfo.name, 'Email:', userInfo.email);
            setIsConnected(true);
            setShowWhatsAppModal(false);
            setWhatsAppCode(response.authResponse.code);
          });
        } else {
          console.log('User cancelled login or did not fully authorize.');
        }
      },
      {
        config_id: '1931062140756222',
        response_type: 'code',
        override_default_response_type: true,
        scope: 'whatsapp_business_management,whatsapp_business_messaging,business_management',
      }
    );
  };

  useEffect(() => {
    if (whatsAppCode) {
      const fetchAccessToken = async () => {
        const response = await api.get(`/whatsapp/access-token/${whatsAppCode}`);
        const accessToken = response.data.access_token;
        console.log('Access token:', accessToken);

        if (!accessToken) {
          console.log('No access token found');
          return;
        }

        // @ts-ignore
        FB.api(`/me?access_token=${accessToken}`, (userInfo) => {
          console.log('User info:', userInfo);
          console.log('Logged in as:', userInfo.name, 'Email:', userInfo.email);
          setIsConnected(true);
          setShowWhatsAppModal(false);

          // @ts-ignore
          FB.api(
            `/debug_token?input_token=${accessToken}&access_token=${accessToken}`,
            (debugInfo: any) => {
              console.log('Debug info:', debugInfo);
              const wabaId = debugInfo.data.granular_scopes.find(
                (scope: any) => scope.scope === 'whatsapp_business_management'
              )?.target_ids[0];
              console.log('WABA ID:', wabaId);
              console.log('debug info:', debugInfo);

              // @ts-ignore
              FB.api(
                `/${wabaId}/phone_numbers?access_token=${accessToken}`,
                (phoneNumbers: any) => {
                  console.log('Phone numbers:', phoneNumbers);

                  const phoneNumberData = phoneNumbers.data.map((phoneNumber: any) => ({
                    phoneNumberId: phoneNumber.id,
                    name: phoneNumber.verified_name,
                    phoneNumber: phoneNumber.display_phone_number,
                    codeVerificationStatus: phoneNumber.code_verification_status,
                  }));

                  const phoneNumberIds = phoneNumberData.map(
                    (phoneNumber: any) => phoneNumber.phoneNumberId
                  );

                  api
                    .post('/whatsapp/accounts', {
                      displayName: userInfo.name,
                      phoneNumberData: phoneNumberData,
                      phoneNumberIds: phoneNumberIds,
                      wabaid: wabaId,
                      accessToken: accessToken,
                    })
                    .then((response: any) => {
                      console.log('API response:', response);
                      setIsConnected(true);
                      setShowWhatsAppModal(false);
                      // Invalidate and refetch the whatsapp-account query
                      queryClient.invalidateQueries({ queryKey: ['whatsapp-account'] });
                    });
                }
              );
            }
          );
        });
      };
      fetchAccessToken();
    }
  }, [whatsAppCode, queryClient]);

  const fetchTotalCost = useCallback(async () => {
    if (!whatsAppAccount.data?.data?.wabaid || !whatsAppAccount.data?.data?.accessToken) {
      console.log('Missing required data for analytics fetch');
      return;
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    // convert to unix timestamp
    const startDateUnix = Math.floor(startDate.getTime() / 1000);
    const endDateUnix = Math.floor(new Date().getTime() / 1000);

    try {
      //@ts-ignore
      FB.api(
        `/${whatsAppAccount.data.data.wabaid}?fields=conversation_analytics
        .start(${startDateUnix})
        .end(${endDateUnix})
        .granularity(DAILY)
        .phone_numbers([])
        .dimensions(["CONVERSATION_CATEGORY","CONVERSATION_TYPE","COUNTRY","PHONE"])
        &access_token=${whatsAppAccount.data.data.accessToken}`,
        (response: any) => {
          if (response.error) {
            console.error('Error fetching analytics:', response.error);
            return;
          }
          console.log('stats:', response);
          if (response.conversation_analytics) {
            let calculatedTotalCost = 0;
            for (const data of response.conversation_analytics.data) {
              for (const point of data.data_points) {
                calculatedTotalCost += point.cost;
              }
            }
            setTotalCost({ ...totalCost, currentMonth: calculatedTotalCost });
          }
        }
      );

      // fetching total cost of previous month for analytics
      const startDatePreviousMonth = new Date();
      startDatePreviousMonth.setDate(startDatePreviousMonth.getDate() - 60);
      const startDatePreviousMonthUnix = Math.floor(startDatePreviousMonth.getTime() / 1000);
      // @ts-ignore
      FB.api(
        `/${whatsAppAccount.data.data.wabaid}?fields=conversation_analytics
        .start(${startDatePreviousMonthUnix})
        .end(${startDateUnix})
        .granularity(DAILY)
        .phone_numbers([])
        .dimensions(["CONVERSATION_CATEGORY","CONVERSATION_TYPE","COUNTRY","PHONE"])
        &access_token=${whatsAppAccount.data.data.accessToken}`,
        (response: any) => {
          if (response.error) {
            console.error('Error fetching analytics:', response.error);
            return;
          }
          if (response.conversation_analytics) {
            let calculatedTotalCost = 0;
            for (const data of response.conversation_analytics.data) {
              for (const point of data.data_points) {
                calculatedTotalCost += point.cost;
              }
            }
            setTotalCost({ ...totalCost, previousMonth: calculatedTotalCost });
          }
        }
      );
    } catch (error) {
      console.error('Error in fetchTotalCost:', error);
    }
  }, [whatsAppAccount.data]);

  useEffect(() => {
    if (whatsAppAccount.data?.data?.wabaid && whatsAppAccount.data?.data?.accessToken) {
      fetchTotalCost();
    }
  }, [whatsAppAccount.data, fetchTotalCost]);

  if (company?.planName !== 'ENTERPRISE') {
    return <WhatsAppPlaceholder />;
  }

  if (whatsAppAccount.isLoading) {
    return <div>Loading...</div>;
  }

  if (whatsAppAccount.isError) {
    return <div>Error loading WhatsApp account</div>;
  }

  const hasWhatsAppAccount = whatsAppAccount.data?.data;

  return (
    <Card className='p-6 space-y-6 min-h-full'>
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-2xl font-bold'>WhatsApp Campaigns</h1>
          <p className='text-muted-foreground text-sm'>Manage your WhatsApp business campaigns</p>
        </div>
        {!hasWhatsAppAccount ? (
          <Button
            onClick={handleWhatsAppLogin}
            className='bg-[#25D366] hover:bg-[#25D366]/90 text-white'
          >
            <FaWhatsapp className='w-4 h-4 mr-2' />
            Connect WhatsApp
          </Button>
        ) : (
          <Button
            onClick={() => setShowCampaignModal(true)}
            className='bg-[#5932EA] hover:bg-[#5932EA]/90'
          >
            Create Campaign
          </Button>
        )}
      </div>

      {hasWhatsAppAccount ? (
        <>
          <MetricsCards campaigns={whatsAppCampaigns.data?.data || []} totalCost={totalCost} />
          <Tabs defaultValue='campaigns' className='space-y-4'>
            <TabsList>
              <TabsTrigger value='campaigns'>Campaigns</TabsTrigger>
              <TabsTrigger value='messages'>Messages</TabsTrigger>
              <TabsTrigger value='audience'>Audience</TabsTrigger>
              <TabsTrigger value='templates'>Templates</TabsTrigger>
              <TabsTrigger value='accounts'>Accounts</TabsTrigger>
            </TabsList>
            <TabsContent value='campaigns'>
              <CampaignsList
                campaigns={whatsAppCampaigns.data?.data || []}
                onCreateCampaign={() => setShowCampaignModal(true)}
                audiences={audiences}
                onUpdateCampaign={() => {
                  queryClient.invalidateQueries({ queryKey: ['whatsapp-campaigns'] });
                }}
              />
            </TabsContent>
            <TabsContent value='messages'>
              <MessagesList
                phoneNumbers={whatsAppAccount.data?.data?.phoneNumbers || []}
                accessToken={whatsAppAccount.data?.data?.accessToken || ''}
                wabaId={whatsAppAccount.data?.data?.wabaid || ''}
              />
            </TabsContent>
            <TabsContent value='accounts'>
              <ConnectedAccounts
                accounts={whatsAppAccount.data?.data?.phoneNumbers}
                accessToken={whatsAppAccount.data?.data?.accessToken || ''}
                wabaId={whatsAppAccount.data?.data?.wabaid || ''}
              />
            </TabsContent>
            <TabsContent value='audience'>
              <AudienceList audiences={audiences} onCreateAudience={handleCreateAudience} />
            </TabsContent>
            <TabsContent value='templates'>
              <TemplatesList
                templates={templates}
                wabaId={whatsAppAccount.data?.data?.wabaid || ''}
                accessToken={whatsAppAccount.data?.data?.accessToken || ''}
                onCreateTemplate={handleCreateTemplate}
                onUpdateTemplate={handleUpdateTemplate}
              />
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <div className='flex flex-col items-center justify-center min-h-[400px] text-center'>
          <FaWhatsapp className='w-16 h-16 text-[#25D366] mb-4' />
          <h2 className='text-xl font-semibold mb-2'>Connect Your WhatsApp Business Account</h2>
          <p className='text-muted-foreground mb-4'>
            Connect your WhatsApp Business account to start creating and managing campaigns
          </p>
          <Button
            onClick={handleWhatsAppLogin}
            className='bg-[#25D366] hover:bg-[#25D366]/90 text-white'
          >
            Connect Now
          </Button>
        </div>
      )}

      <WhatsAppConnectModal
        open={showWhatsAppModal}
        onClose={() => setShowWhatsAppModal(false)}
        onConnect={() => setIsConnected(true)}
      />

      {showCampaignModal && (
        <CreateCampaignModal
          open={showCampaignModal}
          onClose={handleCloseCampaignModal}
          templates={templates}
          onCreateCampaign={handleCreateCampaign}
          audiences={audiences}
        />
      )}
    </Card>
  );
}
